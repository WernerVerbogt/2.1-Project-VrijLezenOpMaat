/** 
 * Reads all the books imported in the MongoDB and converts original catalog fields
 * into normalized format that is used by the application.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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

    // Returns one filtered and paginated catalog page.
    async findPaginated(
        query: GetBooksQueryDto,
    ): Promise<PaginatedBooksResponse> {
        const { page, limit, level, theme, length } = query;

        const skip = (page - 1) * limit;

        // Build the MongoDB filter dynamically.
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
            id: String(rawBook['_id'] ?? ''),
            title: this.toStringValue(rawBook['Titel']),
            author: this.toStringValue(rawBook['Auteur']),
            description: this.toStringValue(rawBook['Korte omschrijving']),
            materialType: this.toStringValue(rawBook['Type materiaal']),
            level: this.toStringValue(rawBook['Niveau']),
            themes: this.normalizeThemes(rawBook['Themas_boek']),
            length: this.toStringValue(rawBook['Lengte']),
        };
    }

    // Safely converts an unknown MongoDB value to a trimmed string.
    private toStringValue(value: unknown): string {
        if (typeof value !== 'string') {
            return '';
        }

        return value.trim();
    }

    // Themes can be stored as either an array or a semicolon-separated string.
    private normalizeThemes(value: unknown): string[] {
        if (Array.isArray(value)) {
            return value
                .filter(
                    (theme): theme is string =>
                        typeof theme === 'string',
                )
                .map((theme) => theme.trim())
                .filter((theme) => theme.length > 0);
        }

        if (typeof value === 'string') {
            return value
                .split(';')
                .map((theme) => theme.trim())
                .filter((theme) => theme.length > 0);
        }

        return [];
    }

    // Prevents special regular-expression characters from changing
    // the intended MongoDB search behaviour.
    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}