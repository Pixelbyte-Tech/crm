export class JournalEntry {
  /** The datetime when the journal entry was created */
  createdAt: Date;

  /** The journal entry data */
  data: object;

  constructor(data: JournalEntry) {
    this.createdAt = data.createdAt;
    this.data = data.data;
  }
}
