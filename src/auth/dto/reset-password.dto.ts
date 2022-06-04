import {IsString, MaxLength, MinLength} from "class-validator";
import {Match} from "../../common/decorators";

export class ResetPasswordDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  newPassword: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Match('newPassword')
  confirmNewPassword: string;
}