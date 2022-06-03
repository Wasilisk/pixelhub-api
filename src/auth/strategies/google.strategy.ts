import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

import { Injectable } from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {Profile} from "passport";
import {UserPayload} from "../types/user-payload.types";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.get<string>('GOOGLE_SECRET'),
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate (accessToken: string, refreshToken: string, profile: Profile): Promise<UserPayload> {
    const signupDto: UserPayload = {
      email: profile.emails[0].value
    };
    return signupDto
  }
}