import {Body, Controller, Get, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {FacebookGuard} from "../../common/guards";
import {Tokens} from "../types";

@Controller('auth/discord')
export class AuthFacebookController {
  constructor(private authService: AuthService) {
  }

  @Get()
  @UseGuards(FacebookGuard)
  async googleAuth(): Promise<void> {}

  @Get('/redirect')
  @UseGuards(FacebookGuard)
  googleAuthRedirect(@Body('email') email: string): Promise<Tokens | string> {
    return this.authService.authorizeWithSocialMedia(email);
  }
}