export type Kind = 'not_working' | 'lag' | 'no_login' | 'crash' | 'shop';
export type Problem = { title: string; phrase: string; kind?: Kind; child?: string; own?: boolean };

export const KIND_LABEL: Record<Kind, string> = {
  not_working: 'Не работает', lag: 'Лагает', no_login: 'Не заходит',
  crash: 'Вылетает', shop: 'Не работает магазин',
};

const GENERIC: Record<string, Problem> = {
  'not-working': { title: 'не работает сегодня', phrase: 'не работает' },
  'login-error': { title: 'ошибка входа', phrase: 'не пускает в аккаунт', kind: 'no_login' },
  'lag':         { title: 'лагает', phrase: 'лагает', kind: 'lag' },
};

const conn: Problem = { title: 'ошибка подключения', phrase: 'выдаёт ошибку подключения' };

// own: true — у проблемы собственный подлежащий в title/phrase (без имени сервиса впереди)
const EXTRA: Record<string, Record<string, Problem>> = {
  roblox: {
    'robux-not-working':      { title: 'Robux не покупается', phrase: 'не покупаются Robux', kind: 'shop', own: true },
    'adopt-me-not-working':   { title: 'Adopt Me не работает', phrase: 'не работает Adopt Me', child: 'adopt-me', own: true },
    'brookhaven-not-working': { title: 'Brookhaven не работает', phrase: 'не работает Brookhaven', child: 'brookhaven', own: true },
  },
  steam: { 'connection-error': conn },
  psn: { 'connection-error': conn },
  discord: { 'voice-not-working': { title: 'не работает голосовой чат', phrase: 'не работает голосовой чат' } },
  'brawl-stars': { crash: { title: 'вылетает', phrase: 'вылетает', kind: 'crash' } },
};

export const problemsFor = (slug: string): Record<string, Problem> => ({ ...GENERIC, ...(EXTRA[slug] ?? {}) });

export const headline = (name: string, p: Problem) =>
  p.own ? `${p.title} — статус ${name} сегодня` : `${name} ${p.title} — статус и карта сбоев`;

export const subject = (name: string, p: Problem) => (p.own ? p.title : `${name} ${p.phrase}`);
