import {BadRequestException, ForbiddenException, Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import * as shortid from 'shortid'
import {AuthResponse, ConfirmationToken, JwtPayload, Tokens} from "./types";
import {ConfigService} from "@nestjs/config";
import {JwtService} from "@nestjs/jwt";
import {MailService} from "../mail/mail.service";
import {CompleteSignupDto, ResetPasswordDto, SigninDto, SignupDto, UpdatePasswordDto} from "./dto";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime";

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {
  }

  async signupLocal(signupDto: SignupDto): Promise<void> {
    const userData = await this.prisma.user.findUnique({
      where: {
        email: signupDto.email
      }
    })

    if (userData && userData.status == 'ACTIVE') {
      throw new ForbiddenException('User is already registered');
    }
    if (userData && userData.status == 'PENDING') {
      const confirmationToken = await shortid.generate();
      const updateUser = await this.prisma.user
        .update({
          where: {
            email: signupDto.email,
          },
          data: {
            confirmationToken
          },
        })
      await this.mailService.sendUserConfirmation(updateUser.email, updateUser.confirmationToken);
    }

    if (!userData) {
      const confirmationToken = await shortid.generate();
      const newUser = await this.prisma.user
        .create({
          data: {
            email: signupDto.email,
            confirmationToken
          },
        });
      await this.mailService.sendUserConfirmation(newUser.email, newUser.confirmationToken);
    }

  }

  async completeSignUp(token: string, completeSignupDto: CompleteSignupDto): Promise<AuthResponse> {
    const hashedPassword = await bcrypt.hash(completeSignupDto.password, 10);
    const userData = await this.prisma.user.update({
      where: {confirmationToken: token},
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

    return {
      email: userData.email,
      ...tokens
    };
  }

  async authorizeWithSocialMedia(signupDto: SignupDto): Promise<ConfirmationToken | AuthResponse> {
    const userData = await this.prisma.user.findUnique({
      where: {
        email: signupDto.email
      }
    })

    if (userData && userData.status == "ACTIVE") {
      const tokens = await this.getTokens(userData.id, userData.email);
      await this.updateRtHash(userData.id, tokens.refresh_token);
      return {
        email: userData.email,
        ...tokens
      };
    }
    if (userData && userData.status == "PENDING") {
      return {
        confirmationToken: userData.confirmationToken
      };
    }
    if (!userData) {
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

  async socialMediaSuccessAuth(userId): Promise<AuthResponse> {
    const userData = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    })
    const tokens = await this.getTokens(userData.id, userData.email);
    await this.updateRtHash(userData.id, tokens.refresh_token);
    return {
      email: userData.email,
      ...tokens
    };
  }

  async signinLocal(signinDto: SigninDto) {
    const userData = await this.prisma.user.findUnique({
      where: {
        email: signinDto.email,
      },
    });

    if (!userData) throw new ForbiddenException('There is no user with this email');

    const passwordMatches = await bcrypt.compare(signinDto.password, userData.hashedPassword);
    if (!passwordMatches) throw new ForbiddenException('Incorrect password');

    const tokens = await this.getTokens(userData.id, userData.email);
    await this.updateRtHash(userData.id, tokens.refresh_token);

    return {
      email: userData.email,
      ...tokens
    };
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

  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const passwordMatches = bcrypt.compare(updatePasswordDto.currentPassword, user.hashedPassword);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedPassword,
      },
    });
  }

  async getResetPasswordEmail(userEmailDto) {
    const confirmationToken = await shortid.generate();
    const user = await this.prisma.user.update({
      where: {
        email: userEmailDto.email
      },
      data: {
        confirmationToken
      }
    })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new ForbiddenException('User with this email doesn`t exist');
          }
        }
        throw error;
      });

    await this.mailService.sendResetPasswordConfirmation(user.email, user.confirmationToken);
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.prisma.user.update({
      where: {confirmationToken: token},
      data: {
        hashedPassword,
        confirmationToken: null
      }
    });
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = bcrypt.compare(refreshToken, user.hashedRt);
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
      where: {
        confirmationToken: token
      }
    })
    if (!userData) {
      throw new BadRequestException('Confirmation token is not correct');
    }
  }
}
