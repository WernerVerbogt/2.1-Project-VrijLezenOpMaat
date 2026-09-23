import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('Mongo URI:', configService.get<string>('MONGODB_URI'));
        
        return {
          uri: configService.get<string>('MONGODB_URI'), // Connects with DB
        };
      },
    }),

    UsersModule,
    AuthModule
  ],
})

export class AppModule {}
