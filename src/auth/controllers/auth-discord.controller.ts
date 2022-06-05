import {Controller, Get, Post, Res, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {DiscordGuard} from "../../common/guards";
import {ConfirmationToken, Tokens} from "../types";
import {SignupDto} from "../dto";
import {GetCurrentUser} from "../../common/decorators";
import {Public} from "../../common/decorators/public.decorator";
import {Response} from "express";
import {ConfigService} from "@nestjs/config";


@Controller('auth/discord')
export class AuthDiscordController {
  constructor(
    private authService: AuthService,
    private config: ConfigService
  ) {
  }

  @Get()
  @Public()
  @UseGuards(DiscordGuard)
  async discordAuth(): Promise<void>  {}


  @Get('/redirect')
  @Public()
  @UseGuards(DiscordGuard)
  discordAuthRedirect(@GetCurrentUser() signupDto: SignupDto, @Res() res: Response): void {
    const authorizeResponse: Promise<ConfirmationToken | Tokens> = this.authService.authorizeWithSocialMedia(signupDto);
    authorizeResponse.then(data => {
        if('confirmationToken' in data) {
          res.redirect(`${this.config.get<string>('CLIENT_URL')}/application/${data.confirmationToken}`)
        } else if('access_token' in data) {
          res.redirect(`${this.config.get<string>('CLIENT_URL')}/login/success/${data.access_token}`)
        }
      }
    )
  }
}