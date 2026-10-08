/**
 * Unit tests for student-teacher links.
 * Covers linking, linked-student access and relationship authorization.
 */

import {
    ForbiddenException,
} from '@nestjs/common';

import { TeacherStudentLinksService } from './teacher-student-links.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReadingListService } from '../reading-list/reading-list.service';

describe('TeacherStudentLinksService', () => {
    let service: TeacherStudentLinksService;

    const prismaMock = {
        user: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },

        teacherStudentLink: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    };

    const readingListServiceMock = {
        getReadingList: jest.fn(),
        addItem: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        service =
            new TeacherStudentLinksService(
                prismaMock as unknown as PrismaService,
                readingListServiceMock as unknown as ReadingListService,
            );
    });

    it('allows a student to link an existing teacher', async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: 'teacher-1',
            firstName: 'Jan',
            lastName: 'Jansen',
            email: 'jan@example.com',
            role: 'TEACHER',
        });

        prismaMock.teacherStudentLink.findUnique.mockResolvedValue(
            null,
        );

        prismaMock.teacherStudentLink.create.mockResolvedValue({
            studentId: 'student-1',
            teacherId: 'teacher-1',
        });

        const result =
            await service.linkTeacher(
                'student-1',
                'STUDENT',
                {
                    teacherId: 'teacher-1',
                },
            );

        expect(
            prismaMock.teacherStudentLink.create,
        ).toHaveBeenCalledWith({
            data: {
                studentId: 'student-1',
                teacherId: 'teacher-1',
            },
        });

        expect(result).toEqual({
            teacherId: 'teacher-1',
            firstName: 'Jan',
            lastName: 'Jansen',
            email: 'jan@example.com',
            isLinked: true,
        });
    });

    it('returns only students linked to the teacher', async () => {
        prismaMock.teacherStudentLink.findMany.mockResolvedValue([
            {
                student: {
                    id: 'student-1',
                    firstName: 'Piet',
                    lastName: 'Student',
                    email: 'piet@example.com',
                },
            },
        ]);

        const result =
            await service.getLinkedStudents(
                'teacher-1',
                'TEACHER',
            );

        expect(
            prismaMock.teacherStudentLink.findMany,
        ).toHaveBeenCalledWith({
            where: {
                teacherId: 'teacher-1',
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

        expect(result).toEqual([
            {
                id: 'student-1',
                firstName: 'Piet',
                lastName: 'Student',
                email: 'piet@example.com',
            },
        ]);
    });

    it('blocks a teacher from accessing an unlinked student', async () => {
        prismaMock.teacherStudentLink.findUnique.mockResolvedValue(
            null,
        );

        await expect(
            service.getLinkedStudentDetails(
                'teacher-1',
                'TEACHER',
                'student-2',
            ),
        ).rejects.toBeInstanceOf(
            ForbiddenException,
        );

        expect(
            prismaMock.user.findUnique,
        ).not.toHaveBeenCalled();

        expect(
            readingListServiceMock.getReadingList,
        ).not.toHaveBeenCalled();
    });

    it('allows a linked teacher to add a book to the student reading list', async () => {
        prismaMock.teacherStudentLink.findUnique.mockResolvedValue({
            studentId: 'student-1',
            teacherId: 'teacher-1',
        });

        readingListServiceMock.addItem.mockResolvedValue({
            id: 'book-1',
            title: 'Testboek',
            isRead: false,
            addedByUserId: 'teacher-1',
        });

        const result =
            await service.addBookToLinkedStudentReadingList(
                'teacher-1',
                'TEACHER',
                'student-1',
                {
                    bookId: 'book-1',
                },
            );

        expect(
            readingListServiceMock.addItem,
        ).toHaveBeenCalledWith(
            'student-1',
            'teacher-1',
            {
                bookId: 'book-1',
            },
        );

        expect(result).toEqual({
            id: 'book-1',
            title: 'Testboek',
            isRead: false,
            addedByUserId: 'teacher-1',
        });
    });
});