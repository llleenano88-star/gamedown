export type Status = 'ok' | 'warn' | 'down';
const BUCKETS_PER_WEEK = 7 * 24 * 4; // 15-минутные окна в неделе

// Порог в 5 жалоб защищает от ложных срабатываний на тихих сервисах
export function calcStatus(last15: number, week: number, min = 5): Status {
  const avg = Math.max(week / BUCKETS_PER_WEEK, 0.5);
  if (last15 < min) return 'ok';
  if (last15 > avg * 10) return 'down';
  if (last15 > avg * 3) return 'warn';
  return 'ok';
}

export const STATUS_META = {
  ok:   { label: 'Работает', color: 'bg-emerald-500', text: 'text-emerald-500' },
  warn: { label: 'Проблемы', color: 'bg-amber-400',   text: 'text-amber-400' },
  down: { label: 'Сбой',     color: 'bg-red-500',     text: 'text-red-500' },
} as const;
