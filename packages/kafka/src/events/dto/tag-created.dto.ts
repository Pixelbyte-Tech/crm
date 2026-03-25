export interface TagCreatedDto {
  /** The tag id */
  tagId: string;
  /** The tag */
  name: string;
  /** The timestamp in (UTC millisecond timestamp) */
  createdAt: number;
}
