/**
 * Manages personal reading list items.
 * The database stores ownership and read status, while book details
 * are retrieved from the book database (catalog) through BooksService.
 */

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { BooksService } from '../books/books.service';

import { AddReadingListItemDto } from './dto/add-reading-list-item.dto';
import { UpdateReadingListStatusDto } from './dto/update-reading-list-status.dto';

@Injectable()
export class ReadingListService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly booksService: BooksService,
    ) {}

    // Returns the personal reading list enriched with the catalog information
    async getReadingList(studentId: string) {
        const readingListItems = await this.prisma.readingListItem.findMany({
            where: {
                studentId,
            },
            orderBy: {
                addedAt: 'desc',
            },
        });

        if (readingListItems.length === 0) {
            return [];
        }

        // Retrieve all required books within one query for the book database
        const bookIds = readingListItems.map((item) => item.bookId);

        const books = await this.booksService.findByIds(bookIds);

        // A map makes matching database items to the book database efficient
        const booksById = new Map(books.map((book) => [book.id, book]));

        return readingListItems.flatMap((item) => {
            const book = booksById.get(item.bookId);

            // A missing catalog book should not break the whole reading list
            if (!book) {
                return [];
            }

            return [
                {
                    ...book,
                    isRead: item.isRead,
                    addedByUserId: item.addedByUserId,
                    addedAt: item.addedAt,
                },
            ];
        });
    }

    // Adds existing catalog book to a student's reading list
    async addItem(studentId: string, addedByUserId: string, dto: AddReadingListItemDto) {
        
        // A reading list may only reference an existing catalog book
        const book = await this.booksService.findById(dto.bookId);
        
        if (!book) {
            throw new NotFoundException('Boek niet gevonden in de catalogus.');
        }

        // The compound primary key prevents the same book from being added more than once for
        // the same student.
        const existingItem = await this.prisma.readingListItem.findUnique({
            where: {
                studentId_bookId: {
                    studentId,
                    bookId: dto.bookId,
                },
            },
        });

        if (existingItem) {
            throw new ConflictException('Dit boek staat al op de leeslijst.');
        }

        const createdItem = await this.prisma.readingListItem.create({
            data: {
                studentId,
                bookId: dto.bookId,
                addedByUserId,
            },
        });

        // Return both the catalog information and personal reading status
        return {
            ...book,
            isRead: createdItem.addedByUserId,
            addedAt: createdItem.addedAt,
        };
    }

    // Updates whether a book has been read by the student
    async updateStatus(studentId: string, bookId: string, dto: UpdateReadingListStatusDto) {
        const existingItem = await this.prisma.readingListItem.findUnique({
            where: {
                studentId_bookId: {
                    studentId,
                    bookId,
                },
            },
        });

        if (!existingItem) {
            throw new NotFoundException('Dit boek staat niet op je leeslijst.');
        }

        const updatedItem = await this.prisma.readingListItem.update({
            where: {
                studentId_bookId: {
                    studentId,
                    bookId,
                },
            },
            data: {
                isRead: dto.isRead,
            },
        });

        return {
            bookId: updatedItem.bookId,
            isRead: updatedItem.isRead,
        };
    }
}