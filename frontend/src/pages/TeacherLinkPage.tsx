/**
 * Shows teachers for the students, which gives the possibility to create a student-teacher link.
 */

import { useEffect, useState } from 'react';

import { useAuth } from '../context/useAuth';

import Button from '../components/ui/Button';

import { getTeachers, linkTeacher } from '../services/teacherStudentLinkService';

import type { Teacher } from '../types/teacherStudentLink';

import './css/TeacherLinkPage.css';

const SKELETON_TEACHERS = 3;

export default function TeacherLinkPage() {
    const { accessToken } = useAuth();

    const [teachers, setTeachers] =
        useState<Teacher[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [
        linkingTeacherId,
        setLinkingTeacherId,
    ] = useState<string | null>(null);

    const [errorMessage, setErrorMessage] =
        useState('');

    const [successMessage, setSuccessMessage] =
        useState('');

    useEffect(() => {
        async function loadTeachers() {
            if (!accessToken) {
                setErrorMessage(
                    'Je bent niet ingelogd.',
                );
                setIsLoading(false);
                return;
            }

            try {
                const result =
                    await getTeachers(
                        accessToken,
                    );

                setTeachers(result);
            } catch (error) {
                if (error instanceof Error) {
                    setErrorMessage(
                        error.message,
                    );
                } else {
                    setErrorMessage(
                        'De docenten konden niet worden geladen.',
                    );
                }
            } finally {
                setIsLoading(false);
            }
        }

        void loadTeachers();
    }, [accessToken]);

    async function handleLinkTeacher(
        teacherId: string,
    ) {
        if (!accessToken) {
            setErrorMessage(
                'Je bent niet ingelogd.',
            );
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');
        setLinkingTeacherId(teacherId);

        try {
            await linkTeacher(
                accessToken,
                {
                    teacherId,
                },
            );

            // Update the linked status without reloading the complete page.
            setTeachers((current) =>
                current.map((teacher) =>
                    teacher.id === teacherId
                        ? {
                            ...teacher,
                            isLinked: true,
                        }
                        : teacher,
                ),
            );

            setSuccessMessage(
                'De docent is succesvol gekoppeld.',
            );
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(
                    error.message,
                );
            } else {
                setErrorMessage(
                    'De docent kon niet worden gekoppeld.',
                );
            }
        } finally {
            setLinkingTeacherId(null);
        }
    }

    return (
        <main className="teacher-link-page">
            <header className="teacher-link-header">
                <h1>Mijn docent</h1>

                <p>
                    Kies een docent die toegang mag krijgen tot jouw leesprofiel en leeslijst.
                </p>
            </header>

            {errorMessage && (
                <p
                    className="teacher-link-error"
                    role="alert"
                >
                    {errorMessage}
                </p>
            )}

            {successMessage && (
                <p
                    className="teacher-link-success"
                    role="status"
                >
                    {successMessage}
                </p>
            )}

            {isLoading ? (
                <section
                    className="teacher-list"
                    aria-label="Docenten worden geladen"
                    aria-busy="true"
                >
                    {Array.from(
                        { length: SKELETON_TEACHERS },
                        (_, index) => (
                            <article
                                key={index}
                                className="teacher-card teacher-card-skeleton"
                                aria-hidden="true"
                            >
                                <div className="teacher-card-skeleton__content">
                                    <div className="teacher-skeleton teacher-skeleton__name" />

                                    <div className="teacher-skeleton teacher-skeleton__email" />
                                </div>

                                <div className="teacher-skeleton teacher-skeleton__button" />
                            </article>
                        ),
                    )}
                </section>
            ) : teachers.length === 0 ? (
                <section className="teacher-link-empty">
                    <h2>
                        Geen docenten gevonden
                    </h2>

                    <p>
                        Er zijn momenteel geen
                        docenten beschikbaar.
                    </p>
                </section>
            ) : (
                <section
                    className="teacher-list"
                    aria-label="Beschikbare docenten"
                >
                    {teachers.map((teacher) => {
                        const isLinking =
                            linkingTeacherId ===
                            teacher.id;

                        return (
                            <article
                                key={teacher.id}
                                className="teacher-card"
                            >
                                <div>
                                    <h2>
                                        {teacher.firstName}{' '}
                                        {teacher.lastName}
                                    </h2>

                                    <p>
                                        {teacher.email}
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    disabled={
                                        teacher.isLinked ||
                                        isLinking
                                    }
                                    onClick={() =>
                                        void handleLinkTeacher(
                                            teacher.id,
                                        )
                                    }
                                >
                                    {isLinking
                                        ? 'Koppelen...'
                                        : teacher.isLinked
                                          ? 'Gekoppeld'
                                          : 'Docent koppelen'}
                                </Button>
                            </article>
                        );
                    })}
                </section>
            )}
        </main>
    );
}