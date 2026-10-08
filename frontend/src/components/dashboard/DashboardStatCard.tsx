/**
 * Reusable dashboard card for displaying statistics from the user that is logged in.
 */

import "../ui/DashboardStatCard.css"

interface DashboardStatCardProps {
    title: string;
    value: string | number;
    description?: string;
    isLoading?: boolean;
}

function DashboardStatCard({
    title,
    value,
    description,
    isLoading = false,
}: DashboardStatCardProps) {
    return (
        <article
            className="dashboard-stat-card"
            aria-busy={isLoading}
        >
            <h2 className="dashboard-stat-card__title">
                {title}
            </h2>

            {isLoading ? (
                <>
                    {/* Skeleton placeholders are shown while dashboard data loads. */}
                    <div className="dashboard-stat-card__skeleton dashboard-stat-card__skeleton--value" />

                    {description && (
                        <div className="dashboard-stat-card__skeleton dashboard-stat-card__skeleton--description" />
                    )}
                </>
            ) : (
                <>
                    <p className="dashboard-stat-card__value">
                        {value}
                    </p>

                    {description && (
                        <p className="dashboard-stat-card__description">
                            {description}
                        </p>
                    )}
                </>
            )}
        </article>
    );
}

export default DashboardStatCard;