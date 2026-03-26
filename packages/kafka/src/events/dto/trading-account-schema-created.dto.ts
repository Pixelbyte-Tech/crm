export interface TradingAccountSchemaCreatedDto {
  /** The schema id */
  schemaId: string;
  /** The server id this schema is associated with*/
  serverId: string;
  /** The schema friendly name  */
  name: string;
  /** The schema description  */
  description?: string;
  /** Whether the schema is enabled and usable */
  isEnabled?: boolean;
  /** Whether users must be KYC verified before creating an account */
  isKycRequired?: boolean;
  /** The allowed account leverage values */
  allowedLeverages?: number[];
  /** Any leverage overwrites applicable to the schema */
  leverageOverwrites?: {
    leverages: number[];
    allowedCountries?: string[];
    excludedCountries?: string[];
  }[];
  /** The allowed account currency values */
  allowedCurrencies?: string[];
  /** Available to users in these countries. Leave null for no restrictions */
  allowedCountries?: string[];
  /** Exclude users in these countries. Leave null for no restrictions */
  excludedCountries?: string[];
  /** The minimum deposit amount allowed for accounts created with this schema. Leave null for no limit */
  minDepositAmountUsd?: number;
  /** The maximum deposit amount allowed for accounts created with this schema. Leave null for no limit */
  maxDepositAmountUsd?: number;
  /** The maximum number of accounts a user can have with this schema. Leave null for no limit */
  maxAccountsPerUser?: number;
  /** The user group id in the platform that will be assigned to users with accounts created with this schema */
  platformUserGroupId: string;
  /** The timestamp in (UTC millisecond timestamp) */
  createdAt: number;
}
