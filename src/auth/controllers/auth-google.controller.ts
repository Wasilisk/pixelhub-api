import {Body, Controller, Get, Req, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {GoogleGuard} from "../../common/guards";
import {Tokens} from "../types";

@Controller('auth/google')
export class AuthGoogleController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(GoogleGuard)
  async googleAuth(@Req() req) {
  }

  @Get('/redirect')
  @UseGuards(GoogleGuard)
  googleAuthRedirect(@Body('email') email: string): Promise<Tokens | string> {
    return this.authService.authorizeWithSocialMedia(email);
  }
}