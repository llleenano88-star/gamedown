import { STATUS_META, Status } from '@/lib/status';

export function StatusDot({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'lg' }) {
  const s = size === 'lg' ? 'h-6 w-6' : 'h-3 w-3';
  return <span className={`inline-block rounded-full ${s} ${STATUS_META[status].color} ${status !== 'ok' ? 'animate-pulse' : ''}`} />;
}
