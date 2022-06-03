import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-facebook";
import {ConfigService} from "@nestjs/config";
import {UserPayload} from "../types/user-payload.types";


@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('FACEBOOK_CLIENT_ID'),
      clientSecret: config.get<string>('FACEBOOK_SECRET'),
      callbackURL: config.get<string>('FACEBOOK_CALLBACK_URL'),
      scope: "email",
      profileFields: ["emails"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<UserPayload> {
    const signupDto: UserPayload = {
      email: profile.emails[0].value
    };
    return signupDto
  }
}