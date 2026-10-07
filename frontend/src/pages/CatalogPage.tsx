/** 
 * Displays catalog page with all the books available.
 * The user can browse, filter and navigate through paginated book results.
 */

import { useEffect, useState } from 'react';

import BookCard from '../components/books/BookCard';
import { getBooks, getBookThemes } from '../services/booksApi';
import type { Book } from '../types/book';

import './css/CatalogPage.css';

const PAGE_SIZE = 12;

export default function CatalogPage() {
    const [books, setBooks] = useState<Book[]>([]);

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Values currently selected inside the filter form.
    const [level, setLevel] = useState('');
    const [theme, setTheme] = useState('');
    const [length, setLength] = useState('');

    // Values that are actually applied to the catalog request.
    const [appliedLevel, setAppliedLevel] = useState('');
    const [appliedTheme, setAppliedTheme] = useState('');
    const [appliedLength, setAppliedLength] = useState('');
    const [availableThemes, setAvailableThemes] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Controls the filter panel on smaller screens.
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Loads all themes that are available in the catalog.
    useEffect(() => {
        async function loadThemes() {
            try {
                const themes = await getBookThemes();
                setAvailableThemes(themes);
            } catch {
                setError('Themafilters konden niet worden geladen.');
            }
        }

        loadThemes();
    }, []);

    // Reloads books when pagination or applied filters change.
    useEffect(() => {
        async function loadBooks() {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getBooks({
                    page,
                    limit: PAGE_SIZE,
                    level: appliedLevel,
                    theme: appliedTheme,
                    length: appliedLength,
                });

                setBooks(data.items);
                setTotal(data.total);
                setTotalPages(data.totalPages);
            } catch {
                setError('Boekenlijst kon niet worden geladen.');
            } finally {
                setIsLoading(false);
            }
        }

        loadBooks();
    }, [
        page,
        appliedLevel,
        appliedTheme,
        appliedLength,
    ]);

    // Applies all selected filters at once.
    function applyFilters(event: React.FormEvent<HTMLFormElement>) {
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
                    Blader door de catalogus of gebruik de filters om
                    gericht leesmateriaal te vinden.
                </p>
            </header>

            <button
                type="button"
                className="catalog-mobile-filter-button"
                aria-expanded={showMobileFilters}
                onClick={() =>
                    setShowMobileFilters((current) => !current)
                }
            >
                {showMobileFilters
                    ? 'Filters verbergen'
                    : 'Filters tonen'}
            </button>

            <div className="catalog-layout">
                <aside
                    className={`catalog-filter-panel ${
                        showMobileFilters
                            ? 'catalog-filter-panel--open'
                            : ''
                    }`}
                    aria-labelledby="catalog-filter-heading"
                >
                    <h2 id="catalog-filter-heading">Filters</h2>

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
                                onChange={(event) =>
                                    setLevel(event.target.value)
                                }
                            >
                                <option value="">Alle niveaus</option>
                                <option value="1F">1F</option>
                                <option value="2F">2F</option>
                                <option value="3F">3F</option>
                            </select>
                        </div>

                        <div className="catalog-filter-group">
                            <label htmlFor="theme-filter">
                                Thema
                            </label>

                            <select
                                id="theme-filter"
                                value={theme}
                                onChange={(event) =>
                                    setTheme(event.target.value)
                                }
                            >
                                <option value="">Alle thema's</option>

                                {availableThemes.map(
                                    (availableTheme) => (
                                        <option
                                            key={availableTheme}
                                            value={availableTheme}
                                        >
                                            {availableTheme}
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
                                onChange={(event) =>
                                    setLength(event.target.value)
                                }
                            >
                                <option value="">Alle lengtes</option>
                                <option value="SHORT">Kort</option>
                                <option value="MEDIUM">
                                    Gemiddeld
                                </option>
                                <option value="LONG">Lang</option>
                            </select>
                        </div>

                        <div className="catalog-filter-actions">
                            <button
                                type="submit"
                                className="catalog-button catalog-button-primary"
                            >
                                Filters toepassen
                            </button>

                            <button
                                type="button"
                                className="catalog-button catalog-button-secondary"
                                onClick={resetFilters}
                            >
                                Reset filters
                            </button>
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
                                totalPages > 0 && (
                                    <p>
                                        Pagina {page} van {totalPages}
                                    </p>
                                )}
                        </div>
                    </div>

                    {error && (
                        <div
                            className="catalog-status catalog-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {isLoading && (
                        <div className="catalog-status">
                            Boekenlijst wordt geladen...
                        </div>
                    )}

                    {!isLoading &&
                        !error &&
                        books.length === 0 && (
                            <div className="catalog-status">
                                <h3>Geen boeken gevonden</h3>

                                <p>
                                    Pas één of meerdere filters aan en
                                    probeer opnieuw.
                                </p>
                            </div>
                        )}

                    {!isLoading &&
                        !error &&
                        books.length > 0 && (
                            <>
                                <div className="catalog-grid">
                                    {books.map((book) => (
                                        <BookCard
                                            key={book.id}
                                            book={book}
                                        />
                                    ))}
                                </div>

                                <nav
                                    className="catalog-pagination"
                                    aria-label="Cataloguspaginering"
                                >
                                    <button
                                        type="button"
                                        disabled={page <= 1}
                                        onClick={() =>
                                            setPage(
                                                (currentPage) =>
                                                    currentPage - 1,
                                            )
                                        }
                                    >
                                        Vorige
                                    </button>

                                    <span className="catalog-current-page">
                                        {page}
                                    </span>

                                    <span>
                                        van {totalPages}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            page >= totalPages
                                        }
                                        onClick={() =>
                                            setPage(
                                                (currentPage) =>
                                                    currentPage + 1,
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