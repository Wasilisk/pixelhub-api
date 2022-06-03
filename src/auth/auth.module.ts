import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import {AuthService} from "./auth.service";
import {
  AccessTokenStrategy,
  DiscordStrategy,
  FacebookStrategy,
  GoogleStrategy,
  RefreshTokenStrategy
} from "./strategies";
import { JwtModule } from '@nestjs/jwt';
import {MailModule} from "../mail/mail.module";
import {AuthDiscordController} from "./controllers/auth-discord.controller";
import {AuthFacebookController} from "./controllers/auth-facebook.controller";
import {AuthGoogleController} from "./controllers/auth-google.controller";

@Module({
  imports: [JwtModule.register({}), MailModule],
  controllers: [
    AuthController,
    AuthDiscordController,
    AuthFacebookController,
    AuthGoogleController
  ],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
    FacebookStrategy,
    DiscordStrategy
  ],
})
export class AuthModule {}
