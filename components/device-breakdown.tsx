import { KIND_LABEL, Kind } from '@/lib/problems';

const DEV: Record<string, string> = { phone: 'Телефон', pc: 'ПК', console: 'Консоль' };

function Bars({ title, items }: { title: string; items: [string, number][] }) {
  const max = Math.max(1, ...items.map(([, n]) => n));
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5">
      <h3 className="font-semibold">{title}</h3>
      {items.length === 0 && <p className="text-sm text-muted-foreground">Жалоб за 24 часа нет.</p>}
      {items.map(([label, n]) => (
        <div key={label} className="space-y-1">
          <div className="flex justify-between text-sm"><span>{label}</span><b>{n}</b></div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-red-500" style={{ width: `${(n / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DeviceBreakdown({ dev, kinds }: { dev: Record<string, number>; kinds: Record<string, number> }) {
  const sort = (o: Record<string, number>, map: (k: string) => string) =>
    Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) => [map(k), n] as [string, number]);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Bars title="По устройствам" items={sort(dev, (k) => DEV[k] ?? k)} />
      <Bars title="По типу проблемы" items={sort(kinds, (k) => KIND_LABEL[k as Kind] ?? k)} />
    </div>
  );
}
