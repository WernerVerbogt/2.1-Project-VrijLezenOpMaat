/**
 * Displays profile and reading-list information for one linked student.
 * The teacher can also add catalog books to the student's reading list.
 * Access to the student is validated by the backend.
 */

import {
    useEffect,
    useState,
} from 'react';

import {
    useNavigate,
    useParams,
} from 'react-router-dom';

import { useAuth } from '../context/useAuth';

import Button from '../components/ui/Button';
import BookCard from '../components/books/BookCard';

import {
    addBookToLinkedStudentReadingList,
    getLinkedStudentDetails,
} from '../services/teacherStudentLinkService';

import {
    getBooks,
} from '../services/booksApi';

import type {
    LinkedStudentDetails,
} from '../types/teacherStudentLink';

import type {
    Book,
} from '../types/book';

import './css/TeacherStudentDetailPage.css';

const CATALOG_PAGE_SIZE = 12;

// Converts internal length codes to readable Dutch labels.
function formatLength(
    length: string,
): string {
    const labels: Record<string, string> = {
        SHORT: 'Kort',
        MEDIUM: 'Gemiddeld',
        LONG: 'Lang',
    };

    return labels[length] ?? length;
}

export default function TeacherStudentDetailPage() {
    const { accessToken } = useAuth();
    const { studentId } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] =
        useState<LinkedStudentDetails | null>(
            null,
        );

    const [isLoading, setIsLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState('');

    const [successMessage, setSuccessMessage] =
        useState('');

    // Catalog state.
    const [catalogBooks, setCatalogBooks] =
        useState<Book[]>([]);

    const [catalogPage, setCatalogPage] =
        useState(1);

    const [
        catalogTotalPages,
        setCatalogTotalPages,
    ] = useState(0);

    const [
        isCatalogLoading,
        setIsCatalogLoading,
    ] = useState(true);

    const [
        addingBookId,
        setAddingBookId,
    ] = useState<string | null>(null);

    // Loads the selected linked student.
    useEffect(() => {
        async function loadStudent() {
            if (!accessToken) {
                setErrorMessage(
                    'Je bent niet ingelogd.',
                );
                setIsLoading(false);
                return;
            }

            if (!studentId) {
                setErrorMessage(
                    'Geen student geselecteerd.',
                );
                setIsLoading(false);
                return;
            }

            try {
                const result =
                    await getLinkedStudentDetails(
                        accessToken,
                        studentId,
                    );

                setStudent(result);
            } catch (error) {
                if (error instanceof Error) {
                    setErrorMessage(
                        error.message,
                    );
                } else {
                    setErrorMessage(
                        'De studentgegevens konden niet worden geladen.',
                    );
                }
            } finally {
                setIsLoading(false);
            }
        }

        void loadStudent();
    }, [
        accessToken,
        studentId,
    ]);

    // Loads catalog books that the teacher can add to the student.
    useEffect(() => {
        async function loadCatalogBooks() {
            try {
                setIsCatalogLoading(true);

                const data = await getBooks({
                    page: catalogPage,
                    limit: CATALOG_PAGE_SIZE,
                    level: '',
                    theme: '',
                    length: '',
                });

                setCatalogBooks(data.items);
                setCatalogTotalPages(
                    data.totalPages,
                );
            } catch {
                setErrorMessage(
                    'De catalogus kon niet worden geladen.',
                );
            } finally {
                setIsCatalogLoading(false);
            }
        }

        void loadCatalogBooks();
    }, [catalogPage]);

    // Adds a catalog book to the linked student's reading list.
    async function handleAddBook(
        bookId: string,
    ) {
        if (
            !accessToken ||
            !studentId ||
            !student
        ) {
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');
        setAddingBookId(bookId);

        try {
            const addedBook =
                await addBookToLinkedStudentReadingList(
                    accessToken,
                    studentId,
                    bookId,
                );

            // Update the visible reading list without reloading the page.
            setStudent((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    readingList: [
                        ...current.readingList,
                        addedBook,
                    ],
                };
            });

            setSuccessMessage(
                'Het boek is aan de leeslijst toegevoegd.',
            );
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(
                    error.message,
                );
            } else {
                setErrorMessage(
                    'Het boek kon niet worden toegevoegd.',
                );
            }
        } finally {
            setAddingBookId(null);
        }
    }

    if (isLoading) {
        return (
            <main
                className="teacher-student-detail-page"
                aria-label="Studentgegevens worden geladen"
                aria-busy="true"
            >
                <div
                    className="teacher-detail-skeleton"
                    aria-hidden="true"
                >
                    <div className="teacher-skeleton teacher-detail-skeleton__back" />

                    <header className="teacher-student-detail-header">
                        <div className="teacher-skeleton teacher-detail-skeleton__name" />
                        <div className="teacher-skeleton teacher-detail-skeleton__email" />
                    </header>

                    <section className="teacher-student-section">
                        <div className="teacher-skeleton teacher-detail-skeleton__heading" />

                        <div className="teacher-detail-skeleton__details">
                            <div className="teacher-skeleton teacher-detail-skeleton__detail" />
                            <div className="teacher-skeleton teacher-detail-skeleton__detail" />
                            <div className="teacher-skeleton teacher-detail-skeleton__detail" />
                        </div>
                    </section>

                    <section className="teacher-student-section">
                        <div className="teacher-skeleton teacher-detail-skeleton__heading" />

                        <div className="teacher-detail-skeleton__books">
                            <div className="teacher-skeleton teacher-detail-skeleton__book" />
                            <div className="teacher-skeleton teacher-detail-skeleton__book" />
                        </div>
                    </section>
                </div>
            </main>
        );
    }

    if (!student) {
        return (
            <main className="teacher-student-detail-page">
                {errorMessage && (
                    <p
                        className="teacher-student-detail-error"
                        role="alert"
                    >
                        {errorMessage}
                    </p>
                )}

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                        navigate(
                            '/teacher/students',
                        )
                    }
                >
                    Terug naar studenten
                </Button>
            </main>
        );
    }

    return (
        <main className="teacher-student-detail-page">
            <div className="teacher-student-detail-back">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                        navigate(
                            '/teacher/students',
                        )
                    }
                >
                    Terug naar studenten
                </Button>
            </div>

            <header className="teacher-student-detail-header">
                <h1>
                    {student.firstName}{' '}
                    {student.lastName}
                </h1>

                <p>{student.email}</p>
            </header>

            {errorMessage && (
                <p
                    className="teacher-student-detail-error"
                    role="alert"
                >
                    {errorMessage}
                </p>
            )}

            {successMessage && (
                <p
                    className="teacher-student-detail-success"
                    role="status"
                >
                    {successMessage}
                </p>
            )}

            <section className="teacher-student-section">
                <h2>Leesprofiel</h2>

                {!student.readingProfile ? (
                    <p>
                        Deze student heeft nog geen
                        leesprofiel ingevuld.
                    </p>
                ) : (
                    <>
                        <dl className="teacher-student-profile-details">
                            <div>
                                <dt>
                                    Leesniveau
                                </dt>

                                <dd>
                                    {
                                        student
                                            .readingProfile
                                            .languageLevelCode
                                    }
                                </dd>
                            </div>

                            <div>
                                <dt>
                                    Voorkeurslengte
                                </dt>

                                <dd>
                                    {formatLength(
                                        student
                                            .readingProfile
                                            .preferredLengthCode,
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt>
                                    Leesdoel
                                </dt>

                                <dd>
                                    {
                                        student
                                            .readingProfile
                                            .readingGoalCode
                                    }
                                </dd>
                            </div>
                        </dl>

                        {student.readingProfile
                            .themes.length > 0 && (
                            <div className="teacher-student-profile-list">
                                <h3>
                                    Thema's
                                </h3>

                                <ul>
                                    {student.readingProfile
                                        .themes.map(
                                            (theme) => (
                                                <li
                                                    key={
                                                        theme.themeCode
                                                    }
                                                >
                                                    {
                                                        theme.themeCode
                                                    }
                                                </li>
                                            ),
                                        )}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </section>

            <section className="teacher-student-section">
                <h2>Leeslijst</h2>

                {student.readingList.length ===
                0 ? (
                    <p>
                        Deze student heeft nog geen
                        boeken op de leeslijst.
                    </p>
                ) : (
                    <div className="teacher-student-reading-list">
                        {student.readingList.map(
                            (book) => (
                                <article
                                    key={book.id}
                                    className="teacher-student-book-card"
                                >
                                    <div>
                                        <h3>
                                            {
                                                book.title
                                            }
                                        </h3>

                                        {book.author && (
                                            <p>
                                                {
                                                    book.author
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <dl className="teacher-student-book-details">
                                        <div>
                                            <dt>
                                                Niveau
                                            </dt>
                                            <dd>
                                                {
                                                    book.level
                                                }
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Lengte
                                            </dt>
                                            <dd>
                                                {formatLength(
                                                    book.length,
                                                )}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Status
                                            </dt>
                                            <dd>
                                                {book.isRead
                                                    ? 'Gelezen'
                                                    : 'Niet gelezen'}
                                            </dd>
                                        </div>
                                    </dl>
                                </article>
                            ),
                        )}
                    </div>
                )}
            </section>

            <section className="teacher-student-section">
                <h2>Boek toevoegen</h2>

                <p>
                    Kies een boek uit de catalogus
                    om het aan de leeslijst van
                    deze student toe te voegen.
                </p>

            {isCatalogLoading ? (
                <div
                    className="teacher-student-catalog"
                    aria-label="Catalogus wordt geladen"
                    aria-busy="true"
                >
                    {Array.from(
                        { length: 6 },
                        (_, index) => (
                            <article
                                key={index}
                                className="teacher-catalog-skeleton"
                                aria-hidden="true"
                            >
                                <div className="teacher-skeleton teacher-catalog-skeleton__title" />
                                <div className="teacher-skeleton teacher-catalog-skeleton__author" />

                                <div className="teacher-catalog-skeleton__lines">
                                    <div className="teacher-skeleton teacher-catalog-skeleton__line" />
                                    <div className="teacher-skeleton teacher-catalog-skeleton__line" />
                                    <div className="teacher-skeleton teacher-catalog-skeleton__line--short" />
                                </div>

                                <div className="teacher-skeleton teacher-catalog-skeleton__button" />
                            </article>
                        ),
                    )}
                </div>
                ) : (
                    <>
                        <div className="teacher-student-catalog">
                            {catalogBooks.map(
                                (book) => {
                                    const isAlreadyAdded =
                                        student.readingList.some(
                                            (
                                                readingListItem,
                                            ) =>
                                                readingListItem.id ===
                                                book.id,
                                        );

                                    return (
                                        <BookCard
                                            key={
                                                book.id
                                            }
                                            book={
                                                book
                                            }
                                            onAdd={() =>
                                                void handleAddBook(
                                                    book.id,
                                                )
                                            }
                                            addLabel="Toevoegen aan student"
                                            isAdding={
                                                addingBookId ===
                                                book.id
                                            }
                                            isAdded={
                                                isAlreadyAdded
                                            }
                                        />
                                    );
                                },
                            )}
                        </div>

                        {catalogTotalPages >
                            1 && (
                            <nav
                                className="teacher-student-catalog-pagination"
                                aria-label="Cataloguspaginering"
                            >
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={
                                        catalogPage <=
                                        1
                                    }
                                    onClick={() =>
                                        setCatalogPage(
                                            (
                                                current,
                                            ) =>
                                                current -
                                                1,
                                        )
                                    }
                                >
                                    Vorige
                                </Button>

                                <span>
                                    Pagina{' '}
                                    {catalogPage}{' '}
                                    van{' '}
                                    {
                                        catalogTotalPages
                                    }
                                </span>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={
                                        catalogPage >=
                                        catalogTotalPages
                                    }
                                    onClick={() =>
                                        setCatalogPage(
                                            (
                                                current,
                                            ) =>
                                                current +
                                                1,
                                        )
                                    }
                                >
                                    Volgende
                                </Button>
                            </nav>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}