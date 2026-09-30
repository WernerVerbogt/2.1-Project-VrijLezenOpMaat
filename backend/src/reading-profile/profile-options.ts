// Defines the fixed reading profile options used for matching and recommendation logic.
// These values are stored in ReadingProfile, ProfileGenre, and ProfileTheme
// and should remain stable so stored profile data stays consistent.

export interface ProfileOption {
    value: string;
    label: string;
}

export const LANGUAGE_LEVEL_OPTIONS: ProfileOption[] = [
    {
        value: 'EASY',
        label: 'Makkelijk',
    },
    {
        value: 'AVERAGE',
        label: 'Gemiddeld',
    },
    {
        value: 'CHALLENGING',
        label: 'Uitdagend',
    },
];

export const LENGTH_OPTIONS: ProfileOption[] = [
  {
    value: 'SHORT',
    label: 'Korte verhalen of teksten',
  },
  {
    value: 'MEDIUM',
    label: 'Middel',
  },
  {
    value: 'LONG',
    label: 'Lang',
  },
];

export const READING_GOAL_OPTIONS: ProfileOption[] = [
  {
    value: 'DISCOVER_NEW_WORLDS',
    label: 'Nieuwe werelden ontdekken',
  },
  {
    value: 'THINK',
    label: 'Aan het denken worden gezet',
  },
  {
    value: 'LEARN',
    label: 'Iets leren of te weten komen',
  },
  {
    value: 'IMPROVE_READING',
    label: 'Een betere of snellere lezer worden',
  },
  {
    value: 'SCHOOL_SUCCESS',
    label: 'Mijn kansen op schoolsucces vergroten',
  },
  {
    value: 'DO_NOT_WANT_TO_READ',
    label: 'Ik wil niet lezen',
  },
];

export const GENRE_OPTIONS: ProfileOption[] = [
  {
    value: 'FICTION_TENSION',
    label: 'Spanning',
  },
  {
    value: 'FICTION_HORROR',
    label: 'Horror',
  },
  {
    value: 'FICTION_HUMOR',
    label: 'Humor',
  },
  {
    value: 'FICTION_LOVE',
    label: 'Liefde',
  },
  {
    value: 'FICTION_FANTASY',
    label: 'Fantasy',
  },
  {
    value: 'FICTION_SCIENCE_FICTION',
    label: 'Sciencefiction',
  },

  {
    value: 'NONFICTION_BIOGRAPHY',
    label: 'Biografie',
  },
  {
    value: 'NONFICTION_HISTORY',
    label: 'Geschiedenis',
  },
  {
    value: 'NONFICTION_POLITICS',
    label: 'Politiek',
  },
  {
    value: 'NONFICTION_INFORMATIONAL',
    label: 'Informatief',
  },
];

export const THEME_OPTIONS: ProfileOption[] = [
  {
    value: 'SPORT',
    label: 'Sport',
  },
  {
    value: 'TECHNOLOGY',
    label: 'Technologie',
  },
  {
    value: 'LOVE',
    label: 'Liefde',
  },
  {
    value: 'CULTURE',
    label: 'Cultuur',
  },
  {
    value: 'ANIMALS',
    label: 'Dieren',
  },
  {
    value: 'GAMES',
    label: 'Games',
  },
];