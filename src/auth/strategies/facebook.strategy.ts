import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-facebook";
import {ConfigService} from "@nestjs/config";


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

  async validate(profile: Profile): Promise<string> {
    return profile.emails[0].value;
  }
}