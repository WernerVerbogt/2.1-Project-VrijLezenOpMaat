/*
 * Role-based application navigation.
 * The navigation can also be expanded as a mobile menu by the Header component.
 */

import { NavLink } from "react-router-dom";
import type { UserRole } from "../../types/auth";

interface NavigationProps {
  role: UserRole;
  isOpen: boolean;
  onNavigate: () => void;
}

interface NavigationLink {
  label: string;
  path: string;
  end?: boolean;
}

const studentLinks: NavigationLink[] = [
    { path: "/student", label: "Home", end: true },
    { path: "/student/profile", label: "Mijn profiel"},
    { path: "/student/recommendations", label: "Advies"},
    { path: "/student/catalog", label: "Catalogus"},
    { path: "/student/reading-list", label: "Leeslijst"},
    { path: "/student/teacher", label: "Docent"}
];

const teacherLinks: NavigationLink[] = [
    { path: "/teacher", label: "Home", end: true },
    { path: "/teacher/students", label: "Mijn studenten"},
];

function Navigation({
    role,
    isOpen,
    onNavigate,
}: NavigationProps) {
    const links =
        role === "student"
            ? studentLinks
            : teacherLinks;

    return (
        <nav
            id="main-navigation"
            className={`navigation ${ isOpen ? "navigation--open" : "" }`}
            aria-label="Hoofdnavigatie"
        >
            <ul className="navigation__list">
                {links.map((link) => (
                    <li key={link.path}>
                        <NavLink
                            to={link.path}
                            end={link.end}
                            onClick={onNavigate}
                            className={({ isActive }) =>
                                [
                                    "navigation__link",
                                    isActive ? "navigation__link--active" : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                            }
                        >
                            {link.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default Navigation;