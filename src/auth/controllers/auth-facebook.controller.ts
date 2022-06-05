import {Body, Controller, Get, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {FacebookGuard} from "../../common/guards";
import {ConfirmationToken, Tokens} from "../types";
import {SignupDto} from "../dto";
import {GetCurrentUser} from "../../common/decorators";
import {Public} from "../../common/decorators/public.decorator";
import {Response} from "express";
import {ConfigService} from "@nestjs/config";

@Controller('auth/facebook')
export class AuthFacebookController {
  constructor(
    private authService: AuthService,
    private config: ConfigService
  ) {
  }

  @Get()
  @Public()
  @UseGuards(FacebookGuard)
  async facebookAuth(): Promise<void> {}

  @Get('/redirect')
  @Public()
  @UseGuards(FacebookGuard)
  facebookAuthRedirect(@GetCurrentUser() signupDto: SignupDto, @Res() res: Response): void {
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