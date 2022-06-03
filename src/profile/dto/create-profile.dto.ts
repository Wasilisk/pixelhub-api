import {IsNotEmpty, IsOptional, IsString, MaxLength, MinLength} from "class-validator";

export class CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio: string;
}
