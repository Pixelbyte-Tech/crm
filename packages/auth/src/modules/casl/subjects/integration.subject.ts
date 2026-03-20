export class IntegrationSubject {
  id: string;
  companyId: string;

  constructor(input: IntegrationSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
