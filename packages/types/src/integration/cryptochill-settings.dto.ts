import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CryptochillSettingsDto {
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  apiSecret: string;

  @IsString()
  @IsNotEmpty()
  callbackToken: string;

  @IsUUID()
  @IsNotEmpty()
  profileId: string;
}
