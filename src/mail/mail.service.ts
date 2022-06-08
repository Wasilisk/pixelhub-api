import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private config: ConfigService
  ) {}

  async sendUserConfirmation(email: string, token: string) {
    const url = `${this.config.get("CLIENT_URL")}/signup/complete/${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to PixelHub! Confirm your Email',
      template: '.templates/userConfirmation',
      context: {
        url,
      },
    });
  }

  async sendResetPasswordConfirmation(email: string, token: string) {
    const url = `${this.config.get("CLIENT_URL")}/login/reset-password/${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset',
      template: '.templates/resetPasswordConfirmation',
      context: {
        url,
      },
    });
  }
}