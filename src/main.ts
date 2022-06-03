import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import {HttpExceptionFilter} from "./common/filters";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /*app.useGlobalFilters(new HttpExceptionFilter());*/
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
