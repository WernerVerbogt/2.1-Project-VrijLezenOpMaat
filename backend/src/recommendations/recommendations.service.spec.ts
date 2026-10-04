/**
 * Unit tests for the recommendation service.
 */

import { BooksService } from '../books/books.service';
import { ReadingProfileService } from '../reading-profile/reading-profile.service';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsService', () => {
  let service: RecommendationsService;

  // Mocked dependencies keep these tests focused on recommendation logic only.
  const readingProfileServiceMock = {
    getProfile: jest.fn(),
  };

  const booksServiceMock = {
    findAll: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // The service is instantiated directly because the dependencies
    // are completely replaced by mocks in these unit tests.
    service = new RecommendationsService(
      readingProfileServiceMock as unknown as ReadingProfileService,
      booksServiceMock as unknown as BooksService,
    );
  });

  it('should rank books based on level, theme, length and preferred format', async () => {
    readingProfileServiceMock.getProfile.mockResolvedValue({
      languageLevelCode: 'AVERAGE',
      preferredLengthCode: 'MEDIUM',
      themes: [
        {
          themeCode: 'LOVE',
        },
      ],
      answers: [
        {
          questionCode: 'PREFERRED_FORMAT',
          stringValue: 'BOOK',
        },
      ],
    });

    booksServiceMock.findAll.mockResolvedValue([
      {
        id: 'book-1',
        title: 'Perfect Match',
        author: 'Author One',
        description: 'Description',
        materialType: 'boek',
        level: '2F',
        themes: ['liefde'],
        length: 'MEDIUM',
      },
      {
        id: 'book-2',
        title: 'Level Length and Format Match',
        author: 'Author Two',
        description: 'Description',
        materialType: 'boek',
        level: '2F',
        themes: ['sport'],
        length: 'MEDIUM',
      },
      {
        id: 'book-3',
        title: 'Theme Match',
        author: 'Author Three',
        description: 'Description',
        materialType: 'e-book',
        level: '3F',
        themes: ['liefde'],
        length: 'LONG',
      },
      {
        id: 'book-4',
        title: 'Format Match',
        author: 'Author Four',
        description: 'Description',
        materialType: 'boek',
        level: '1F',
        themes: ['sport'],
        length: 'LONG',
      },
    ]);

    const result = await service.getRecommendations('student-1');

    expect(result).toHaveLength(3);

    // Full match:
    // level (3) + theme (2) + length (2) + format (1) = 8.
    expect(result[0].title).toBe('Perfect Match');
    expect(result[0].score).toBe(8);

    // Level (3) + length (2) + format (1) = 6.
    expect(result[1].title).toBe(
      'Level Length and Format Match',
    );
    expect(result[1].score).toBe(6);

    // Theme only = 2.
    expect(result[2].title).toBe('Theme Match');
    expect(result[2].score).toBe(2);
  });

  it('should give additional score when book length matches the profile preference', async () => {
    readingProfileServiceMock.getProfile.mockResolvedValue({
      languageLevelCode: 'CHALLENGING',
      preferredLengthCode: 'SHORT',
      themes: [],
      answers: [],
    });

    booksServiceMock.findAll.mockResolvedValue([
      {
        id: 'book-1',
        title: 'Short Book',
        author: 'Author',
        description: 'Description',
        materialType: 'boek',
        level: '1F',
        themes: [],
        length: 'SHORT',
      },
      {
        id: 'book-2',
        title: 'Long Book',
        author: 'Author',
        description: 'Description',
        materialType: 'boek',
        level: '1F',
        themes: [],
        length: 'LONG',
      },
      {
        id: 'book-3',
        title: 'Book Without Length',
        author: 'Author',
        description: 'Description',
        materialType: 'boek',
        level: '1F',
        themes: [],
        length: '',
      },
    ]);

    const result = await service.getRecommendations('student-1');

    expect(result).toHaveLength(3);

    // Only the first book matches the preferred length.
    expect(result[0].title).toBe('Short Book');
    expect(result[0].score).toBe(2);

    expect(
      result[0].reasons.some(
        (reason) => reason.type === 'LENGTH',
      ),
    ).toBe(true);
  });

  it('should match a combined catalog level such as 2F-3F', async () => {
    readingProfileServiceMock.getProfile.mockResolvedValue({
      languageLevelCode: 'AVERAGE',
      preferredLengthCode: 'LONG',
      themes: [],
      answers: [],
    });

    booksServiceMock.findAll.mockResolvedValue([
      {
        id: 'book-1',
        title: 'Combined Level Book',
        author: 'Author',
        description: 'Description',
        materialType: 'boek',
        level: '2F-3F',
        themes: [],
        length: 'SHORT',
      },
      {
        id: 'book-2',
        title: 'Fallback Book One',
        author: 'Author',
        description: 'Description',
        materialType: 'boek',
        level: '1F',
        themes: [],
        length: 'SHORT',
      },
      {
        id: 'book-3',
        title: 'Fallback Book Two',
        author: 'Author',
        description: 'Description',
        materialType: 'boek',
        level: '1F',
        themes: [],
        length: 'SHORT',
      },
    ]);

    const result = await service.getRecommendations('student-1');

    expect(result).toHaveLength(3);

    expect(result[0].title).toBe('Combined Level Book');
    expect(result[0].score).toBe(3);

    expect(
      result[0].reasons.some(
        (reason) => reason.type === 'LEVEL',
      ),
    ).toBe(true);
  });

  it('should still return three books when no catalog book matches the profile', async () => {
    readingProfileServiceMock.getProfile.mockResolvedValue({
      languageLevelCode: 'CHALLENGING',
      preferredLengthCode: 'LONG',
      themes: [
        {
          themeCode: 'TECHNOLOGY',
        },
      ],
      answers: [
        {
          questionCode: 'PREFERRED_FORMAT',
          stringValue: 'ARTICLE',
        },
      ],
    });

    booksServiceMock.findAll.mockResolvedValue([
      {
        id: 'book-1',
        title: 'Book One',
        author: 'Author',
        description: 'Description',
        materialType: 'boek',
        level: '1F',
        themes: ['sport'],
        length: 'SHORT',
      },
      {
        id: 'book-2',
        title: 'Book Two',
        author: 'Author',
        description: 'Description',
        materialType: 'boek',
        level: '1F',
        themes: ['dieren'],
        length: 'SHORT',
      },
      {
        id: 'book-3',
        title: 'Book Three',
        author: 'Author',
        description: 'Description',
        materialType: 'boek',
        level: '1F',
        themes: ['cultuur'],
        length: 'SHORT',
      },
    ]);

    const result = await service.getRecommendations('student-1');

    expect(result).toHaveLength(3);

    // No matching metadata means all suggestions are fallback results.
    expect(
      result.every(
        (recommendation) => recommendation.score === 0,
      ),
    ).toBe(true);

    expect(
      result.every((recommendation) =>
        recommendation.reasons.some(
          (reason) => reason.type === 'FALLBACK',
        ),
      ),
    ).toBe(true);
  });
});