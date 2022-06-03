import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {Strategy, Profile} from "passport-discord";

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

  async validate (profile: Profile): Promise<string> {
    return profile.email;
  }
}