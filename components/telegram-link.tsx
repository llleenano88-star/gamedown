export function TelegramLink({ slug, name }: { slug: string; name: string }) {
  const bot = process.env.NEXT_PUBLIC_TG_BOT;
  if (!bot) return null;
  return (
    <a href={`https://t.me/${bot}?start=${slug}`} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted sm:ml-3">
      ✈️ Уведомлять о сбоях {name} в Telegram
    </a>
  );
}
