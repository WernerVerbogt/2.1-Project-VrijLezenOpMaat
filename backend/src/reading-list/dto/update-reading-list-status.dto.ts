/**
 * Validates the status of a book from the user when a reading list item is updated
 */

import { IsBoolean } from 'class-validator';

export class UpdateReadingListStatusDto {
    @IsBoolean()
    isRead: boolean;
}