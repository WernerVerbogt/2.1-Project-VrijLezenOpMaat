// This file is meant to be used as a schema for the Book model in a NestJS application using Mongoose. 
// It defines the structure of the Book document in the MongoDB collection.

import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './schemas/book.schema'

@Module({
  imports: [
    MongooseModule.forFeature([ // makes Book model available in BooksModule
      {
        name: Book.name,
        schema: BookSchema,
      },
    ]),
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}