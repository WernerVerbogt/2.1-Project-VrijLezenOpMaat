/**
 * Validates the teacher that is selected by the student
 */

import { IsUUID } from "class-validator";

export class LinkTeacherDto {
    @IsUUID()
    teacherId: string;
}