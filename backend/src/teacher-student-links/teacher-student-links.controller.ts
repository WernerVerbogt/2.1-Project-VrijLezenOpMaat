/**
 * Handles requests for linking students to teachers.
 * The current student is determined from the verified JWT payload.
 */

import { Body, Controller, Get, Post, Req, Param } from '@nestjs/common';
import { LinkTeacherDto } from './dto/link-teacher.dto';
import { TeacherStudentLinksService } from './teacher-student-links.service';
import { AddReadingListItemDto } from '../reading-list/dto/add-reading-list-item.dto';

import type { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
    user: {
        sub: string;
        email: string;
        role: string;
    };
}

@Controller('teacher-student-links')
export class TeacherStudentLinksController {
    constructor(private readonly teacherStudentLinksService: TeacherStudentLinksService) {}

    // Returns available teachers to the students
    @Get('teachers')
    getTeachers(@Req() request: AuthenticatedRequest) {
        return this.teacherStudentLinksService.getTeachers(request.user.sub, request.user.role);
    }
    
    // Returns students linked to the current authenticated teacher
    @Get('students')
    getLinkedStudents(@Req() request: AuthenticatedRequest) {
        return this.teacherStudentLinksService.getLinkedStudents(
            request.user.sub,
            request.user.role,
        );
    }

    @Get('students/:studentId')
    getLinkedStudentDetails(
        @Req() request: AuthenticatedRequest,
        @Param('studentId') studentId: string,
    ) {
        return this.teacherStudentLinksService.getLinkedStudentDetails(
            request.user.sub,
            request.user.role,
            studentId,
        );
    }
    
    // Teacher: adds a catalog book to one linked student's reading list.
    @Post('students/:studentId/reading-list')
    addBookToLinkedStudentReadingList(
        @Req() request: AuthenticatedRequest,
        @Param('studentId') studentId: string,
        @Body() dto: AddReadingListItemDto,
    ) {
        return this.teacherStudentLinksService
            .addBookToLinkedStudentReadingList(
                request.user.sub,
                request.user.role,
                studentId,
                dto,
            );
    }

    // Student creates link with one of the teachers
    @Post()
    linkTeacher(@Req() request: AuthenticatedRequest, @Body() dto: LinkTeacherDto) {
        return this.teacherStudentLinksService.linkTeacher(
            request.user.sub,
            request.user.role,
            dto,
        );
    }
}