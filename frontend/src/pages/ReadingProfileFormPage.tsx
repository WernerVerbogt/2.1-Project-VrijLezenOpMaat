/** Reading Profile Form page
 * Provides the form to configure the reading profile for the student.
 * Every profile question is shown as a separate step.
 * Answers are kept in local React state while navigating and are only
 * persisted after the student confirms the answers on the review screen
 */

import {
  useEffect,
  useState,
  type SyntheticEvent,
} from 'react';

import { useAuth } from '../context/useAuth';

import {
  GENRE_OPTIONS,
  LANGUAGE_LEVEL_OPTIONS,
  LENGTH_OPTIONS,
  PROFILE_QUESTIONS,
  READING_GOAL_OPTIONS,
  THEME_OPTIONS,
} from '../config/readingProfileConfig';

import type {
  ReadingProfileOption,
  ReadingProfileQuestion,
} from '../config/readingProfileConfig';

import {
  getReadingProfile,
  ReadingProfileApiError,
  saveReadingProfile,
} from '../services/readingProfileService';

import type {
  ProfileAnswerPayload,
  ReadingProfileResponse,
  SaveReadingProfilePayload,
} from '../types/readingProfile';


interface QuestionAnswerState {
  stringValue?: string;
  stringValues?: string[];
  numberValue?: number;
  textValue?: string;
}

type AnswersState = Record<string, QuestionAnswerState>;

interface ReadingProfileFormState {
  languageLevelCode: string;
  preferredLengthCode: string;
  readingGoalCode: string;
  genreCodes: string[];
  themeCodes: string[];
  answers: AnswersState;
}

interface ReadingProfileDraft {
  form: ReadingProfileFormState,
  currentStep: number;
}

type WizardQuestion =
  | {
      type: 'FIXED_SINGLE';
      key:
        | 'languageLevelCode'
        | 'preferredLengthCode'
        | 'readingGoalCode';
      title: string;
      category: string;
      options: ReadingProfileOption[];
      required: true;
    }
  | {
      type: 'GENRES';
      title: string;
      category: string;
      required: true;
    }
  | {
      type: 'THEMES';
      title: string;
      category: string;
      required: true;
    }
  | {
      type: 'PROFILE_QUESTION';
      questionCode: string;
      category: string;
    };


// Temp. draft storage for the current browser tab
const SESSION_STORAGE_KEY = 'reading-profile-draft';


// Defines the exact order in which the questions appear in the wizard.

const WIZARD_QUESTIONS: WizardQuestion[] = [
  {
    type: 'PROFILE_QUESTION',
    questionCode: 'FIRST_LANGUAGE',
    category: 'Achtergrond',
  },
  {
    type: 'FIXED_SINGLE',
    key: 'languageLevelCode',
    title: 'Hoe moeilijk mag wat je leest zijn?',
    category: 'Taalniveau',
    options: LANGUAGE_LEVEL_OPTIONS,
    required: true,
  },
  {
    type: 'PROFILE_QUESTION',
    questionCode: 'READING_CONFIDENCE',
    category: 'Leesvertrouwen',
  },
  {
    type: 'PROFILE_QUESTION',
    questionCode: 'READING_ENJOYMENT',
    category: 'Leesplezier',
  },
  {
    type: 'PROFILE_QUESTION',
    questionCode: 'LIKED_BOOKS',
    category: 'Leeservaring',
  },
  {
    type: 'PROFILE_QUESTION',
    questionCode: 'FICTION_OR_TRUE',
    category: 'Voorkeur',
  },
  {
    type: 'GENRES',
    title: 'Welke genres vind je leuk?',
    category: 'Genre',
    required: true,
  },
  {
    type: 'THEMES',
    title: 'Welke onderwerpen vind je interessant?',
    category: 'Onderwerp',
    required: true,
  },
  {
    type: 'PROFILE_QUESTION',
    questionCode: 'DESIRED_EXPERIENCE',
    category: 'Voorkeur',
  },
  {
    type: 'PROFILE_QUESTION',
    questionCode: 'PREFERRED_FORMAT',
    category: 'Vorm',
  },
  {
    type: 'FIXED_SINGLE',
    key: 'preferredLengthCode',
    title: 'Hoe lang mag wat je leest zijn?',
    category: 'Lengte',
    options: LENGTH_OPTIONS,
    required: true,
  },
  {
    type: 'PROFILE_QUESTION',
    questionCode: 'READING_AVOIDANCE',
    category: 'Leesvermijding',
  },
  {
    type: 'PROFILE_QUESTION',
    questionCode: 'CHOICE_HELP',
    category: 'Kiezen',
  },
  {
    type: 'FIXED_SINGLE',
    key: 'readingGoalCode',
    title: 'Waarom wil je lezen?',
    category: 'Leesdoel',
    options: READING_GOAL_OPTIONS,
    required: true,
  },
  {
    type: 'PROFILE_QUESTION',
    questionCode: 'READ_MORE_WHEN',
    category: 'Open vraag',
  },
];

