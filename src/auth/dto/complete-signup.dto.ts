import {CreateProfileDto} from "../../profile/dto";
import {IsNotEmpty, IsString, MaxLength, MinLength, ValidateNested} from "class-validator";
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

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile: CreateProfileDto
}