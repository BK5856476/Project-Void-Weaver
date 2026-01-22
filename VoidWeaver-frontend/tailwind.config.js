/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // Void Weaver Color Palette
                'void': {
                    bg: '#09090b',
                    darker: '#0E1117',
                    text: '#e4e4e7',
                    'text-dim': '#a1a1aa',
                },
                'neon': {
                    cyan: '#06b6d4',
                    'cyan-glow': '#22d3ee',
                    purple: '#a855f7',
                    'purple-glow': '#c084fc',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-neon': 'linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)',
            },
            animation: {
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            },
            keyframes: {
                'glow-pulse': {
                    '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px currentColor)' },
                    '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 12px currentColor)' },
                },
            },
        },
    },
    plugins: [],
}