const QUESTION_COUNT = WIZARD_QUESTIONS.length;
const REVIEW_STEP = QUESTION_COUNT;


// Creates an empty form for a student who does not have a profile yet.

function createEmptyForm(): ReadingProfileFormState {
  return {
    languageLevelCode: '',
    preferredLengthCode: '',
    readingGoalCode: '',
    genreCodes: [],
    themeCodes: [],
    answers: {},
  };
}


// Reads undefined profile from sessionStorage.
// Invalid stored data is removed instead of breaking the form.

function getStoredDraft(): ReadingProfileDraft | null {
  const storedDraft = sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!storedDraft) {
    return null;
  }

  try {
    const parsedDraft = JSON.parse(storedDraft) as ReadingProfileDraft;

    if (!parsedDraft.form || typeof parsedDraft.currentStep !== 'number') {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return {
      form: parsedDraft.form,

      // Prevent an invalid stored step from breaking the wizard
      currentStep: Math.min(
        Math.max(parsedDraft.currentStep, 0),
        REVIEW_STEP,
      ),
    };
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}


// Converts the backend response into editable frontend form state.

function profileToForm(
  profile: ReadingProfileResponse,
): ReadingProfileFormState {
  const answers: AnswersState = {};

  for (const answer of profile.answers) {
    answers[answer.questionCode] = {
      stringValue: answer.stringValue ?? undefined,
      stringValues: answer.stringValues,
      numberValue: answer.numberValue ?? undefined,
      textValue: answer.textValue ?? undefined,
    };
  }

  return {
    languageLevelCode: profile.languageLevelCode,
    preferredLengthCode: profile.preferredLengthCode,
    readingGoalCode: profile.readingGoalCode,

    genreCodes: profile.genres.map(
      (genre) => genre.genreCode,
    ),

    themeCodes: profile.themes.map(
      (theme) => theme.themeCode,
    ),

    answers,
  };
}


export default function ReadingProfilePage() {
  const { accessToken } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);

  const [form, setForm] =
    useState<ReadingProfileFormState>(
      createEmptyForm(),
    );


  // Keeps the latest persisted version.

  const [savedForm, setSavedForm] =
    useState<ReadingProfileFormState | null>(null);

  const [
    hasExistingProfile,
    setHasExistingProfile,
  ] = useState(false);

  // Tracks whether unsaved changes need to be stored temporarily.
  const [
    hasDraftChanges,
    setHasDraftChanges,
  ] = useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');


// Loads an existing profile. When 404 shows, it means that the student still needs to create a profile.

  useEffect(() => {
    async function loadProfile() {
      if (!accessToken) {
        setErrorMessage('Je bent niet ingelogd.');
        setIsLoading(false);
        return;
      }

      const storedDraft = getStoredDraft();

      try {
        const profile =
          await getReadingProfile(accessToken);

        const loadedForm =
          profileToForm(profile);

        setSavedForm(loadedForm);
        setHasExistingProfile(true);

        // A temporary draft takes precedence over the saved database version.
        if (storedDraft) {
          setForm(storedDraft.form);
          setCurrentStep(storedDraft.currentStep);
          setHasDraftChanges(true);
        } else {
          setForm(loadedForm);
        }
      } catch (error) {
        if (
          error instanceof ReadingProfileApiError &&
          error.status === 404
        ) {
          setSavedForm(null);
          setHasExistingProfile(false);

          // A new profile can also have an unfinished draft.
          if (storedDraft) {
            setForm(storedDraft.form);
            setCurrentStep(storedDraft.currentStep);
            setHasDraftChanges(true);
          } else {
            setForm(createEmptyForm());
          }
        } else if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            'Het leesprofiel kon niet worden geladen.',
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, [accessToken]);


  // Stores unfinished changes so they survive navigation to another page.
  useEffect(() => {
    if (isLoading || !hasDraftChanges) {
      return;
    }

    const draft: ReadingProfileDraft = {
      form,
      currentStep,
    };

    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(draft),
    );
  }, [
    form,
    currentStep,
    isLoading,
    hasDraftChanges,
  ]);


  function clearMessages() {
    setErrorMessage('');
    setSuccessMessage('');
  }


  // Marks the current form as an unfinished draft.
  function markDraftChanged() {
    setHasDraftChanges(true);
  }


  // Updates one of the three fixed ReadingProfile properties.

  function updateFixedField(
    field:
      | 'languageLevelCode'
      | 'preferredLengthCode'
      | 'readingGoalCode',
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    markDraftChanged();
    clearMessages();
  }


  function toggleGenre(
    genreCode: string,
  ) {
    setForm((current) => ({
      ...current,

      genreCodes:
        current.genreCodes.includes(genreCode)
          ? current.genreCodes.filter(
              (code) => code !== genreCode,
            )
          : [
              ...current.genreCodes,
              genreCode,
            ],
    }));

    markDraftChanged();
    clearMessages();
  }


  function toggleTheme(
    themeCode: string,
  ) {
    setForm((current) => ({
      ...current,

      themeCodes:
        current.themeCodes.includes(themeCode)
          ? current.themeCodes.filter(
              (code) => code !== themeCode,
            )
          : [
              ...current.themeCodes,
              themeCode,
            ],
    }));

    markDraftChanged();
    clearMessages();
  }


  function updateSingleChoice(
    questionCode: string,
    value: string,
  ) {
    setForm((current) => ({
      ...current,

      answers: {
        ...current.answers,

        [questionCode]: {
          stringValue: value,
        },
      },
    }));

    markDraftChanged();
    clearMessages();
  }


  function toggleMultipleChoice(
    questionCode: string,
    value: string,
  ) {
    setForm((current) => {
      const selectedValues =
        current.answers[questionCode]
          ?.stringValues ?? [];

      const newValues =
        selectedValues.includes(value)
          ? selectedValues.filter(
              (selectedValue) =>
                selectedValue !== value,
            )
          : [
              ...selectedValues,
              value,
            ];

      return {
        ...current,

        answers: {
          ...current.answers,

          [questionCode]: {
            stringValues: newValues,
          },
        },
      };
    });

    markDraftChanged();
    clearMessages();
  }


  function updateScale(
    questionCode: string,
    value: number,
  ) {
    setForm((current) => ({
      ...current,

      answers: {
        ...current.answers,

        [questionCode]: {
          numberValue: value,
        },
      },
    }));

    markDraftChanged();
    clearMessages();
  }


  function updateText(
    questionCode: string,
    value: string,
  ) {
    setForm((current) => ({
      ...current,

      answers: {
        ...current.answers,

        [questionCode]: {
          textValue: value,
        },
      },
    }));

    markDraftChanged();
    clearMessages();
  }


  // Finds a flexible question in the shared frontend configuration.

  function findProfileQuestion(
    questionCode: string,
  ) {
    return PROFILE_QUESTIONS.find(
      (question) =>
        question.code === questionCode,
    );
  }


  /**
   * Validates a flexible question before the student can continue.
   * Optional questions may be skipped.
   */

  function validateProfileQuestion(
    question: ReadingProfileQuestion,
  ): string | null {
    if (!question.required) {
      return null;
    }

    const answer =
      form.answers[question.code];

    if (!answer) {
      return `Beantwoord de vraag: "${question.label}"`;
    }

    switch (question.answerType) {
      case 'SINGLE_CHOICE':
        if (!answer.stringValue) {
          return `Beantwoord de vraag: "${question.label}"`;
        }
        break;

      case 'MULTIPLE_CHOICE':
        if (
          !answer.stringValues ||
          answer.stringValues.length === 0
        ) {
          return `Beantwoord de vraag: "${question.label}"`;
        }
        break;

      case 'SCALE':
        if (
          answer.numberValue === undefined
        ) {
          return `Beantwoord de vraag: "${question.label}"`;
        }
        break;

      case 'OPEN_TEXT':
        if (!answer.textValue?.trim()) {
          return `Beantwoord de vraag: "${question.label}"`;
        }
        break;
    }

    return null;
  }


//Validates only the question currently visible on screen.
// All fields need to be filled in (handled by validateCurrentQuestion)

  function validateCurrentQuestion():
    string | null {
    const currentQuestion =
      WIZARD_QUESTIONS[currentStep];

    if (!currentQuestion) {
      return null;
    }

    switch (currentQuestion.type) {
      case 'FIXED_SINGLE':
        if (!form[currentQuestion.key]) {
          return `Beantwoord de vraag: "${currentQuestion.title}"`;
        }
        return null;

      case 'GENRES':
        if (form.genreCodes.length === 0) {
          return 'Kies minimaal één genre.';
        }
        return null;

      case 'THEMES':
        if (form.themeCodes.length === 0) {
          return 'Kies minimaal één onderwerp.';
        }
        return null;

      case 'PROFILE_QUESTION': {
        const question =
          findProfileQuestion(
            currentQuestion.questionCode,
          );

        if (!question) {
          return 'Deze vraag kon niet worden gevonden.';
        }

        return validateProfileQuestion(
          question,
        );
      }
    }
  }


  function handleNext() {
    const validationError =
      validateCurrentQuestion();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    clearMessages();
    markDraftChanged();

    setCurrentStep((step) =>
      Math.min(
        step + 1,
        REVIEW_STEP,
      ),
    );
  }


  function handlePrevious() {
    clearMessages();
    markDraftChanged();

    setCurrentStep((step) =>
      Math.max(step - 1, 0),
    );
  }


// Converts the complete wizard state into the JSON structure expected by PUT /reading-profile.

  function buildPayload():
    SaveReadingProfilePayload {
    const answers: ProfileAnswerPayload[] =
      [];

    for (const question of PROFILE_QUESTIONS) {
      const answer =
        form.answers[question.code];

      if (!answer) {
        continue;
      }

      switch (question.answerType) {
        case 'SINGLE_CHOICE':
          if (answer.stringValue) {
            answers.push({
              questionCode: question.code,
              answerType:
                question.answerType,
              stringValue:
                answer.stringValue,
            });
          }
          break;

        case 'MULTIPLE_CHOICE':
          if (
            answer.stringValues &&
            answer.stringValues.length > 0
          ) {
            answers.push({
              questionCode: question.code,
              answerType:
                question.answerType,
              stringValues:
                answer.stringValues,
            });
          }
          break;

        case 'SCALE':
          if (
            answer.numberValue !== undefined
          ) {
            answers.push({
              questionCode: question.code,
              answerType:
                question.answerType,
              numberValue:
                answer.numberValue,
            });
          }
          break;

        case 'OPEN_TEXT':
          if (answer.textValue?.trim()) {
            answers.push({
              questionCode: question.code,
              answerType:
                question.answerType,
              textValue:
                answer.textValue.trim(),
            });
          }
          break;
      }
    }

    return {
      languageLevelCode:
        form.languageLevelCode,

      preferredLengthCode:
        form.preferredLengthCode,

      readingGoalCode:
        form.readingGoalCode,

      genreCodes:
        form.genreCodes,

      themeCodes:
        form.themeCodes,

      answers,
    };
  }


  /**
   * Saves the profile only after the student confirms the review screen.
   */

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      currentStep !== REVIEW_STEP
    ) {
      return;
    }

    if (!accessToken) {
      setErrorMessage(
        'Je bent niet ingelogd.',
      );
      return;
    }

    setIsSaving(true);
    clearMessages();

    try {
      const savedProfile =
        await saveReadingProfile(
          accessToken,
          buildPayload(),
        );

      const updatedForm =
        profileToForm(savedProfile);

      setForm(updatedForm);
      setSavedForm(updatedForm);
      setHasExistingProfile(true);

      // The profile is now saved permanently, so the temporary draft is no longer needed.
      setHasDraftChanges(false);

      sessionStorage.removeItem(
        SESSION_STORAGE_KEY,
      );

      setSuccessMessage(
        hasExistingProfile
          ? 'Je leesprofiel is bijgewerkt.'
          : 'Je leesprofiel is opgeslagen.',
      );
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          'Het leesprofiel kon niet worden opgeslagen.',
        );
      }
    } finally {
      setIsSaving(false);
    }
  }


