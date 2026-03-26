export type Mt4AdditionalUpdateAccountData = undefined;
export type Mt5AdditionalUpdateAccountData = undefined;
export type TtAdditionalUpdateAccountData = undefined;
export type CtAdditionalUpdateAccountData = undefined;
export type TlAdditionalUpdateAccountData = {
  /**
   * Unlike other platforms, the concept of a leverage exist as a form of a config
   * called risk plan and each leverage is referenced within that entity
   * and has an id
   */
  riskPlanId?: string;
  /** The id of the spread plan to assign to the account */
  spreadPlanId?: string;
  /** The id of the commission plan to assign to the account */
  commissionPlanId?: string;
};
export type TeAdditionalUpdateAccountData = {
  /**
   * Unlike other platforms, the concept of a leverage exist as a form of a config
   * called risk plan and each leverage is referenced within that entity
   * and has an id
   */
  riskPlanId: number;
};

export type UpdateAccountAdditionalData =
  | Mt4AdditionalUpdateAccountData
  | Mt5AdditionalUpdateAccountData
  | TtAdditionalUpdateAccountData
  | CtAdditionalUpdateAccountData
  | TlAdditionalUpdateAccountData
  | TeAdditionalUpdateAccountData;

export class UpdateAccountDto<T extends UpdateAccountAdditionalData> {
  /** The first name of the account holder */
  firstName?: string;
  /** The last name of the account holder */
  lastName?: string;
  /** The email of the account holder */
  email?: string;
  /** The address of the account holder */
  address?: string;
  /** The city of the account holder */
  city?: string;
  /** The zipcode of the account holder */
  zipcode?: string;
  /** The state of the account holder */
  state?: string;
  /** The country of residence of the account holder (ISO 3166) */
  country?: string;
  /** The phone number of the account holder */
  phone?: string;
  /** The leverage to update the account with */
  leverage?: number;
  /** Whether the account is allowed to open or close trades */
  isTradingAllowed?: boolean;
  /** Whether the account is suspended */
  isSuspended?: boolean;
  /** The commission group the account belongs to */
  commissionGroup?: string;
  /** The spread group the account belongs to */
  spreadGroup?: string;
  /** Additional platform specific data to update the account with */
  additionalData?: T;

  constructor(data: UpdateAccountDto<T>) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.address = data.address;
    this.city = data.city;
    this.zipcode = data.zipcode;
    this.state = data.state;
    this.country = data.country;
    this.phone = data.phone;
    this.leverage = data.leverage;
    this.isTradingAllowed = data.isTradingAllowed;
    this.isSuspended = data.isSuspended;
    this.commissionGroup = data.commissionGroup;
    this.spreadGroup = data.spreadGroup;
    this.additionalData = data.additionalData;
  }
}
