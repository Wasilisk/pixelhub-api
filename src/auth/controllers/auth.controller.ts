import {Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import {AuthService} from "../auth.service";
import {CompleteSignupDto, ResetPasswordDto, SigninDto, SignupDto, UpdatePasswordDto, UserEmailDto} from "../dto";
import {Tokens} from "../types";
import {GetCurrentUser, GetCurrentUserId} from "../../common/decorators";
import {Public} from "../../common/decorators/public.decorator";
import {RtGuard} from "../../common/guards";

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
  async checkSignupToken(@Param('token') token: string): Promise<void> {
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

  @Get('success')
  successAuthWithSocialMedia(@GetCurrentUser("sub") userId: number): Promise<Tokens> {
    return this.authService.socialMediaSuccessAuth(userId);
  }

  @Public()
  @Post('local/signin')
  signinLocal(@Body() signinDto:SigninDto): Promise<Tokens> {
    return this.authService.signinLocal(signinDto);
  }

  @Post('logout')
  logout(@GetCurrentUserId() userId: number): Promise<void> {
    return this.authService.logout(userId);
  }

  @Post('update-password')
  updatePassword(
    @GetCurrentUserId() userId: number,
    @Body() updatePasswordDto: UpdatePasswordDto
  ): Promise<void> {
    return this.authService.updatePassword(userId, updatePasswordDto);
  }

  @Public()
  @Post('reset-password')
  async getResetPasswordEmail(@Body() userEmailDto: UserEmailDto): Promise<void> {
    return this.authService.getResetPasswordEmail(userEmailDto);
  }

  @Public()
  @Get('reset-password/:token')
  async checkResetPasswordToken(@Param('token') token: string): Promise<void> {
    return this.authService.checkConfirmationToken(token);
  }

  @Public()
  @Post('reset-password/:token')
  resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<void> {
    return this.authService.resetPassword(token, resetPasswordDto);
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
