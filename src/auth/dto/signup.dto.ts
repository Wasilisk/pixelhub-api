import {IsEmail, IsNotEmpty} from "class-validator";

export class SignupDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}