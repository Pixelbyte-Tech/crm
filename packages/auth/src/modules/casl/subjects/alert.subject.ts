export class AlertSubject {
  id: string;
  companyId: string;

  constructor(input: AlertSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
