import {Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {AuthDto} from "../dto";
import {AuthGuard} from "@nestjs/passport";
import {Tokens} from "../types";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Post('local/signup')
  signupLocal(@Body('email') email: string): Promise<void> {
    return this.authService.signupLocal(email);
  }

  @Get('signup/complete/:token')
  async checkTokenCorrect(@Param('token') token: string): Promise<void> {
    return this.authService.checkConfirmationToken(token);
  }

  @Post('signup/complete/:token')
  async completeSignUp(@Param('token') token: string): Promise<Tokens> {
    return this.authService.completeSignUp(token);
  }

  @Post('local/signin')
  signinLocal() {
    return this.authService.signinLocal();
  }

  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  @Post('refresh')
  refreshTokens() {
    return this.authService.refreshTokens();
  }
}
