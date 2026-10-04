create extension if not exists pgcrypto;

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  logo_url text,
  category text not null default 'platform' check (category in ('platform','game','service','provider')),
  parent_id uuid references services(id),
  priority int not null default 0,
  geo_map boolean not null default true   -- false = разбивка по устройствам вместо карты
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  region text,
  provider text,
  kind text not null default 'not_working' check (kind in ('not_working','lag','no_login','crash','shop')),
  device text check (device in ('phone','pc','console')),
  created_at timestamptz not null default now(),
  ip_hash text not null
);
create index on reports (service_id, created_at desc);
create index on reports (ip_hash, created_at desc);

create table comments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 500),
  created_at timestamptz not null default now(),
  nickname text not null default 'Аноним',
  ip_hash text
);
create index on comments (service_id, created_at desc);

alter table services enable row level security;
alter table reports enable row level security;
alter table comments enable row level security;
create policy "read services" on services for select using (true);
create policy "read comments" on comments for select using (true);

alter publication supabase_realtime add table comments;

create or replace function services_stats()
returns table (service_id uuid, last15 int, last_hour int, week int)
language sql stable as $$
  select s.id,
    count(r.id) filter (where r.created_at > now() - interval '15 minutes')::int,
    count(r.id) filter (where r.created_at > now() - interval '1 hour')::int,
    count(r.id)::int
  from services s
  left join reports r on r.service_id = s.id and r.created_at > now() - interval '7 days'
  group by s.id
$$;

insert into services (slug, name, category, priority, geo_map) values
 ('roblox','Roblox','platform',100,false),
 ('steam','Steam','platform',50,true),
 ('psn','PlayStation Network','platform',40,true),
 ('xbox','Xbox Live','platform',30,true),
 ('epic','Epic Games Store','platform',20,true),
 ('battlenet','Battle.net','platform',10,true),
 ('ea','EA App','platform',5,true),
 ('brawl-stars','Brawl Stars','game',90,false),
 ('standoff-2','Standoff 2','game',80,false),
 ('minecraft','Minecraft','game',70,false),
 ('genshin','Genshin Impact','game',60,false),
 ('pubg-mobile','PUBG Mobile','game',50,false),
 ('fortnite','Fortnite','game',40,false),
 ('dota-2','Dota 2','game',30,false),
 ('cs2','CS2','game',30,false),
 ('discord','Discord','service',50,true),
 ('twitch','Twitch','service',40,true),
 ('youtube-gaming','YouTube Gaming','service',30,true),
 ('plati','Plati.market','service',0,true),
 ('kinguin','Kinguin','service',0,true),
 ('g2a','G2A','service',0,true),
 ('rostelecom','Ростелеком','provider',0,true),
 ('mts','МТС','provider',0,true),
 ('beeline','Билайн','provider',0,true),
 ('megafon','МегаФон','provider',0,true);

insert into services (slug, name, category, geo_map, parent_id)
select v.slug, v.name, 'game', false, (select id from services where slug = 'roblox')
from (values ('adopt-me','Adopt Me'), ('brookhaven','Brookhaven')) as v(slug, name);
