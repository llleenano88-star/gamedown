import { getServices } from '@/lib/data';
import { ServiceCard } from '@/components/service-card';
import { ServiceSearch } from '@/components/service-search';
import { HomeTabs } from '@/components/home-tabs';
import { JsonLd } from '@/components/json-ld';

export const revalidate = 30;

export default async function Home() {
  const services = await getServices();
  const top = services.filter((s) => !s.parent_id);
  const hotGames = top
    .filter((s) => s.category === 'game' || s.slug === 'roblox')
    .filter((s) => s.last15 > 0)
    .sort((a, b) => b.last15 - a.last15)
    .slice(0, 3);

  return (
    <div className="space-y-16">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'WebSite', name: 'GameDown', url: process.env.NEXT_PUBLIC_SITE_URL, inLanguage: 'ru',
            description: 'Мониторинг сбоев игровых сервисов в России' },
          { '@type': 'Organization', name: 'GameDown', url: process.env.NEXT_PUBLIC_SITE_URL },
        ],
      }} />
      <section className="space-y-6 pt-8 text-center">
        <h1 className="text-3xl font-bold sm:text-5xl">Не работает игра или сервис?</h1>
        <p className="text-muted-foreground">Сбои игр и платформ в России — в реальном времени</p>
        <ServiceSearch items={services.map(({ slug, name }) => ({ slug, name }))} />
      </section>

      {hotGames.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">🔥 Сейчас больше всего жалуются на…</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {hotGames.map((s) => <ServiceCard key={s.id} s={s} />)}
          </div>
        </section>
      )}

      <HomeTabs services={services} />
    </div>
  );
}
