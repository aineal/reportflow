import { useState, useMemo } from "react";

function isNumeric(val) {
  return val !== "" && val !== null && !isNaN(Number(val));
}

export default function DataTable({ rows }) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 15;

  const cols = rows.length ? Object.keys(rows[0]) : [];

  const filtered = useMemo(() => {
    if (!search) return rows;
    return rows.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
    );
  }, [rows, search]);

  const total = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const fmt = (val) => {
    if (isNumeric(val) && val !== "") {
      const n = Number(val);
      return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
    }
    return val;
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 flex-wrap gap-3">
        <h2 className="text-white font-semibold text-lg">📋 Data Table</h2>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search..."
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors w-48"
          />
          <span className="text-slate-400 text-xs">{filtered.length} rows</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900/50">
              {cols.map((c) => (
                <th key={c} className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider whitespace-nowrap border-b border-slate-700">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                {cols.map((c) => (
                  <td key={c} className={`px-4 py-2.5 whitespace-nowrap ${isNumeric(row[c]) ? "text-emerald-400 font-mono text-right" : "text-slate-300"}`}>
                    {fmt(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="text-slate-400 hover:text-white disabled:opacity-30 text-sm transition-colors">← Prev</button>
          <span className="text-slate-400 text-xs">Page {page + 1} of {total}</span>
          <button disabled={page >= total - 1} onClick={() => setPage(p => p + 1)} className="text-slate-400 hover:text-white disabled:opacity-30 text-sm transition-colors">Next →</button>
        </div>
      )}
    </div>
  );
}