import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {Strategy, Profile} from "passport-discord";
import {UserPayload} from "../types/user-payload.types";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {

  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('DISCORD_CLIENT_ID'),
      clientSecret: config.get<string>('DISCORD_SECRET'),
      callbackURL: config.get<string>('DISCORD_CALLBACK_URL'),
      scope: ['email'],
    });
  }

  async validate (accessToken: string, refreshToken: string, profile: Profile): Promise<UserPayload> {
    const signupDto: UserPayload = {
      email: profile.email
    };
    return signupDto
  }
}