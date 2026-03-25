import { IsString, IsNotEmpty } from 'class-validator';

export class DxServerSettingsDto {
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

  /** The domain on the server */
  @IsString()
  @IsNotEmpty()
  domain: string;
}
