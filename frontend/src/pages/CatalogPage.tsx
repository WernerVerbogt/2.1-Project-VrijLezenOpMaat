import { useEffect, useState } from "react";
import type { Book } from "../types/book";
import { getBooks } from "../services/booksApi";

export default function CatalogPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadBooks() {
            try {
                const data = await getBooks();
                setBooks(data);
            } 
            catch {
                setError('Boekenlijst kon niet worden geladen.');
            }
            finally {
                setIsLoading(false);
            }
        }

        loadBooks();
    }, []);

    if (isLoading) {
        return <p>Boekenlijst wordt geladen...</p>;
    }

    if (error) {
        return <p>{error}</p>
    }

    return (
        <main>
            <h1>Boekenlijst / Catalogus</h1>

            <p>{books.length} boeken gevonden</p>

            <div>
                {books.map((book) => (
                    <article key={book.id}>
                        <h2>{book.title}</h2>

                        <p>
                            <strong>Auteur:</strong> {book.author}
                        </p>

                        <p>
                            <strong>Niveau:</strong> {book.level}
                        </p>

                        <p>{book.description}</p>

                        <p>
                            <strong>Thema's:</strong> {' '}
                            {book.themes.join(', ')}
                        </p>

                    </article>
                ))}
            </div>
        </main>
    );
}


{/*stap 12*/}