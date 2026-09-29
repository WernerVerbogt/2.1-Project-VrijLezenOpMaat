/* Central place to check
- Who has been logged in?
- Which UserRole is assigned?
- Is someone logged in?
- Login and logout

Global authentication state is active here for the logged-in user.

This function is separated in 3 files for fast refresh
*/

import { createContext } from "react";
import type { AuthUser } from "../types/auth"

export interface AuthContextType {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (user: AuthUser, accessToken: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined> ( // No AuthProvider means context = undefined
    undefined
);