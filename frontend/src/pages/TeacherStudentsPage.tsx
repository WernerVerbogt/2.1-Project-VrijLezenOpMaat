/**
 * Displays all students linked to the logged-in teacher.
 * The teacher can open a student to view profile and reading-list information.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getLinkedStudents } from '../services/teacherStudentLinkService';

import type { LinkedStudent } from '../types/teacherStudentLink';
import Button from '../components/ui/Button';

import './css/TeacherStudentsPage.css';

const SKELETON_STUDENTS = 3;

export default function TeacherStudentsPage() {
    const { accessToken } = useAuth();
    const navigate = useNavigate();

    const [students, setStudents] = useState<LinkedStudent[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        async function loadStudents() {
            if (!accessToken) {
                setErrorMessage(
                    'Je bent niet ingelogd.',
                );
                setIsLoading(false);
                return;
            }

            try {
                const result =
                    await getLinkedStudents(
                        accessToken,
                    );

                setStudents(result);
            } catch (error) {
                if (error instanceof Error) {
                    setErrorMessage(
                        error.message,
                    );
                } else {
                    setErrorMessage(
                        'De gekoppelde studenten konden niet worden geladen.',
                    );
                }
            } finally {
                setIsLoading(false);
            }
        }

        void loadStudents();
    }, [accessToken]);

    function handleOpenStudent(
        studentId: string,
    ) {
        navigate(
            `/teacher/students/${studentId}`,
        );
    }

    return (
        <main className="teacher-students-page">
            <header className="teacher-students-header">
                <h1>Mijn studenten</h1>

                <p>
                    Bekijk de studenten die aan
                    jouw docentaccount zijn
                    gekoppeld.
                </p>
            </header>

            {errorMessage && (
                <p
                    className="teacher-students-error"
                    role="alert"
                >
                    {errorMessage}
                </p>
            )}

            {isLoading ? (
                <section
                    className="teacher-students-list"
                    aria-label="Studenten worden geladen"
                    aria-busy="true"
                >
                    {Array.from(
                        { length: SKELETON_STUDENTS },
                        (_, index) => (
                            <article
                                key={index}
                                className="teacher-student-card teacher-student-skeleton-card"
                                aria-hidden="true"
                            >
                                <div className="teacher-student-skeleton-content">
                                    <div className="teacher-student-skeleton teacher-student-skeleton-name" />

                                    <div className="teacher-student-skeleton teacher-student-skeleton-email" />
                                </div>

                                <div className="teacher-student-skeleton teacher-student-skeleton-button" />
                            </article>
                        ),
                    )}
                </section>
            ) : students.length === 0 ? (
                <section className="teacher-students-empty">
                    <h2>
                        Geen gekoppelde studenten
                    </h2>

                    <p>
                        Er zijn momenteel geen
                        studenten aan jou gekoppeld.
                    </p>
                </section>
            ) : (
                <section
                    className="teacher-students-list"
                    aria-label="Gekoppelde studenten"
                >
                    {students.map((student) => (
                        <article
                            key={student.id}
                            className="teacher-student-card"
                        >
                            <div>
                                <h2>
                                    {student.firstName}{' '}
                                    {student.lastName}
                                </h2>

                                <p>
                                    {student.email}
                                </p>
                            </div>

                            <Button
                                type="button"
                                onClick={() =>
                                    handleOpenStudent(
                                        student.id,
                                    )
                                }
                            >
                                Student bekijken
                            </Button>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}