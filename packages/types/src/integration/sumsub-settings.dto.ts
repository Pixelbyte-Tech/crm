import { IsString, IsNotEmpty } from 'class-validator';

export class SumSubSettingsDto {
  @IsString()
  @IsNotEmpty()
  appToken: string;

  @IsString()
  @IsNotEmpty()
  secretKey: string;

  @IsString()
  @IsNotEmpty()
  webhookSecret: string;
}
