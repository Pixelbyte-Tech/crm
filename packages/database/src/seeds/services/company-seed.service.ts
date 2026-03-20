import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable, NotFoundException } from '@nestjs/common';

import { CompanyType, CompanySetting } from '@crm/types';

import { CompanyEntity } from '../../entities/company.entity';
import { OrganisationEntity } from '../../entities/organisation.entity';
import { CompanySettingEntity } from '../../entities/company-setting.entity';
import { PROP_COMPANY_NAME, ORGANISATION_NAME, BROKER_COMPANY_NAME } from '../seed-ids';

@Injectable()
export class CompanySeedService {
  constructor(
    @InjectRepository(CompanyEntity) private companyRepo: Repository<CompanyEntity>,
    @InjectRepository(OrganisationEntity) private orgRepo: Repository<OrganisationEntity>,
  ) {}

  readonly #logger = new Logger(this.constructor.name);

  async run() {
    this.#logger.log('Starting companies seed');

    // Find the organisation
    const org = await this.orgRepo.findOne({ where: { name: ORGANISATION_NAME } });
    if (!org) {
      this.#logger.error(`Error seeding companies, no organisation found`);
      throw new NotFoundException('Organisation not Found');
    }

    try {
      const countBroker = await this.companyRepo.count({ where: { name: BROKER_COMPANY_NAME } });
      if (countBroker === 0) {
        const company = new CompanyEntity();
        company.organisationId = org.id;
        company.name = BROKER_COMPANY_NAME;
        company.type = CompanyType.BROKER;
        company.domain = 'broker.example.com';
        company.settings = this.#getSettings();

        await this.companyRepo.save(company);
        this.#logger.log(`Seeded company '${BROKER_COMPANY_NAME}'`);
      }

      const countProp = await this.companyRepo.count({ where: { name: PROP_COMPANY_NAME } });
      if (countProp === 0) {
        const company = new CompanyEntity();
        company.organisationId = org.id;
        company.name = PROP_COMPANY_NAME;
        company.type = CompanyType.PROP;
        company.domain = 'prop.example.com';
        company.settings = this.#getSettings();

        await this.companyRepo.save(company);
        this.#logger.log(`Seeded company '${PROP_COMPANY_NAME}'`);
      }
    } catch (err) {
      this.#logger.error(`Error seeding companies`, err);
      throw err;
    }
  }

  /**
   * Prepares base settings for seeded companies
   */
  #getSettings(): CompanySettingEntity[] {
    const settings: CompanySettingEntity[] = [];

    const depositSetting = new CompanySettingEntity();
    depositSetting.key = CompanySetting.USER_CAN_DEPOSIT;
    depositSetting.value = '1';

    const withdrawSetting = new CompanySettingEntity();
    withdrawSetting.key = CompanySetting.USER_CAN_WITHDRAW;
    withdrawSetting.value = '1';

    const authWithdrawSetting = new CompanySettingEntity();
    authWithdrawSetting.key = CompanySetting.USER_CAN_AUTO_WITHDRAW;
    authWithdrawSetting.value = '0';

    const maxWithdrawSetting = new CompanySettingEntity();
    maxWithdrawSetting.key = CompanySetting.USER_MAX_AUTO_WITHDRAW_AMT;
    maxWithdrawSetting.value = '1000';

    settings.push(depositSetting);
    settings.push(withdrawSetting);
    settings.push(maxWithdrawSetting);
    settings.push(authWithdrawSetting);

    return settings;
  }
}
