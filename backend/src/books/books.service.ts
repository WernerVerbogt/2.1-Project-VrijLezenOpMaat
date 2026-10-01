// Reads all the books imported in the MongoDB

import { Injectable } from '@nestjs/common';
import { InjectModel, raw } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './schemas/book.schema';
import { CatalogBook } from './types/catalog-book.type';

@Injectable()
export class BooksService {
    constructor(
        @InjectModel(Book.name)
        private readonly bookModel: Model<Book>,
    ) {}

    // Returns all catalog books in normalized format used in the application.
    // The original catalog database will not be modified as this remains a proof of concept.
    async findAll() {
        const books = await this.bookModel.find().lean().exec(); // finds all the books, return JSON objects (lean)

        return books.map((book) => {
            const rawBook = book as unknown as Record<string, unknown>; // TODO make type safer | Handle it as unknown for now as it doesn't define the fields now

            return this.mapBook(rawBook);
        });
    }

    // Maps original catalog database fields to application-friendly field names
    private mapBook(rawBook: Record<string, unknown>): CatalogBook {
        return {
            id: String(rawBook['_id'] ?? ''),
            title: this.toStringValue(rawBook['Titel']),
            author: this.toStringValue(rawBook['Auteur']),
            description: this.toStringValue(rawBook['Korte omschrijving']),
            materialType: this.toStringValue(rawBook['Type materiaal']),
            level: this.toStringValue(rawBook['Niveau']),
            themes: this.normalizeThemes(rawBook['Themas_boek']),
        };
    }

    // Converts unknown (document) database value to a trimmed string
    private toStringValue(value: unknown): string {
        if (typeof value !== 'string') {
            return '';
        }

        return value.trim();
    }

    // Themes can originate from MongoDB as either a semicolon-separated
    // string or an array, so both formats are normalized to string[].
    private normalizeThemes(value: unknown): string[] {
        if (Array.isArray(value)) {
            return value
                .filter((theme): theme is string => typeof theme === 'string')
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
}
