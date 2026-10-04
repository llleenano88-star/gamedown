'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 pt-16 text-center">
      <h1 className="text-2xl font-bold">Что-то пошло не так</h1>
      <p className="text-muted-foreground">Проверьте подключение к базе данных и попробуйте ещё раз.</p>
      <button onClick={reset} className="rounded-md bg-foreground px-4 py-2 text-background">Повторить</button>
    </div>
  );
}
