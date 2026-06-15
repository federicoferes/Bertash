import * as React from 'react';

// Botón mínimo self-contained (sin radix/cva/@lib) para el bundle del canvas.
type Variant = 'default' | 'outline' | 'ghost';

const VARIANTS: Record<Variant, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-border bg-transparent hover:bg-accent/50',
    ghost: 'bg-transparent hover:bg-accent/50',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'default', ...props }, ref) => (
        <button
            ref={ref}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${className}`}
            {...props}
        />
    )
);
Button.displayName = 'Button';
