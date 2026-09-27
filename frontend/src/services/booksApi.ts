// Handles communication with backend to fetch books from the list
// React component -> getBooks() -> GET /books -> NestJS

import type { Book } from '../types/book';

export async function getBooks(): Promise<Book[]> {
    const response = await fetch('/api/books');

    if (!response.ok) {
        throw new Error('Failed to fetch books');
    }

    return response.json();
}