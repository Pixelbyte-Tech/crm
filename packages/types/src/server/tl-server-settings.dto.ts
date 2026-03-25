import { IsString, IsNotEmpty } from 'class-validator';

export class TlServerSettingsDto {
  /** The api host */
  @IsString()
  @IsNotEmpty()
  host: string;

  /** The api key  */
  @IsString()
  @IsNotEmpty()
  apiKey: string;
}
