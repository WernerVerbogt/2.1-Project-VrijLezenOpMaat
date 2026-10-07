/**
 * Handles communication with the backend for browsing the book catalog.
 * Supports pagination and optional catalog filters.
 */
import type { Book } from '../types/book';

export interface GetBooksParams {
    page?: number;
    limit?: number;
    level?: string;
    theme?: string;
    length?: string;
}

export interface PaginatedBooksResponse {
    items: Book[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Fetches one filtered and paginated page from the catalog
export async function getBooks(
    params: GetBooksParams = {},
): Promise<PaginatedBooksResponse> {
    const searchParams = new URLSearchParams();

    searchParams.set('page', String(params.page ?? 1));
    searchParams.set('limit', String(params.limit ?? 12));

    // Only send filters that are actually selected.
    if (params.level) {
        searchParams.set('level', params.level);
    }

    if (params.theme) {
        searchParams.set('theme', params.theme);
    }

    if (params.length) {
        searchParams.set('length', params.length);
    }

    const response = await fetch(
        `/api/books?${searchParams.toString()}`,
    );

    if (!response.ok) {
        throw new Error('Failed to fetch books');
    }

    return response.json();
}

// Fetches all the unique themes that are currently available from the books in the catalog
export async function getBookThemes(): Promise<string[]> {
    const response = await fetch('/api/books/themes');

    if (!response.ok) {
        throw new Error('Failed to fetch book themes');
    }

    return response.json();
}