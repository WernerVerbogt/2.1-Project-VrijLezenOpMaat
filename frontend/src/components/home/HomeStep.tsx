/*
 * Reusable step component for explaining how the application works.
 */

import "../ui/HomeStep.css";

interface HomeStepProps {
    stepNumber: number;
    title: string;
    description: string;
}

function HomeStep({
    stepNumber,
    title,
    description,
}: HomeStepProps) {
    return (
        <article className="home-step">
            <div
                className="home-step__number"
                aria-hidden="true"
            >
                {stepNumber}
            </div>

            <h2 className="home-step__title">
                {title}
            </h2>

            <p className="home-step__description">
                {description}
            </p>
        </article>
    );
}

export default HomeStep;