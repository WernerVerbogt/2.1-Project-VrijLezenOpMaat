// Temporary code to check accounts and login

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { AuthUser } from "../types/auth";

const mockStudent: AuthUser = {
    id: 1,
    firstName: "Werner",
    lastName: "Verbogt",
    email: "werner.verbogt@mail.nl",
    role: "student",
};

const mockTeacher: AuthUser = {
    id: 2,
    firstName: "Jan",
    lastName: "Jan",
    email: "dubbeljan@mail.nl",
    role: "teacher",
};

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    function loginAsStudent() {
        login(mockStudent);
        navigate("/student");
    }

    function loginAsTeacher() {
        login(mockTeacher);
        navigate("/teacher");
    }

    return (
        <main className="login-page">
            <section className="login-card">
                <h1>Inloggen</h1>

                <p>
                    Tijdelijke testomgeving voor authenticatie en autorisatie.
                </p>

                <div className="login-card__action">
                    <button type="button" onClick={loginAsStudent}>
                        Test login als student
                    </button>

                    <button type="button" onClick={loginAsTeacher}>
                        Test login als docent
                    </button>
                </div>
            </section>
        </main>
    );
}