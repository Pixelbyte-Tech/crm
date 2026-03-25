import { IsString, IsNotEmpty } from 'class-validator';

export class Mt5ServerSettingsDto {
  /** The api host */
  @IsString()
  @IsNotEmpty()
  host: string;

  /** The api username */
  @IsString()
  @IsNotEmpty()
  username: string;

  /** The api password */
  @IsString()
  @IsNotEmpty()
  password: string;
}
