import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="space-y-4 pt-16 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Такой страницы или сервиса нет.</p>
      <Link href="/" className="underline">На главную</Link>
    </div>
  );
}
