import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase-server';
import { getServices } from '@/lib/data';
import { STATUS_META } from '@/lib/status';
import { send, esc, EMOJI } from '@/lib/telegram';

export const dynamic = 'force-dynamic';
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? '';
const MAX_SUBS = 30;

const HELP = `<b>GameDown — уведомления о сбоях</b>

/list — все сервисы и их статус
/status <code>steam</code> — статус сервиса
/subscribe <code>steam</code> — уведомлять о сбоях
/unsubscribe <code>steam</code> — отписаться
/subs — мои подписки

Название сервиса — это slug из адреса страницы, например <code>roblox</code>, <code>brawl-stars</code>.`;

export async function POST(req: Request) {
  if (req.headers.get('x-telegram-bot-api-secret-token') !== process.env.TELEGRAM_WEBHOOK_SECRET)
    return new NextResponse('forbidden', { status: 403 });

  const msg = (await req.json().catch(() => null))?.message;
  if (!msg?.text) return NextResponse.json({ ok: true });

  const chat: number = msg.chat.id;
  const [raw, ...rest] = String(msg.text).trim().split(/\s+/);
  const cmd = raw.split('@')[0].toLowerCase();
  const arg = rest.join(' ').toLowerCase();

  const services = await getServices();
  const svc = services.find((s) => s.slug === arg || s.name.toLowerCase() === arg);

  async function subscribe(): Promise<string> {
    if (!svc) return 'Не нашёл такой сервис. Список: /list';
    const { count } = await db.from('tg_subscriptions').select('*', { count: 'exact', head: true }).eq('chat_id', chat);
    if ((count ?? 0) >= MAX_SUBS) return `Максимум ${MAX_SUBS} подписок.`;
    await db.from('tg_subscriptions').upsert({ chat_id: chat, service_id: svc.id }, { onConflict: 'chat_id,service_id' });
    return `✅ Подписка на <b>${esc(svc.name)}</b> оформлена. Напишу, если начнутся проблемы.`;
  }

  let text: string;
  switch (cmd) {
    case '/start':
      text = arg ? await subscribe() : HELP; // ссылка t.me/бот?start=steam подписывает сразу
      break;
    case '/list':
      text = services.filter((s) => !s.parent_id)
        .map((s) => `${EMOJI[s.status]} ${esc(s.name)} — <code>${s.slug}</code>`).join('\n');
      break;
    case '/status':
      text = svc
        ? `${EMOJI[svc.status]} <b>${esc(svc.name)}</b>: ${STATUS_META[svc.status].label}\nЖалоб за 15 минут: ${svc.last15}\n${SITE}/status/${svc.slug}`
        : 'Укажите сервис, например: /status steam';
      break;
    case '/subscribe':
      text = arg ? await subscribe() : 'Укажите сервис, например: /subscribe steam';
      break;
    case '/unsubscribe':
      if (!svc) { text = 'Укажите сервис, например: /unsubscribe steam'; break; }
      await db.from('tg_subscriptions').delete().eq('chat_id', chat).eq('service_id', svc.id);
      text = `Отписал от ${esc(svc.name)}.`;
      break;
    case '/subs': {
      const { data } = await db.from('tg_subscriptions').select('service_id').eq('chat_id', chat);
      const names = (data ?? []).map((r) => services.find((s) => s.id === r.service_id)?.name).filter(Boolean);
      text = names.length ? 'Ваши подписки:\n' + names.map((n) => `• ${esc(n!)}`).join('\n') : 'Подписок нет. Пример: /subscribe steam';
      break;
    }
    default:
      text = HELP;
  }
  await send(chat, text);
  return NextResponse.json({ ok: true });
}
