import { createHash } from 'crypto';

export function ipHash(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  return createHash('sha256').update(ip + (process.env.IP_SALT ?? '')).digest('hex');
}
