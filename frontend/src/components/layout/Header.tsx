// Header structure

import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "./Navigation";
import type { UserRole } from "../../types/auth";

interface HeaderProps {
    role: UserRole;
}

export default function Header ({ role }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false); // Component state

    const homePath = role === "student" ? "/student" : "/teacher";

    return (
        <header className="site-header">
            <div className="site-header-container">
                <Link to={homePath} className="site-header__logo">
                Vrij lezen op maat
                </Link>

                <button type="button" className="menu-button" aria-expanded={menuOpen} aria-controls="main-navigation"
                onClick={() => setMenuOpen((previous) => !previous)}>
                    Menu
                </button>

                <Navigation role={role} isOpen={menuOpen} onNavigate={() => setMenuOpen(false)}/>

                <div className="site-header__acount">
                    Account
                </div>
            </div>
        </header>
    );
}