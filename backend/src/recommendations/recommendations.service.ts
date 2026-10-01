import { Injectable } from '@nestjs/common';

import { BooksService } from '../books/books.service';
import { CatalogBook } from '../books/types/catalog-book.type';
import { ReadingProfileService } from '../reading-profile/reading-profile.service';

import {
  PREFERRED_FORMAT_QUESTION_CODE,
  PROFILE_FORMAT_TO_MATERIAL_TYPES,
  PROFILE_LEVEL_TO_CATALOG_LEVELS,
  PROFILE_THEME_TO_CATALOG_TERM,
  RECOMMENDATION_LIMIT,
  RECOMMENDATION_WEIGHTS,
} from './recommendation.constants';

import {
  BookRecommendation,
  RecommendationReason,
} from './types/recommendation.types';

// Minimal shapes used by the recommendation algorithm.
// Keeping these small prevents the matching logic from depending
// unnecessarily on the complete Prisma-generated model.
interface ProfileTheme {
  themeCode: string;
}

interface ProfileAnswer {
  questionCode: string;
  stringValue: string | null;
}

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly readingProfileService: ReadingProfileService,
    private readonly booksService: BooksService,
  ) {}

  // Generates recommendations for the currently authenticated student.
  async getRecommendations(studentId: string): Promise<BookRecommendation[]> {
    const [profile, books] = await Promise.all([
      this.readingProfileService.getProfile(studentId),
      this.booksService.findAll(),
    ]);

    const preferredFormat = this.getPreferredFormat(profile.answers);

    const scoredBooks = books.map((book) =>
      this.scoreBook(
        book,
        profile.languageLevelCode,
        profile.themes,
        preferredFormat,
      ),
    );

    return this.selectRecommendations(scoredBooks);
  }

  // Calculates the total score and explanation for one catalog book.
  private scoreBook(
    book: CatalogBook,
    languageLevelCode: string,
    profileThemes: ProfileTheme[],
    preferredFormat: string | null,
  ): BookRecommendation {
    const reasons: RecommendationReason[] = [];

    this.addLevelMatchReason(book, languageLevelCode, reasons);
    this.addThemeMatchReasons(book, profileThemes, reasons);
    this.addFormatMatchReason(book, preferredFormat, reasons);

    const score = reasons.reduce((total, reason) => total + reason.points,0,);

    return {
      bookId: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      materialType: book.materialType,
      level: book.level,
      themes: book.themes,
      score,
      reasons,
    };
  }

  // Checks whether the catalog reading level matches the student's selected profile difficulty.
  private addLevelMatchReason(
    book: CatalogBook,
    languageLevelCode: string,
    reasons: RecommendationReason[],
  ): void {
    const allowedLevels =
      PROFILE_LEVEL_TO_CATALOG_LEVELS[languageLevelCode] ?? [];

    const catalogLevels = this.extractCatalogLevels(book.level);

    const hasLevelMatch = allowedLevels.some((allowedLevel) => catalogLevels.includes(allowedLevel),);

    if (!hasLevelMatch) {
      return;
    }

    reasons.push({
      type: 'LEVEL',
      message: 'Het leesniveau sluit aan bij jouw leesprofiel.',
      points: RECOMMENDATION_WEIGHTS.LEVEL,
    });
  }

  // Adds a score for every selected profile theme that can also
  // be found in the book's catalog themes.
  private addThemeMatchReasons(
    book: CatalogBook,
    profileThemes: ProfileTheme[],
    reasons: RecommendationReason[],
  ): void {
    const normalizedBookThemes = book.themes.map((theme) =>
      this.normalizeText(theme),
    );

    for (const profileTheme of profileThemes) {
      const catalogTerm = PROFILE_THEME_TO_CATALOG_TERM[profileTheme.themeCode];

      if (!catalogTerm) {
        continue;
      }

      const normalizedCatalogTerm = this.normalizeText(catalogTerm);

      const hasThemeMatch = normalizedBookThemes.some((bookTheme) =>
        bookTheme.includes(normalizedCatalogTerm),
      );

      if (!hasThemeMatch) {
        continue;
      }

      reasons.push({
        type: 'THEME',
        message: `Dit boek past bij jouw interesse in ${this.formatThemeName(
          profileTheme.themeCode,
        )}.`,
        points: RECOMMENDATION_WEIGHTS.THEME,
      });
    }
  }

  // Checks whether the selected preferred format corresponds with the material type stored in the book catalog.
  private addFormatMatchReason(
    book: CatalogBook,
    preferredFormat: string | null,
    reasons: RecommendationReason[],
  ): void {
    if (!preferredFormat) {
      return;
    }

    const acceptedMaterialTypes =
      PROFILE_FORMAT_TO_MATERIAL_TYPES[preferredFormat] ?? [];

    const normalizedMaterialType = this.normalizeText(book.materialType);

    const hasFormatMatch = acceptedMaterialTypes.some(
      (materialType) =>
        this.normalizeText(materialType) === normalizedMaterialType,
    );

    if (!hasFormatMatch) {
      return;
    }

    reasons.push({
      type: 'FORMAT',
      message: 'Het materiaaltype past bij jouw leesvoorkeur.',
      points: RECOMMENDATION_WEIGHTS.FORMAT,
    });
  }

  // Retrieves the PREFERRED_FORMAT answer from the flexible reading profile question answers.
  private getPreferredFormat(answers: ProfileAnswer[]): string | null {
    const formatAnswer = answers.find(
      (answer) =>
        answer.questionCode === PREFERRED_FORMAT_QUESTION_CODE,
    );

    return formatAnswer?.stringValue ?? null;
  }

  // Extracts individual levels from catalog values such as "2F", "3F" or "2F-3F".
  private extractCatalogLevels(level: string): string[] {
    const matches = level.toUpperCase().match(/[123]F/g);

    return matches ?? [];
  }

  // Selects the highest scoring books. If fewer than three books have a positive score, additional
  // catalog books are used to return at least 3 suggestions.
  private selectRecommendations(
    recommendations: BookRecommendation[],
  ): BookRecommendation[] {
    const sortedRecommendations = [...recommendations].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      // Keeps the result deterministic when two books have equal scores.
      return a.title.localeCompare(b.title, 'nl');
    });

    const matchedRecommendations = sortedRecommendations.filter(
      (recommendation) => recommendation.score > 0,
    );

    if (matchedRecommendations.length >= RECOMMENDATION_LIMIT) {
      return matchedRecommendations.slice(0, RECOMMENDATION_LIMIT);
    }

    const selectedIds = new Set(
      matchedRecommendations.map((recommendation) => recommendation.bookId),
    );

    const fallbackRecommendations = sortedRecommendations
      .filter(
        (recommendation) =>
          !selectedIds.has(recommendation.bookId),
      )
      .map((recommendation) => ({
        ...recommendation,
        reasons: [
          ...recommendation.reasons,
          {
            type: 'FALLBACK' as const,
            message:
              'Aanvullende suggestie uit de beschikbare boekencatalogus.',
            points: 0,
          },
        ],
      }));

    return [
      ...matchedRecommendations,
      ...fallbackRecommendations,
    ].slice(0, RECOMMENDATION_LIMIT);
  }

  // Normalizes textual catalog data so comparisons are case-insensitive and unaffected by surrounding whitespace.
  private normalizeText(value: string): string {
    return value.trim().toLowerCase();
  }

  // Converts internal theme codes to readable Dutch labels for the recommendation explanation.
  private formatThemeName(themeCode: string): string {
    const readableThemeNames: Record<string, string> = {
      SPORT: 'sport',
      TECHNOLOGY: 'technologie',
      LOVE: 'liefde',
      CULTURE: 'cultuur',
      ANIMALS: 'dieren',
      GAMES: 'games',
    };

    return readableThemeNames[themeCode] ?? themeCode.toLowerCase();
  }
}