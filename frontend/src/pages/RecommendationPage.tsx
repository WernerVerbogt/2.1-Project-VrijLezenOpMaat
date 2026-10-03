/** Recommendation Page
 * will show the recommendations for the student based of its profile, 
 * which is filled in in the Reading Profile Form.
 * The cards will be set up in the RecommendationCard.tsx file
 */

import { useEffect, useState } from 'react';

import RecommendationCard from './RecommendationCard';
import { useAuth } from '../context/useAuth';
import { getRecommendations } from '../services/recommendationService';

import type { BookRecommendation } from '../types/recommendation';

import './css/RecommendationPage.css';

export default function RecommendationPage() {
    const { accessToken } = useAuth();

    const [recommendations, setRecommendations] =
        useState<BookRecommendation[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load recommendations when the page is mounted
    // or when the authentication token changes.
    useEffect(() => {
        if (!accessToken) {
            return;
        }

        // Store the validated token as a definite string.
        const token = accessToken;

        let cancelled = false;

        // Fetch personalized recommendations from the backend.
        async function fetchRecommendations() {
            try {
                const response = await getRecommendations(token);

                // Only update state if the component is still mounted.
                if (!cancelled) {
                    // Protect the UI against an unexpected API response.
                    setRecommendations(
                        Array.isArray(response.recommendations)
                            ? response.recommendations
                            : [],
                    );

                    setError(null);
                }
            } catch (error) {
                if (!cancelled) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : 'Het ophalen van de leesadviezen is mislukt.';

                    setError(message);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void fetchRecommendations();

        // Prevent state updates after the component has been unmounted.
        return () => {
            cancelled = true;
        };
    }, [accessToken]);

    // Retry the request manually after an error.
    async function handleRetry() {
        if (!accessToken) {
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await getRecommendations(accessToken);

            // Protect the UI against an unexpected API response.
            setRecommendations(
                Array.isArray(response.recommendations)
                    ? response.recommendations
                    : [],
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Het ophalen van de leesadviezen is mislukt.';

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    // Fallback if no token is available.
    if (!accessToken) {
        return (
            <section className="recommendations-page">
                <h1>Jouw leesadvies</h1>

                <p>Je bent niet ingelogd.</p>
            </section>
        );
    }

    // Show feedback while recommendations are being retrieved.
    if (isLoading) {
        return (
            <section
                className="recommendations-page"
                aria-live="polite"
                aria-busy="true"
            >
                <h1>Jouw leesadvies</h1>

                <p>Je persoonlijke leesadviezen worden geladen...</p>
            </section>
        );
    }

    // Show an accessible error message and allow the user to retry.
    if (error) {
        return (
            <section className="recommendations-page">
                <h1>Jouw leesadvies</h1>

                <div
                    className="recommendations-page__error"
                    role="alert"
                >
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() => void handleRetry()}
                    >
                        Opnieuw proberen
                    </button>
                </div>
            </section>
        );
    }

    // Handle a successful response without recommendations.
    if (recommendations.length === 0) {
        return (
            <section className="recommendations-page">
                <h1>Jouw leesadvies</h1>

                <p>
                    Er zijn op dit moment geen passende leesadviezen beschikbaar.
                </p>
            </section>
        );
    }

    // Render the personalized recommendations.
    return (
        <section className="recommendations-page">
            <header className="recommendations-page__header">
                <h1>Jouw leesadvies</h1>

                <p>
                    Deze boeken zijn geselecteerd op basis van jouw leesprofiel.
                </p>
            </header>

            <div className="recommendations-page__grid">
                {recommendations.map((recommendation) => (
                    <RecommendationCard
                        key={recommendation.bookId}
                        recommendations={recommendation}
                    />
                ))}
            </div>
        </section>
    );
}