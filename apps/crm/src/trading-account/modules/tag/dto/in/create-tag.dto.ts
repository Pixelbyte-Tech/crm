import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTagDto {
  /** The tag */
  @IsNotEmpty()
  @IsString()
  name: string;
}
