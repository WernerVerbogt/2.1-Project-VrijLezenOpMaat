/**
 * Handles API requests for the student's personal reading list.
 * Authentication is provided through the JWT access token.
 */

import type {
    AddReadingListItemPayload,
    ReadingListItem,
    UpdateReadingListStatusPayload,
    UpdateReadingListStatusResponse,
} from '../types/readingList';

const API_URL = 'http://localhost:3000/reading-list';

interface ApiErrorResponse {
    message?: string | string[];
}

// Represents an API error including the HTTP status code
export class ReadingListApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);

        this.name = 'ReadingListApiError';
        this.status = status;
    }
}

// Extracts a readable error message from a NestJS error response
async function createApiError(response: Response, fallbackMessage: string): Promise<ReadingListApiError> {
    let message = fallbackMessage;

    try {
        const body = await response.json() as ApiErrorResponse;

        if (Array.isArray(body.message)) {
            message = body.message.join(' ');
        } else if (typeof body.message === 'string') {
            message = body.message;
        }
    } catch {
        // Keep fallback message when the response does not contain JSON.
    }

    return new ReadingListApiError(response.status, message);
}

// Returns the personal reading list of the logged-in student
export async function getReadingList(accessToken: string): Promise<ReadingListItem[]> {
    const response = await fetch(API_URL,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            'De leeslijst kon niet worden geladen.',
        );
    }

    return response.json() as Promise<ReadingListItem[]>;
}

// Adds one existing catalog book to the personal reading list
export async function addReadingListItem(accessToken: string, payload: AddReadingListItemPayload):
    Promise<ReadingListItem> {
        const response = await fetch(API_URL,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            },
        );

        if (!response.ok) {
            throw await createApiError(response, 'Het boek kan niet aan je leeslijst worden toegevoegd.');
        }

    return response.json() as Promise<ReadingListItem>;
}

// Changes wether one reading-list item has been read
export async function updateReadingListStatus(
    accessToken: string,
    bookId: string,
    payload: UpdateReadingListStatusPayload,
): Promise<UpdateReadingListStatusResponse> {
    const response = await fetch(
        `${API_URL}/${encodeURIComponent(bookId)}/status`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            'De leesstatus kon niet worden aangepast.',
        );
    }

    return response.json() as Promise<UpdateReadingListStatusResponse>;
}