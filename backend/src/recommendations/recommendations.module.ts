import { Module } from '@nestjs/common';

import { BooksModule } from '../books/books.module';
import { ReadingProfileModule } from '../reading-profile/reading-profile.module';

import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';

@Module({
    imports: [
        BooksModule,
        ReadingProfileModule,
    ],

    controllers: [RecommendationsController],
    providers: [RecommendationsService],
    exports: [RecommendationsService],
})
export class RecommendationsModule {}