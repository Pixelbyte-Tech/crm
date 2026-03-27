import { Gender, UserExperience, UserEmploymentStatus } from '../enums';

export class UserDetail {
  /** User detail unique identifier */
  id: string;

  birthday?: Date | null;
  phone?: string | null;

  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postcode?: string | null;
  state?: string | null;
  country?: string | null;
  language?: string | null;
  taxId?: string | null;
  gender?: Gender;

  isPoaVerified: boolean;
  isPoiVerified: boolean;
  isPowVerified: boolean;
  isPoliticallyExposed: boolean;

  netCapitalUsd?: number | null;
  annualIncomeUsd?: number | null;
  approxAnnualInvestmentVolumeUsd?: number | null;

  occupation?: string | null;
  employmentStatus?: UserEmploymentStatus | null;

  sourceOfFunds?: string | null;
  experience: UserExperience[];

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: UserDetail) {
    if (data) {
      this.id = data.id;
      this.birthday = data.birthday;
      this.phone = data.phone;

      this.addressLine1 = data.addressLine1;
      this.addressLine2 = data.addressLine2;
      this.city = data.city;
      this.postcode = data.postcode;
      this.state = data.state;
      this.country = data.country;
      this.language = data.language;
      this.taxId = data.taxId;
      this.gender = data.gender;

      this.isPoaVerified = data.isPoaVerified;
      this.isPoiVerified = data.isPoiVerified;
      this.isPowVerified = data.isPowVerified;
      this.isPoliticallyExposed = data.isPoliticallyExposed;

      this.netCapitalUsd = data.netCapitalUsd;
      this.annualIncomeUsd = data.annualIncomeUsd;
      this.approxAnnualInvestmentVolumeUsd = data.approxAnnualInvestmentVolumeUsd;

      this.occupation = data.occupation;
      this.employmentStatus = data.employmentStatus;

      this.sourceOfFunds = data.sourceOfFunds;
      this.experience = data.experience;

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
