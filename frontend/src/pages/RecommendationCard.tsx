/** Recommendation Card
 * Initializes the cards which will be used to show the recommendation cards on the recommendations page.
 *  
 * The score, which represents how well a book matches the student's reading profile, is not shown here
 * as it's not useful for the user to see. It's only useful for the logic to match the book with the profile.
 */

import type { BookRecommendation } from '../types/recommendation';

import Button from '../components/ui/Button';

interface RecommendationCardProps {
    recommendations: BookRecommendation;
    isAdding: boolean;
    isOnReadingList: boolean;
    onAddToReadingList: (
        bookId: string,
    ) => Promise<void>;
}

export default function RecommendationCard({
    recommendations: recommendation,
    isAdding,
    isOnReadingList,
    onAddToReadingList,
}: RecommendationCardProps) {
    return (
        <article className="recommendation-card">
            <header className="recommendation-card__header">
                <h2>
                    {recommendation.title}
                </h2>

                {recommendation.author && (
                    <p className="recommendation-card__author">
                        Door {
                            recommendation.author
                        }
                    </p>
                )}
            </header>

            {recommendation.description && (
                <p className="recommendation-card__description">
                    {
                        recommendation.description
                    }
                </p>
            )}

            {/* Additional catalog information helps the student understand the book. */}
            <dl className="recommendation-card__metadata">
                {recommendation.level && (
                    <div>
                        <dt>Niveau</dt>
                        <dd>
                            {
                                recommendation.level
                            }
                        </dd>
                    </div>
                )}

                {recommendation.materialType && (
                    <div>
                        <dt>Type</dt>
                        <dd>
                            {
                                recommendation.materialType
                            }
                        </dd>
                    </div>
                )}

                {recommendation.themes.length >
                    0 && (
                    <div>
                        <dt>Thema's</dt>
                        <dd>
                            {recommendation.themes.join(
                                ', ',
                            )}
                        </dd>
                    </div>
                )}
            </dl>

            <section
                className="recommendation-card__reason"
                aria-labelledby={
                    `recommendation-reason-${recommendation.bookId}`
                }
            >
                <h3
                    id={
                        `recommendation-reason-${recommendation.bookId}`
                    }
                >
                    Waarom past dit bij jou?
                </h3>

                <ul>
                    {recommendation.reasons.map(
                        (reason, index) => (
                            <li
                                key={
                                    `${reason.type}-${index}`
                                }
                            >
                                {
                                    reason.message
                                }
                            </li>
                        ),
                    )}
                </ul>
            </section>

            <div className="recommendation-card__actions">
                <Button
                    type="button"
                    disabled={isAdding || isOnReadingList}
                    onClick={() =>
                        void onAddToReadingList(
                            recommendation.bookId,
                        )
                    }
                >
                    {isAdding
                        ? 'Toevoegen...'
                        : isOnReadingList
                        ? 'Op leeslijst'
                        : 'Toevoegen aan leeslijst'}
                </Button>
            </div>
        </article>
    );
}