import { IsString, IsNotEmpty } from 'class-validator';

export class SendxSettingsDto {
  @IsString()
  @IsNotEmpty()
  teamApiKey: string;
}
