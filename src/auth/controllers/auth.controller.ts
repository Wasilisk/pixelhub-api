import {Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {SigninDto, SignupDto} from "../dto";
import {AuthGuard} from "@nestjs/passport";
import {Tokens} from "../types";
import {CompleteSignupDto} from "../dto/complete-signup.dto";
import {GetCurrentUser, GetCurrentUserId} from "../../common/decorators";
import {Public} from "../../common/decorators/public.decorator";
import {DiscordGuard, RtGuard} from "../../common/guards";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Public()
  @Post('local/signup')
  signupLocal(@Body() signupDto: SignupDto): Promise<void> {
    return this.authService.signupLocal(signupDto);
  }

  @Public()
  @Get('signup/complete/:token')
  async checkTokenCorrect(@Param('token') token: string): Promise<void> {
    return this.authService.checkConfirmationToken(token);
  }

  @Public()
  @Post('signup/complete/:token')
  async completeSignUp(
    @Param('token') token: string,
    @Body() completeSignupDto: CompleteSignupDto
  ): Promise<Tokens> {
    return this.authService.completeSignUp(token, completeSignupDto);
  }

  @Public()
  @Post('local/signin')
  signinLocal(@Body() signinDto:SigninDto) {
    return this.authService.signinLocal(signinDto);
  }

  @Post('logout')
  logout(@GetCurrentUserId() userId: number) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
