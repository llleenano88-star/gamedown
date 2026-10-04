import Link from 'next/link';
import { db } from '@/lib/supabase-server';
import { getServices } from '@/lib/data';
import { STATUS_META } from '@/lib/status';
import { StatusDot } from '@/components/status-badge';

export const revalidate = 60;
export const metadata = {
  title: 'Горячее — на что жалуются сейчас',
  description: 'Рейтинг игр и сервисов по числу жалоб за последний час и история по часам за сутки.',
  alternates: { canonical: '/hot' },
};

type Row = { hour: string; service_id: string; cnt: number };
const MEDALS = ['🥇', '🥈', '🥉'];
const fmt = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });

export default async function Hot() {
  const [services, { data }] = await Promise.all([getServices(), db.rpc('hot_history', { hrs: 24 })]);
  const byId = new Map(services.map((s) => [s.id, s]));

  const hours = new Map<string, Row[]>();
  for (const r of (data ?? []) as Row[]) {
    const k = new Date(r.hour).toISOString();
    if (!hours.has(k)) hours.set(k, []);
    hours.get(k)!.push(r);
  }
  const history = [...hours.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([h, list]) => ({ h, top: list.sort((a, b) => b.cnt - a.cnt).slice(0, 3) }));

  const now = services.filter((s) => s.last_hour > 0).sort((a, b) => b.last_hour - a.last_hour).slice(0, 10);

  return (
    <div className="space-y-12 pt-4">
      <h1 className="text-2xl font-bold sm:text-4xl">🔥 Горячее: на что жалуются сейчас</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Топ за последний час</h2>
        {now.length === 0 && <p className="text-muted-foreground">Пока жалоб нет — всё спокойно.</p>}
        <ol className="space-y-2">
          {now.map((s, i) => (
            <li key={s.id}>
              <Link href={`/status/${s.slug}`} className="flex items-center justify-between rounded-xl border bg-card p-4 hover:bg-muted">
                <span className="flex items-center gap-3">
                  <span className="w-6 text-muted-foreground">{i + 1}</span>
                  <StatusDot status={s.status} />
                  <b>{s.name}</b>
                </span>
                <span className={STATUS_META[s.status].text}>{s.last_hour} жалоб/час</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">История по часам (МСК, 24 часа)</h2>
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr><th className="p-3">Час</th>{MEDALS.map((m) => <th key={m} className="p-3">{m}</th>)}</tr>
            </thead>
            <tbody>
              {history.map(({ h, top }) => (
                <tr key={h} className="border-t">
                  <td className="whitespace-nowrap p-3 text-muted-foreground">{fmt(h)}</td>
                  {[0, 1, 2].map((i) => {
                    const t = top[i], s = t && byId.get(t.service_id);
                    return (
                      <td key={i} className="p-3">
                        {s ? <Link href={`/status/${s.slug}`} className="hover:underline">{s.name} <span className="text-muted-foreground">({t.cnt})</span></Link> : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan={4} className="p-3 text-muted-foreground">Данных за сутки пока нет.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
