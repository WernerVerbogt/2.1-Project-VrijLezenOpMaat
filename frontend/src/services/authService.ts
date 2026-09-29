// Handles authentication requests between the frontend and NestJS backend.

import type { LoginCredentials, LoginResponse } from "../types/auth";

const API_URL = "http://localhost:3000";

export async function loginUser(
    credentials: LoginCredentials,
): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password,
        }),
    });

    if (!response.ok) {
        throw new Error("E-mailadres of wachtwoord is onjuist.");
    }

    return response.json() as Promise<LoginResponse>;
}