/**
 * Defines the data and functions that are globally available
 * through the authentication context.
 */

import type { AuthUser } from '../types/auth';

export interface AuthContextType {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;

    login: (user: AuthUser, accessToken: string) => void;
    logout: () => void;
}