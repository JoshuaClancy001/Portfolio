import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1a1a',
        foreground: '#f5f5f0',
        secondary: '#2a2a2a',
        border: '#2a2a2a',
        'muted-foreground': '#a0a0a0',
        accent: '#ff6b35',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
