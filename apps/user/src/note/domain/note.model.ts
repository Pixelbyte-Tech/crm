export class Note {
  id: string;
  summary?: string;
  body: string;
  isPinned: boolean;
  authorId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data?: Note) {
    if (data) {
      this.id = data.id;
      this.summary = data.summary;
      this.body = data.body;
      this.isPinned = data.isPinned;
      this.authorId = data.authorId;
      this.userId = data.userId;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
