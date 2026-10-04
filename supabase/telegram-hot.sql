-- Выполнить после schema.sql и update.sql

-- История «горячих» по часам считается прямо из reports — снимки и cron не нужны
create or replace function hot_history(hrs int default 24)
returns table (hour timestamptz, service_id uuid, cnt int)
language sql stable as $$
  select date_trunc('hour', r.created_at), r.service_id, count(*)::int
  from reports r
  where r.created_at > now() - make_interval(hours => hrs)
  group by 1, 2
$$;

-- Telegram: подписки и последнее известное состояние статусов
create table if not exists tg_subscriptions (
  chat_id bigint not null,
  service_id uuid not null references services(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (chat_id, service_id)
);
create table if not exists status_state (
  service_id uuid primary key references services(id) on delete cascade,
  status text not null,
  updated_at timestamptz not null default now()
);
alter table tg_subscriptions enable row level security;  -- политик нет: доступ только через service role
alter table status_state enable row level security;
