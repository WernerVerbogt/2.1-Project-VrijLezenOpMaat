import { useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../types/auth";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);

    function login(user: AuthUser) {
        setUser(user);
    }

    function logout() {
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: user !== null,
            login,
            logout,
        }} >
            {children}
        </AuthContext.Provider>
    );
}