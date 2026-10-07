/**
 * Represents one book card shown in the catalog.
 * An optional add action can be used to add the book to a reading list.
 */

import type { Book } from '../../types/book';

import '../../pages/css/BookCard.css';
import Button from '../ui/Button';

interface BookCardProps {
    book: Book;
    onAdd?: (bookId: string) => void;
    addLabel?: string;
    isAdding?: boolean;
    isAdded?: boolean;
}

// Converts internal length codes to readable Dutch labels.
function formatLength(length: string): string {
    const labels: Record<string, string> = {
        SHORT: 'Kort',
        MEDIUM: 'Gemiddeld',
        LONG: 'Lang',
    };

    return labels[length] ?? length;
}

export default function BookCard({
    book,
    onAdd,
    addLabel = 'Toevoegen',
    isAdding = false,
    isAdded = false,
}: BookCardProps) {
    return (
        <article className="book-card">
            <div className="book-card-placeholder">
                <span>Boek</span>
            </div>

            <div className="book-card-body">
                <h3>{book.title}</h3>

                {book.author && (
                    <p className="book-card-author">
                        {book.author}
                    </p>
                )}

                <div className="book-card-badges">
                    {book.level && (
                        <span>{book.level}</span>
                    )}

                    {book.length && (
                        <span>
                            {formatLength(book.length)}
                        </span>
                    )}
                </div>

                <p className="book-card-description">
                    {book.description}
                </p>

                {book.themes.length > 0 && (
                    <div className="book-card-themes">
                        {book.themes.map((theme) => (
                            <span key={theme}>
                                {theme}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {onAdd && (
                <Button
                    type="button"
                    disabled={isAdding || isAdded}
                    onClick={() => onAdd(book.id)}
                >
                    {isAdding
                        ? 'Toevoegen...'
                        : isAdded
                        ? 'Op leeslijst'
                        : addLabel}
                </Button>
            )}
        </article>
    );
}