/** Root module of the NestJS application.
 * It configures environment variables, MongoDB, PostgreSQL/Prisma,
 * authentication, books, and the reading profile feature. 
 * */

import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
//import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module'
import { BooksModule } from './books/books.module';
import { ReadingProfileModule } from './reading-profile/reading-profile.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ReadingListModule } from './reading-list/reading-list.module';

@Module({
  imports: [
    // Makes environment variables from .env file available thoughout the app
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),

    // Connection NestJS <-> MongoDB
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        //console.log('Mongo URI:', configService.get<string>('MONGODB_URI'));

        return {
          uri: configService.get<string>('MONGODB_URI'), // Connects with DB
        };
      },
    }),

    
    UsersModule,
    AuthModule,
    BooksModule,
    PrismaModule,
    ReadingProfileModule,
    RecommendationsModule,
    ReadingListModule,
  ],
})

export class AppModule {}