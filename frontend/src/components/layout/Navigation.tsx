// Navigation structure

import { NavLink } from "react-router-dom";
import type { UserRole } from "../../types/auth";

interface NavigationProps {
    role: UserRole;
    isOpen: boolean;
    onNavigate: () => void;
}

const studentLinks = [
    { path: "/student", label: "Home", end: true },
    { path: "/student/profile", label: "Mijn profiel"},
    { path: "/student/recommendations", label: "Advies"},
    { path: "/student/catalog", label: "Catalogus"},
    { path: "/student/reading-list", label: "Leeslijst"},
    { path: "/student/teacher", label: "Docent"}
];

const teacherLinks = [
    { path: "/teacher", label: "Home", end: true },
    { path: "/teacher/students", label: "Mijn studenten"},
];

export default function Navigation({
    role,
    isOpen,
    onNavigate,
}: NavigationProps) {
    const links = role === "student" ? studentLinks : teacherLinks;

  return (
    <nav
      id="main-navigation"
      className={`navigation ${isOpen ? "navigation--open" : ""}`}
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
                `navigation__link ${
                  isActive ? "navigation__link--active" : ""
                }`
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