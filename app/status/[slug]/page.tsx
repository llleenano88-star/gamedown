import type { Metadata } from 'next';
import { ServiceView } from '@/components/service-view';
import { getServices } from '@/lib/data';

export const revalidate = 30;

export async function generateStaticParams() {
  try { return (await getServices()).map((s) => ({ slug: s.slug })); } catch { return []; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = (await getServices()).find((x) => x.slug === params.slug);
  if (!s) return {};
  return {
    title: `${s.name} — статус и сбои сегодня`,
    description: `Работает ли ${s.name} прямо сейчас? Отчёты пользователей и статистика сбоев.`,
    alternates: { canonical: `/status/${s.slug}` },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ServiceView slug={params.slug} path={`/status/${params.slug}`} />;
}
