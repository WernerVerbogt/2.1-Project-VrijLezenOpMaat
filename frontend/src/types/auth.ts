// This application contains 2 roles: student role and teacher role.
// Each have their own environment in the application

export type UserRole = "student" | "teacher";

// Each student has an own unique email
// No password through the frontend!

export interface AuthUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface LoginCredentials {
    email: string;
    password: string;
}