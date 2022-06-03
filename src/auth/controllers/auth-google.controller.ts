import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {GoogleGuard} from "../../common/guards";
import {Tokens} from "../types";
import {SignupDto} from "../dto";
import {GetCurrentUserId} from "../../common/decorators";

@Controller('auth/google')
export class AuthGoogleController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(GoogleGuard)
  async googleAuth(@Req() req): Promise<void> {
  }

  @Get('redirect')
  @UseGuards(GoogleGuard)
  googleAuthRedirect(@GetCurrentUserId() signupDto: SignupDto): Promise<Tokens | string> {
    return this.authService.authorizeWithSocialMedia(signupDto);
  }
}