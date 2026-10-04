'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { CITIES, PROVIDERS } from '@/lib/geo';

type Row = { region: string; provider: string; count: number };

export function MyRegion({ rows }: { rows: Row[] }) {
  const [city, setCity] = useState('');
  const [provider, setProvider] = useState('');
  const inCity = rows.filter((r) => r.region === city);
  const cityTotal = inCity.reduce((a, r) => a + r.count, 0);
  const both = inCity.filter((r) => !provider || r.provider === provider).reduce((a, r) => a + r.count, 0);

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Input list="my-cities" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ваш город" />
          <datalist id="my-cities">{CITIES.map((c) => <option key={c.name} value={c.name} />)}</datalist>
        </div>
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
          <option value="">Любой провайдер</option>
          {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      {city && (
        <p className="text-lg">
          {both > 0
            ? <>За 24 часа в регионе <b>{city}</b>{provider && <> у провайдера <b>{provider}</b></>} — <b>{both}</b> жалоб (всего по городу: {cityTotal}). Вы не одиноки.</>
            : <>В регионе <b>{city}</b> жалоб почти нет — вероятно, проблема на вашей стороне.</>}
        </p>
      )}
    </div>
  );
}
