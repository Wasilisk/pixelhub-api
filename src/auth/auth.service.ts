import {BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import * as shortid from 'shortid'
import {ConfirmationToken, JwtPayload, Tokens} from "./types";
import {ConfigService} from "@nestjs/config";
import {JwtService} from "@nestjs/jwt";
import {MailService} from "../mail/mail.service";
import {CompleteSignupDto, SigninDto, SignupDto} from "./dto";

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signupLocal(signupDto: SignupDto): Promise<void> {
    const userData = await this.prisma.user.findUnique({
      where:{
        email: signupDto.email
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
            email: signupDto.email,
            confirmationToken
          },
        })
      await this.mailService.sendUserConfirmation(newUser.email, newUser.confirmationToken);
    }

  }

  async completeSignUp(token: string, completeSignupDto: CompleteSignupDto): Promise<Tokens> {
    const hashedPassword = await bcrypt.hash(completeSignupDto.password, 10);
    const userData = await this.prisma.user.update({
      where: { confirmationToken: token },
      data: {
        hashedPassword: hashedPassword,
        status: "ACTIVE",
        confirmationToken: null,
        profile: {
          create: {
            username: completeSignupDto.profile.username,
            bio: completeSignupDto.profile.bio,
            socialProfiles: {
              create: {}
            }
          }
        }
      },
    })

    const tokens = await this.getTokens(userData.id, userData.email);
    await this.updateRtHash(userData.id, tokens.refresh_token);

    return tokens;
  }

  async authorizeWithSocialMedia(signupDto: SignupDto): Promise<Tokens | ConfirmationToken> {
    const userData = await this.prisma.user.findUnique({
      where:{
        email: signupDto.email
      }
    })

    if(userData && userData.status == "ACTIVE") {
      const tokens = await this.getTokens(userData.id, userData.email);
      await this.updateRtHash(userData.id, tokens.refresh_token);
      return tokens;
    }
    if(userData && userData.status == "PENDING") {
      return {
        confirmationToken: userData.confirmationToken
      };
    }
    if(!userData) {
      const confirmationToken = await shortid.generate();
      const newUser = await this.prisma.user
        .create({
          data: {
            email: signupDto.email,
            confirmationToken
          },
        })
      return {
        confirmationToken: newUser.confirmationToken
      };
    }
  }

  async signinLocal(signinDto: SigninDto) {
    console.log(signinDto)
    const user = await this.prisma.user.findUnique({
      where: {
        email: signinDto.email,
      },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = bcrypt.compare(user.hashedPassword, signinDto.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: number): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = bcrypt.compare(user.hashedRt, refreshToken);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
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
