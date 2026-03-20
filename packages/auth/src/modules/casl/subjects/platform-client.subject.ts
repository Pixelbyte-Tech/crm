export class PlatformClientSubject {
  id: string;
  companyId: string;

  constructor(input: PlatformClientSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
