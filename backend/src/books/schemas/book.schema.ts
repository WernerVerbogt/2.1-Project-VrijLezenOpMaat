// This file is meant to be used as a schema for the Book model in a NestJS application using Mongoose. 
// It defines the structure of the Book document in the MongoDB collection.

import { HydratedDocument } from "mongoose";
import { Schema, SchemaFactory } from '@nestjs/mongoose'

export type BookDocument = HydratedDocument<Book>;

@Schema({
    collection: 'boeken', // Name of collection
    strict: false, // TODO improve for type safety and maintainability, this is good for now as the collection is directly imported via .csv file
})
export class Book {}

export const BookSchema = SchemaFactory.createForClass(Book);