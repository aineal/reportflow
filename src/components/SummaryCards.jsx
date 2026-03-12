import { useMemo } from "react";

function isNumeric(val) {
  return val !== "" && val !== null && !isNaN(Number(val));
}

export default function SummaryCards({ rows }) {
  const stats = useMemo(() => {
    if (!rows.length) return [];
    const numericCols = Object.keys(rows[0]).filter((k) =>
      rows.some((r) => isNumeric(r[k]))
    );
    return numericCols.slice(0, 4).map((col) => {
      const vals = rows.map((r) => Number(r[col])).filter((v) => !isNaN(v));
      const total = vals.reduce((a, b) => a + b, 0);
      const avg = vals.length ? total / vals.length : 0;
      const max = Math.max(...vals);
      return { col, total, avg, max, count: vals.length };
    });
  }, [rows]);

  if (!stats.length) return null;

  const fmt = (n) =>
    Math.abs(n) >= 1000
      ? n.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.col} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1 truncate">{s.col}</p>
          <p className="text-white text-2xl font-bold">{fmt(s.total)}</p>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Avg: {fmt(s.avg)}</span>
            <span>Max: {fmt(s.max)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}