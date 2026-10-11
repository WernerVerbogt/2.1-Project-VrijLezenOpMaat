/*
 * Public landing page shown to users who are not logged in.
 * Introduces the application and provides access to the login page.
 */

import { Link } from "react-router-dom";

import HomeStep from "../components/home/HomeStep";

import "./css/HomePage.css";

function HomePage() {
    return (
        <div className="public-home-page">
            {/* Public header */}
            <header className="public-home-header">
                <div className="public-home-header__content">
                    <span className="public-home-header__brand">
                        Vrij lezen op maat
                    </span>

                    <Link
                        to="/login"
                        className="public-home-header__login"
                    >
                        Inloggen
                    </Link>
                </div>
            </header>

            <main>
                {/* Introduction */}
                <section className="public-home-hero">
                    <div className="public-home-hero__content">
                        <h1>
                            Vind een boek dat bij jou past
                        </h1>

                        <p>
                            Ontdek boeken op basis van jouw leesniveau,
                            interesses en voorkeuren.
                        </p>
                    </div>
                </section>

                {/* Explanation of the application flow */}
                <section className="public-home-process">
                    <div className="public-home-process__content">
                        <header className="public-home-process__header">
                            <h2>
                                Zo werkt het
                            </h2>

                            <p>
                                In drie stappen vind je een boek dat bij jou past.
                            </p>
                        </header>

                        <div className="public-home-process__steps">
                            <HomeStep
                                stepNumber={1}
                                title="Vul je leesprofiel in"
                                description="Geef aan wat je graag leest en welk leesniveau bij jou past."
                            />

                            <HomeStep
                                stepNumber={2}
                                title="Ontvang leesadvies"
                                description="Je krijgt persoonlijke boekadviezen op basis van jouw profiel."
                            />

                            <HomeStep
                                stepNumber={3}
                                title="Kies een boek"
                                description="Bekijk de catalogus, kies een passend boek en voeg het toe aan je leeslijst."
                            />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default HomePage;