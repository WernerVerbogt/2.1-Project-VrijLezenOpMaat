/**
 * Validates the data that is required to add a book to a student's reading list
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class AddReadingListItemDto {
    @IsString()
    @IsNotEmpty()
    bookId: string;
}