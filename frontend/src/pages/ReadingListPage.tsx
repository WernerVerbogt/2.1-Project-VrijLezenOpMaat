/**
 * Page where the reading list for the student is shown.
 * The student can see their saved books and change the reading status.
 */

import { useEffect, useState } from 'react';

import { useAuth } from '../context/useAuth';

import { getReadingList, updateReadingListStatus } from '../services/readingListService';

import type { ReadingListItem } from '../types/readingList';

import './css/ReadingListPage.css';
import Button from '../components/ui/Button';

const SKELETON_ITEMS = 3;

export default function ReadingListPage() {
    const { accessToken } = useAuth();

    const [readingList, setReadingList] = useState<ReadingListItem[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [updatingBookIds, setUpdatingBookIds] = useState<string[]>([]);

    const [errorMessage, setErrorMessage] = useState('');

    // Loads personal reading list when the page opens
    useEffect(() => {
        async function loadReadingList() {
            if (!accessToken) {
                setErrorMessage('Je bent niet ingelogd.');

                setIsLoading(false);
                return;
            }

            try {
                const items = await getReadingList(accessToken);

                setReadingList(items);
            } catch (error) {
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                }
                else {
                    setErrorMessage('De leeslijst kon niet worden geladen.');
                }
            } finally {
                setIsLoading(false);
            }
        }

        void loadReadingList();
    }, [accessToken]);

    // Changes the read status and updates the item in the local state
    async function handleStatusChange(item: ReadingListItem) {
        if (!accessToken) {
            setErrorMessage('Je bent niet ingelogd.');
            return;
        }

        const newStatus = !item.isRead;

        setErrorMessage('');

        setUpdatingBookIds((current) => [
            ...current,
            item.id,
        ]);

        try {
            const updatedStatus =
                await updateReadingListStatus(
                    accessToken,
                    item.id,
                    {
                        isRead: newStatus,
                    },
                );

            setReadingList((current) =>
                current.map((currentItem) =>
                    currentItem.id ===
                    updatedStatus.bookId
                        ? {
                            ...currentItem,
                            isRead: updatedStatus.isRead,
                        }
                        : currentItem,
                ),
            );
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('De leesstatus kon niet worden aangepast.');
            }
        } finally {
            setUpdatingBookIds((current) => current.filter((bookId) => bookId !== item.id));
        }
    }

    function formatLength(length: string): string {
        const labels: Record<string, string> = {
            SHORT: 'Kort',
            MEDIUM: 'Gemiddeld',
            LONG: 'Lang',
        };

        return labels[length] ?? length;
    }

    return (
        <main className="reading-list-page">
            <header className="reading-list-header">
                <h1>Mijn leeslijst</h1>

                <p>
                    Hier staan je opgeslagen boeken.
                    Je kan bijhouden welke je wel en niet gelezen hebt.
                </p>
            </header>

            {errorMessage && (
                <p className="reading-list-error" role="alert">
                    {errorMessage}
                </p>
            )}

            {isLoading ? (
                <section
                    className="reading-list-items"
                    aria-label="Leeslijst wordt geladen"
                    aria-busy="true"
                >
                    {Array.from(
                        { length: SKELETON_ITEMS },
                        (_, index) => (
                            <article
                                key={index}
                                className="reading-list-card reading-list-skeleton"
                                aria-hidden="true"
                            >
                                <div className="skeleton-title" />

                                <div className="skeleton-author" />

                                <div className="skeleton-line" />
                                <div className="skeleton-line" />
                                <div className="skeleton-line skeleton-line-short" />

                                <div className="skeleton-details">
                                    <div className="skeleton-detail" />
                                    <div className="skeleton-detail" />
                                    <div className="skeleton-detail" />
                                    <div className="skeleton-detail" />
                                </div>

                                <div className="skeleton-button" />
                            </article>
                        ),
                    )}
                </section>
            ) : readingList.length === 0 ? (
                <section className="reading-list-empty">
                    <h2>
                        Je leeslijst is nog leeg
                    </h2>

                    <p>
                        Voeg een boek toe vanuit je
                        leesadviezen of vanuit de catalogus.
                    </p>
                </section>
            ) : (
                <section
                    className="reading-list-items"
                    aria-label="Opgeslagen boeken"
                >
                    {readingList.map((item) => {
                        const isUpdating = updatingBookIds.includes(item.id);

                        return (
                            <article key={item.id} className="reading-list-card" >
                                <div className="reading-list-card-content">
                                    <header>
                                        <h2>
                                            {item.title}
                                        </h2>

                                        {item.author && (
                                            <p>
                                                Auteur: {item.author}
                                            </p>
                                        )}
                                    </header>
                                    
                                    <p>
                                        <strong>Beschrijving van het boek:</strong>
                                    </p>
                                    <p>
                                        {item.description}
                                    </p>

                                    <dl className="reading-list-details">
                                        <div>
                                            <dt>Leesniveau</dt>
                                            <dd>
                                                {item.level}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>Lengte boek</dt>
                                            <dd>
                                                {formatLength(item.length)}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>Type materiaal</dt>
                                            <dd>
                                                {item.materialType}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>Gelezen?</dt>
                                            <dd>
                                                {item.isRead ? '✅' : '❌'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className="reading-list-actions">
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            void handleStatusChange(item)
                                        }
                                        disabled={isUpdating}
                                        aria-pressed={item.isRead}
                                    >
                                        {isUpdating
                                            ? 'Opslaan...'
                                            : item.isRead
                                            ? 'Markeer als niet gelezen'
                                            : 'Markeer als gelezen'}
                                    </Button>
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}
        </main>
    );
}