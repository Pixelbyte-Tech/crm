export interface UserNoteDeletedDto {
  /** The unique id of the note */
  noteId: string;
  /** The timestamp in (UTC millisecond timestamp) */
  deletedAt: number;
}
