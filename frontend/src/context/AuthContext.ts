/**
 * Creates the global authentication context.
 *
 * The context itself is separated from AuthProvider.tsx
 * so React Fast Refresh can handle the provider component correctly.
 */

import { createContext } from 'react';

import type { AuthContextType } from './AuthContextType';

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined,
);