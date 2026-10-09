/**
 * Bootstraps the NestJS application and configures global middleware.
 * This includes CORS and DTO validation for all incoming requests.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
//import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Temp code to test db connection without API feature.
  // const prisma = app.get(PrismaService);
  // const users = await prisma.user.findMany();
  // console.log(
  //   `PostgreSQL connection successful. Users found: ${users.length}`,
  // );

  // Validates all incoming DTOs using class-validator decorators.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Allows the local React frontend to communicate with the API.
  app.enableCors({
    origin: 'http://localhost:5173',
  });

  // Generates OpenAPI documentation for the REST API.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vrij lezen op maat API')
    .setDescription(
      'REST API for reading profiles, recommendations, catalog, reading lists and teacher-student links.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

  const swaggerDocument =
    SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );

  SwaggerModule.setup(
    'api-docs',
    app,
    swaggerDocument,
    {
      swaggerOptions: {
        persistAuthorization: true,
      },
    },
  );

  await app.listen(
    process.env.PORT ?? 3000,
  );
}

void bootstrap();