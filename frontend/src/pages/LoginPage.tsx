// Temporary code to check accounts and login

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { loginUser } from "../services/authService";

import './css/LoginPage.css'

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>,) {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            const response = await loginUser({
                email,
                password,
            });

            login(response.user, response.accessToken);

            if (response.user.role === "student") {
                navigate("/student");
            }
            else {
                navigate("/teacher/students");
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>Inloggen</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="email">
                            E-mailadres
                        </label>

                        <input id="email" name="email" type="email" autoComplete="email" required value={email}
                        onChange={(event) => setEmail(event.target.value)} />

                    </div>

                    <div className="form-field">
                        <label htmlFor="password">
                            Wachtwoord
                        </label>

                        <input id="password" name="password" type="password" autoComplete="current-password" required value={password}
                        onChange={(event) => setPassword(event.target.value)} />
                    </div>

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Bezig ..." : "Inloggen"}
                    </button>
                </form>
            </section>
        </main>
    )
}