import { Controller, Get } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books') // endpoint /books
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Get()
    findAll() {
        return this.booksService.findAll();
    }
}
