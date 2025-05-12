// tailwind.config.js
module.exports = {
    content: [
        './src/**/*.{html,js,svelte,ts}'
    ],
    theme: {
        extend: {
            colors: {
                darkest: '#0a0a0a',
                darker: '#121212',
                dark: '#1c1c1c',
                'mid-dark': '#242424',
                highlight: '#ff7b24', // Vibrant Orange
                'highlight-semi': '#ff6a0630', // Vibrant Orange (semi-transparent)
            },
        },
    },
    plugins: [],
};
