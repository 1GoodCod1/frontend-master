import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{ts,tsx}',
        './src/components/**/*.{ts,tsx}',
        './src/app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
        './index.html',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "'Figtree'",
                    '-apple-system',
                    'BlinkMacSystemFont',
                    "'Segoe UI'",
                    'Roboto',
                    'sans-serif',
                ],
            },
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
                secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
                destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
                muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
                accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
                popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
                card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
                cta: { DEFAULT: 'hsl(var(--cta))', foreground: 'hsl(var(--cta-foreground))' },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
                'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
                'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
                'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
                'slide-in-from-top-2': { from: { transform: 'translateY(-0.5rem)' }, to: { transform: 'translateY(0)' } },
                'slide-in-from-bottom-2': { from: { transform: 'translateY(0.5rem)' }, to: { transform: 'translateY(0)' } },
                favoritePulse: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.4)', boxShadow: '0 0 20px rgba(220, 20, 60, 0.7)' },
                    '100%': { transform: 'scale(1.1)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                'accordion-up': 'accordion-up 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                'fade-in': 'fade-in 0.3s ease-out',
                'fade-out': 'fade-out 0.3s ease-out',
                'favorite-pulse': 'favoritePulse 0.6s ease-in-out',
            },
        },
    },
};

export default config;
