/**
 * Provides the global authentication state for the application.
 *
 * Responsibilities:
 * - Stores the authenticated user and access token.
 * - Handles login and logout.
 * - Persists the session in sessionStorage.
 * - Restores a valid session after a page refresh.
 */

import {
    useState,
    type ReactNode,
} from 'react';

import type { AuthUser } from '../types/auth';

import { AuthContext } from './AuthContext';

interface AuthProviderProps {
    children: ReactNode;
}

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
}

const USER_STORAGE_KEY = 'authUser';
const TOKEN_STORAGE_KEY = 'accessToken';

// Removes all persisted authentication information.
function clearStoredAuth(): void {
    sessionStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

// Checks whether the JWT stored in the browser has expired.
function isTokenExpired(token: string): boolean {
    try {
        const payloadBase64 = token.split('.')[1];

        if (!payloadBase64) {
            return true;
        }

        // JWT uses Base64URL encoding, so convert it to regular Base64 first.
        const normalizedPayload = payloadBase64
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const paddedPayload = normalizedPayload.padEnd(
            Math.ceil(normalizedPayload.length / 4) * 4,
            '=',
        );

        const payload = JSON.parse(
            atob(paddedPayload),
        ) as {
            exp?: number;
        };

        if (!payload.exp) {
            return true;
        }

        // JWT expiration is expressed in seconds; Date.now() uses milliseconds.
        return payload.exp * 1000 <= Date.now();
    } catch {
        return true;
    }
}

// Restores authentication from sessionStorage when React starts.
// Invalid or expired authentication information is removed immediately.
function restoreAuth(): AuthState {
    const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedUser || !storedToken) {
        clearStoredAuth();

        return {
            user: null,
            accessToken: null,
        };
    }

    if (isTokenExpired(storedToken)) {
        clearStoredAuth();

        return {
            user: null,
            accessToken: null,
        };
    }

    try {
        const user = JSON.parse(storedUser) as AuthUser;

        return {
            user,
            accessToken: storedToken,
        };
    } catch {
        clearStoredAuth();

        return {
            user: null,
            accessToken: null,
        };
    }
}

export function AuthProvider({ children }: AuthProviderProps) {
    // Lazy initialization restores the session immediately after a refresh.
    const [authState, setAuthState] = useState<AuthState>(() =>
        restoreAuth(),
    );

    const { user, accessToken } = authState;

    const isAuthenticated =
        user !== null &&
        accessToken !== null;

    // Stores a successful login in both React state and sessionStorage.
    function login(user: AuthUser, token: string): void {
        sessionStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify(user),
        );

        sessionStorage.setItem(
            TOKEN_STORAGE_KEY,
            token,
        );

        setAuthState({
            user,
            accessToken: token,
        });
    }

    // Removes the authentication state from React and the browser session.
    function logout(): void {
        clearStoredAuth();

        setAuthState({
            user: null,
            accessToken: null,
        });
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}