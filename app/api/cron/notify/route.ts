import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase-server';
import { getServices } from '@/lib/data';
import { STATUS_META } from '@/lib/status';
import { send, esc, EMOJI } from '@/lib/telegram';

export const dynamic = 'force-dynamic';
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? '';

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return new NextResponse('forbidden', { status: 403 });

  const services = await getServices();
  const { data: states } = await db.from('status_state').select('service_id,status');
  const prev = new Map((states ?? []).map((r) => [r.service_id, r.status as string]));
  let sent = 0;

  for (const s of services) {
    const before = prev.get(s.id);
    if (before === s.status) continue;
    await db.from('status_state').upsert({ service_id: s.id, status: s.status, updated_at: new Date().toISOString() });
    if (!before) continue; // первый запуск: только запоминаем, без рассылки

    const { data: subs } = await db.from('tg_subscriptions').select('chat_id').eq('service_id', s.id);
    const text = s.status === 'ok'
      ? `🟢 <b>${esc(s.name)}</b> снова работает.\n${SITE}/status/${s.slug}`
      : `${EMOJI[s.status]} <b>${esc(s.name)}</b>: ${STATUS_META[s.status].label.toLowerCase()}!\nЖалоб за 15 минут: ${s.last15}\n${SITE}/status/${s.slug}`;

    const chats = (subs ?? []).map((r) => Number(r.chat_id));
    for (let i = 0; i < chats.length; i += 20) { // лимит Telegram ~30 сообщений/сек
      const res = await Promise.all(chats.slice(i, i + 20).map((c) => send(c, text)));
      sent += res.filter(Boolean).length;
      if (i + 20 < chats.length) await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return NextResponse.json({ ok: true, sent });
}
