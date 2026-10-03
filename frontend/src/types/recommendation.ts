/** 
 * Defines the recommendation data received from the backend via JSON.
 * Recommendation recommends the books for the student based on his reading profile, which is
 * filled in the form.
 */

export type RecommendationReasonType =
  | 'LEVEL'
  | 'THEME'
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
  score: number;
  reasons: RecommendationReason[];
}

export interface RecommendationsResponse {
  recommendations: BookRecommendation[];
}