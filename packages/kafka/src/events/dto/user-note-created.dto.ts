export interface UserNoteCreatedDto {
  /* The unique id of the note */
  noteId: string;
  /** The note body */
  body: string;
  /** The note string */
  summary?: string;
  /** The id of the note author */
  authorId: string;
  /** The id of the user the note refers to */
  userId: string;
  /** The timestamp in (UTC millisecond timestamp) */
  createdAt: number;
}
