
import { 
  Body, 
  Controller, 
  Get,
  Post, 
  HttpCode, 
  HttpStatus,
  Request,
  UseGuards 
} from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import type { Request as ExpressRequest } from 'express';
import { Public } from './decorators/public.decorators';

type AuthenticatedRequest = ExpressRequest & {
  user: {
    sub: string;
    username: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // The @Public() decorator is used to mark this route as public, meaning it doesn't require authentication.
  // This is needed for the login route, as users need to be able to log in without already being authenticated.
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
