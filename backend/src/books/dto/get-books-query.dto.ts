/**
 * Defines and validates the query parameters that are used when browsing in the book catalog
 */

import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class GetBooksQueryDto {
    // Page numbers starts at 1 for a user-friendly API
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    // Limits how many books are returned for each catalog page
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit: number = 12;

    // Filters books by catalog reading level (1F, 2F, 3F...)
    @IsOptional()
    @IsString()
    level?: string;

    // The catalog stores genres (themes) in the Themas_boek field.
    @IsOptional()
    @IsString()
    genre?: string;

    // Uses the same length codes as the reading profile
    @IsOptional()
    @IsIn(['SHORT', 'MEDIUM', 'LONG'])
    length?: string;
}