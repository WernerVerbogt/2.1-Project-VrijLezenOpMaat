/*
 * Main application header.
 * Shows the navigation and account actions for the logged-in user.
 * On mobile, navigation and account actions are shown inside a collapsible menu.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

import Navigation from "./Navigation";

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);

    // The authenticated layout does not need a header without a user.
    if (!user) {
        return null;
    }

    const homePath =
        user.role === "student"
            ? "/student"
            : "/teacher";

    // Closes the mobile navigation after a route is selected.
    function handleNavigation() {
        setMenuOpen(false);
    }

    // Clears authentication and returns the user to the login page.
    function handleLogout() {
        setMenuOpen(false);

        logout();
        navigate("/login");
    }

    return (
        <header className="site-header">
            <div className="site-header__container">

                {/* Application name also links back to the role-specific home page. */}
                <Link
                    to={homePath}
                    className="site-header__logo"
                    onClick={handleNavigation}
                >
                    Vrij lezen op maat
                </Link>

                {/* Mobile menu button */}
                <button
                    type="button"
                    className={`menu-button ${
                        menuOpen
                            ? "menu-button--open"
                            : ""
                    }`}
                    aria-label={
                        menuOpen
                            ? "Navigatiemenu sluiten"
                            : "Navigatiemenu openen"
                    }
                    aria-expanded={menuOpen}
                    aria-controls="main-navigation"
                    onClick={() =>
                        setMenuOpen((current) => !current)
                    }
                >
                    <span className="menu-button__line" />
                    <span className="menu-button__line" />
                    <span className="menu-button__line" />
                </button>

                <Navigation
                    role={user.role}
                    isOpen={menuOpen}
                    onNavigate={handleNavigation}
                />

                {/* Account controls shown in the desktop header. */}
                <div className="site-header__account">
                    <span className="site-header__user-name">
                        {user.firstName}
                    </span>

                    <button
                        type="button"
                        className="site-header__logout"
                        onClick={handleLogout}
                    >
                        Uitloggen
                    </button>
                </div>

                {/* Account controls shown underneath the mobile navigation. */}
                <div
                    className={`site-header__mobile-account ${
                        menuOpen
                            ? "site-header__mobile-account--open"
                            : ""
                    }`}
                >
                    <span className="site-header__mobile-user-name">
                        {user.firstName}
                    </span>

                    <button
                        type="button"
                        className="site-header__mobile-logout"
                        onClick={handleLogout}
                    >
                        Uitloggen
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;