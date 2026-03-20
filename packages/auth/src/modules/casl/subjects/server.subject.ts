export class ServerSubject {
  id: string;
  companyId: string;

  constructor(input: ServerSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
