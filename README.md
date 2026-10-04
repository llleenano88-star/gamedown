# GameDown — мониторинг сбоев игровых сервисов (РФ)

Next.js 14 · Tailwind · Supabase · Vercel

## Запуск локально
1. Установите Node.js 20+.
2. Supabase: создайте проект, в SQL Editor выполните `supabase/schema.sql` (один файл, включает всё).
3. `cp .env.example .env.local` и заполните ключи (Supabase → Settings → API).
4. `npm install`
5. `npm run dev` → http://localhost:3000

Env-переменные должны быть заданы до `npm run build`: страницы генерируются с чтением из БД.

## Логотипы
Положите файлы в `public/logos/` и пропишите путь в `services.logo_url`
(например `update services set logo_url='/logos/steam.svg' where slug='steam';`).
Пока `logo_url` пуст, на карточке показывается первая буква названия.

## Деплой на Vercel
Импортируйте репозиторий, добавьте переменные из `.env.example`, Deploy.
Затем отправьте `/sitemap.xml` в Яндекс.Вебмастер и Google Search Console.

## Статус
Жалобы за 15 минут сравниваются со средним за неделю на одно 15-минутное окно:
> 3× — «Проблемы», > 10× — «Сбой». Минимум 5 жалоб, чтобы не ловить шум (`lib/status.ts`).

## Игры
Для сервисов с `geo_map = false` (Roblox, игры) вместо карты показывается разбивка
по устройствам и типам проблем; жалоба требует устройство, а не город/провайдера.

## Дополнительно
- `supabase/update.sql` — выполнить после `schema.sql`: пороги чувствительности (`services.min_reports`) и пути к логотипам.
- `supabase/demo-data.sql` — демо-жалобы, чтобы на локальном сайте были графики, «Сбой» у Roblox и т.д.
  Удалить: `delete from reports where ip_hash = 'demo';`
- Логотипы в `public/logos/` — заглушки-плитки; замените файлы на настоящие с тем же именем.
- Тесты логики статуса: `npm test`.
- Комментарии фильтруются от ссылок и рекламы (`lib/moderation.ts`).

## /hot, Telegram-бот, JSON-LD
1. Выполните в Supabase `supabase/telegram-hot.sql`.
2. `/hot` работает сразу: история по часам считается из таблицы `reports`.
3. Бот: создайте его у @BotFather, заполните `TELEGRAM_*`, `CRON_SECRET`, `NEXT_PUBLIC_TG_BOT` (локально и в Vercel), задеплойте, затем один раз зарегистрируйте webhook:
   `curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://ВАШ-ДОМЕН/api/telegram&secret_token=<TELEGRAM_WEBHOOK_SECRET>"`
   (webhook требует публичный HTTPS-адрес — на localhost не заработает; для теста используйте деплой на Vercel или ngrok).
4. Рассылка: GitHub Actions `.github/workflows/notify.yml` каждые 5 минут дёргает `/api/cron/notify`.
   Добавьте secrets репозитория `SITE_URL` и `CRON_SECRET`. (Альтернатива на Vercel Pro — `crons` в `vercel.json`.)
   Первый запуск только запоминает текущие статусы; уведомления идут при их изменении.
5. JSON-LD (WebSite, WebPage, BreadcrumbList, FAQPage) выводится автоматически на главной и страницах сервисов.
   Проверка: https://validator.schema.org
