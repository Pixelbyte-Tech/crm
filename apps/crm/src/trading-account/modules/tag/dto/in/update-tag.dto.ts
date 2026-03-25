import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateTagDto {
  /** The tag */
  @IsNotEmpty()
  @IsString()
  name: string;
}
