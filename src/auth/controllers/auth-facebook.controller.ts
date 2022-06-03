import {Body, Controller, Get, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {FacebookGuard} from "../../common/guards";
import {Tokens} from "../types";
import {SignupDto} from "../dto";
import {GetCurrentUserId} from "../../common/decorators";

@Controller('auth/facebook')
export class AuthFacebookController {
  constructor(private authService: AuthService) {
  }

  @Get()
  @UseGuards(FacebookGuard)
  async facebookAuth(): Promise<void> {}

  @Get('/redirect')
  @UseGuards(FacebookGuard)
  facebookAuthRedirect(@GetCurrentUserId() signupDto: SignupDto): Promise<Tokens | string> {
    return this.authService.authorizeWithSocialMedia(signupDto);
  }
}