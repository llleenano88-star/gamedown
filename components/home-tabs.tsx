'use client';
import { useState } from 'react';
import type { ServiceRow } from '@/lib/data';
import { ServiceCard } from './service-card';

const TABS = [['platform', 'Платформы'], ['game', 'Игры'], ['service', 'Сервисы'], ['provider', 'Провайдеры']] as const;

export function HomeTabs({ services }: { services: ServiceRow[] }) {
  const [tab, setTab] = useState<string>('platform');
  const list = services
    .filter((s) => s.category === tab && !s.parent_id)
    .sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`whitespace-nowrap rounded-full border px-5 py-2 text-sm font-medium transition ${tab === k ? 'bg-foreground text-background' : 'hover:bg-muted'}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s) => <ServiceCard key={s.id} s={s} />)}
      </div>
    </div>
  );
}
