export interface TagDeletedDto {
  /** The tag id */
  tagId: string;
  /** The timestamp in (UTC millisecond timestamp) */
  deletedAt: number;
}
