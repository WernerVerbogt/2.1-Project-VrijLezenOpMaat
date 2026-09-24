// Header structure

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import { useAuth } from "../../context/useAuth"
//import { log } from "console";
//import type { UserRole } from "../../types/auth";

/*interface HeaderProps {
    role: UserRole;
}*/

export default function Header () {
    const [menuOpen, setMenuOpen] = useState(false); // Component state

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return null;
    }

    const homePath = user.role === "student" ? "/student" : "/teacher";

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header className="site-header">
            <div className="site-header-container">

                <Link to={homePath} className="site-header__logo">
                Vrij lezen op maat
                </Link>

                <button 
                type="button" 
                className="menu-button" 
                aria-expanded={menuOpen} 
                aria-controls="main-navigation"
                onClick={() => setMenuOpen((previous) => !previous)}>
                    Menu
                </button>

                <Navigation role={user.role} isOpen={menuOpen} onNavigate={() => setMenuOpen(false)}/>

                <div className="site-header__acount">
                    <span>{user.firstName}</span>

                    <button type="button" onClick={handleLogout}>
                        Uitloggen
                    </button>
                </div>
            </div>
        </header>
    );
}