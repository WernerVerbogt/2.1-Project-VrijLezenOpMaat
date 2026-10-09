/**
 * Defines the data structures used for student-teacher links
 * and the student information visible to linked teachers.
 */

import type { ReadingListItem } from './readingList';

export interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isLinked: boolean;
}

export interface LinkedTeacherPayload {
    teacherId: string;
}

export interface LinkedStudent {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface StudentProfileGenre {
    studentId: string;
    genreCode: string;
}

export interface StudentProfileTheme {
    studentId: string;
    themeCode: string;
}

export interface StudentProfileAnswer {
    studentId: string;
    questionCode: string;
    answerType: string;
    stringValue: string | null;
    stringValues: string[];
    numberValue: number | null;
    textValue: string | null;
}

export interface LinkedStudentReadingProfile {
    studentId: string;
    languageLevelCode: string;
    preferredLengthCode: string;
    readingGoalCode: string;
    genres: StudentProfileGenre[];
    themes: StudentProfileTheme[];
    answers: StudentProfileAnswer[];
}

export interface LinkedStudentDetails
    extends LinkedStudent {
    readingProfile: LinkedStudentReadingProfile | null;
    readingList: ReadingListItem[];
}