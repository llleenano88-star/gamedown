-- Демо-данные для локальной разработки. Удалить: delete from reports where ip_hash = 'demo';
-- Фон за 7 дней (больше у популярных сервисов)
insert into reports (service_id, region, provider, kind, device, created_at, ip_hash)
select s.id,
  case when s.geo_map then (array['Москва','Санкт-Петербург','Новосибирск','Екатеринбург','Казань','Краснодар'])[1 + floor(random()*6)::int] end,
  case when s.geo_map then (array['Ростелеком','МТС','Билайн','МегаФон','Дом.ру'])[1 + floor(random()*5)::int] end,
  (array['not_working','lag','no_login','crash','shop'])[1 + floor(random()*5)::int],
  case when not s.geo_map then (array['phone','phone','phone','pc','console'])[1 + floor(random()*5)::int] end,
  now() - random() * interval '7 days', 'demo'
from services s, generate_series(1, 1000) g
where s.parent_id is null and g <= 100 + s.priority * 8;

-- Всплески за последние 10 минут: Roblox — «Сбой», Brawl Stars — «Проблемы», PSN — «Сбой»
insert into reports (service_id, region, provider, kind, device, created_at, ip_hash)
select s.id,
  case when s.geo_map then (array['Москва','Санкт-Петербург','Казань'])[1 + floor(random()*3)::int] end,
  case when s.geo_map then (array['Ростелеком','МТС','Билайн'])[1 + floor(random()*3)::int] end,
  'not_working',
  case when not s.geo_map then (array['phone','phone','pc'])[1 + floor(random()*3)::int] end,
  now() - random() * interval '10 minutes', 'demo'
from services s
join (values ('roblox', 20), ('brawl-stars', 12), ('psn', 9)) v(slug, n) on v.slug = s.slug,
     generate_series(1, 30) g
where g <= v.n;
