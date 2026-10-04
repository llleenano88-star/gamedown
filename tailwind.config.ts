import type { Config } from 'tailwindcss';
const c = (v: string) => `hsl(var(--${v}))`;
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: {
    background: c('background'), foreground: c('foreground'), card: c('card'),
    muted: c('muted'), 'muted-foreground': c('muted-foreground'), border: c('border'),
  } } },
  plugins: [],
};
export default config;
