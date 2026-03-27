export class UserGroup {
  platformId: string;
  platformName?: string;
  currency?: string;

  constructor(data?: UserGroup) {
    if (data) {
      this.platformId = data.platformId;
      this.platformName = data.platformName;
      this.currency = data.currency;
    }
  }
}
