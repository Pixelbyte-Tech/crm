type AccountCredential = {
  login: string;
  password: string;
};

export class AccountResult {
  /** The id of the account on the remote platform */
  platformAccountId: string;

  /** The name of the account on the remote platform */
  platformAccountName?: string;

  /** The id of the user on the remote platform */
  platformUserId?: string;

  /** The master credential for the account */
  masterCredential?: AccountCredential;

  /** The phone credential for the account */
  phoneCredential?: AccountCredential;

  /** The readonly credential for the account */
  readonlyCredential?: AccountCredential;

  constructor(data: AccountResult) {
    this.platformAccountId = data.platformAccountId;
    this.platformAccountName = data.platformAccountName;
    this.platformUserId = data.platformUserId;
    this.masterCredential = data.masterCredential;
    this.phoneCredential = data.phoneCredential;
    this.readonlyCredential = data.readonlyCredential;
  }
}
