import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/supabase-server';
import { CITIES, PROVIDERS } from '@/lib/geo';
import { ipHash } from '@/lib/ip';

const schema = z.object({
  service_id: z.string().uuid(),
  kind: z.enum(['not_working', 'lag', 'no_login', 'crash', 'shop']),
  region: z.string().refine((v) => CITIES.some((c) => c.name === v)).optional(),
  provider: z.string().refine((v) => PROVIDERS.includes(v)).optional(),
  device: z.enum(['phone', 'pc', 'console']).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
  const { service_id, kind, region, provider, device } = parsed.data;

  const { data: svc } = await db.from('services').select('geo_map').eq('id', service_id).single();
  if (!svc) return NextResponse.json({ error: 'Сервис не найден' }, { status: 404 });
  if (svc.geo_map && (!region || !provider))
    return NextResponse.json({ error: 'Укажите город и провайдера' }, { status: 400 });
  if (!svc.geo_map && !device)
    return NextResponse.json({ error: 'Укажите устройство' }, { status: 400 });

  const hash = ipHash(req);
  const since = new Date(Date.now() - 5 * 60_000).toISOString();
  const { data: recent } = await db.from('reports').select('id').eq('ip_hash', hash).gte('created_at', since).limit(1);
  if (recent?.length) return NextResponse.json({ error: 'Можно отправлять раз в 5 минут' }, { status: 429 });

  const { error } = await db.from('reports').insert({
    service_id, kind, region: region ?? null, provider: provider ?? null, device: device ?? null, ip_hash: hash,
  });
  if (error) return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
