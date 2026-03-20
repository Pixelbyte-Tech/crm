import { Injectable } from '@nestjs/common';

import { User, UserDetail, UserSetting } from '@crm/types';
import { UserEntity, UserDetailEntity } from '@crm/database';

@Injectable()
export class UserMapper {
  toUser(data: UserEntity): User {
    const user = new User();
    user.id = data.id;

    user.firstName = data.firstName;
    user.middleName = data.middleName;
    user.lastName = data.lastName;

    user.email = data.email;
    user.passwordHash = data.passwordHash;
    user.securityPin = data.securityPin;
    user.status = data.status;

    user.isEmailVerified = data.isEmailVerified;
    user.emailVerifiedAt = data.emailVerifiedAt;
    user.isTermsAccepted = data.isTermsAccepted;
    user.termsAcceptedAt = data.termsAcceptedAt;
    user.isPrivacyAccepted = data.isPrivacyAccepted;
    user.privacyAcceptedAt = data.privacyAcceptedAt;
    user.isCookiesAccepted = data.isCookiesAccepted;
    user.cookiesAcceptedAt = data.cookiesAcceptedAt;

    if (data.detail) {
      user.details = this.#toUserDetails(data.detail);
    }

    if (data.settings) {
      user.settings = this.#toUserSetting(data.settings);
    }

    user.createdAt = data.createdAt;
    user.updatedAt = data.updatedAt;
    return user;
  }

  #toUserDetails(data: UserDetailEntity): UserDetail {
    const userDetail = new UserDetail();
    userDetail.id = data.id;

    userDetail.birthday = data.birthday;
    userDetail.phone = data.phone;

    userDetail.addressLine1 = data.addressLine1;
    userDetail.addressLine2 = data.addressLine2;
    userDetail.city = data.city;
    userDetail.postcode = data.postcode;
    userDetail.state = data.state;
    userDetail.country = data.country;
    userDetail.taxId = data.taxId;

    userDetail.isPoaVerified = data.isPoaVerified;
    userDetail.isPoiVerified = data.isPoiVerified;
    userDetail.isPowVerified = data.isPowVerified;
    userDetail.isPoliticallyExposed = data.isPoliticallyExposed;

    userDetail.netCapitalUsd = data.netCapitalUsd;
    userDetail.annualIncomeUsd = data.annualIncomeUsd;
    userDetail.approxAnnualInvestmentVolumeUsd = data.approxAnnualInvestmentVolumeUsd;

    userDetail.occupation = data.occupation;
    userDetail.employmentStatus = data.employmentStatus;

    userDetail.sourceOfFunds = data.sourceOfFunds;
    userDetail.experience = data.experience ?? [];

    userDetail.createdAt = data.createdAt;
    userDetail.updatedAt = data.updatedAt;
    return userDetail;
  }

  #toUserSetting(data: UserSetting): UserSetting {
    const userSetting = new UserSetting();
    userSetting.id = data.id;

    userSetting.canDeposit = data.canDeposit;
    userSetting.canWithdraw = data.canWithdraw;
    userSetting.canAutoWithdraw = data.canAutoWithdraw;
    userSetting.maxAutoWithdrawAmount = data.maxAutoWithdrawAmount;

    userSetting.createdAt = data.createdAt;
    userSetting.updatedAt = data.updatedAt;
    return userSetting;
  }
}
