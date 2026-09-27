// Simulates the backend temporarily to check if everything works as it should be

import type { AuthUser, LoginCredentials, RegisterData } from "../types/auth";

interface MockUser extends AuthUser {
    password: string;
}

const users: MockUser[] = [
    {
        id: 1,
        firstName: "Werner",
        lastName: "Verbogt",
        email: "werner.verbogt@mail.nl",
        password: "testww1234",
        role: "student",
    },
    {
        id: 2,
        firstName: "Docent",
        lastName: "Test",
        email: "testdocent@mail.nl",
        password: "Test1234",
        role: "teacher",
    },
];

export async function loginUser(credentials: LoginCredentials,): Promise<AuthUser> {
    const email = credentials.email.trim().toLowerCase();

    const user = users.find(
        (user) => user.email.toLowerCase() === email && user.password === credentials.password,
    );

    if (!user) {
        throw new Error("E-mailadres of wachtwoord is onjuist.");
    }

    const authUser: AuthUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
    };

    return authUser;
} 

export async function registerUser(data: RegisterData,): Promise<AuthUser> {
    const email = data.email.trim().toLowerCase();

    const emailExists = users.some((user) => user.email.toLowerCase() === email,);

    if (emailExists) {
        throw new Error("E-mail is al in gebruik.");
    }

    const newUser: MockUser = {
        id: users.length + 1,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email,
        password: data.password,
        role: data.role,
    };

    users.push(newUser);

    const authUser: AuthUser = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
    };
    
    return authUser;
}