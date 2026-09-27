// Reads all the books imported in the MongoDB

import { Injectable } from '@nestjs/common';
import { InjectModel, raw } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './schemas/book.schema';

@Injectable()
export class BooksService {
    constructor(
        @InjectModel(Book.name)
        private readonly bookModel: Model<Book>,
    ) {}

    async findAll() {
        const books = await this.bookModel.find().lean().exec(); // finds all the books, return JSON objects (lean)

        return books.map((book) => {
            const rawBook = book as unknown as Record<string, unknown>; // TODO make type safer | Handle it as unknown for now as it doesn't define the fields now

            return {
                id: String(rawBook['_id']),
                title: rawBook['Titel'],
                author: rawBook['Auteur'],
                description: rawBook['Korte omschrijving'],
                materialType: rawBook['Type materiaal'],
                level: rawBook['Niveau'],
                themes: typeof rawBook['Themas_boek'] === 'string' ? rawBook['Themas_boek'].split(';').map((theme) => theme.trim()) : [],
            };
        });
    }
}
