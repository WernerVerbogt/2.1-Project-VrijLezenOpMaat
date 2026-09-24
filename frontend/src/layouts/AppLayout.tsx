// Standard, complete page structure
// Uses the separate layout from the components

import { Outlet } from "react-router-dom"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
//import type { UserRole } from "../types/auth"

export default function AppLayout() {
    return (
        <div className="app">
            <a href="#main-content" className="skip-link">
                Ga naar hoofdinhoud
            </a>

            <Header />

            <main id="main-content" className="main-content" tabIndex={-1}>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

