import {Body, Controller, Get, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {DiscordGuard} from "../../common/guards";
import {ConfirmationToken, Tokens} from "../types";
import {SignupDto} from "../dto";
import {GetCurrentUser} from "../../common/decorators";
import {Public} from "../../common/decorators/public.decorator";


@Controller('auth/discord')
export class AuthDiscordController {
  constructor(private authService: AuthService) {
  }

  @Get()
  @Public()
  @UseGuards(DiscordGuard)
  async discordAuth(): Promise<void>  {}

  @Get('/redirect')
  @Public()
  @UseGuards(DiscordGuard)
  discordAuthRedirect(@GetCurrentUser() signupDto: SignupDto): Promise<Tokens | ConfirmationToken> {
    return this.authService.authorizeWithSocialMedia(signupDto);
  }
}