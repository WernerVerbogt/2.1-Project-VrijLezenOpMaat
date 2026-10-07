/**
 * Reusable application button.
 * Provides consistent styling and behavior across different pages.
 */

import type {
    ButtonHTMLAttributes,
    ReactNode,
} from 'react';

import './Button.css';

type ButtonVariant =
    | 'primary'
    | 'secondary';

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
}

export default function Button({
    children,
    variant = 'primary',
    className = '',
    ...buttonProps
}: ButtonProps) {
    return (
        <button
            className={
                `app-button app-button--${variant} ${className}`
            }
            {...buttonProps}
        >
            {children}
        </button>
    );
}