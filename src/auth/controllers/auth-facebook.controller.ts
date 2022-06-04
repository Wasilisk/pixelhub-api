import {Body, Controller, Get, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {FacebookGuard} from "../../common/guards";
import {ConfirmationToken, Tokens} from "../types";
import {SignupDto} from "../dto";
import {GetCurrentUser} from "../../common/decorators";
import {Public} from "../../common/decorators/public.decorator";

@Controller('auth/facebook')
export class AuthFacebookController {
  constructor(private authService: AuthService) {
  }

  @Get()
  @Public()
  @UseGuards(FacebookGuard)
  async facebookAuth(): Promise<void> {}

  @Get('/redirect')
  @Public()
  @UseGuards(FacebookGuard)
  facebookAuthRedirect(@GetCurrentUser() signupDto: SignupDto): Promise<Tokens | ConfirmationToken> {
    return this.authService.authorizeWithSocialMedia(signupDto);
  }
}