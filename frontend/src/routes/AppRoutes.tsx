/**
 * Below defines the routing structure for the application using React Router. 
 * It sets up different routes for students and teachers, as well as a login page and a 404 Not Found page. 
 * The AppLayout component is used to provide a consistent layout for the student and teacher routes, 
 * while PlaceholderPage components are used to represent the content of each route. 
 * The BrowserRouter component wraps the entire routing structure, 
 * enabling navigation between different pages in the application. 
 * */

import { BrowserRouter, Route, Routes } from "react-router-dom"; {/* TODO add Navigate */}
import AppLayout from "../layouts/AppLayout";
import LoggedInHomePage from "../pages/LoggedInHomePage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";
import HomePage from "../pages/HomePage";
import CatalogPage from "../pages/CatalogPage";
import ReadingProfilePage from "../pages/ReadingProfileFormPage";
import RecommendationPage from "../pages/RecommendationPage";
import ReadingListPage from "../pages/ReadingListPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<HomePage />} />

                {/*<Route path="/" element={<Navigate to ="/" replace />} /> {/*TODO replace with login ??*/}

                <Route path="/login" element={<LoginPage />} />

                {/*Everything below needs authentication*/}

                <Route element={<ProtectedRoute />}>

                    {/*Routings for student role*/}
                    <Route element={<RoleGuard allowedRole="student" />}>
                        <Route path="/student" element={<AppLayout />}>
                            <Route index element={<LoggedInHomePage />} />
                            <Route path="profile" element={<ReadingProfilePage />} />
                            <Route path="recommendations" element={<RecommendationPage />} />
                            <Route path="catalog" element={<CatalogPage /> } />
                            <Route path="reading-list" element={<ReadingListPage />} />
                            <Route path="teacher" element={<LoggedInHomePage />} />
                        </Route>
                    </Route>

                    {/*Routings for teacher */}
                    <Route element={<RoleGuard allowedRole="teacher" />}>
                        <Route path="/teacher" element={<AppLayout />}>
                            <Route index element={<LoggedInHomePage />} />
                            <Route path="students" element={<LoggedInHomePage />} />
                            <Route path="students/:studentId" element={<LoggedInHomePage />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />

            </Routes>
        </BrowserRouter>
    );
}