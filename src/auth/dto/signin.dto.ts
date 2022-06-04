import {IsEmail, IsNotEmpty, IsString, MaxLength, MinLength} from "class-validator";

export class SigninDto {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string
}