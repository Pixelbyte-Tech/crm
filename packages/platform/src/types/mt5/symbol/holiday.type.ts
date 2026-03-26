export enum Mt5HolidayMode {
  HOLIDAY_ENABLED = 'HOLIDAY_ENABLED',
  HOLIDAY_DISABLED = 'HOLIDAY_DISABLED',
}

export interface Mt5Holiday {
  description: string;
  mode: Mt5HolidayMode;
  year: number;
  month: number;
  day: number;
  workFrom: number;
  workFromHours: number;
  workFromMinutes: number;
  workTo: number;
  workToHours: number;
  workToMinutes: number;
  symbolTotal: number;
  symbols: string[];
}
