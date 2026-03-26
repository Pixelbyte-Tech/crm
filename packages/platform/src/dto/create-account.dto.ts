import { Gender, Monetisation } from '@crm/types';

export type Mt5AdditionalCreateAccountData = undefined;
export type CtAdditionalCreateAccountData = undefined;
export type TlAdditionalCreateAccountData = {
  /** The risk plan id to assign to the account (overwrites the leverage property) */
  riskPlanId?: number;
  /** Ensures de-duplication when creating accounts by preventing more than 1 account to be created with the same key */
  idempotencyKey?: string;
};

export type CreateAccountAdditionalData =
  | Mt5AdditionalCreateAccountData
  | CtAdditionalCreateAccountData
  | TlAdditionalCreateAccountData;

export class CreateAccountDto<T extends CreateAccountAdditionalData> {
  /** The UID of the brand on which to create the account */
  brandUid: string;
  /** The id of the user on the project */
  projectUserId: string;
  /** The leverage to create the account with */
  leverage: number;
  /** The currency to assign to the created account */
  currency: string;
  /** The first name of the account holder */
  firstName: string;
  /** The last name of the account holder */
  lastName: string;
  /** The email address of the account holder */
  email: string;
  /** The password to use for the account */
  password: string;
  /** The gender of the account holder */
  gender: Gender;
  /** The chosen language to create the account in */
  language: string;
  /** The Monetisation type of the account */
  monetisation: Monetisation;
  /**
   * Specifies the account id to use on the platform. This id auto generated
   * based on the project configs and should only be changed if you know what you are doing!
   **/
  platformAccountId?: string;
  /** A user-friendly name for the new account */
  friendlyName?: string;
  /** The address of the account holder */
  address?: string;
  /** The city of the account holder */
  city?: string;
  /** The postal code of the account holder */
  zipcode?: string;
  /** The state of the account holder */
  state?: string;
  /** The country of residence of the account holder as alpha 2 ISO 3166 */
  country?: string;
  /** The phone number of the account holder */
  phone?: string;
  /** A readonly/investor password to use with the account */
  readonlyPassword?: string;
  /** A phone password to use with the account */
  phonePassword?: string;
  /** The lead source which generated the account */
  leadSource?: string;
  /** Any additional comment related to account creation */
  comment?: string;
  /** Additional platform specific data to create the account with */
  additionalData?: T;

  constructor(data: CreateAccountDto<T>) {
    this.brandUid = data.brandUid;
    this.projectUserId = data.projectUserId;
    this.leverage = data.leverage;
    this.currency = data.currency;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.gender = data.gender;
    this.language = data.language;
    this.monetisation = data.monetisation;
    this.platformAccountId = data.platformAccountId;
    this.friendlyName = data.friendlyName;
    this.address = data.address;
    this.city = data.city;
    this.zipcode = data.zipcode;
    this.state = data.state;
    this.country = data.country;
    this.phone = data.phone;
    this.readonlyPassword = data.readonlyPassword;
    this.phonePassword = data.phonePassword;
    this.leadSource = data.leadSource;
    this.comment = data.comment;
    this.additionalData = data.additionalData;
  }
}
