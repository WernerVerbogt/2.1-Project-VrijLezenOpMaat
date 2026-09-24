/* Central place to check
- Who has been logged in?
- Which UserRole is assigned?
- Is someone logged in?
- Login and logout

Global state is active here for the user that is logged in

This function is separated in 3 files for fast refresh
*/

import { createContext } from "react";
import type { AuthUser } from "../types/auth"

export interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (user: AuthUser) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined> ( // No AuthProvider means context = undefined
    undefined
);