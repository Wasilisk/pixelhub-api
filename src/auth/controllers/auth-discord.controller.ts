import {Body, Controller, Get, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {DiscordGuard} from "../../common/guards";
import {Tokens} from "../types";

@Controller('auth/discord')
export class AuthDiscordController {
  constructor(private authService: AuthService) {
  }

  @Get()
  @UseGuards(DiscordGuard)
  async googleAuth(): Promise<void>  {}

  @Get('/redirect')
  @UseGuards(DiscordGuard)
  googleAuthRedirect(@Body('email') email: string): Promise<Tokens | string> {
    return this.authService.authorizeWithSocialMedia(email);
  }
}