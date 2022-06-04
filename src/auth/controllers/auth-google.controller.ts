import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {GoogleGuard} from "../../common/guards";
import {ConfirmationToken, Tokens} from "../types";
import {SignupDto} from "../dto";
import {GetCurrentUser} from "../../common/decorators";
import {Public} from "../../common/decorators/public.decorator";

@Controller('auth/google')
export class AuthGoogleController {
  constructor(private authService: AuthService) {}

  @Get()
  @Public()
  @UseGuards(GoogleGuard)
  async googleAuth(@Req() req): Promise<void> {
  }

  @Get('redirect')
  @Public()
  @UseGuards(GoogleGuard)
  googleAuthRedirect(@GetCurrentUser() signupDto: SignupDto): Promise<Tokens | ConfirmationToken> {
    return this.authService.authorizeWithSocialMedia(signupDto);
  }
}