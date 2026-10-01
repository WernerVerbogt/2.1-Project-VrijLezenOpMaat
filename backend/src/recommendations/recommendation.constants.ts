/** 
 * Contains the configurable (business) rules used by the recommendation algorithm
 */

export const RECOMMENDATION_LIMIT = 3;

export const RECOMMENDATION_WEIGHTS = {
    LEVEL: 3,
    THEME: 2,
    FORMAT: 1,
} as const;

// Question code used to retrieve the preferred reading format from the flexible profile answers
export const PREFERRED_FORMAT_QUESTION_CODE = 'PREFERRED_FORMAT';

// Maps the profile's readable difficulty choices to catalog reading levels.
// These are application-specific matching rules, not an official education equivalence.

export const PROFILE_LEVEL_TO_CATALOG_LEVELS: Record<string, string[]> = {
    EASY: ['1F'],
    AVERAGE: ['2F'],
    CHALLENGING: ['3F'],
};

// Maps profile theme codes to textual values used in the catalog
export const PROFILE_THEME_TO_CATALOG_TERM: Record<string, string> = {
    SPORT: 'sport',
    TECHNOLOGY: 'technologie',
    LOVE: 'liefde',
    CULTURE: 'cultuur',
    ANIMALS: 'dieren',
    GAMES: 'games',
};

// Maps reading-profile format answer to MongoDB material types.
export const PROFILE_FORMAT_TO_MATERIAL_TYPES: Record<string, string[]> = {
    BOOK: ['boek'],
    E_READER: ['e-book', 'ebook'],
    ARTICLE: ['artikel'],
    ONLINE: ['online'],
    NEWSPAPER: ['krant'],
    MAGAZINE: ['tijdschrift'],
}

