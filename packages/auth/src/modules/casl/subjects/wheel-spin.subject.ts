export class WheelSpinSubject {
  userId: string;

  constructor(input?: WheelSpinSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
