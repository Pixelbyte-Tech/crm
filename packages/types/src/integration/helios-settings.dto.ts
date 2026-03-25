import { IsString, IsNotEmpty } from 'class-validator';

export class HeliosSettingsDto {
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  apiSecret: string;

  @IsString()
  @IsNotEmpty()
  apiToken: string;

  @IsString()
  @IsNotEmpty()
  paylink: string;

  @IsString()
  @IsNotEmpty()
  walletId: string;
}
