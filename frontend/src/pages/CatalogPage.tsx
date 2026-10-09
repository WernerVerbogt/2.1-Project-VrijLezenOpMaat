/**
 * Displays the catalog page with all available books.
 * The student can browse, filter, paginate and add books
 * to the personal reading list.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { getBooks, getBookThemes } from '../services/booksApi';
import { addReadingListItem, getReadingList, ReadingListApiError } from '../services/readingListService';

import BookCard from '../components/books/BookCard';
import type { Book } from '../types/book';

import './css/CatalogPage.css';
import Button from '../components/ui/Button';

const PAGE_SIZE = 12;
const SKELETON_BOOK_COUNT = 6;

export default function CatalogPage() {
    const { accessToken } = useAuth();

    const [books, setBooks] = useState<Book[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [totalPages, setTotalPages] = useState(0);

    // Values currently selected inside the filter form.
    const [level, setLevel] = useState('');
    const [theme, setTheme] = useState('');
    const [length, setLength] = useState('');

    // Values actually applied to the catalog request.
    const [appliedLevel, setAppliedLevel] = useState('');
    const [appliedTheme, setAppliedTheme] = useState('');
    const [appliedLength, setAppliedLength] = useState('');
    const [availableThemes, setAvailableThemes] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stores books that are already part of the student's reading list.
    const [ readingListBookIds, setReadingListBookIds] = useState<string[]>([]);

    // Stores books that currently have an add request running.
    const [addingBookIds, setAddingBookIds] = useState<string[]>([]);
    const [readingListError, setReadingListError] = useState<string | null>(null);

    // Controls the filter panel on smaller screens.
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Loads all themes that are available in the catalog.
    useEffect(() => {
        async function loadThemes() {
            try {
                const themes =
                    await getBookThemes();

                setAvailableThemes(themes);
            } catch {
                setError(
                    'Themafilters konden niet worden geladen.',
                );
            }
        }

        void loadThemes();
    }, []);

    // Loads the student's current reading list once.
    useEffect(() => {
        if (!accessToken) {
            return;
        }

        const token = accessToken;
        let cancelled = false;

        async function loadReadingList() {
            try {
                const items =
                    await getReadingList(token);

                if (!cancelled) {
                    setReadingListBookIds(
                        items.map(
                            (item) => item.id,
                        ),
                    );
                }
            } catch {
                // The catalog can still be used if reading-list status fails to load.
            }
        }

        void loadReadingList();

        return () => {
            cancelled = true;
        };
    }, [accessToken]);

    // Reloads books when pagination or applied filters change.
    useEffect(() => {
        async function loadBooks() {
            setIsLoading(true);
            setError(null);

            try {
                const data =
                    await getBooks({
                        page,
                        limit: PAGE_SIZE,
                        level: appliedLevel,
                        theme: appliedTheme,
                        length: appliedLength,
                    });

                setBooks(data.items);
                setTotal(data.total);
                setTotalPages(
                    data.totalPages,
                );
            } catch {
                setError(
                    'Boekenlijst kon niet worden geladen.',
                );
            } finally {
                setIsLoading(false);
            }
        }

        void loadBooks();
    }, [
        page,
        appliedLevel,
        appliedTheme,
        appliedLength,
    ]);

    // Adds one catalog book to the student's personal reading list.
    async function handleAddToReadingList(
        bookId: string,
    ) {
        if (!accessToken) {
            setReadingListError(
                'Je bent niet ingelogd.',
            );
            return;
        }

        // Prevent an unnecessary second request.
        if (
            readingListBookIds.includes(
                bookId,
            ) ||
            addingBookIds.includes(bookId)
        ) {
            return;
        }

        setReadingListError(null);

        setAddingBookIds((current) => [
            ...current,
            bookId,
        ]);

        try {
            await addReadingListItem(
                accessToken,
                {
                    bookId,
                },
            );

            setReadingListBookIds(
                (current) =>
                    current.includes(bookId)
                        ? current
                        : [
                            ...current,
                            bookId,
                        ],
            );
        } catch (error) {

            // A conflict means that the book already exists on the reading list.
            if (
                error instanceof
                    ReadingListApiError &&
                error.status === 409
            ) {
                setReadingListBookIds(
                    (current) =>
                        current.includes(bookId)
                            ? current
                            : [
                                ...current,
                                bookId,
                            ],
                );

                return;
            }

            setReadingListError(
                error instanceof Error
                    ? error.message
                    : 'Het boek kon niet aan je leeslijst worden toegevoegd.',
            );
        } finally {
            setAddingBookIds((current) =>
                current.filter(
                    (id) => id !== bookId,
                ),
            );
        }
    }

    // Applies all selected filters at once.
    function applyFilters(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setAppliedLevel(level);
        setAppliedTheme(theme);
        setAppliedLength(length);

        setPage(1);
        setShowMobileFilters(false);
    }

    // Clears both the selected and applied filters.
    function resetFilters() {
        setLevel('');
        setTheme('');
        setLength('');

        setAppliedLevel('');
        setAppliedTheme('');
        setAppliedLength('');

        setPage(1);
    }

    return (
        <main className="catalog-page">
            <header className="catalog-page-header">
                <h1>Catalogus</h1>

                <p>
                    Blader door de catalogus of
                    gebruik de filters om gericht
                    leesmateriaal te vinden.
                </p>
            </header>

            <button
                type="button"
                className="catalog-mobile-filter-button"
                aria-expanded={
                    showMobileFilters
                }
                onClick={() =>
                    setShowMobileFilters(
                        (current) =>
                            !current,
                    )
                }
            >
                {showMobileFilters
                    ? 'Filters verbergen'
                    : 'Filters tonen'}
            </button>

            <div className="catalog-layout">
                <aside
                    className={
                        `catalog-filter-panel ${
                            showMobileFilters
                                ? 'catalog-filter-panel--open'
                                : ''
                        }`
                    }
                    aria-labelledby="catalog-filter-heading"
                >
                    <h2 id="catalog-filter-heading">
                        Filters
                    </h2>

                    <form
                        className="catalog-filter-form"
                        onSubmit={applyFilters}
                    >
                        <div className="catalog-filter-group">
                            <label htmlFor="level-filter">
                                Taalniveau
                            </label>

                            <select
                                id="level-filter"
                                value={level}
                                onChange={(
                                    event,
                                ) =>
                                    setLevel(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            >
                                <option value="">
                                    Alle niveaus
                                </option>

                                <option value="1F">
                                    1F
                                </option>

                                <option value="2F">
                                    2F
                                </option>

                                <option value="3F">
                                    3F
                                </option>
                            </select>
                        </div>

                        <div className="catalog-filter-group">
                            <label htmlFor="theme-filter">
                                Thema
                            </label>

                            <select
                                id="theme-filter"
                                value={theme}
                                onChange={(
                                    event,
                                ) =>
                                    setTheme(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            >
                                <option value="">
                                    Alle thema's
                                </option>

                                {availableThemes.map(
                                    (
                                        availableTheme,
                                    ) => (
                                        <option
                                            key={
                                                availableTheme
                                            }
                                            value={
                                                availableTheme
                                            }
                                        >
                                            {
                                                availableTheme
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <div className="catalog-filter-group">
                            <label htmlFor="length-filter">
                                Lengte
                            </label>

                            <select
                                id="length-filter"
                                value={length}
                                onChange={(
                                    event,
                                ) =>
                                    setLength(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            >
                                <option value="">
                                    Alle lengtes
                                </option>

                                <option value="SHORT">
                                    Kort
                                </option>

                                <option value="MEDIUM">
                                    Gemiddeld
                                </option>

                                <option value="LONG">
                                    Lang
                                </option>
                            </select>
                        </div>

                        <div className="catalog-filter-actions">
                            <Button type="submit">
                                Filters toepassen
                            </Button>

                            <Button
                                type="button"
                                variant='secondary'
                                onClick={resetFilters}
                            >
                                Reset filters
                            </Button>
                        </div>
                    </form>
                </aside>

                <section className="catalog-content">
                    <div className="catalog-results-header">
                        <div>
                            <h2>
                                {isLoading
                                    ? 'Catalogus laden...'
                                    : `${total} ${
                                        total === 1
                                            ? 'boek gevonden'
                                            : 'boeken gevonden'
                                    }`}
                            </h2>

                            {!isLoading &&
                                !error &&
                                totalPages >
                                    0 && (
                                    <p>
                                        Pagina{' '}
                                        {page}{' '}
                                        van{' '}
                                        {
                                            totalPages
                                        }
                                    </p>
                                )}
                        </div>
                    </div>

                    {readingListError && (
                        <div
                            className="catalog-status catalog-error"
                            role="alert"
                        >
                            {
                                readingListError
                            }
                        </div>
                    )}

                    {error && (
                        <div
                            className="catalog-status catalog-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {isLoading && (
                        <section
                            className="catalog-grid"
                            aria-label="Boeken worden geladen"
                            aria-busy="true"
                        >
                            {Array.from(
                                {
                                    length: SKELETON_BOOK_COUNT,
                                },
                                (_, index) => (
                                    <article
                                        key={index}
                                        className="catalog-skeleton-card"
                                        aria-hidden="true"
                                    >
                                        <div className="catalog-skeleton-cover" />

                                        <div className="catalog-skeleton-body">
                                            <div className="catalog-skeleton-line catalog-skeleton-title" />

                                            <div className="catalog-skeleton-line catalog-skeleton-author" />

                                            <div className="catalog-skeleton-badges">
                                                <div className="catalog-skeleton-badge" />
                                                <div className="catalog-skeleton-badge" />
                                            </div>

                                            <div className="catalog-skeleton-description">
                                                <div className="catalog-skeleton-line" />
                                                <div className="catalog-skeleton-line" />
                                                <div className="catalog-skeleton-line catalog-skeleton-line-short" />
                                            </div>

                                            <div className="catalog-skeleton-themes">
                                                <div className="catalog-skeleton-theme" />
                                                <div className="catalog-skeleton-theme" />
                                            </div>

                                            <div className="catalog-skeleton-button" />
                                        </div>
                                    </article>
                                ),
                            )}
                        </section>
                    )}

                    {!isLoading &&
                        !error &&
                        books.length === 0 && (
                            <div className="catalog-status">
                                <h3>
                                    Geen boeken
                                    gevonden
                                </h3>

                                <p>
                                    Pas één of
                                    meerdere
                                    filters aan en
                                    probeer
                                    opnieuw.
                                </p>
                            </div>
                        )}

                    {!isLoading &&
                        !error &&
                        books.length >
                            0 && (
                            <>
                                <div className="catalog-grid">
                                    {books.map(
                                        (
                                            book,
                                        ) => (
                                            <BookCard
                                                key={
                                                    book.id
                                                }
                                                book={
                                                    book
                                                }
                                                onAdd={
                                                    handleAddToReadingList
                                                }
                                                addLabel="Toevoegen aan leeslijst"
                                                isAdding={addingBookIds.includes(
                                                    book.id,
                                                )}
                                                isAdded={readingListBookIds.includes(
                                                    book.id,
                                                )}
                                            />
                                        ),
                                    )}
                                </div>

                                <nav
                                    className="catalog-pagination"
                                    aria-label="Cataloguspaginering"
                                >
                                    <button
                                        type="button"
                                        disabled={
                                            page <=
                                            1
                                        }
                                        onClick={() =>
                                            setPage(
                                                (
                                                    currentPage,
                                                ) =>
                                                    currentPage -
                                                    1,
                                            )
                                        }
                                    >
                                        Vorige
                                    </button>

                                    <span className="catalog-current-page">
                                        {page}
                                    </span>

                                    <span>
                                        van{' '}
                                        {
                                            totalPages
                                        }
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            page >=
                                            totalPages
                                        }
                                        onClick={() =>
                                            setPage(
                                                (
                                                    currentPage,
                                                ) =>
                                                    currentPage +
                                                    1,
                                            )
                                        }
                                    >
                                        Volgende
                                    </button>
                                </nav>
                            </>
                        )}
                </section>
            </div>
        </main>
    );
}