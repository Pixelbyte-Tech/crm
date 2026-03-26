export class DeleteHolidayDto {
  /** The symbols to which the holiday should be deleted */
  symbols: string[];
  /** The name of the holiday to delete */
  name: string;
  /** The start day/time in the symbol timezone */
  from: Date;
  /** The end day/time in the symbol timezone. Only applies if isAllDay is false  */
  to?: Date;
  /** Whether the holiday to delete covers the entire day */
  isAllDay: boolean;

  constructor(data: DeleteHolidayDto) {
    this.symbols = data.symbols;
    this.name = data.name;
    this.from = data.from;
    this.to = data.to;
    this.isAllDay = data.isAllDay;
  }
}
