import { Controller, Get } from '@nestjs/common';
import { BooksService } from './books.service';
import { Public } from '../auth/decorators/public.decorators';

@Controller('books') // endpoint /books
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Public() // for development purposes, it will be temporarily set to public
    @Get()
    findAll() {
        return this.booksService.findAll();
    }
}
