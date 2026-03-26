export class PasswordResult {
  /** The account master password */
  master?: boolean;

  /** The account phone password */
  phone?: boolean;

  /** The account read-only password (investor password) */
  readOnly?: boolean;

  constructor(data: PasswordResult) {
    this.master = data.master;
    this.phone = data.phone;
    this.readOnly = data.readOnly;
  }
}
