/**
 * Defines the data structures used by the personal reading list.
 * Book information comes from the book database, while reading-list status
 * and ownership information come from the user database.
 */

// One complete item returned by GET /reading-list.
export interface ReadingListItem {
    id: string;
    title: string;
    author: string;
    description: string;
    materialType: string;
    level: string;
    themes: string[];
    length: string;

    isRead: boolean;
    addedByUserId: string;
    addedAt: string;
}

// Data sent when a book is added to the reading list.
export interface AddReadingListItemPayload {
    bookId: string;
}

// Data sent when the read status is changed.
export interface UpdateReadingListStatusPayload {
    isRead: boolean;
}

// Response returned after changing the read status.
export interface UpdateReadingListStatusResponse {
    bookId: string;
    isRead: boolean;
}