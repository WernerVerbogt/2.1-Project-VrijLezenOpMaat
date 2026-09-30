// Defines the DTOs used to validate reading profile data sent from the frontend.
// It ensures that profile values, genres, themes, and question answers
// match the allowed options and expected data types before they reach the service layer.

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ProfileAnswerType } from '../../generated/prisma/enums';
import { PROFILE_QUESTIONS } from '../profile-questions';

import {
  GENRE_OPTIONS,
  LANGUAGE_LEVEL_OPTIONS,
  LENGTH_OPTIONS,
  READING_GOAL_OPTIONS,
  THEME_OPTIONS,
} from '../profile-options';

// Convert the configured profile options into arrays of allowed database values.
const LANGUAGE_LEVEL_CODES = LANGUAGE_LEVEL_OPTIONS.map((option) => option.value,);

const LENGTH_CODES = LENGTH_OPTIONS.map((option) => option.value,);

const READING_GOAL_CODES = READING_GOAL_OPTIONS.map((option) => option.value,);

const GENRE_CODES = GENRE_OPTIONS.map((option) => option.value,);

const THEME_CODES = THEME_OPTIONS.map((option) => option.value,);

const PROFILE_QUESTION_CODES = PROFILE_QUESTIONS.map((question) => question.code,);

// Represents one flexible answer from the reading profile questions.

export class ProfileAnswerDto {
  @IsString()
  @IsIn(PROFILE_QUESTION_CODES)
  questionCode: string;

  @IsEnum(ProfileAnswerType)
  answerType: ProfileAnswerType;

  @IsOptional()
  @IsString()
  stringValue?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  stringValues?: string[];

  @IsOptional()
  @IsInt()
  numberValue?: number;

  @IsOptional()
  @IsString()
  textValue?: string;
}

// Represents the complete reading profile submitted by the student.

export class SaveReadingProfileDto {
  @IsString()
  @IsIn(LANGUAGE_LEVEL_CODES)
  languageLevelCode: string;

  @IsString()
  @IsIn(LENGTH_CODES)
  preferredLengthCode: string;

  @IsString()
  @IsIn(READING_GOAL_CODES)
  readingGoalCode: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  @IsIn(GENRE_CODES, { each: true })
  genreCodes: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  @IsIn(THEME_CODES, { each: true })
  themeCodes: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProfileAnswerDto)
  answers: ProfileAnswerDto[];
}