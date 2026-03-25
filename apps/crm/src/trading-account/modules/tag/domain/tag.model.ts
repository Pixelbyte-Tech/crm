export class Tag {
  /** Tag unique identifier */
  id: string;
  name: string;

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: Tag) {
    if (data) {
      this.id = data.id;
      this.name = data.name;

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
