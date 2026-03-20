import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable, NotFoundException } from '@nestjs/common';

import { Role } from '@crm/types';
import { Cryptography } from '@crm/utils';

import { UserEntity } from '../../entities/user.entity';
import { CompanyEntity } from '../../entities/company.entity';
import { UserCompanyEntity } from '../../entities/user-company.entity';
import { UserSettingEntity } from '../../entities/user-setting.entity';
import { OrganisationEntity } from '../../entities/organisation.entity';
import { ADMIN_USER_EMAIL, ORGANISATION_NAME, BROKER_COMPANY_NAME, STANDARD_USER_EMAIL } from '../seed-ids';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(CompanyEntity) private companyRepo: Repository<CompanyEntity>,
    @InjectRepository(OrganisationEntity) private orgRepo: Repository<OrganisationEntity>,
    @InjectRepository(UserCompanyEntity) private userCompanyRepo: Repository<UserCompanyEntity>,
  ) {}

  readonly #logger = new Logger(this.constructor.name);

  async run() {
    this.#logger.log('Starting users seed');

    // Find the id of the seed company
    const company = await this.companyRepo.findOne({ where: { name: BROKER_COMPANY_NAME } });
    if (!company) {
      this.#logger.error(`Error seeding users, no company found`);
      throw new NotFoundException('Company not Found');
    }

    // Find the organisation
    const org = await this.orgRepo.findOne({ where: { name: ORGANISATION_NAME } });
    if (!org) {
      this.#logger.error(`Error seeding users, no organisation found`);
      throw new NotFoundException('Organisation not Found');
    }

    try {
      const count = await this.userRepo.count({ where: { email: STANDARD_USER_EMAIL } });
      if (count === 0) {
        const user = new UserEntity();
        user.organisationId = org.id;
        user.companyId = company.id;
        user.firstName = 'John';
        user.lastName = 'Doe';
        user.email = STANDARD_USER_EMAIL;
        user.securityPin = '1234';
        user.passwordHash = Cryptography.hash('P@ssword123');
        user.isEmailVerified = true;
        user.emailVerifiedAt = new Date();
        user.isCookiesAccepted = true;
        user.cookiesAcceptedAt = new Date();
        user.isPrivacyAccepted = true;
        user.privacyAcceptedAt = new Date();
        user.isTermsAccepted = true;
        user.termsAcceptedAt = new Date();

        // Create the user settings
        const userSettings = new UserSettingEntity();
        userSettings.canAutoWithdraw = false;
        userSettings.canDeposit = true;
        userSettings.canWithdraw = true;
        userSettings.maxAutoWithdrawAmount = 1000;
        userSettings.companyId = company.id;

        user.settings = userSettings;

        await this.userRepo.save(user);
        this.#logger.log(`Seeded user '${STANDARD_USER_EMAIL}'`);
      } else {
        this.#logger.log('User already seeded, skipping');
      }

      const countSuper = await this.userRepo.count({ where: { email: ADMIN_USER_EMAIL } });
      if (countSuper === 0) {
        const user = new UserEntity();
        user.organisationId = org.id;
        user.firstName = 'John';
        user.lastName = 'Doe (super)';
        user.email = ADMIN_USER_EMAIL;
        user.securityPin = '4321';
        user.passwordHash = Cryptography.hash('P@ssword123');
        user.isEmailVerified = true;
        user.emailVerifiedAt = new Date();
        user.isCookiesAccepted = true;
        user.cookiesAcceptedAt = new Date();
        user.isPrivacyAccepted = true;
        user.privacyAcceptedAt = new Date();
        user.isTermsAccepted = true;
        user.termsAcceptedAt = new Date();

        // Create the user settings
        const userSettings = new UserSettingEntity();
        userSettings.canAutoWithdraw = true;
        userSettings.canDeposit = true;
        userSettings.canWithdraw = true;
        userSettings.maxAutoWithdrawAmount = 5000;
        userSettings.companyId = company.id;

        user.settings = userSettings;

        const savedUser = await this.userRepo.save(user);
        this.#logger.log(`Seeded user '${ADMIN_USER_EMAIL}'`);

        // Assign the user to the company
        await this.userCompanyRepo.save({
          userId: savedUser.id,
          companyId: company.id,
          roles: [Role.ADMIN],
        });
      }
    } catch (err) {
      this.#logger.error(`Error seeding users`, err);
      throw err;
    }
  }
}
