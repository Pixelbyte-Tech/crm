export class UpdatePasswordDto {
  /** The new main password to set */
  password?: string;
  /** The new phone password to set */
  passwordPhone?: string;
  /** The new readonly/investor password to set */
  passwordReadOnly?: string;

  constructor(data: UpdatePasswordDto) {
    this.password = data.password;
    this.passwordPhone = data.passwordPhone;
    this.passwordReadOnly = data.passwordReadOnly;
  }
}
