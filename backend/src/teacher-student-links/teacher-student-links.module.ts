/**
 * Configures the student-teacher linking feature
 */

import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReadingListModule } from '../reading-list/reading-list.module';

import { TeacherStudentLinksController } from './teacher-student-links.controller';
import { TeacherStudentLinksService } from './teacher-student-links.service';

@Module({
    imports: [
        ReadingListModule,
    ],
    controllers: [
        TeacherStudentLinksController,
    ],
    providers: [
        TeacherStudentLinksService,
        PrismaService,
    ],
    exports: [
        TeacherStudentLinksService,
    ],
})
export class TeacherStudentLinksModule {}