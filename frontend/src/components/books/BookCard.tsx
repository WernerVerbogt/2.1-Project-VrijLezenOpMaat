// Component, represents the cards for each book that is shown on the catalog page

import type { Book } from "../../types/book";

interface BookCardProps {
    book: Book;
    onAdd?: (bookId: string) => void;
    addLabel?: string;
}

export default function BookCard({
    book,
    onAdd,
    addLabel = 'Toevoegen',
}: BookCardProps) {
    return (
        <article>
            <h2>{book.title}</h2>

            <p>
                <strong>Auteur:</strong> {book.author}
            </p>

            <p>
                <strong>Niveau:</strong> {book.level}
            </p>

            <p>{book.description}</p>

            {book.themes.length > 0 && (
                <p>
                    <strong>Thema's:</strong>{' '}
                    {book.themes.join(', ')}
                </p>
            )}

            { onAdd && (
                <button type="button" onClick={() => onAdd(book.id)}>
                    {addLabel} {/*onAdd component can have different functionalities later*/}
                </button>
            )}
        </article>
    );
}