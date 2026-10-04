/** 
 * Reads all the books imported in the MongoDB and converts original catalog fields
 * into normalized format that is used by the application.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
  // This method is still used internally by FR3 recommendation matching.
  async findAll(): Promise<CatalogBook[]> {
    const books = await this.bookModel.find().lean().exec();

    return books.map((book) => {
      const rawBook = book as unknown as Record<string, unknown>;

      return this.mapBook(rawBook);
    });
  }

  // Returns only the requested catalog page together with pagination metadata.
  async findPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedBooksResponse> {
    const skip = (page - 1) * limit;

    // Fetch the requested books and total result count concurrently.
    const [books, total] = await Promise.all([
      this.bookModel
        .find()
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      this.bookModel.countDocuments().exec(),
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

      // Application-specific metadata added to the local PoC catalog.
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

  // Themes may originate from MongoDB as either an array or a
  // semicolon-separated string, so both formats are supported.
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