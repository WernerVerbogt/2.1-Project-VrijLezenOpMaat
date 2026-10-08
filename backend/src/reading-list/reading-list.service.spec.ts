/**
 * Unit tests for the personal reading list.
 * Covers adding books, duplicate protection and updating read status.
 */

import {
    ConflictException,
    NotFoundException,
} from '@nestjs/common';

import { ReadingListService } from './reading-list.service';
import { PrismaService } from '../prisma/prisma.service';
import { BooksService } from '../books/books.service';

describe('ReadingListService', () => {
    let service: ReadingListService;

    const prismaMock = {
        readingListItem: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    };

    const booksServiceMock = {
        findById: jest.fn(),
        findByIds: jest.fn(),
    };

    const catalogBook = {
        id: 'book-1',
        title: 'Testboek',
        author: 'Test Auteur',
        description: 'Een testboek.',
        materialType: 'Boek',
        level: '2F',
        themes: ['Sport'],
        length: 'SHORT',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        service = new ReadingListService(
            prismaMock as unknown as PrismaService,
            booksServiceMock as unknown as BooksService,
        );
    });

    it('adds an existing catalog book to the reading list', async () => {
        const addedAt = new Date();

        booksServiceMock.findById.mockResolvedValue(
            catalogBook,
        );

        prismaMock.readingListItem.findUnique.mockResolvedValue(
            null,
        );

        prismaMock.readingListItem.create.mockResolvedValue({
            studentId: 'student-1',
            bookId: 'book-1',
            isRead: false,
            addedByUserId: 'student-1',
            addedAt,
        });

        const result = await service.addItem(
            'student-1',
            'student-1',
            {
                bookId: 'book-1',
            },
        );

        expect(
            booksServiceMock.findById,
        ).toHaveBeenCalledWith('book-1');

        expect(
            prismaMock.readingListItem.create,
        ).toHaveBeenCalledWith({
            data: {
                studentId: 'student-1',
                bookId: 'book-1',
                addedByUserId: 'student-1',
            },
        });

        expect(result).toEqual({
            ...catalogBook,
            isRead: false,
            addedByUserId: 'student-1',
            addedAt,
        });
    });

    it('rejects adding the same book twice', async () => {
        booksServiceMock.findById.mockResolvedValue(
            catalogBook,
        );

        prismaMock.readingListItem.findUnique.mockResolvedValue({
            studentId: 'student-1',
            bookId: 'book-1',
            isRead: false,
            addedByUserId: 'student-1',
            addedAt: new Date(),
        });

        await expect(
            service.addItem(
                'student-1',
                'student-1',
                {
                    bookId: 'book-1',
                },
            ),
        ).rejects.toBeInstanceOf(
            ConflictException,
        );

        expect(
            prismaMock.readingListItem.create,
        ).not.toHaveBeenCalled();
    });

    it('updates a book from unread to read', async () => {
        prismaMock.readingListItem.findUnique.mockResolvedValue({
            studentId: 'student-1',
            bookId: 'book-1',
            isRead: false,
            addedByUserId: 'student-1',
            addedAt: new Date(),
        });

        prismaMock.readingListItem.update.mockResolvedValue({
            studentId: 'student-1',
            bookId: 'book-1',
            isRead: true,
            addedByUserId: 'student-1',
            addedAt: new Date(),
        });

        const result =
            await service.updateStatus(
                'student-1',
                'book-1',
                {
                    isRead: true,
                },
            );

        expect(
            prismaMock.readingListItem.update,
        ).toHaveBeenCalledWith({
            where: {
                studentId_bookId: {
                    studentId: 'student-1',
                    bookId: 'book-1',
                },
            },
            data: {
                isRead: true,
            },
        });

        expect(result).toEqual({
            bookId: 'book-1',
            isRead: true,
        });
    });

    it('rejects updating a book that is not on the reading list', async () => {
        prismaMock.readingListItem.findUnique.mockResolvedValue(
            null,
        );

        await expect(
            service.updateStatus(
                'student-1',
                'book-1',
                {
                    isRead: true,
                },
            ),
        ).rejects.toBeInstanceOf(
            NotFoundException,
        );

        expect(
            prismaMock.readingListItem.update,
        ).not.toHaveBeenCalled();
    });
});