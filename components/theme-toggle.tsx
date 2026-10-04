'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Button variant="ghost" size="sm" aria-label="Сменить тему"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {mounted ? (theme === 'dark' ? '☀️ Светлая' : '🌙 Тёмная') : null}
    </Button>
  );
}