// Restores the last saved profile. For a new profile, all unsaved input is cleared.

  function handleCancel() {
    if (savedForm) {
      setForm(savedForm);
    } else {
      setForm(createEmptyForm());
    }

    setCurrentStep(0);

    // Cancel also removes the unfinished profile from the current browser session.
    setHasDraftChanges(false);

    sessionStorage.removeItem(
      SESSION_STORAGE_KEY,
    );

    clearMessages();
  }


  // Returns the readable label belonging to a stored code.

  function getOptionLabel(
    options: ReadingProfileOption[],
    value: string,
  ) {
    return (
      options.find(
        (option) =>
          option.value === value,
      )?.label ?? value
    );
  }


  // Converts a flexible stored answer to readable review text.

  function getAnswerLabel(
    question: ReadingProfileQuestion,
  ) {
    const answer =
      form.answers[question.code];

    if (!answer) {
      return 'Niet ingevuld';
    }

    switch (question.answerType) {
      case 'SINGLE_CHOICE':
        return (
          question.options?.find(
            (option) =>
              option.value ===
              answer.stringValue,
          )?.label ??
          answer.stringValue ??
          'Niet ingevuld'
        );

      case 'MULTIPLE_CHOICE':
        return (
          answer.stringValues
            ?.map(
              (value) =>
                question.options?.find(
                  (option) =>
                    option.value === value,
                )?.label ?? value,
            )
            .join(', ') ||
          'Niet ingevuld'
        );

      case 'SCALE':
        return answer.numberValue !== undefined
          ? `${answer.numberValue} van 5`
          : 'Niet ingevuld';

      case 'OPEN_TEXT':
        return (
          answer.textValue ||
          'Niet ingevuld'
        );
    }
  }


  function renderProfileQuestion(
    question: ReadingProfileQuestion,
  ) {
    const answer =
      form.answers[question.code] ?? {};

    switch (question.answerType) {
      case 'SINGLE_CHOICE':
        return (
          <fieldset className="profile-question">
            <legend>
              {question.label}
              {question.required && ' *'}
            </legend>

            <div className="profile-options">
              {question.options?.map(
                (option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name={question.code}
                      value={option.value}
                      checked={
                        answer.stringValue ===
                        option.value
                      }
                      onChange={() =>
                        updateSingleChoice(
                          question.code,
                          option.value,
                        )
                      }
                    />

                    <span>
                      {option.label}
                    </span>
                  </label>
                ),
              )}
            </div>
          </fieldset>
        );

      case 'MULTIPLE_CHOICE':
        return (
          <fieldset className="profile-question">
            <legend>
              {question.label}
              {question.required && ' *'}
            </legend>

            <p>
              Je kunt meerdere antwoorden
              kiezen.
            </p>

            <div className="profile-options">
              {question.options?.map(
                (option) => (
                  <label key={option.value}>
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={
                        answer.stringValues?.includes(
                          option.value,
                        ) ?? false
                      }
                      onChange={() =>
                        toggleMultipleChoice(
                          question.code,
                          option.value,
                        )
                      }
                    />

                    <span>
                      {option.label}
                    </span>
                  </label>
                ),
              )}
            </div>
          </fieldset>
        );

      case 'SCALE': {
        const minimum =
          question.minValue ?? 1;

        const maximum =
          question.maxValue ?? 5;

        const scaleValues =
          Array.from(
            {
              length:
                maximum - minimum + 1,
            },
            (_, index) =>
              minimum + index,
          );

        return (
          <fieldset className="profile-question">
            <legend>
              {question.label}
              {question.required && ' *'}
            </legend>

            <div className="profile-scale">
              <span>
                Helemaal oneens
              </span>

              {scaleValues.map(
                (value) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name={question.code}
                      value={value}
                      checked={
                        answer.numberValue ===
                        value
                      }
                      onChange={() =>
                        updateScale(
                          question.code,
                          value,
                        )
                      }
                    />

                    <span>{value}</span>
                  </label>
                ),
              )}

              <span>
                Helemaal eens
              </span>
            </div>
          </fieldset>
        );
      }

      case 'OPEN_TEXT':
        return (
          <div className="profile-question">
            <label htmlFor={question.code}>
              {question.label}
              {question.required && ' *'}
            </label>

            <textarea
              id={question.code}
              value={
                answer.textValue ?? ''
              }
              onChange={(event) =>
                updateText(
                  question.code,
                  event.target.value,
                )
              }
              rows={5}
            />
          </div>
        );
    }
  }


  function renderCurrentQuestion() {
    const currentQuestion =
      WIZARD_QUESTIONS[currentStep];

    if (!currentQuestion) {
      return null;
    }

    switch (currentQuestion.type) {
      case 'FIXED_SINGLE':
        return (
          <fieldset className="profile-question">
            <legend>
              {currentQuestion.title} *
            </legend>

            <div className="profile-options">
              {currentQuestion.options.map(
                (option) => (
                  <label
                    key={option.value}
                  >
                    <input
                      type="radio"
                      name={
                        currentQuestion.key
                      }
                      value={option.value}
                      checked={
                        form[
                          currentQuestion.key
                        ] === option.value
                      }
                      onChange={() =>
                        updateFixedField(
                          currentQuestion.key,
                          option.value,
                        )
                      }
                    />

                    <span>
                      {option.label}
                    </span>
                  </label>
                ),
              )}
            </div>
          </fieldset>
        );

      case 'GENRES':
        return (
          <fieldset className="profile-question">
            <legend>
              {currentQuestion.title} *
            </legend>

            <p>
              Je kunt meerdere genres
              kiezen.
            </p>

            <div className="profile-options">
              {GENRE_OPTIONS.map(
                (option) => (
                  <label
                    key={option.value}
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={
                        form.genreCodes.includes(
                          option.value,
                        )
                      }
                      onChange={() =>
                        toggleGenre(
                          option.value,
                        )
                      }
                    />

                    <span>
                      {option.label}
                    </span>
                  </label>
                ),
              )}
            </div>
          </fieldset>
        );

      case 'THEMES':
        return (
          <fieldset className="profile-question">
            <legend>
              {currentQuestion.title} *
            </legend>

            <p>
              Je kunt meerdere onderwerpen
              kiezen.
            </p>

            <div className="profile-options">
              {THEME_OPTIONS.map(
                (option) => (
                  <label
                    key={option.value}
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={
                        form.themeCodes.includes(
                          option.value,
                        )
                      }
                      onChange={() =>
                        toggleTheme(
                          option.value,
                        )
                      }
                    />

                    <span>
                      {option.label}
                    </span>
                  </label>
                ),
              )}
            </div>
          </fieldset>
        );

      case 'PROFILE_QUESTION': {
        const question =
          findProfileQuestion(
            currentQuestion.questionCode,
          );

        if (!question) {
          return (
            <p role="alert">
              Deze profielvraag kon niet
              worden geladen.
            </p>
          );
        }

        return renderProfileQuestion(
          question,
        );
      }
    }
  }


  if (isLoading) {
    return (
      <main>
        <p>Leesprofiel laden...</p>
      </main>
    );
  }

  const currentQuestion =
    WIZARD_QUESTIONS[currentStep];

  return (
    <main className="reading-profile-page">
      <header className="profile-page-header">
        <h1>
          {hasExistingProfile
            ? 'Mijn leesprofiel'
            : 'Maak je leesprofiel'}
        </h1>

        <p>
          Beantwoord de vragen stap voor
          stap. Je antwoorden blijven
          bewaard wanneer je teruggaat naar
          een eerdere vraag.
        </p>
      </header>

      {errorMessage && (
        <p
          className="profile-error"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p
          className="profile-success"
          role="status"
        >
          {successMessage}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {currentStep < REVIEW_STEP && (
          <section className="profile-wizard-card">
            <header className="profile-question-header">
              <p className="profile-step-number">
                Vraag {currentStep + 1} van{' '}
                {QUESTION_COUNT}
              </p>

              <div
                className="profile-progress-track"
                aria-hidden="true"
              >
                <div
                  className="profile-progress-value"
                  style={{
                    width: `${
                      ((currentStep + 1) /
                        QUESTION_COUNT) *
                      100
                    }%`,
                  }}
                />
              </div>

              <p className="profile-category">
                {currentQuestion?.category}
              </p>
            </header>

            <div className="profile-question-content">
              {renderCurrentQuestion()}
            </div>

            <footer className="profile-navigation">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Vorige
              </button>

              <button
                type="button"
                onClick={handleNext}
              >
                {currentStep ===
                QUESTION_COUNT - 1
                  ? 'Profiel controleren'
                  : 'Volgende'}
              </button>
            </footer>
          </section>
        )}

        {currentStep === REVIEW_STEP && (
          <section className="profile-review">
            <header>
              <h2>
                Controleer je leesprofiel
              </h2>

              <p>
                Controleer je antwoorden
                voordat je het profiel
                opslaat.
              </p>
            </header>

            <dl className="profile-summary">
              <div>
                <dt>Eerste taal</dt>
                <dd>
                  {getAnswerLabel(
                    findProfileQuestion(
                      'FIRST_LANGUAGE',
                    )!,
                  )}
                </dd>
              </div>

              <div>
                <dt>Taalniveau</dt>
                <dd>
                  {getOptionLabel(
                    LANGUAGE_LEVEL_OPTIONS,
                    form.languageLevelCode,
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Ik begrijp teksten goed
                </dt>
                <dd>
                  {getAnswerLabel(
                    findProfileQuestion(
                      'READING_CONFIDENCE',
                    )!,
                  )}
                </dd>
              </div>

              <div>
                <dt>Ik vind lezen leuk</dt>
                <dd>
                  {getAnswerLabel(
                    findProfileQuestion(
                      'READING_ENJOYMENT',
                    )!,
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Leuk gevonden boeken
                </dt>
                <dd>
                  {getAnswerLabel(
                    findProfileQuestion(
                      'LIKED_BOOKS',
                    )!,
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Fictie of waargebeurd
                </dt>
                <dd>
                  {getAnswerLabel(
                    findProfileQuestion(
                      'FICTION_OR_TRUE',
                    )!,
                  )}
                </dd>
              </div>

              <div>
                <dt>Genres</dt>
                <dd>
                  {form.genreCodes
                    .map((value) =>
                      getOptionLabel(
                        GENRE_OPTIONS,
                        value,
                      ),
                    )
                    .join(', ')}
                </dd>
              </div>

              <div>
                <dt>Onderwerpen</dt>
                <dd>
                  {form.themeCodes
                    .map((value) =>
                      getOptionLabel(
                        THEME_OPTIONS,
                        value,
                      ),
                    )
                    .join(', ')}
                </dd>
              </div>

              <div>
                <dt>
                  Wat wil je ervaren?
                </dt>
                <dd>
                  {getAnswerLabel(
                    findProfileQuestion(
                      'DESIRED_EXPERIENCE',
                    )!,
                  )}
                </dd>
              </div>

              <div>
                <dt>Leesvorm</dt>
                <dd>
                  {getAnswerLabel(
                    findProfileQuestion(
                      'PREFERRED_FORMAT',
                    )!,
                  )}
                </dd>
              </div>

              <div>
                <dt>Lengte</dt>
                <dd>
                  {getOptionLabel(
                    LENGTH_OPTIONS,
                    form.preferredLengthCode,
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Ik lees alleen als het moet
                </dt>
                <dd>
                  {getAnswerLabel(
                    findProfileQuestion(
                      'READING_AVOIDANCE',
                    )!,
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Hulp bij kiezen
                </dt>
                <dd>
                  {getAnswerLabel(
                    findProfileQuestion(
                      'CHOICE_HELP',
                    )!,
                  )}
                </dd>
              </div>

              <div>
                <dt>Leesdoel</dt>
                <dd>
                  {getOptionLabel(
                    READING_GOAL_OPTIONS,
                    form.readingGoalCode,
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Wanneer zou je meer lezen?
                </dt>
                <dd>
                  {getAnswerLabel(
                    findProfileQuestion(
                      'READ_MORE_WHEN',
                    )!,
                  )}
                </dd>
              </div>
            </dl>

            <div className="profile-review-actions">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(0);
                  markDraftChanged();
                  clearMessages();
                }}
                disabled={isSaving}
              >
                Wijzigen
              </button>

              <button
                type="submit"
                disabled={isSaving}
              >
                {isSaving
                  ? 'Opslaan...'
                  : hasExistingProfile
                    ? 'Wijzigingen opslaan'
                    : 'Profiel opslaan'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Annuleren
              </button>
            </div>
          </section>
        )}
      </form>
    </main>
  );
}