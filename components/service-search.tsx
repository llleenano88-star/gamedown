'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

export function ServiceSearch({ items }: { items: { slug: string; name: string }[] }) {
  const [q, setQ] = useState('');
  const router = useRouter();
  const res = q ? items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  return (
    <div className="relative mx-auto w-full max-w-xl text-left">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти сервис или игру…" className="h-12 rounded-xl text-base" />
      {res.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border bg-card shadow-lg">
          {res.map((r) => (
            <li key={r.slug}>
              <button className="w-full px-4 py-3 text-left hover:bg-muted" onClick={() => router.push(`/status/${r.slug}`)}>
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
