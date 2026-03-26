type Flags = 'LOG_FLAGS_NONE';
type Code = 'MTLogFolder';
type Type = 'MTLogFolder';

export interface Mt5JournalEntry {
  flags: Flags;
  code: Code;
  type: Type;
  datetime: number;
  source: string;
  message: string;
  datetime_msc: number;
  reserved: number[];
}
