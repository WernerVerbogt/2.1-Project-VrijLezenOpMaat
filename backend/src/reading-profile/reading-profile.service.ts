/**  Handles reading profile business logic and persistence.
 * The service validates profile answers, retrieves existing profiles,
 * and stores profile changes atomically in PostgreSQL using Prisma. */

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {ProfileAnswerType, UserRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { SaveReadingProfileDto } from './dto/save-reading-profile.dto';
import { PROFILE_QUESTIONS } from './profile-questions';

@Injectable()
export class ReadingProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the complete reading profile of the authenticated student.
   * The related genres, themes and flexible answers are included
   * so the frontend can reconstruct the complete form for FR2.
   */
  async getProfile(studentId: string) {
    await this.validateStudent(studentId);

    const profile = await this.prisma.readingProfile.findUnique({
      where: {
        studentId,
      },
      include: {
        genres: true,
        themes: true,
        answers: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Geen leesprofiel gevonden.');
    }

    return profile;
  }

  /**
   * Creates a new reading profile or completely updates an existing one.
   * The student ID comes from the authenticated JWT, not from the request body.
   */
  async saveProfile(studentId: string, dto: SaveReadingProfileDto,) {
    await this.validateStudent(studentId);
    this.validateProfileAnswers(dto.answers);

    return this.prisma.$transaction(async (tx) => {
      // Create the profile when it does not exist yet,
      // or update its fixed matching fields when it already exists.
      await tx.readingProfile.upsert({
        where: {
          studentId,
        },
        update: {
          languageLevelCode: dto.languageLevelCode,
          preferredLengthCode: dto.preferredLengthCode,
          readingGoalCode: dto.readingGoalCode,
        },
        create: {
          studentId,
          languageLevelCode: dto.languageLevelCode,
          preferredLengthCode: dto.preferredLengthCode,
          readingGoalCode: dto.readingGoalCode,
        },
      });

      // Replace all genres with the newly submitted selection.
      await tx.profileGenre.deleteMany({
        where: {
          studentId,
        },
      });

      await tx.profileGenre.createMany({
        data: dto.genreCodes.map((genreCode) => ({
          studentId,
          genreCode,
        })),
      });

      // Replace all themes with the newly submitted selection.
      await tx.profileTheme.deleteMany({
        where: {
          studentId,
        },
      });

      await tx.profileTheme.createMany({
        data: dto.themeCodes.map((themeCode) => ({
          studentId,
          themeCode,
        })),
      });

      // Replace the flexible answers with the latest submitted answers.
      await tx.profileAnswer.deleteMany({
        where: {
          studentId,
        },
      });

      await tx.profileAnswer.createMany({
        data: dto.answers.map((answer) => ({
          studentId,
          questionCode: answer.questionCode,
          answerType: answer.answerType,
          stringValue: answer.stringValue ?? null,
          stringValues: answer.stringValues ?? [],
          numberValue: answer.numberValue ?? null,
          textValue: answer.textValue ?? null,
        })),
      });

      // Return the complete profile after saving.
      return tx.readingProfile.findUnique({
        where: {
          studentId,
        },
        include: {
          genres: true,
          themes: true,
          answers: true,
        },
      });
    });
  }

  /**
   * Ensures that the profile belongs to an existing student.
   */
  private async validateStudent(studentId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: studentId,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('User does not exist.');
    }

    if (user.role !== UserRole.STUDENT) {
      throw new ForbiddenException(
        'Only students can manage a reading profile.',
      );
    }
  }

  /**
   * Validates every submitted answer against the central question definitions.
   * DTO validation handles the request structure; this handles business rules.
   */
  private validateProfileAnswers(answers: SaveReadingProfileDto['answers'],) {
    const submittedQuestionCodes = answers.map(
      (answer) => answer.questionCode,
    );

    // A question may only occur once in a submitted profile.
    if (new Set(submittedQuestionCodes).size !==submittedQuestionCodes.length) {
      throw new BadRequestException(
        'A profile question may only be answered once.',
      );
    }

    // All questions marked as required must be present.
    const requiredQuestions = PROFILE_QUESTIONS.filter((question) => question.required,);

    for (const question of requiredQuestions) {
      if (!submittedQuestionCodes.includes(question.code)) {
        throw new BadRequestException(
          `Required profile question "${question.code}" is missing.`,
        );
      }
    }

    // Validate each answer against its configured question.
    for (const answer of answers) {
      const question = PROFILE_QUESTIONS.find(
        (item) => item.code === answer.questionCode,
      );

      if (!question) {
        throw new BadRequestException(
          `Unknown profile question "${answer.questionCode}".`,
        );
      }

      if (answer.answerType !== question.answerType) {
        throw new BadRequestException(
          `Invalid answer type for "${answer.questionCode}".`,
        );
      }

      switch (question.answerType) {
        case ProfileAnswerType.SINGLE_CHOICE:
          this.validateSingleChoiceAnswer(
            question.code,
            question.options?.map((option) => option.value) ?? [],
            answer.stringValue,
          );
          break;

        case ProfileAnswerType.MULTIPLE_CHOICE:
          this.validateMultipleChoiceAnswer(
            question.code,
            question.options?.map((option) => option.value) ?? [],
            answer.stringValues,
          );
          break;

        case ProfileAnswerType.SCALE:
          this.validateScaleAnswer(
            question.code,
            question.minValue,
            question.maxValue,
            answer.numberValue,
          );
          break;

        case ProfileAnswerType.OPEN_TEXT:
          this.validateOpenTextAnswer(
            question.code,
            answer.textValue,
          );
          break;
      }
    }
  }

  /**
   * Validates a single-choice answer against its configured options.
   */
  private validateSingleChoiceAnswer(questionCode: string, allowedValues: string[], value?: string,) {
    if (!value || !allowedValues.includes(value)) {
      throw new BadRequestException(
        `Invalid answer for "${questionCode}".`,
      );
    }
  }

  /**
   * Validates a multiple-choice answer and requires at least one value.
   */
  private validateMultipleChoiceAnswer(questionCode: string, allowedValues: string[], values?: string[],) {
    if (!values || values.length === 0) {
      throw new BadRequestException(
        `At least one answer is required for "${questionCode}".`,
      );
    }

    const containsInvalidValue = values.some((value) => !allowedValues.includes(value),);

    if (containsInvalidValue) {
      throw new BadRequestException(
        `Invalid answer for "${questionCode}".`,
      );
    }

    if (new Set(values).size !== values.length) {
      throw new BadRequestException(
        `Duplicate answers are not allowed for "${questionCode}".`,
      );
    }
  }

  /**
   * Validates that a scale answer falls within its configured range.
   */
  private validateScaleAnswer(
    questionCode: string,
    minValue?: number,
    maxValue?: number,
    value?: number,
  ) {
    if (
      value === undefined ||
      minValue === undefined ||
      maxValue === undefined ||
      value < minValue ||
      value > maxValue
    ) {
      throw new BadRequestException(
        `Answer for "${questionCode}" must be between ${minValue} and ${maxValue}.`,
      );
    }
  }

  /**
   * Rejects an empty open-text answer when the optional question is submitted.
   * Optional open questions may instead be omitted entirely.
   */
  private validateOpenTextAnswer(questionCode: string, value?: string,) {
    if (!value || value.trim().length === 0) {
      throw new BadRequestException(
        `Answer for "${questionCode}" may not be empty.`,
      );
    }
  }
}