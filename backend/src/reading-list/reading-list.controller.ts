/**
 * Handles student requests for the personal reading list.
 * The logged-in student is determined from the verified JWT payload.
 */

import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Req,
} from '@nestjs/common';

import type { Request as ExpressRequest } from 'express';
import { AddReadingListItemDto } from './dto/add-reading-list-item.dto';
import { UpdateReadingListStatusDto } from './dto/update-reading-list-status.dto';
import { ReadingListService } from './reading-list.service';

interface AuthenticatedRequest extends ExpressRequest {
    user: {
        sub: string;
        email: string;
        role: string;
    };
}

@Controller('reading-list')
export class ReadingListController {
    constructor(
        private readonly readingListService: ReadingListService,
    ) {}

    // Returns the reading list of the logged-in student.
    @Get()
    getReadingList(
        @Req() request: AuthenticatedRequest,
    ) {
        const studentId = this.getStudentId(request);

        return this.readingListService.getReadingList(
            studentId,
        );
    }

    // Adds an existing catalog book to the student's reading list.
    @Post()
    addItem(
        @Req() request: AuthenticatedRequest,
        @Body() dto: AddReadingListItemDto,
    ) {
        const studentId = this.getStudentId(request);

        return this.readingListService.addItem(
            studentId,
            studentId,
            dto,
        );
    }

    // Updates the read status of one book on the student's reading list.
    @Patch(':bookId/status')
    updateStatus(
        @Req() request: AuthenticatedRequest,
        @Param('bookId') bookId: string,
        @Body() dto: UpdateReadingListStatusDto,
    ) {
        const studentId = this.getStudentId(request);

        return this.readingListService.updateStatus(
            studentId,
            bookId,
            dto,
        );
    }

    // Ensures that these personal reading-list endpoints are student-only.
    private getStudentId(
        request: AuthenticatedRequest,
    ): string {
        //console.log('JWT User:', request.user)
        //console.log('JWT Role:', request.user.role)
        if (request.user.role !== 'STUDENT') {
            throw new ForbiddenException('Alleen studenten kunnen deze leeslijst gebruiken.');
        }

        return request.user.sub;
    }
}