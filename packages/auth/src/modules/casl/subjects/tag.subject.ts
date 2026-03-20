export class TagSubject {
  id: string;
  companyId: string;

  constructor(input: TagSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
