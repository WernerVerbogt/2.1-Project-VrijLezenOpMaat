// Exposes authenticated API endpoints for retrieving and saving
// the reading profile of the currently logged-in student.
// The student ID is always taken from the verified JWT payload.

import {
  Body,
  Controller,
  Get,
  Put,
  Request,
} from '@nestjs/common';

import type { Request as ExpressRequest } from 'express';

import { SaveReadingProfileDto } from './dto/save-reading-profile.dto';
import { ReadingProfileService } from './reading-profile.service';

// Describes the authenticated user data added to the request by the JWT guard.

type AuthenticatedRequest = ExpressRequest & {
  user: {
    sub: string;
    email: string;
    role: string;
  };
};

@Controller('reading-profile')
export class ReadingProfileController {
  constructor(
    private readonly readingProfileService: ReadingProfileService,
  ) {}

  // Retrieves the existing reading profile.
  @Get()
  getProfile(
    @Request() request: AuthenticatedRequest,
  ) {
    return this.readingProfileService.getProfile(
      request.user.sub, // UUID of logged in user is coming here from JWT
    );
  }

  // Creates a new profile or updates the existing profile.

  @Put()
  saveProfile(
    @Request() request: AuthenticatedRequest,
    @Body() dto: SaveReadingProfileDto,
  ) {
    return this.readingProfileService.saveProfile(
      request.user.sub,
      dto,
    );
  }
}