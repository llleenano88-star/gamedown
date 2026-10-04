import { db } from './supabase-server';
import { calcStatus, Status } from './status';

export type ServiceRow = {
  id: string; slug: string; name: string; logo_url: string | null; category: string;
  parent_id: string | null; priority: number; geo_map: boolean;
  last15: number; last_hour: number; status: Status;
};

export async function getServices(): Promise<ServiceRow[]> {
  const [{ data: svcs }, { data: stats }] = await Promise.all([
    db.from('services').select('*').order('name'),
    db.rpc('services_stats'),
  ]);
  return (svcs ?? []).map((s: any) => {
    const st = stats?.find((x: any) => x.service_id === s.id);
    const last15 = st?.last15 ?? 0;
    return { ...s, last15, last_hour: st?.last_hour ?? 0, status: calcStatus(last15, st?.week ?? 0, s.min_reports ?? 5) };
  });
}

export async function getServiceData(slug: string) {
  const all = await getServices();
  const service = all.find((s) => s.slug === slug);
  if (!service) return null;

  const since = new Date(Date.now() - 864e5).toISOString();
  const { data: reps } = await db.from('reports')
    .select('region,provider,created_at,kind,device')
    .eq('service_id', service.id).gte('created_at', since).limit(10000);

  const now = Date.now();
  const hourly = Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now - (23 - i) * 36e5);
    return { label: `${String(t.getHours()).padStart(2, '0')}:00`, count: 0 };
  });
  const map = new Map<string, { region: string; provider: string; count: number }>();
  const dev: Record<string, number> = {};
  const kinds: Record<string, number> = {};

  for (const r of reps ?? []) {
    const idx = 23 - Math.floor((now - new Date(r.created_at).getTime()) / 36e5);
    if (hourly[idx]) hourly[idx].count++;
    if (r.region && r.provider) {
      const k = `${r.region}|${r.provider}`;
      const row = map.get(k) ?? { region: r.region, provider: r.provider, count: 0 };
      row.count++; map.set(k, row);
    }
    if (r.device) dev[r.device] = (dev[r.device] ?? 0) + 1;
    kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
  }
  const rows = [...map.values()].sort((a, b) => b.count - a.count);
  const children = all.filter((s) => s.parent_id === service.id);
  return { service, hourly, rows, total24: reps?.length ?? 0, dev, kinds, children };
}
