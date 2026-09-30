// Bootstraps the NestJS application and configures global middleware.
// This includes CORS and DTO validation for all incoming requests.

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
//import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Temp code to test db connection without API feature
  //const prisma = app.get(PrismaService);
  //const users = await prisma.user.findMany();
  //console.log(`PostgreSQL connection succesful. Users found: ${users.length}`);

  // Validates all incoming DTOs using class-validator decorators.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: "http://localhost:5173"
  })

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
  