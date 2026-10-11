/** 
 * Handles all HTTP requests related to the authenticated student's reading profile.
 * The JWT access token is supplied by AuthContext and sent as a Bearer token.
 */

import type { ReadingProfileResponse, SaveReadingProfilePayload } from "../types/readingProfile";

const API_URL = 'http://localhost:3000';

export class ReadingProfileApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ReadingProfileApiError';
        this.status = status;
    }
}

// Retrieves reading profile of the currently authenticated student

export async function getReadingProfile(accessToken: string,):
Promise<ReadingProfileResponse> {
    const response = await fetch(`${API_URL}/reading-profile`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw await createApiError(response);
    }

    return response.json() as Promise<ReadingProfileResponse>;
}

// Creates or updates complete reading profile of the currently authenticated student

export async function saveReadingProfile(
    accessToken: string, profile: SaveReadingProfilePayload,
): Promise<ReadingProfileResponse> {
    const response = await fetch(`${API_URL}/reading-profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profile),
    });

    if (!response.ok) {
        throw await createApiError(response);
    }

    return response.json() as Promise<ReadingProfileResponse>;
}

// Converts NestJS error into reusable frontend error

async function createApiError(response: Response,): Promise<ReadingProfileApiError> {
    
  let message = 'Something went wrong while communicating with the server.';

  try {
    const body = (await response.json()) as {
      message?: string | string[];
    };

    if (Array.isArray(body.message)) {
      message = body.message.join(' ');
    } else if (body.message) {
      message = body.message;
    }
  } catch {
    // Keep the generic message if the response does not contain JSON.
  }

  return new ReadingProfileApiError(message, response.status);
}