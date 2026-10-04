import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/supabase-server';
import { ipHash } from '@/lib/ip';
import { isSpam } from '@/lib/moderation';

const schema = z.object({
  service_id: z.string().uuid(),
  text: z.string().trim().min(1).max(500),
  nickname: z.string().trim().max(24).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });

  if (isSpam(parsed.data.text) || isSpam(parsed.data.nickname ?? ''))
    return NextResponse.json({ error: 'Сообщение похоже на спам (ссылки и реклама запрещены)' }, { status: 422 });

  const hash = ipHash(req);
  const since = new Date(Date.now() - 30_000).toISOString();
  const { data: recent } = await db.from('comments').select('id').eq('ip_hash', hash).gte('created_at', since).limit(1);
  if (recent?.length) return NextResponse.json({ error: 'Слишком часто, подождите немного' }, { status: 429 });

  const { error } = await db.from('comments').insert({
    ...parsed.data, nickname: parsed.data.nickname || 'Аноним', ip_hash: hash,
  });
  if (error) return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
