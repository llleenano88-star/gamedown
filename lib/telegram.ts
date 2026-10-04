import { db } from './supabase-server';

export const EMOJI = { ok: '🟢', warn: '🟡', down: '🔴' } as const;
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function send(chat_id: number, text: string): Promise<boolean> {
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  if (res.status === 403) await db.from('tg_subscriptions').delete().eq('chat_id', chat_id); // бот заблокирован
  return res.ok;
}
