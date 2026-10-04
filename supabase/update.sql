-- Выполнить ПОСЛЕ schema.sql (на новой и на уже созданной базе)
alter table services add column if not exists min_reports int not null default 5;
update services set min_reports = 15 where slug = 'roblox';
update services set min_reports = 10 where slug in ('brawl-stars','standoff-2','minecraft','discord','steam');
update services set logo_url = '/logos/' || slug || '.svg';
