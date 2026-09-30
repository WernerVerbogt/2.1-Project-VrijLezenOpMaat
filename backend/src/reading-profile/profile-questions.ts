// Defines the reading profile questions that are stored as flexible profile answers.
// Each question has a stable code, category, answer type, validation rules,
// and optional answer choices used by the backend and frontend.

import { ProfileAnswerType } from "../generated/prisma/enums";

export type ProfileQuestionCategory =
 | 'BACKGROUND'
 | 'READING_EXPERIENCE'
 | 'READING_ENJOYMENT'
 | 'READING_CONFIDENCE'
 | 'READING_AVOIDANCE'
 | 'PREFERENCE'
 | 'LEVEL'
 | 'FORMAT'
 | 'CHOOSING'
 | 'OPEN';

export interface ProfileQuestionOption {
    value: string;
    label: string;
}

export interface ProfileQuestion {
    code: string;
    category: ProfileQuestionCategory;
    label: string;
    answerType: ProfileAnswerType;
    required: boolean;
    options?: ProfileQuestionOption[];
    minValue?: number;
    maxValue?: number;
}

// Below is a selection of questions that can be asked in the form.
// As this is a concept, not all the questions are asked here

export const PROFILE_QUESTIONS: ProfileQuestion[] = [
    {
        code: 'FIRST_LANGUAGE',
        category: 'BACKGROUND',
        label: 'Wat is je eerste taal?',
        answerType: ProfileAnswerType.SINGLE_CHOICE,
        required: true,
        options: [
            {
                value: 'DUTCH',
                label: 'Nederlands',
            },
            {
                value: 'OTHER',
                label: 'Anders',
            },
        ],
    },
    {
        code: 'LIKED_BOOKS',
        category: 'READING_EXPERIENCE',
        label: 'Welk(e) boek(en) die je gelezen hebt vond je leuk en waarom?',
        answerType: ProfileAnswerType.OPEN_TEXT,
        required: false,
    },
    {
        code: 'READING_ENJOYMENT',
        category: 'READING_ENJOYMENT',
        label: 'Ik vind lezen leuk.',
        answerType: ProfileAnswerType.SCALE,
        required: true,
        minValue: 1,
        maxValue: 5,

        // 1 = helemaal oneens, 2 = oneens, 3 = neutraal, 4 = eens, 5 = helemaal eens

    },
    /* {
        code: 'READING_REASON',
        category: 'READING_ENJOYMENT',
        label: 'Ik lees omdat ik...',
        answerType: ProfileAnswerType.SINGLE_CHOICE,
        required: true,
        options: [
            {
                value: 'DISCOVER_NEW_WORLDS',
                label: 'Nieuwe werelden wil ontdekken',
            },
            {
                value: 'THINK',
                label: 'Aan het denken wil worden gezet',
            },
            {
                value: 'LEARN',
                label: 'Iets wil leren of te weten wil komen',
            },
            {
                value: 'IMPROVE_READING',
                label: 'Een betere of snellere lezer wil worden',
            },
            {
                value: 'SCHOOL_SUCCESS',
                label: 'Mijn kansen op schoolsucces wil vergroten',
            },
            {
                value: 'DO_NOT_WANT_TO_READ',
                label: 'Ik wil niet lezen',
            },
        ],
    }, */
    {
        code: 'READING_CONFIDENCE',
        category: 'READING_CONFIDENCE',
        label: 'Ik begrijp teksten goed.',
        answerType: ProfileAnswerType.SCALE,
        required: true,
        minValue: 1,
        maxValue: 5,
    },
    {
        code: 'READING_AVOIDANCE',
        category: 'READING_AVOIDANCE',
        label: 'Ik lees alleen als het moet.',
        answerType: ProfileAnswerType.SCALE,
        required: true,
        minValue: 1,
        maxValue: 5,
    },
    {
        code: 'FICTION_OR_TRUE',
        category: 'PREFERENCE',
        label: 'Lees je liever fictie, waargebeurde verhalen of maakt het niet uit?',
        answerType: ProfileAnswerType.SINGLE_CHOICE,
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
            category: 'PREFERENCE',
            label: 'Als je leest, wat wil je dan voelen of ervaren?',
            answerType: ProfileAnswerType.MULTIPLE_CHOICE,
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
                label: 'Herkenning van personages, situaties of gebeurtenissen',
            },
        ],
    },
    {
        code: 'PREFERRED_FORMAT',
        category: 'FORMAT',
        label: 'Wat lees je liever?',
        answerType: ProfileAnswerType.SINGLE_CHOICE,
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
        category: 'CHOOSING',
        label: 'Ik wil hulp bij het kiezen van iets om te lezen.',
        answerType: ProfileAnswerType.SCALE,
        required: true,
        minValue: 1,
        maxValue: 5,
    },
    {
        code: 'READ_MORE_WHEN',
        category: 'OPEN',
        label: 'Wanneer zou jij meer lezen?',
        answerType: ProfileAnswerType.OPEN_TEXT,
        required: false,
    },
];