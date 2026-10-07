// Temporary page for testing 

interface PlaceholderPageProps {
    title: string;
}

export default function PlaceholderPage({
    title,
}: PlaceholderPageProps) {
    return (
        <section>
            <h1>{title}</h1>

            <p>
                Hallo!
            </p>
        </section>
    );
}