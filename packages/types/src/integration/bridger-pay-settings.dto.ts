import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class BridgerPaySettingsDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsUUID()
  @IsNotEmpty()
  apiKey: string;

  @IsUUID()
  @IsNotEmpty()
  cashierKey: string;
}
