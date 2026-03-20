export class CompanySubject {
  id: string;
  organisationId: string;

  constructor(input: CompanySubject) {
    this.id = input.id;
    this.organisationId = input.organisationId;
  }
}
