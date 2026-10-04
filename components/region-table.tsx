type Row = { region: string; provider: string; count: number };

export function RegionTable({ rows }: { rows: Row[] }) {
  if (!rows.length) return <p className="text-muted-foreground">За последние 24 часа жалоб нет.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr><th className="p-3">Регион</th><th className="p-3">Провайдер</th><th className="p-3 text-right">Жалоб</th></tr>
        </thead>
        <tbody>
          {rows.slice(0, 30).map((r) => (
            <tr key={r.region + r.provider} className="border-t">
              <td className="p-3">{r.region}</td>
              <td className="p-3">{r.provider}</td>
              <td className="p-3 text-right font-semibold">{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
