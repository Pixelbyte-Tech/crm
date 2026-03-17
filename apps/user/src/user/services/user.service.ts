import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import {
  Logger,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { User } from '@crm/types';
import { UserStatus } from '@crm/types';
import { Cryptography } from '@crm/utils';
import { UserEntity } from '@crm/database';
import { PaginatedResDto } from '@crm/http';

import { UserMapper } from '../mappers';
import { AuthService } from '../../auth/services';
import { NewUserDto, ListUsersDto, CreateUserDto, UpdateUserDto } from '../dto';

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly userMapper: UserMapper,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches a user by their ID.
   * @param userId The id of the user to fetch
   */
  async get(userId: string): Promise<User> {
    const msg = `Fetching user ${userId}`;

    // Find the user by ID
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find user ${userId}`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.userMapper.toUser(user);
  }

  /**
   * Lists all users
   * @param dto The list dto
   */
  async list(dto: ListUsersDto): Promise<PaginatedResDto<User>> {
    // Find the traders for the company
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
   * @param dto The login dto
   */
  async create(dto: CreateUserDto): Promise<NewUserDto> {
    const msg = `Attempting to create user from email '${dto.email}'`;

    // Create the new user
    const user = await this.userRepo.save({
      email: dto.email,
      password: Cryptography.hash(dto.password),
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
      securityPin: Math.floor(1000 + Math.random() * 9000).toString(),
      status: UserStatus.ACTIVE,
    });

    if (!user) {
      this.#logger.error(`${msg} - Failed`);
      throw new InternalServerErrorException(`Failed to create user from email '${dto.email}'`);
    }

    try {
      // Generate a confirmation token and send the email
      const token = await this.authService.generateEmailConfirmationToken(user.id);

      // todo send email confirm email

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
   * @param userId The id of the user to fetch
   * @param dto The update dto
   */
  async update(userId: string, dto: UpdateUserDto): Promise<User> {
    const msg = `Updating user ${userId}`;

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

    // Find the user by ID
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
      throw new UnprocessableEntityException(`Failed to update user ${userId}`);
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
