/**
 * Unit tests for the reading profile service.
 * Covers saving a complete profile and retrieving a missing profile.
 */

import { NotFoundException } from '@nestjs/common';

import {
  ProfileAnswerType,
  UserRole,
} from '../generated/prisma/enums';

import { PrismaService } from '../prisma/prisma.service';
import { ReadingProfileService } from './reading-profile.service';
import { SaveReadingProfileDto } from './dto/save-reading-profile.dto';
import { PROFILE_QUESTIONS } from './profile-questions';

describe('ReadingProfileService', () => {
  let service: ReadingProfileService;

  const transactionMock = {
    readingProfile: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    profileGenre: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    profileTheme: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    profileAnswer: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    readingProfile: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock.$transaction.mockImplementation(
      async (callback) =>
        callback(transactionMock),
    );

    service = new ReadingProfileService(
      prismaMock as unknown as PrismaService,
    );
  });

  // Creates one valid answer for every required profile question.
  function createRequiredAnswers(): SaveReadingProfileDto['answers'] {
    return PROFILE_QUESTIONS
      .filter((question) => question.required)
      .map((question) => {
        switch (question.answerType) {
          case ProfileAnswerType.SINGLE_CHOICE:
            return {
              questionCode: question.code,
              answerType: question.answerType,
              stringValue:
                question.options?.[0]?.value,
            };

          case ProfileAnswerType.MULTIPLE_CHOICE:
            return {
              questionCode: question.code,
              answerType: question.answerType,
              stringValues: [
                question.options![0].value,
              ],
            };

          case ProfileAnswerType.SCALE:
            return {
              questionCode: question.code,
              answerType: question.answerType,
              numberValue: question.minValue,
            };

          case ProfileAnswerType.OPEN_TEXT:
            return {
              questionCode: question.code,
              answerType: question.answerType,
              textValue: 'Test answer',
            };
        }
      });
  }

  it('saves a complete reading profile', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      role: UserRole.STUDENT,
    });

    const dto = {
      languageLevelCode: 'AVERAGE',
      preferredLengthCode: 'MEDIUM',
      readingGoalCode: 'LEARN',
      genreCodes: ['SPORT'],
      themeCodes: ['SPORT'],
      answers: createRequiredAnswers(),
    } as SaveReadingProfileDto;

    const savedProfile = {
      studentId: 'student-1',
      languageLevelCode: 'AVERAGE',
      preferredLengthCode: 'MEDIUM',
      readingGoalCode: 'LEARN',
      genres: [
        {
          studentId: 'student-1',
          genreCode: 'SPORT',
        },
      ],
      themes: [
        {
          studentId: 'student-1',
          themeCode: 'SPORT',
        },
      ],
      answers: dto.answers,
    };

    transactionMock.readingProfile.findUnique
      .mockResolvedValue(savedProfile);

    const result = await service.saveProfile(
      'student-1',
      dto,
    );

    expect(
      transactionMock.readingProfile.upsert,
    ).toHaveBeenCalledWith({
      where: {
        studentId: 'student-1',
      },
      update: {
        languageLevelCode: 'AVERAGE',
        preferredLengthCode: 'MEDIUM',
        readingGoalCode: 'LEARN',
      },
      create: {
        studentId: 'student-1',
        languageLevelCode: 'AVERAGE',
        preferredLengthCode: 'MEDIUM',
        readingGoalCode: 'LEARN',
      },
    });

    expect(
      transactionMock.profileGenre.createMany,
    ).toHaveBeenCalled();

    expect(
      transactionMock.profileTheme.createMany,
    ).toHaveBeenCalled();

    expect(
      transactionMock.profileAnswer.createMany,
    ).toHaveBeenCalled();

    expect(result).toEqual(savedProfile);
  });

  it('throws NotFoundException when no reading profile exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      role: UserRole.STUDENT,
    });

    prismaMock.readingProfile.findUnique
      .mockResolvedValue(null);

    await expect(
      service.getProfile('student-1'),
    ).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});