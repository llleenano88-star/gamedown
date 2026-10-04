const BAD = ['казино', 'ставки', '1xbet', 'заработок', 'крипт', 'продам', 'куплю', 'подпишись', 'накрутк'];

export function isSpam(text: string): boolean {
  const t = text.toLowerCase();
  if (/(https?:\/\/|www\.|t\.me|[a-z0-9-]+\.(ru|com|org|net|io|me|xyz|рф)\b|@\w{3,})/i.test(t)) return true;
  if (BAD.some((w) => t.includes(w))) return true;
  if (/(.)\1{9,}/.test(t)) return true;
  const letters = text.replace(/[^A-Za-zА-Яа-яЁё]/g, '');
  const upper = letters.replace(/[^A-ZА-ЯЁ]/g, '');
  return letters.length > 12 && upper.length / letters.length > 0.7;
}
