export class UpdateHolidayDto {
  find: {
    /** The name of the holiday */
    name: string;
    /** The start day/time in the symbol timezone */
    from: Date;
    /** The end day/time in the symbol timezone. Only applies if isAllDay is false  */
    to?: Date;
    /** Specifies specific instances of the holiday which only effects the provided symbols */
    symbols?: string[];
    /** Whether the holiday covers the entire day */
    isAllDay: boolean;
  };

  set: {
    /** The new name of the holiday */
    name?: string;

    dates?: {
      /** The new start day/time in the symbol timezone */
      from: Date;
      /** The new end day/time in the symbol timezone. Only applies if isAllDay is false  */
      to?: Date;
      /** Updates whether the holiday covers the entire day */
      isAllDay: boolean;
    };

    symbols?: {
      /** Symbols to add to the holiday */
      add?: string[];
      /** Symbols to remove from the holiday */
      remove?: string[];
    };
  };

  constructor(data: UpdateHolidayDto) {
    this.find = data.find;
    this.set = data.set;
  }
}
