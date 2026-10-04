'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CITIES, PROVIDERS } from '@/lib/geo';
import { KIND_LABEL, Kind } from '@/lib/problems';

const sel = 'h-10 rounded-md border bg-background px-3 text-sm';

export function ReportForm({ serviceId, serviceName, game }: { serviceId: string; serviceName: string; game: boolean }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>('not_working');
  const [city, setCity] = useState('');
  const [provider, setProvider] = useState('');
  const [device, setDevice] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/reports', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: serviceId, kind, ...(game ? { device } : { region: city, provider }) }),
    });
    const j = await res.json();
    setMsg({ ok: res.ok, text: res.ok ? 'Спасибо! Жалоба отправлена.' : j.error });
    setLoading(false);
  }

  if (!open)
    return <Button size="lg" className="h-14 w-full text-lg sm:w-auto" onClick={() => setOpen(true)}>Сообщить о проблеме с {serviceName}</Button>;

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-4">
      <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} className={sel}>
        {Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      {game ? (
        <select value={device} onChange={(e) => setDevice(e.target.value)} required className={sel + ' sm:col-span-2'}>
          <option value="">Устройство</option>
          <option value="phone">Телефон</option>
          <option value="pc">ПК</option>
          <option value="console">Консоль</option>
        </select>
      ) : (
        <>
          <div>
            <Input list="cities" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Город" required />
            <datalist id="cities">{CITIES.map((c) => <option key={c.name} value={c.name} />)}</datalist>
          </div>
          <select value={provider} onChange={(e) => setProvider(e.target.value)} required className={sel}>
            <option value="">Провайдер</option>
            {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </>
      )}
      <Button type="submit" disabled={loading}>{loading ? 'Отправка…' : 'Отправить'}</Button>
      {msg && <p className={`text-sm sm:col-span-4 ${msg.ok ? 'text-emerald-500' : 'text-red-500'}`}>{msg.text}</p>}
    </form>
  );
}
