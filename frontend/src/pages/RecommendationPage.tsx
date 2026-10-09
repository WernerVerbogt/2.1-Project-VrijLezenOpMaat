/**
 * Recommendation Page
 * Shows personal recommendations based on the student's reading profile.
 * Students can add recommended books to their personal reading list.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { getRecommendations } from '../services/recommendationService';
import { addReadingListItem, getReadingList, ReadingListApiError } from '../services/readingListService';

import RecommendationCard from './RecommendationCard';
import type { BookRecommendation } from '../types/recommendation';

import './css/RecommendationPage.css';

const SKELETON_RECOMMENDATIONS = 3;

export default function RecommendationPage() {
    const { accessToken } = useAuth();

    const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);

    const [readingListBookIds, setReadingListBookIds] = useState<string[]>([]);

    const [addingBookIds, setAddingBookIds] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    const [readingListError, setReadingListError] = useState<string | null>(null);

    // Load recommendations when the page is mounted
    // or when the authentication token changes.
    useEffect(() => {
        if (!accessToken) {
            return;
        }

        const token = accessToken;
        let cancelled = false;

        // Fetch personalized recommendations from the backend.
        async function fetchRecommendations() {
            try {
                const response =
                    await getRecommendations(token);

                if (!cancelled) {
                    setRecommendations(Array.isArray(response.recommendations) ? response.recommendations : []);

                    setError(null);
                }
            } catch (error) {
                if (!cancelled) {
                    const message =
                        error instanceof Error ? error.message : 'Het ophalen van de leesadviezen is mislukt.';

                    setError(message);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        // Load existing reading-list items so already saved books
        // can immediately be shown as added.
        async function fetchReadingList() {
            try {
                const items =
                    await getReadingList(token);

                if (!cancelled) {
                    setReadingListBookIds(
                        items.map(
                            (item) => item.id,
                        ),
                    );
                }
            } catch {
                // Recommendations can still be used if this request fails.
            }
        }

        void fetchRecommendations();
        void fetchReadingList();

        return () => {
            cancelled = true;
        };
    }, [accessToken]);

    // Retry the recommendation request manually after an error.
    async function handleRetry() {
        if (!accessToken) {
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await getRecommendations(accessToken);

            setRecommendations(Array.isArray(response.recommendations) ? response.recommendations : [],
            );
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Het ophalen van de leesadviezen is mislukt.';

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    // Adds one recommended book to the student's reading list.
    async function handleAddToReadingList(
        bookId: string,
    ) {
        if (!accessToken) {
            setReadingListError(
                'Je bent niet ingelogd.',
            );
            return;
        }

        setReadingListError(null);

        setAddingBookIds((current) => [
            ...current,
            bookId,
        ]);

        try {
            await addReadingListItem(
                accessToken,
                {
                    bookId,
                },
            );

            setReadingListBookIds(
                (current) =>
                    current.includes(bookId)
                        ? current
                        : [
                            ...current,
                            bookId,
                        ],
            );
        } catch (error) {

            // A conflict means the book was already saved earlier.
            if (
                error instanceof
                    ReadingListApiError &&
                error.status === 409
            ) {
                setReadingListBookIds(
                    (current) =>
                        current.includes(bookId)
                            ? current
                            : [
                                ...current,
                                bookId,
                            ],
                );

                return;
            }

            setReadingListError(error instanceof Error ? error.message : 'Het boek kon niet aan je leeslijst worden toegevoegd.');

        } finally {
            setAddingBookIds((current) =>
                current.filter(
                    (id) => id !== bookId,
                ),
            );
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
                aria-label="Leesadviezen worden geladen"
                aria-busy="true"
            >
                <header className="recommendations-page__header">
                    <h1>Jouw leesadvies</h1>

                    <p>
                        Deze boeken worden geselecteerd
                        op basis van jouw leesprofiel.
                    </p>
                </header>

                <div className="recommendations-page__grid">
                    {Array.from(
                        {
                            length:
                                SKELETON_RECOMMENDATIONS,
                        },
                        (_, index) => (
                            <article
                                key={index}
                                className="recommendation-card recommendation-skeleton"
                                aria-hidden="true"
                            >
                                <div className="recommendation-skeleton__title" />

                                <div className="recommendation-skeleton__author" />

                                <div className="recommendation-skeleton__description">
                                    <div className="recommendation-skeleton__line" />
                                    <div className="recommendation-skeleton__line" />
                                    <div className="recommendation-skeleton__line recommendation-skeleton__line--short" />
                                </div>

                                <div className="recommendation-skeleton__metadata">
                                    <div className="recommendation-skeleton__metadata-item" />
                                    <div className="recommendation-skeleton__metadata-item" />
                                </div>

                                <div className="recommendation-skeleton__reason">
                                    <div className="recommendation-skeleton__line recommendation-skeleton__line--medium" />
                                    <div className="recommendation-skeleton__line" />
                                    <div className="recommendation-skeleton__line recommendation-skeleton__line--short" />
                                </div>

                                <div className="recommendation-skeleton__button" />
                            </article>
                        ),
                    )}
                </div>
            </section>
        );
    }

    // Show an accessible error message and allow retry.
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
                        onClick={() =>
                            void handleRetry()
                        }
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
                    Er zijn op dit moment geen
                    passende leesadviezen
                    beschikbaar.
                </p>
            </section>
        );
    }

    return (
        <section className="recommendations-page">
            <header className="recommendations-page__header">
                <h1>Jouw leesadvies</h1>

                <p>
                    Deze boeken zijn geselecteerd
                    op basis van jouw leesprofiel.
                </p>
            </header>

            {readingListError && (
                <p
                    className="recommendations-page__error"
                    role="alert"
                >
                    {readingListError}
                </p>
            )}

            <div className="recommendations-page__grid">
                {recommendations.map(
                    (recommendation) => (
                        <RecommendationCard
                            key={
                                recommendation.bookId
                            }
                            recommendations={
                                recommendation
                            }
                            isAdding = {
                                addingBookIds.includes(
                                    recommendation.bookId,
                                )
                            }
                            isOnReadingList = {
                                readingListBookIds.includes(
                                    recommendation.bookId,
                                )
                            }
                            onAddToReadingList = {
                                handleAddToReadingList
                            }
                        />
                    ),
                )}
            </div>
        </section>
    );
}