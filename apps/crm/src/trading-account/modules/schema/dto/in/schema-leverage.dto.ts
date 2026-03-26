import { Transform } from 'class-transformer';
import { IsInt, ValidateIf, IsISO31661Alpha2 } from 'class-validator';

import { toArray, toUpperCase } from '@crm/validation';

export class SchemaLeverageDto {
  /** The list of leverage exceptions */
  @IsInt({ each: true })
  @Transform(toArray(Number))
  leverages: number[];

  /** Available to users in these countries. Leave null for no restrictions */
  @ValidateIf((s) => s.excludedCountries?.length === 0)
  @IsISO31661Alpha2({ each: true })
  @Transform(toArray(String))
  @Transform(toUpperCase)
  allowedCountries?: string[] | null;

  /** Exclude users in these countries. Leave null for no restrictions */
  @ValidateIf((s) => s.allowedCountries?.length === 0)
  @IsISO31661Alpha2({ each: true })
  @Transform(toArray(String))
  @Transform(toUpperCase)
  excludedCountries?: string[] | null;
}
