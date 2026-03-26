export class AddHolidayDto {
  /** The symbols to which the holiday should be assigned */
  symbols: string[];
  /** The name of the holiday */
  name: string;
  /** The start day/time in the symbol timezone */
  from: Date;
  /** The end day/time in the symbol timezone. Only applies if isAllDay is false  */
  to?: Date;
  /** Whether the holiday covers the entire day */
  isAllDay: boolean;

  constructor(data: AddHolidayDto) {
    this.symbols = data.symbols;
    this.name = data.name;
    this.from = data.from;
    this.to = data.to;
    this.isAllDay = data.isAllDay;
  }
}
