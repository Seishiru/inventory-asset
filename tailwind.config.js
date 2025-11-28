export default {
  content: [
    "./index.html",
    "./*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    // Include CSS so Tailwind processes rules referenced from plain CSS files
    "./styles/**/*.{css,ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)'
      },
    },
  },
};
 