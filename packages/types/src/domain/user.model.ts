import { UserStatus } from '../enums';
import { UserDetail } from './user-detail.model';
import { UserSetting } from './user-setting.model';

export class User {
  /** User unique identifier */
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  securityPin: string;
  status: UserStatus;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date | null;
  isTermsAccepted: boolean;
  termsAcceptedAt?: Date | null;
  isPrivacyAccepted: boolean;
  privacyAcceptedAt?: Date | null;
  isCookiesAccepted: boolean;
  cookiesAcceptedAt?: Date | null;

  details: UserDetail;
  settings: UserSetting;

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: User) {
    if (data) {
      this.id = data.id;

      this.firstName = data.firstName;
      this.middleName = data.middleName;
      this.lastName = data.lastName;

      this.email = data.email;
      this.securityPin = data.securityPin;
      this.status = data.status;

      this.isEmailVerified = data.isEmailVerified;
      this.emailVerifiedAt = data.emailVerifiedAt;
      this.isTermsAccepted = data.isTermsAccepted;
      this.termsAcceptedAt = data.termsAcceptedAt;
      this.isPrivacyAccepted = data.isPrivacyAccepted;
      this.privacyAcceptedAt = data.privacyAcceptedAt;
      this.isCookiesAccepted = data.isCookiesAccepted;
      this.cookiesAcceptedAt = data.cookiesAcceptedAt;

      this.details = data.details ?? new UserDetail();
      this.settings = data.settings ?? new UserSetting();

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
