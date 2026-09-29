
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

import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from './auth.guard.js';
import { Public } from './decorators/public.decorators';

type AuthenticatedRequest = ExpressRequest & {
  user: {
    sub: string;
    username: string;
    role: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Login needs to be public as non-users don't have JWT yet.
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
