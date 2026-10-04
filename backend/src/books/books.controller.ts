import { Controller, Get, Query } from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorators';
import { BooksService } from './books.service';
import { GetBooksQueryDto } from './dto/get-books-query.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // Returns one page of the catalog.
  // This endpoint is temporarily public during development.
  @Public()
  @Get()
  findPaginated(@Query() query: GetBooksQueryDto) {
    return this.booksService.findPaginated(query.page, query.limit);
  }
}