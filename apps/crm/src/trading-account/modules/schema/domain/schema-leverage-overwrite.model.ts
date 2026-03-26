export class SchemaLeverageOverwrite {
  /** Leverage overwrite unique identifier */
  id: string;
  leverages: number[];
  allowedCountries?: string[];
  excludedCountries?: string[];

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: SchemaLeverageOverwrite) {
    if (data) {
      this.id = data.id;
      this.leverages = data.leverages;
      this.allowedCountries = data.allowedCountries;
      this.excludedCountries = data.excludedCountries;

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
