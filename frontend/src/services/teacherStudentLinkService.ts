/**
 * Handles API requests for student-teacher links.
 */

import type { LinkedStudent, LinkedTeacherPayload, LinkedStudentDetails, Teacher } from "../types/teacherStudentLink";
import type { ReadingListItem } from "../types/readingList";

const API_URL = 'http://localhost:3000/teacher-student-links';

interface ApiErrorResponse {
    message?: string | string[];
}

export class TeacherStudentLinkApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);

        this.name = 'TeacherStudentLinkApiError';

        this.status = status;
    }
}

// Converts an unsuccessful API response into readable error
async function createApiError(
    response: Response,
    fallbackMessage: string,
): Promise<TeacherStudentLinkApiError> {
    let message = fallbackMessage;

    try {
        const body =
            await response.json() as ApiErrorResponse;

        if (Array.isArray(body.message)) {
            message = body.message.join(' ');
        } else if (
            typeof body.message === 'string'
        ) {
            message = body.message;
        }
    } catch {
        // Keep the fallback message when no JSON response is available.
    }

    return new TeacherStudentLinkApiError(
        response.status,
        message,
    );
}

// Returns all teachers and their current link status.
export async function getTeachers(
    accessToken: string,
): Promise<Teacher[]> {
    const response = await fetch(
        `${API_URL}/teachers`,
        {
            headers: {
                Authorization:
                    `Bearer ${accessToken}`,
            },
        },
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            'De docenten konden niet worden geladen.',
        );
    }

    return response.json() as Promise<Teacher[]>;
}

// Links the logged-in student to the selected teacher.
export async function linkTeacher(
    accessToken: string,
    payload: LinkedTeacherPayload,
): Promise<Teacher> {
    const response = await fetch(
        API_URL,
        {
            method: 'POST',
            headers: {
                Authorization:
                    `Bearer ${accessToken}`,
                'Content-Type':
                    'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            'De docent kon niet worden gekoppeld.',
        );
    }

    return response.json() as Promise<Teacher>;
}

// Returns the students linked to the logged-in teacher.
export async function getLinkedStudents(
    accessToken: string,
): Promise<LinkedStudent[]> {
    const response = await fetch(
        `${API_URL}/students`,
        {
            headers: {
                Authorization:
                    `Bearer ${accessToken}`,
            },
        },
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            'De gekoppelde studenten konden niet worden geladen.',
        );
    }

    return response.json() as Promise<LinkedStudent[]>;
}

// Returns profile and reading-list information for one linked student.
export async function getLinkedStudentDetails(
    accessToken: string,
    studentId: string,
): Promise<LinkedStudentDetails> {
    const response = await fetch(
        `${API_URL}/students/${encodeURIComponent(studentId)}`,
        {
            headers: {
                Authorization:
                    `Bearer ${accessToken}`,
            },
        },
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            'De studentgegevens konden niet worden geladen.',
        );
    }

    return response.json() as Promise<LinkedStudentDetails>;
}

// Adds an existing catalog book to a linked student's reading list.
export async function addBookToLinkedStudentReadingList(
    accessToken: string,
    studentId: string,
    bookId: string,
): Promise<ReadingListItem> {
    const response = await fetch(
        `${API_URL}/students/${encodeURIComponent(studentId)}/reading-list`,
        {
            method: 'POST',
            headers: {
                Authorization:
                    `Bearer ${accessToken}`,
                'Content-Type':
                    'application/json',
            },
            body: JSON.stringify({bookId}),
        },
    );

    if (!response.ok) {
        throw await createApiError(
            response,
            'Het boek kon niet aan de leeslijst worden toegevoegd.',
        );
    }

    return response.json() as Promise<ReadingListItem>;
}