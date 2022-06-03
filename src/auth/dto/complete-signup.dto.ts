import {CreateProfileDto} from "../../profile/dto";
import {IsString, MaxLength, MinLength, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {Match} from "../../common/decorators";

export class CompleteSignupDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Match('password')
  confirmPassword: string;

  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile: CreateProfileDto
}