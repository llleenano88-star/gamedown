import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServiceData } from '@/lib/data';
import { STATUS_META } from '@/lib/status';
import { CITIES } from '@/lib/geo';
import { StatusDot } from './status-badge';
import { ReportForm } from './report-form';
import { ReportsChart } from './reports-chart';
import { RegionTable } from './region-table';
import { MyRegion } from './my-region';
import { Comments } from './comments';
import { DeviceBreakdown } from './device-breakdown';
import { JsonLd } from './json-ld';
import { TelegramLink } from './telegram-link';

const RussiaMap = dynamic(() => import('./russia-map'), { ssr: false });

type IntroArgs = { name: string; label: string; last15: number; total24: number; top?: string };

export async function ServiceView({ slug, path, problemTitle, heading, intro, extra }: {
  slug: string; path: string; problemTitle?: string; heading?: string; intro?: (d: IntroArgs) => string; extra?: React.ReactNode;
}) {
  const data = await getServiceData(slug);
  if (!data) notFound();
  const { service, hourly, rows, total24, dev, kinds, children } = data;
  const meta = STATUS_META[service.status];

  const byCity = new Map<string, number>();
  rows.forEach((r) => byCity.set(r.region, (byCity.get(r.region) ?? 0) + r.count));
  const points = CITIES.filter((c) => byCity.has(c.name)).map((c) => ({ ...c, count: byCity.get(c.name)! }));
  const top = [...byCity.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  const h2 = 'text-xl font-semibold';

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const url = base + path;
  const title = heading ?? `Статус ${service.name} сегодня`;
  const answer = `Сейчас статус ${service.name}: «${meta.label}». За последние 15 минут — ${service.last15} жалоб, за сутки — ${total24}.` +
    (top ? ` Больше всего жалоб из региона: ${top}.` : '');
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': url, url, name: title, inLanguage: 'ru', dateModified: new Date().toISOString(),
        isPartOf: { '@type': 'WebSite', name: 'GameDown', url: base } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: base },
        { '@type': 'ListItem', position: 2, name: service.name, item: `${base}/status/${service.slug}` },
        ...(problemTitle ? [{ '@type': 'ListItem', position: 3, name: problemTitle, item: url }] : []),
      ] },
      { '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: `Работает ли ${service.name} сегодня?`,
        acceptedAnswer: { '@type': 'Answer', text: answer } }] },
    ],
  };
  return (
    <div className="space-y-12">
      <JsonLd data={ld} />
      <section className="space-y-6 pt-4">
        <h1 className="text-2xl font-bold sm:text-4xl">{heading ?? `Статус ${service.name} сегодня`}</h1>
        <div className="flex items-center gap-4 rounded-3xl border bg-card p-6 sm:p-10">
          <StatusDot status={service.status} size="lg" />
          <div>
            <div className={`text-4xl font-extrabold sm:text-6xl ${meta.text}`}>{meta.label}</div>
            <div className="text-muted-foreground">{service.last15} жалоб за 15 минут</div>
          </div>
        </div>
        {intro && (
          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            {intro({ name: service.name, label: meta.label, last15: service.last15, total24, top })}
          </p>
        )}
        {extra}
        <ReportForm serviceId={service.id} serviceName={service.name} game={!service.geo_map} />
        <TelegramLink slug={service.slug} name={service.name} />
      </section>

      {children.length > 0 && (
        <section className="space-y-3">
          <h2 className={h2}>Отдельные игры</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {children.map((c) => (
              <Link key={c.id} href={`/status/${c.slug}`} className="flex items-center justify-between rounded-xl border bg-card p-4 hover:bg-muted">
                <span>{c.name}</span>
                <span className={STATUS_META[c.status].text}>{STATUS_META[c.status].label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3"><h2 className={h2}>Жалобы за 24 часа</h2><ReportsChart data={hourly} /></section>

      {service.geo_map ? (
        <>
          <section className="space-y-3"><h2 className={h2}>Карта сбоев</h2><RussiaMap points={points} /></section>
          <section className="space-y-3"><h2 className={h2}>Регионы и провайдеры</h2><RegionTable rows={rows} /></section>
          <section className="space-y-3"><h2 className={h2}>Это только у меня?</h2><MyRegion rows={rows} /></section>
        </>
      ) : (
        <section className="space-y-3"><h2 className={h2}>Кто жалуется</h2><DeviceBreakdown dev={dev} kinds={kinds} /></section>
      )}

      <section className="space-y-3"><h2 className={h2}>Комментарии</h2><Comments serviceId={service.id} /></section>
    </div>
  );
}
