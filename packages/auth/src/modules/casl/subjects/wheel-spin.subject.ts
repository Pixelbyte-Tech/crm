export class WheelSpinSubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: WheelSpinSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
