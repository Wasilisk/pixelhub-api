import {Body, Controller, Get, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {DiscordGuard} from "../../common/guards";
import {Tokens} from "../types";
import {SignupDto} from "../dto";
import {GetCurrentUserId} from "../../common/decorators";


@Controller('auth/discord')
export class AuthDiscordController {
  constructor(private authService: AuthService) {
  }

  @Get()
  @UseGuards(DiscordGuard)
  async discordAuth(): Promise<void>  {}

  @Get('/redirect')
  @UseGuards(DiscordGuard)
  discordAuthRedirect(@GetCurrentUserId() signupDto: SignupDto): Promise<Tokens | string> {
    return this.authService.authorizeWithSocialMedia(signupDto);
  }
}