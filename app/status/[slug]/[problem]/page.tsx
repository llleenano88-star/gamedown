import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceView } from '@/components/service-view';
import { getServices } from '@/lib/data';
import { problemsFor, headline, subject } from '@/lib/problems';
import { STATUS_META } from '@/lib/status';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const svcs = await getServices();
    return svcs.flatMap((s) => Object.keys(problemsFor(s.slug)).map((problem) => ({ slug: s.slug, problem })));
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: { slug: string; problem: string } }): Promise<Metadata> {
  const s = (await getServices()).find((x) => x.slug === params.slug);
  const p = problemsFor(params.slug)[params.problem];
  if (!s || !p) return {};
  return {
    title: headline(s.name, p),
    description: `${subject(s.name, p)}? Проверьте статус в реальном времени и отчёты пользователей.`,
    alternates: { canonical: `/status/${s.slug}/${params.problem}` },
  };
}

export default async function Page({ params }: { params: { slug: string; problem: string } }) {
  const p = problemsFor(params.slug)[params.problem];
  const all = await getServices();
  const s = all.find((x) => x.slug === params.slug);
  if (!p || !s) notFound();

  const child = p.child ? all.find((x) => x.slug === p.child) : null;
  const extra = child && (
    <p className="rounded-xl border bg-card p-4">
      Статус {child.name} сейчас:{' '}
      <b className={STATUS_META[child.status].text}>{STATUS_META[child.status].label}</b>{' '}
      ({child.last15} жалоб за 15 минут). Игра может лежать отдельно от основного сайта.
    </p>
  );

  return (
    <ServiceView
      slug={params.slug}
      path={`/status/${params.slug}/${params.problem}`}
      problemTitle={headline(s.name, p)}
      heading={headline(s.name, p)}
      extra={extra}
      intro={({ name, label, last15, total24, top }) =>
        `Пользователи сообщают о проблеме: ${subject(name, p)}. Сейчас статус ${name}: «${label}». ` +
        `За последние 15 минут отправлено ${last15} жалоб, за сутки — ${total24}. ` +
        (top ? `Больше всего жалоб приходит из региона: ${top}. ` : 'Массовых жалоб по регионам пока нет. ') +
        'Если проблема только у вас, возможна неполадка у провайдера или на вашем устройстве.'}
    />
  );
}
