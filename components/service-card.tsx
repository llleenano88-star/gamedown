import Link from 'next/link';
import type { ServiceRow } from '@/lib/data';
import { STATUS_META } from '@/lib/status';
import { StatusDot } from './status-badge';

export function ServiceCard({ s }: { s: ServiceRow }) {
  return (
    <Link href={`/status/${s.slug}`}
      className="flex flex-col gap-4 rounded-2xl border bg-card p-5 transition hover:border-foreground/30">
      <div className="flex items-center gap-3">
        {s.logo_url
          ? <img src={s.logo_url} alt="" className="h-10 w-10 rounded-lg object-contain" />
          : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-bold">{s.name[0]}</div>}
        <span className="font-semibold">{s.name}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={`flex items-center gap-2 ${STATUS_META[s.status].text}`}>
          <StatusDot status={s.status} /> {STATUS_META[s.status].label}
        </span>
        <span className="text-muted-foreground">{s.last_hour} жалоб/час</span>
      </div>
    </Link>
  );
}
