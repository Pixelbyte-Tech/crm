export class ChannelSubject {
  id: string;
  companyId: string;

  constructor(input: ChannelSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
