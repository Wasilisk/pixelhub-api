import {BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import * as shortid from 'shortid'
import {JwtPayload, Tokens} from "./types";
import {ConfigService} from "@nestjs/config";
import {JwtService} from "@nestjs/jwt";
import {MailService} from "../mail/mail.service";

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signupLocal(email: string): Promise<void> {
    const userData = await this.prisma.user.findUnique({
      where:{
        email: email
      }
    })

    if(userData && userData.status == 'ACTIVE') {
      throw new ForbiddenException('User is already registered');
    }
    if(userData && userData.status == 'PENDING') {
      throw new ForbiddenException('User is pending');
    }

    if(!userData) {
      const confirmationToken = await shortid.generate();
      const newUser = await this.prisma.user
        .create({
          data: {
            email: email,
            confirmationToken
          },
        })
      await this.mailService.sendUserConfirmation(newUser.email, newUser.confirmationToken);
    }

  }

  async completeSignUp(token): Promise<Tokens> {
    const userData = await this.prisma.user.update({
      where: { confirmationToken: token },
      data: { hashedPassword: 'asfdasfasfads', status: "ACTIVE", confirmationToken: null},
    })

    const tokens = await this.getTokens(userData.id, userData.email);
    await this.updateRtHash(userData.id, tokens.refresh_token);

    return tokens;
  }

  async authorizeWithSocialMedia(user): Promise<Tokens | string> {
    const userData = await this.prisma.user.findUnique({
      where:{
        email: user.email
      }
    })

    if(userData && userData.status == "ACTIVE") {
      const tokens = await this.getTokens(userData.id, userData.email);
      await this.updateRtHash(userData.id, tokens.refresh_token);
      return tokens;
    }
    if(userData && userData.status == "PENDING") {
      return userData.confirmationToken;
    }
    if(!userData) {
      const confirmationToken = await shortid.generate();
      const newUser = await this.prisma.user
        .create({
          data: {
            email: user.email,
            confirmationToken
          },
        })
      return newUser.confirmationToken;
    }
  }

  async signinLocal() {

  }

  async logout() {

  }

  async refreshTokens() {

  }

  async updateRtHash(userId: number, refreshToken: string): Promise<void> {
    const hashedRt = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt,
      },
    });
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async checkConfirmationToken(token): Promise<void> {
    const userData = await this.prisma.user.findUnique({
      where:{
        confirmationToken: token
      }
    })
    if(!userData) {
      throw new BadRequestException('Confirmation token is not correct');
    }
  }
}
