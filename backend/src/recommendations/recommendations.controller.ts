import {
  Controller,
  ForbiddenException,
  Get,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { RecommendationsService } from './recommendations.service';

// Defines JWT payload that the global AuthGuard adds to request.user.

interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
        email: string;
        role: string;
    };
}

/**
 * Backend decides who is logged in, instead of using an endpoint like
 * GET /recommendations?studentId=123
 * That's not the safest option as you can type in any other studentId.
 * */

@Controller('recommendations')
export class RecommendationsController {
    constructor(private readonly recommendationsService: RecommendationsService,) {}

    // Returns personalized book recommendations for the authenticated student
    @Get()
    async getRecommendations(@Req() request: AuthenticatedRequest) {
        // Temp check for JWT
        //console.log('Authenticated user:', request.user);
        
        if (request.user.role !== 'STUDENT' && 'student') {
            throw new ForbiddenException('Recommendations are only available for students.');
        }

        const recommendations = await this.recommendationsService.getRecommendations(request.user.sub,);

        return {
            recommendations,
        };
    }
}