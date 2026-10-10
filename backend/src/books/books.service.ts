/**
 * Reads books imported into book database and converts the original catalog fields
 * into the normalized format used by the application.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { GetBooksQueryDto } from './dto/get-books-query.dto';
import { Book } from './schemas/book.schema';
import { CatalogBook } from './types/catalog-book.type';
import { PaginatedBooksResponse } from './types/paginated-books-response.type';

@Injectable()
export class BooksService {
    constructor(
        @InjectModel(Book.name)
        private readonly bookModel: Model<Book>,
    ) {}

    // Returns all catalog books.
    async findAll(): Promise<CatalogBook[]> {
        const books = await this.bookModel.find().lean().exec();

        return books.map((book) => {
            const rawBook = book as unknown as Record<string, unknown>;

            return this.mapBook(rawBook);
        });
    }

    // Returns one catalog book by its bookId
    async findById(bookId: string): Promise<CatalogBook | null> {

        // Prevent the database from throwing a CastError for an invalid bookId.
        if (!Types.ObjectId.isValid(bookId)) {
            return null;
        }

        const book = await this.bookModel
            .findById(bookId)
            .lean()
            .exec();

        if (!book) {
            return null;
        }

        const rawBook = book as unknown as Record<string, unknown>;

        return this.mapBook(rawBook);
    }

    // Returns all catalog books matching the supplied bookId
    async findByIds(bookIds: string[]): Promise<CatalogBook[]> {

        // Only valid bookIds are sent to the database
        const validBookIds = bookIds.filter((bookId) =>
            Types.ObjectId.isValid(bookId),
        );

        if (validBookIds.length === 0) {
            return [];
        }

        const books = await this.bookModel
            .find({
                _id: {
                    $in: validBookIds,
                },
            })
            .lean()
            .exec();

        return books.map((book) => {
            const rawBook = book as unknown as Record<string, unknown>;

            return this.mapBook(rawBook);
        });
    }

    // Returns one filtered and paginated catalog page.
    async findPaginated(
        query: GetBooksQueryDto,
    ): Promise<PaginatedBooksResponse> {
        const { page, limit, level, theme, length } = query;

        const skip = (page - 1) * limit;

        // Build the book database filter dynamically.
        // Only filters supplied by the frontend are added.
        const filter: Record<string, unknown> = {};

        if (level) {
            // A filter for 2F should also match catalog values such as 2F-3F.
            filter['Niveau'] = {
                $regex: this.escapeRegex(level),
                $options: 'i',
            };
        }

        if (theme) {
            // Themes are stored in Themas_boek, usually separated by semicolons.
            // Case-insensitive matching keeps imported catalog data flexible.
            filter['Themas_boek'] = {
                $regex: this.escapeRegex(theme),
                $options: 'i',
            };
        }

        if (length) {
            // Length uses the same SHORT / MEDIUM / LONG codes as FR1.
            filter['Lengte'] = length;
        }

        // The same filter must be used for both the page results and
        // the total count, otherwise pagination metadata would be incorrect.
        const [books, total] = await Promise.all([
            this.bookModel
                .find(filter)
                .sort({ _id: 1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),

            this.bookModel
                .countDocuments(filter)
                .exec(),
        ]);

        const items = books.map((book) => {
            const rawBook = book as unknown as Record<string, unknown>;

            return this.mapBook(rawBook);
        });

        return {
            items,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // Maps the original Dutch catalog fields to application-friendly names.
    private mapBook(rawBook: Record<string, unknown>): CatalogBook {
        return {
            id: this.toIdString(rawBook['_id']),
            title: this.toStringValue(rawBook['Titel']),
            author: this.toStringValue(rawBook['Auteur']),
            description: this.toStringValue(rawBook['Korte omschrijving']),
            materialType: this.toStringValue(rawBook['Type materiaal']),
            level: this.toStringValue(rawBook['Niveau']),
            themes: this.normalizeThemes(rawBook['Themas_boek']),
            length: this.toStringValue(rawBook['Lengte']),
        };
    }

    // Safely converts an unknown book database value to a trimmed string.
    private toStringValue(value: unknown): string {
        if (typeof value !== 'string') {
            return '';
        }

        return value.trim();
    }

    private isUrl(value: string): boolean {
        return /^https?:\/\//i.test(value);
    }

    // Safely converts a ObjectId  or string value to an ID string from the book database.
    private toIdString(value: unknown): string {
        if (value instanceof Types.ObjectId) {
            return value.toHexString();
        }

        if (typeof value === 'string') {
            return value;
        }

        return '';
    }

    // Themes can be stored as either an array or a semicolon-separated string.
    // URLs stored in this source field are ignored because they are not themes.
    private normalizeThemes(value: unknown): string[] {
        if (Array.isArray(value)) {
            return value
                .filter(
                    (theme): theme is string =>
                        typeof theme === 'string',
                )
                .map((theme) => theme.trim())
                .filter((theme) => theme.length > 0 && !this.isUrl(theme));
        }

        if (typeof value === 'string') {
            return value
                .split(';')
                .map((theme) => theme.trim())
                .filter((theme) => theme.length > 0 && !this.isUrl(theme));
        }

        return [];
    }

    // Prevents special regular-expression characters from changing
    // the intended book database search behaviour.
    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Returns all unique themes currently available in the catalog
    async findAvailableThemes(): Promise<string[]> {
        const books = await this.bookModel
            .find({}, { Themas_boek: 1 })
            .lean()
            .exec();

        // The lowercase key prevents duplicate themes that only differ in casing.
        const uniqueThemes = new Map<string, string>();

        for (const book of books) {
            const rawBook = book as unknown as Record<string, unknown>;
            const themes = this.normalizeThemes(rawBook['Themas_boek']);

            for (const theme of themes) {
                const key = theme.toLowerCase();

                if (!uniqueThemes.has(key)) {
                    uniqueThemes.set(key, theme);
                }
            }
        }

        return [...uniqueThemes.values()].sort((a, b) =>
            a.localeCompare(b, 'nl'),
        );
    }
}