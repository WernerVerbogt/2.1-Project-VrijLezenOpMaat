// This file defines the AuthModule, which is responsible for handling authentication-related functionality 
// in the application. It imports necessary modules such as PrismaModule for database interactions, UsersModule 
// for user management, and ConfigModule for configuration management. The JwtModule is configured asynchronously 
// to use a secret key from the environment variables for signing JWT tokens. The AuthController handles incoming 
// requests related to authentication, while the AuthService contains the business logic for authentication processes. 
// The AuthGuard is provided globally to protect routes that require authentication.

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  
  providers: [
    AuthService,
    {
      provide: APP_GUARD, // Guard will be used globally for all routes.
      useClass: AuthGuard,
    },
  ],
})

export class AuthModule {}
