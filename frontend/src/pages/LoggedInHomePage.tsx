/**
 * First page that is shown when the user is logged in.
 */

import { useEffect, useState } from "react";

import { useAuth } from "../context/useAuth";
import { getReadingProfile, ReadingProfileApiError } from "../services/readingProfileService";
import { getReadingList } from "../services/readingListService";

import type { ReadingListItem } from "../types/readingList";

import DashboardStatCard from "../components/dashboard/DashboardStatCard";

import "./css/LoggedInHomePage.css";

function LoggedInHomePage() {
    const { accessToken } = useAuth();

    const [hasReadingProfile, setHasReadingProfile] = useState<boolean | null>(null);

    const [readingList, setReadingList] = useState<ReadingListItem[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        const loadDashboardData = async () => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                // A missing reading profile is a valid state.
                // HTTP 404 therefore means that the student has not filled it in yet.

                const readingProfilePromise = getReadingProfile(accessToken)
                    .then(() => true)
                    .catch((error: unknown) => {
                        if (
                            error instanceof ReadingProfileApiError &&
                            error.status === 404
                        ) {
                            return false;
                        }

                        throw error;
                    });

                //Profile and reading-list data do not depend on each other,
                //so they can be fetched at the same time.

                const [
                    profileExists,
                    readingListItems,
                ] = await Promise.all([
                    readingProfilePromise,
                    getReadingList(accessToken),
                ]);

                setHasReadingProfile(profileExists);
                setReadingList(readingListItems);
            } catch (error) {
                console.error(
                    "Failed to load dashboard data:",
                    error,
                );

                setErrorMessage(
                    "De gegevens voor de startpagina konden niet worden geladen.",
                );
            } finally {
                setIsLoading(false);
            }
        };

        void loadDashboardData();
    }, [accessToken]);

    // Calculate the statistics shown in the dashboard cards.
    const totalReadingListItems = readingList.length;

    const totalReadItems = readingList.filter(
        (item) => item.isRead,
    ).length;

    return (
        <main className="logged-in-home-page">
            <header className="logged-in-home-page__header">
                <h1>Welkom!</h1>

                <p>
                    Hieronder zie je een korte samenvatting van je leesstatus.
                </p>
            </header>

            {errorMessage && (
                <p
                    className="logged-in-home-page__error"
                    role="alert"
                >
                    {errorMessage}
                </p>
            )}

            <section
                className="logged-in-home-page__stats"
                aria-label="Leesstatus"
            >
                <DashboardStatCard
                    title="Leesprofiel"
                    value={
                        hasReadingProfile
                            ? "Ingevuld"
                            : "Nog invullen"
                    }
                    description="Status van je persoonlijke leesprofiel."
                    isLoading={isLoading}
                />

                <DashboardStatCard
                    title="Leeslijst"
                    value={totalReadingListItems}
                    description={
                        totalReadingListItems === 1
                            ? "boek op je leeslijst"
                            : "boeken op je leeslijst"
                    }
                    isLoading={isLoading}
                />

                <DashboardStatCard
                    title="Gelezen"
                    value={totalReadItems}
                    description={
                        totalReadItems === 1
                            ? "boek gelezen"
                            : "boeken gelezen"
                    }
                    isLoading={isLoading}
                />
            </section>
        </main>
    );
}

export default LoggedInHomePage;