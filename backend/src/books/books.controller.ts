/**
 * Handles requests when the user is browsing in the book catalog.
 */

import { Controller, Get, Query } from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorators';
import { BooksService } from './books.service';
import { GetBooksQueryDto } from './dto/get-books-query.dto';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    // Returns all unique themes that are available in the catalog.
    @Public()
    @Get('themes')
    findAvailableThemes() {
        return this.booksService.findAvailableThemes();
    }

    // Returns one filtered and paginated page of the catalog.
    @Public()
    @Get()
    findPaginated(@Query() query: GetBooksQueryDto) {
        return this.booksService.findPaginated(query);
    }
}
