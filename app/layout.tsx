import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'GameDown — сбои игровых сервисов в России', template: '%s | GameDown' },
  description: 'Статус Steam, PSN, Roblox, Discord и других сервисов в реальном времени. Карта сбоев по России.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
            <Link href="/" className="text-xl font-bold">Game<span className="text-red-500">Down</span></Link>
            <nav className="flex items-center gap-2"><Link href="/hot" className="text-sm hover:underline">🔥 Горячее</Link><ThemeToggle /></nav>
          </header>
          <main className="mx-auto max-w-6xl px-4 pb-24">{children}</main>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
