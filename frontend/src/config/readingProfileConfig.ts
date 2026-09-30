/** Defines the questions and selectable options shown in the reading profile form.
 * The stored values match the codes accepted by the NestJS backend where the same logic happens.
 * The backend acts as the validation and security layer, this frontend config is to define the labels 
 * and show the options in the form.
*/

import type { ProfileAnswerType } from '../types/readingProfile';

export interface ReadingProfileOption {
  value: string;
  label: string;
}

export interface ReadingProfileQuestion {
  code: string;
  category: string;
  label: string;
  answerType: ProfileAnswerType;
  required: boolean;
  options?: ReadingProfileOption[];
  minValue?: number;
  maxValue?: number;
}

// Fixed profile values stored directly in ReadingProfile.
export const LANGUAGE_LEVEL_OPTIONS: ReadingProfileOption[] = [
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

export const LENGTH_OPTIONS: ReadingProfileOption[] = [
  {
    value: 'SHORT',
    label: 'Kort',
  },
  {
    value: 'MEDIUM',
    label: 'Gemiddeld',
  },
  {
    value: 'LONG',
    label: 'Lang',
  },
];

export const READING_GOAL_OPTIONS: ReadingProfileOption[] = [
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

// Genres are stored in ProfileGenre.
export const GENRE_OPTIONS: ReadingProfileOption[] = [
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

// Themes are stored in ProfileTheme.
export const THEME_OPTIONS: ReadingProfileOption[] = [
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

// Flexible questions are stored in ProfileAnswer.
export const PROFILE_QUESTIONS: ReadingProfileQuestion[] = [
  {
    code: 'FIRST_LANGUAGE',
    category: 'Achtergrond',
    label: 'Wat is je eerste taal?',
    answerType: 'SINGLE_CHOICE',
    required: true,
    options: [
      {
        value: 'DUTCH',
        label: 'Nederlands',
      },
      {
        value: 'OTHER',
        label: 'OTHER',
      },
    ],
  },

  {
    code: 'LIKED_BOOKS',
    category: 'Leeservaring',
    label: 'Welk(e) boek(en) die je gelezen hebt vond je leuk en waarom?',
    answerType: 'OPEN_TEXT',
    required: false,
  },

  {
    code: 'READING_ENJOYMENT',
    category: 'Leesplezier',
    label: 'Ik vind lezen leuk.',
    answerType: 'SCALE',
    required: true,
    minValue: 1,
    maxValue: 5,
  },

  {
    code: 'READING_CONFIDENCE',
    category: 'Leesvertrouwen',
    label: 'Ik begrijp teksten goed.',
    answerType: 'SCALE',
    required: true,
    minValue: 1,
    maxValue: 5,
  },

  {
    code: 'READING_AVOIDANCE',
    category: 'Leesvermijding',
    label: 'Ik lees alleen als het moet.',
    answerType: 'SCALE',
    required: true,
    minValue: 1,
    maxValue: 5,
  },

  {
    code: 'FICTION_OR_TRUE',
    category: 'Voorkeur',
    label: 'Lees je liever fictie, waargebeurde verhalen of maakt het niet uit?',
    answerType: 'SINGLE_CHOICE',
    required: true,
    options: [
      {
        value: 'TRUE_STORY',
        label: 'Waargebeurd',
      },
      {
        value: 'FICTION',
        label: 'Fictie',
      },
      {
        value: 'NO_PREFERENCE',
        label: 'Maakt niet uit',
      },
    ],
  },

  {
    code: 'DESIRED_EXPERIENCE',
    category: 'Voorkeur',
    label: 'Als je leest, wat wil je dan voelen of ervaren?',
    answerType: 'MULTIPLE_CHOICE',
    required: true,
    options: [
      {
        value: 'TENSION',
        label: 'Spanning',
      },
      {
        value: 'RELAXATION',
        label: 'Ontspanning',
      },
      {
        value: 'DRAMA',
        label: 'Drama',
      },
      {
        value: 'HUMOR',
        label: 'Humor',
      },
      {
        value: 'SENSATION',
        label: 'Sensatie',
      },
      {
        value: 'LEARN_SOMETHING_NEW',
        label: 'Iets nieuws leren',
      },
      {
        value: 'RECOGNITION',
        label: 'Herkenning',
      },
    ],
  },

  {
    code: 'PREFERRED_FORMAT',
    category: 'Vorm',
    label: 'Wat lees je liever?',
    answerType: 'SINGLE_CHOICE',
    required: true,
    options: [
      {
        value: 'BOOK',
        label: 'Boek',
      },
      {
        value: 'E_READER',
        label: 'E-reader',
      },
      {
        value: 'ARTICLE',
        label: 'Artikel',
      },
      {
        value: 'ONLINE',
        label: 'Online',
      },
      {
        value: 'NEWSPAPER',
        label: 'Krant',
      },
      {
        value: 'MAGAZINE',
        label: 'Magazine',
      },
    ],
  },

  {
    code: 'CHOICE_HELP',
    category: 'Kiezen',
    label: 'Ik wil hulp bij het kiezen van iets om te lezen.',
    answerType: 'SCALE',
    required: true,
    minValue: 1,
    maxValue: 5,
  },

  {
    code: 'READ_MORE_WHEN',
    category: 'Open',
    label: 'Wanneer zou jij meer lezen?',
    answerType: 'OPEN_TEXT',
    required: false,
  },
];