export class InvitationSubject {
  sentByUserId: string;

  constructor(input?: InvitationSubject) {
    if (input) {
      this.sentByUserId = input.sentByUserId;
    }
  }
}
