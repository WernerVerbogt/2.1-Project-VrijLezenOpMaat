/**
 * Provides easy access to the global authentication context.
 *
 * Components should use this hook instead of using
 * AuthContext directly.
 */

import { useContext } from 'react';

import { AuthContext } from './AuthContext';

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used within AuthProvider!',
        );
    }

    return context;
}