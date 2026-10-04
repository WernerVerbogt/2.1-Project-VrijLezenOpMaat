/** 
 * Defines the data structures used by the recommendation feature (algorithm)
 * */

export type RecommendationReasonType =
 | 'LEVEL'
 | 'THEME'
 | 'LENGTH'
 | 'FORMAT'
 | 'FALLBACK';

export interface RecommendationReason {
    type: RecommendationReasonType;
    message: string;
    points: number;
}

export interface BookRecommendation {
    bookId: string;
    title: string;
    author: string;
    description: string;
    materialType: string;
    level: string;
    themes: string[];

    // Based on the reading profile, we can give a score to each book
    score: number;

    // Why was this book chosen?
    reasons: RecommendationReason[];
}