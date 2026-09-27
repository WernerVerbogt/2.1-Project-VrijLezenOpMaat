// Reads all the books imported in the MongoDB

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './schemas/book.schema';

@Injectable()
export class BooksService {
    constructor(
        @InjectModel(Book.name)
        private readonly bookModel: Model<Book>,
    ) {}

    async findAll() {
        return this.bookModel.find().lean().exec(); // finds all the books, return JSON objects (lean)
    }
}
