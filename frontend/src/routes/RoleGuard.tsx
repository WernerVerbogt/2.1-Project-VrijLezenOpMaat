// Once the person has logged in, we need to know the autorisation level of the user to determine which routes they can access. 
// This is done by checking the UserRole of the logged in user. If the user is not logged in, they will be redirected to the login page.

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { UserRole } from "../types/auth";

interface RoleGuardProps {
    allowedRole: UserRole;
}

export default function RoleGuard({
    allowedRole,
}: RoleGuardProps) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" replace />; // TODO replace with either homepage or login
    }

    if (user.role !== allowedRole) {
        const fallback = user.role === "student" ? "/student" : "/teacher";

        return <Navigate to={fallback} replace />;
    }

    return <Outlet />
}