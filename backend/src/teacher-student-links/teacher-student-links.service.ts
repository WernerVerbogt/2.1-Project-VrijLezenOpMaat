/**
 * Manages links between students and teachers.
 * Authorization checks are handled in the service so they cannot
 * be bypassed by calling a different controller route.
 */

import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ReadingListService } from '../reading-list/reading-list.service';
import { AddReadingListItemDto } from '../reading-list/dto/add-reading-list-item.dto';

import { LinkTeacherDto } from './dto/link-teacher.dto';

@Injectable()
export class TeacherStudentLinksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly readingListService: ReadingListService,
    ) {}

    // Returns all teachers and indicates which teachers are already linked.
    async getTeachers(
        studentId: string,
        role: string,
    ) {
        this.assertStudent(role);

        const [teachers, existingLinks] =
            await Promise.all([
                this.prisma.user.findMany({
                    where: {
                        role: 'TEACHER',
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                    orderBy: [
                        {
                            lastName: 'asc',
                        },
                        {
                            firstName: 'asc',
                        },
                    ],
                }),

                this.prisma.teacherStudentLink.findMany({
                    where: {
                        studentId,
                    },
                    select: {
                        teacherId: true,
                    },
                }),
            ]);

        const linkedTeacherIds = new Set(
            existingLinks.map(
                (link) => link.teacherId,
            ),
        );

        return teachers.map((teacher) => ({
            ...teacher,
            isLinked:
                linkedTeacherIds.has(
                    teacher.id,
                ),
        }));
    }

    // Creates a link between the logged-in student and one teacher.
    async linkTeacher(
        studentId: string,
        role: string,
        dto: LinkTeacherDto,
    ) {
        this.assertStudent(role);

        if (studentId === dto.teacherId) {
            throw new ForbiddenException(
                'Je kunt jezelf niet als docent koppelen.',
            );
        }

        const teacher =
            await this.prisma.user.findUnique({
                where: {
                    id: dto.teacherId,
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                },
            });

        if (
            !teacher ||
            teacher.role !== 'TEACHER'
        ) {
            throw new NotFoundException(
                'De geselecteerde docent bestaat niet.',
            );
        }

        const existingLink =
            await this.prisma.teacherStudentLink.findUnique({
                where: {
                    studentId_teacherId: {
                        studentId,
                        teacherId: dto.teacherId,
                    },
                },
            });

        if (existingLink) {
            throw new ConflictException(
                'Je bent al gekoppeld aan deze docent.',
            );
        }

        await this.prisma.teacherStudentLink.create({
            data: {
                studentId,
                teacherId: dto.teacherId,
            },
        });

        return {
            teacherId: teacher.id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            isLinked: true,
        };
    }

    // Returns all students linked to the logged-in teacher.
    async getLinkedStudents(
        teacherId: string,
        role: string,
    ) {
        this.assertTeacher(role);

        const links =
            await this.prisma.teacherStudentLink.findMany({
                where: {
                    teacherId,
                },
                select: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    student: {
                        lastName: 'asc',
                    },
                },
            });

        return links.map(
            (link) => link.student,
        );
    }

    // Returns profile and reading-list information for one linked student.
    async getLinkedStudentDetails(
        teacherId: string,
        role: string,
        studentId: string,
    ) {
        this.assertTeacher(role);

        await this.assertTeacherLinkedToStudent(
            teacherId,
            studentId,
        );

        const student =
            await this.prisma.user.findUnique({
                where: {
                    id: studentId,
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,

                    readingProfile: {
                        include: {
                            genres: true,
                            themes: true,
                            answers: true,
                        },
                    },
                },
            });

        if (
            !student ||
            student.role !== 'STUDENT'
        ) {
            throw new NotFoundException(
                'Student niet gevonden.',
            );
        }

        const readingList =
            await this.readingListService.getReadingList(
                studentId,
            );

        return {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            readingProfile:
                student.readingProfile,
            readingList,
        };
    }

    // Adds an existing catalog book to a linked student's reading list.
    async addBookToLinkedStudentReadingList(
        teacherId: string,
        role: string,
        studentId: string,
        dto: AddReadingListItemDto,
    ) {
        this.assertTeacher(role);

        await this.assertTeacherLinkedToStudent(
            teacherId,
            studentId,
        );

        return this.readingListService.addItem(
            studentId,
            teacherId,
            dto,
        );
    }

    // Checks whether the teacher is actually linked to the requested student.
    private async assertTeacherLinkedToStudent(
        teacherId: string,
        studentId: string,
    ) {
        const link =
            await this.prisma.teacherStudentLink.findUnique({
                where: {
                    studentId_teacherId: {
                        studentId,
                        teacherId,
                    },
                },
            });

        if (!link) {
            throw new ForbiddenException(
                'Je hebt geen toegang tot deze student.',
            );
        }
    }

    // Only students may manage their own teacher links.
    private assertStudent(role: string) {
        if (
            role.toUpperCase() !== 'STUDENT'
        ) {
            throw new ForbiddenException(
                'Alleen studenten kunnen een docent koppelen.',
            );
        }
    }

    // Only teachers may access teacher functionality.
    private assertTeacher(role: string) {
        if (
            role.toUpperCase() !== 'TEACHER'
        ) {
            throw new ForbiddenException(
                'Alleen docenten kunnen deze functie gebruiken.',
            );
        }
    }
}