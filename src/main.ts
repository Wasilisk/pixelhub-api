import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import {HttpExceptionFilter} from "./common/filters";

const Port = process.env["PORT "] || 3001

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /*app.useGlobalFilters(new HttpExceptionFilter());*/
  app.enableCors({origin: "http://localhost:3000"});
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(Port).then(() => console.log('Server start at port - ', Port));
}
bootstrap();
