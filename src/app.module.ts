import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import {ConfigModule} from "@nestjs/config";
import { ProfileController } from './profile/profile.controller';
import { ProfileModule } from './profile/profile.module';
import {APP_GUARD} from "@nestjs/core";
import {AtGuard} from "./common/guards";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule, PrismaModule, ProfileModule],
  controllers: [ProfileController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ]
})
export class AppModule {}
