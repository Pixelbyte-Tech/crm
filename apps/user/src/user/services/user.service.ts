import { isNil } from 'lodash';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { ClientKafka } from '@nestjs/microservices';
import {
  Inject,
  Logger,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Cryptography } from '@crm/utils';
import { PaginatedResDto } from '@crm/http';
import { UserCreatedEvent } from '@crm/kafka';
import { Role, User, UserStatus, UserSettingKey } from '@crm/types';
import { UserEntity, UserDetailEntity, UserSettingEntity } from '@crm/database';

import { GlobalSettingService } from './global-setting.service';

import { UserMapper } from '../mappers';
import { AuthService } from '../../auth/services';
import {
  NewUserDto,
  ListUsersDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserDetailsDto,
  UpdateUserSettingsDto,
} from '../dto';

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly userMapper: UserMapper,
    private readonly companySettingService: GlobalSettingService,
    @Inject('KAFKA') private readonly kafka: ClientKafka,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserSettingEntity)
    private readonly userSettingRepo: Repository<UserSettingEntity>,
    @InjectRepository(UserDetailEntity)
    private readonly userDetailRepo: Repository<UserDetailEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches a user by their ID.
   * @param userId The id of the user to fetch
   */
  async get(userId: string): Promise<User> {
    const msg = `Fetching user '${userId}'`;

    // Find the user by ID
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find user '${userId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.userMapper.toUser(user);
  }

  /**
   * Lists all users
   * @param dto The list dto
   */
  async list(dto: ListUsersDto): Promise<PaginatedResDto<User>> {
    // Find the resources paginated
    const traders = await paginate(
      this.userRepo,
      { limit: dto.limit, page: dto.page },
      { order: { createdAt: dto.sortDir } },
    );

    return {
      data: traders.items.map(this.userMapper.toUser),
      page: traders.meta.currentPage,
      limit: traders.meta.itemsPerPage,
      total: traders.meta.totalItems,
    };
  }

  /**
   * Creates a new user in the system.
   * @param dto The dto with the creation data
   */
  async create(dto: CreateUserDto): Promise<NewUserDto> {
    const msg = `Attempting to create user from email '${dto.email}'`;

    // Fetch the default settings for the company
    const settings = await this.companySettingService.fetch();

    // Create the user settings
    const userSettings = new UserSettingEntity();
    userSettings.canDeposit = Boolean(settings.find((s) => s.key === UserSettingKey.USER_CAN_DEPOSIT)?.value ?? true);
    userSettings.canWithdraw = Boolean(settings.find((s) => s.key === UserSettingKey.USER_CAN_WITHDRAW)?.value ?? true);
    userSettings.canAutoWithdraw = Boolean(
      settings.find((s) => s.key === UserSettingKey.USER_CAN_AUTO_WITHDRAW)?.value ?? false,
    );
    userSettings.maxAutoWithdrawAmount = Number(
      settings.find((s) => s.key === UserSettingKey.USER_MAX_AUTO_WITHDRAW_AMT)?.value ?? 1000,
    );

    // Create the new user
    const user = await this.userRepo.save({
      email: dto.email,
      password: Cryptography.hash(dto.password),
      roles: [Role.USER],
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
      securityPin: Math.floor(1000 + Math.random() * 9000).toString(),
      status: UserStatus.ACTIVE,
      settings: userSettings,
    });

    if (!user) {
      this.#logger.error(`${msg} - Failed`);
      throw new InternalServerErrorException(`Failed to create user from email '${dto.email}'`);
    }

    try {
      // Generate a confirmation token and send the email
      const token = await this.authService.generateEmailConfirmationToken(user.id);

      // Trigger the creation event
      this.kafka.emit(
        UserCreatedEvent.type,
        new UserCreatedEvent({
          userId: user.id,
          email: user.email,
          confirmEmailToken: token.token,
          createdAt: DateTime.fromJSDate(user.createdAt).toMillis(),
        }),
      );

      this.#logger.log(`${msg} - Complete`);
      return { user: this.userMapper.toUser(user), tokens: { confirmEmail: token } };
    } catch (err) {
      await this.delete(user.id);
      this.#logger.error(`${msg} - Failed to send confirmation email`, err);
      throw new InternalServerErrorException(`Failed to send confirmation email to '${dto.email}'`);
    }
  }

  /**
   * Updates a user by their ID.
   * @param userId The id of the user to update
   * @param dto The update dto
   */
  async update(userId: string, dto: UpdateUserDto): Promise<User> {
    const msg = `Updating user '${userId}'`;

    // Find the user prior to the update
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Unable to find user '${userId}'`);
    }

    const now = DateTime.utc().toJSDate();

    // Prepare the required dates
    let cookiesAcceptedAt: Date | null | undefined = dto.isCookiesAccepted && !user.isCookiesAccepted ? now : undefined;
    let privacyAcceptedAt: Date | null | undefined = dto.isPrivacyAccepted && !user.isPrivacyAccepted ? now : undefined;
    let termsAcceptedAt: Date | null | undefined = dto.isTermsAccepted && !user.isTermsAccepted ? now : undefined;

    if (undefined !== dto.isCookiesAccepted && !dto.isCookiesAccepted) {
      cookiesAcceptedAt = null;
    }

    if (undefined !== dto.isPrivacyAccepted && !dto.isPrivacyAccepted) {
      privacyAcceptedAt = null;
    }

    if (undefined !== dto.isTermsAccepted && !dto.isTermsAccepted) {
      termsAcceptedAt = null;
    }

    // Perform the update
    const result = await this.userRepo.update(userId, {
      ...(dto.email ? { email: dto.email } : {}),
      ...(dto.password ? { password: Cryptography.hash(dto.password) } : {}),
      ...(dto.firstName ? { firstName: dto.firstName } : {}),
      ...(dto.middleName ? { middleName: dto.middleName } : {}),
      ...(dto.lastName ? { lastName: dto.lastName } : {}),
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.securityPin ? { securityPin: dto.securityPin.toString() } : {}),

      ...(dto.isCookiesAccepted ? { isCookiesAccepted: dto.isCookiesAccepted } : {}),
      ...(cookiesAcceptedAt ? { cookiesAcceptedAt } : {}),

      ...(dto.isPrivacyAccepted ? { isPrivacyAccepted: dto.isPrivacyAccepted } : {}),
      ...(privacyAcceptedAt ? { privacyAcceptedAt } : {}),

      ...(dto.isTermsAccepted ? { isTermsAccepted: dto.isTermsAccepted } : {}),
      ...(termsAcceptedAt ? { termsAcceptedAt } : {}),
    });

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update user '${userId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.get(userId);
  }

  /**
   * Updates a user's details by their ID.
   * @param userId The id of the user to update
   * @param dto The update dto
   */
  async updateDetails(userId: string, dto: UpdateUserDetailsDto): Promise<User> {
    const msg = `Updating user '${userId}' details`;

    // Find the user prior to the update
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Unable to find user '${userId}'`);
    }

    // Perform the update
    const result = await this.userDetailRepo.update(userId, {
      ...(undefined !== dto.birthday ? { birthday: dto.birthday } : {}),
      ...(undefined !== dto.phone ? { phone: dto.phone } : {}),
      ...(undefined !== dto.addressLine1 ? { addressLine1: dto.addressLine1 } : {}),
      ...(undefined !== dto.addressLine2 ? { addressLine2: dto.addressLine2 } : {}),
      ...(undefined !== dto.city ? { city: dto.city } : {}),
      ...(undefined !== dto.postcode ? { postcode: dto.postcode } : {}),
      ...(undefined !== dto.state ? { state: dto.state } : {}),
      ...(undefined !== dto.country ? { country: dto.country } : {}),
      ...(undefined !== dto.taxId ? { taxId: dto.taxId } : {}),
      ...(!isNil(dto.isPoaVerified) ? { isPoaVerified: dto.isPoaVerified } : {}),
      ...(!isNil(dto.isPoiVerified) ? { isPoiVerified: dto.isPoiVerified } : {}),
      ...(!isNil(dto.isPowVerified) ? { isPowVerified: dto.isPowVerified } : {}),
      ...(!isNil(dto.isPoliticallyExposed) ? { isPoliticallyExposed: dto.isPoliticallyExposed } : {}),
      ...(undefined !== dto.netCapitalUsd ? { netCapitalUsd: dto.netCapitalUsd } : {}),
      ...(undefined !== dto.annualIncomeUsd ? { annualIncomeUsd: dto.annualIncomeUsd } : {}),
      ...(undefined !== dto.approxAnnualInvestmentVolumeUsd
        ? { approxAnnualInvestmentVolumeUsd: dto.approxAnnualInvestmentVolumeUsd }
        : {}),
      ...(undefined !== dto.occupation ? { occupation: dto.occupation } : {}),
      ...(undefined !== dto.employmentStatus ? { employmentStatus: dto.employmentStatus } : {}),
      ...(undefined !== dto.sourceOfFunds ? { sourceOfFunds: dto.sourceOfFunds } : {}),
      ...(undefined !== dto.experience ? { experience: dto.experience } : {}),
    });

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update user '${userId}' details`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.get(userId);
  }

  /**
   * Updates a user's settings by their ID.
   * @param userId The id of the user to update
   * @param dto The update dto
   */
  async updateSettings(userId: string, dto: UpdateUserSettingsDto): Promise<User> {
    const msg = `Updating user '${userId}' settings`;

    // Find the user prior to the update
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Unable to find user '${userId}'`);
    }

    // Perform the update
    const result = await this.userSettingRepo.update(userId, {
      ...(!isNil(dto.canDeposit) ? { canDeposit: dto.canDeposit } : {}),
      ...(!isNil(dto.canWithdraw) ? { canWithdraw: dto.canWithdraw } : {}),
      ...(!isNil(dto.canAutoWithdraw) ? { canAutoWithdraw: dto.canAutoWithdraw } : {}),
      ...(undefined !== dto.maxAutoWithdrawAmount ? { maxAutoWithdrawAmount: dto.maxAutoWithdrawAmount } : {}),
    });

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update user '${userId}' settings`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.get(userId);
  }

  /**
   * Deletes a user by their ID.
   * @param userId The id of the user to delete
   */
  async delete(userId: string): Promise<void> {
    const msg = `Deleting user '${userId}'`;

    // Find the user by ID
    const result = await this.userRepo.delete({ id: userId });
    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to delete user '${userId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
  }
}
