import { useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../types/auth";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    function login(user: AuthUser, token: string) {
        setUser(user);
        setAccessToken(token);
    }

    function logout() {
        setUser(null);
        setAccessToken(null);
    }

    return (
        <AuthContext.Provider 
        value={{
            user,
            accessToken,
            isAuthenticated: user !== null,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}