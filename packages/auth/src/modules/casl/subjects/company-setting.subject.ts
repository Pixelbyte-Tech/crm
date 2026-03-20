export class CompanySettingSubject {
  id: string;
  companyId: string;

  constructor(input: CompanySettingSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
