import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable } from '@nestjs/common';

import { Role } from '@crm/types';
import { Cryptography } from '@crm/utils';

import { UserEntity } from '../../entities/user.entity';
import { ADMIN_USER_EMAIL, STANDARD_USER_EMAIL } from '../seed-ids';
import { UserSettingEntity } from '../../entities/user-setting.entity';

@Injectable()
export class UserSeedService {
  constructor(@InjectRepository(UserEntity) private repo: Repository<UserEntity>) {}

  readonly #logger = new Logger(this.constructor.name);

  async run() {
    this.#logger.log('Starting users seed');

    try {
      const count = await this.repo.count({ where: { email: STANDARD_USER_EMAIL } });
      if (count === 0) {
        const user = new UserEntity();
        user.firstName = 'John';
        user.lastName = 'Doe';
        user.roles = [Role.USER];
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

        user.settings = userSettings;

        await this.repo.save(user);
        this.#logger.log(`Seeded user '${STANDARD_USER_EMAIL}'`);
      } else {
        this.#logger.log('User already seeded, skipping');
      }

      const countSuper = await this.repo.count({ where: { email: ADMIN_USER_EMAIL } });
      if (countSuper === 0) {
        const user = new UserEntity();
        user.firstName = 'John';
        user.lastName = 'Doe (super)';
        user.roles = [Role.ADMIN];
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

        user.settings = userSettings;

        await this.repo.save(user);
        this.#logger.log(`Seeded user '${ADMIN_USER_EMAIL}'`);
      }
    } catch (err) {
      this.#logger.error(`Error seeding users`, err);
      throw err;
    }
  }
}
