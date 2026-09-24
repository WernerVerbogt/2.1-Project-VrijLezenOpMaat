// Checks if the user is logged in and autorised to view the route
// Not autorised = directly sent to the login page

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />
}