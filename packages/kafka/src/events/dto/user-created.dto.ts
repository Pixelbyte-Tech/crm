export interface UserCreatedDto {
  /** The unique identifier of the user */
  userId: string;
  /** The id of the company the user is registered with */
  companyId: string;
  /** The email address of the user */
  email: string;
  /** The token the user needs to use in order to confirm their email */
  confirmEmailToken: string;
  /** The date the integration was created (UTC millisecond timestamp) */
  createdAt: number;
}
