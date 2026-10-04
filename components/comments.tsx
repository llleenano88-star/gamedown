'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type C = { id: string; text: string; nickname: string; created_at: string };

export function Comments({ serviceId }: { serviceId: string }) {
  const [items, setItems] = useState<C[]>([]);
  const [text, setText] = useState('');
  const [nick, setNick] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    supabase.from('comments').select('id,text,nickname,created_at')
      .eq('service_id', serviceId).order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => setItems((data as C[]) ?? []));

    const ch = supabase.channel(`comments:${serviceId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `service_id=eq.${serviceId}` },
        (p) => setItems((prev) => [p.new as C, ...prev]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [serviceId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch('/api/comments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: serviceId, text, nickname: nick }),
    });
    if (res.ok) setText(''); else setErr((await res.json()).error);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={send} className="flex flex-col gap-3 sm:flex-row">
        <Input value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Ник (необязательно)" className="sm:w-48" maxLength={24} />
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Что у вас происходит?" maxLength={500} required />
        <Button type="submit">Отправить</Button>
      </form>
      {err && <p className="text-sm text-red-500">{err}</p>}
      <ul className="space-y-3">
        {items.map((c) => (
          <li key={c.id} className="rounded-xl border bg-card p-4">
            <div className="mb-1 text-xs text-muted-foreground">{c.nickname} · {new Date(c.created_at).toLocaleString('ru-RU')}</div>
            <p className="whitespace-pre-wrap break-words">{c.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
