/**
 * Contains the functions for interacting with the recommendation API.
 */

import type { RecommendationsResponse } from '../types/recommendation';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'; // TODO change URL when deploying

// Retrieves personalized recommendations for the authenticated student.
export async function getRecommendations(
  accessToken: string,
): Promise<RecommendationsResponse> {
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Convert backend errors to a useful frontend error.
  if (response.status === 404) {
    throw new Error ('Vul eerst je leesprofiel in om persoonlijke adviezen te krijgen.')
  }

  if (!response.ok) {
    let message = 'Het ophalen van de leesadviezen is mislukt.';

    try {
      const errorResponse = (await response.json()) as {
        message?: string;
      };

      if (errorResponse.message) {
        message = errorResponse.message;
      }
    } catch {
      // Keep the generic message if the backend did not return JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as RecommendationsResponse;
}