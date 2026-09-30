/** Defines the TypeScript models used by the reading profile frontend.
 * The request types match the NestJS DTO, while the response types match 
 * the complete profile returned by GET /reading-profile. 
 * */

export type ProfileAnswerType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'SCALE'
  | 'OPEN_TEXT';

export interface ProfileAnswerPayload {
  questionCode: string;
  answerType: ProfileAnswerType;

  stringValue?: string;
  stringValues?: string[];
  numberValue?: number;
  textValue?: string;
}

export interface SaveReadingProfilePayload {
  languageLevelCode: string;
  preferredLengthCode: string;
  readingGoalCode: string;

  genreCodes: string[];
  themeCodes: string[];

  answers: ProfileAnswerPayload[];
}

export interface ProfileGenreResponse {
  studentId: string;
  genreCode: string;
}

export interface ProfileThemeResponse {
  studentId: string;
  themeCode: string;
}

export interface ProfileAnswerResponse {
  studentId: string;
  questionCode: string;
  answerType: ProfileAnswerType;

  stringValue: string | null;
  stringValues: string[];
  numberValue: number | null;
  textValue: string | null;
}

export interface ReadingProfileResponse {
  studentId: string;

  languageLevelCode: string;
  preferredLengthCode: string;
  readingGoalCode: string;

  genres: ProfileGenreResponse[];
  themes: ProfileThemeResponse[];
  answers: ProfileAnswerResponse[];
}