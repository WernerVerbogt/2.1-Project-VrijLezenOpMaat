/**
 * Configures the reading list feature and its dependencies.
 */

import { Module } from '@nestjs/common';
import { BooksModule } from '../books/books.module';
import { PrismaService } from '../prisma/prisma.service';
import { ReadingListController } from './reading-list.controller';
import { ReadingListService } from './reading-list.service';

@Module({
    imports: [
        // Reuses the existing book database catalog functionality.
        BooksModule,
    ],
    controllers: [
        ReadingListController,
    ],
    providers: [
        ReadingListService,
        PrismaService,
    ],
    exports: [
        // The same reading list logic can be used for the teacher so see the reading list of the students.
        ReadingListService,
    ],
})
export class ReadingListModule {}