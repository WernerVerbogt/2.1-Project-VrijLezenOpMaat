/** Groups the reading profile controller, service and database dependency
 * into dedicated NestJS feature module  
 * */

import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { ReadingProfileController } from './reading-profile.controller';
import { ReadingProfileService } from './reading-profile.service';

@Module({
    imports: [PrismaModule],
    controllers: [ReadingProfileController],
    providers: [ReadingProfileService],
    exports: [ReadingProfileService]
})
export class ReadingProfileModule {}