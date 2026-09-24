/* Below defines the routing structure for the application using React Router. 
It sets up different routes for students and teachers, as well as a login page and a 404 Not Found page. 
The AppLayout component is used to provide a consistent layout for the student and teacher routes, 
while PlaceholderPage components are used to represent the content of each route. 
The BrowserRouter component wraps the entire routing structure, enabling navigation between different pages in the application. */

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import PlaceholderPage from "../pages/PlaceholderPage";
import NotFoundPage from "../pages/NotFoundPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/*Temp. starting point*/}
                <Route path="/" element={<Navigate to="/student" replace />} />

                {/* Login krijgt later geen normale app-navigatie */}
                <Route path="/login" element={<PlaceholderPage title="Inloggen" />} />

                {/*Routing for role student*/}
                <Route path="/student" element={<AppLayout role="student" />}>
                    <Route index element={<PlaceholderPage title="Home" />} />
                    <Route path="profile" element={<PlaceholderPage title="Mijn leesprofiel" />} />
                    <Route path="recommendations" element={<PlaceholderPage title="Mijn leesadvies" />} />
                    <Route path="catalog" element={<PlaceholderPage title="Catalogus" />} />
                    <Route path="reading-list" element={<PlaceholderPage title="Mijn leeslijst" />} />
                    <Route path="teacher" element={<PlaceholderPage title="Mijn docent" />} />
                </Route>

                {/*Routings for role teacher*/}
                <Route path="/teacher" element={<AppLayout role="teacher" />}>
                    <Route index element={<PlaceholderPage title="Docent dashboard" />} />
                    <Route path="students" element={<PlaceholderPage title="Mijn studenten" />} />
                    <Route path="students/:studentId" element={<PlaceholderPage title="Student bekijken" />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />             

            </Routes>
        </BrowserRouter>
    );
}