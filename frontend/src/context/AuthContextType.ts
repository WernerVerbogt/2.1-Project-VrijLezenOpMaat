import type { AuthUser } from '../types/auth';

export interface AuthContextType {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (user: AuthUser, accessToken: string) => void;
    logout: () => void;
}