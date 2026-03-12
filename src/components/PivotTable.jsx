import { useState, useMemo } from "react";

function isNumeric(val) {
  return val !== "" && val !== null && val !== undefined && !isNaN(Number(val));
}

const AGG_FNS = {
  Sum: (vals) => vals.reduce((a, b) => a + b, 0),
  Average: (vals) => vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
  Count: (vals) => vals.length,
  Max: (vals) => Math.max(...vals),
  Min: (vals) => Math.min(...vals),
};

export default function PivotTable({ rows }) {
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const numericCols = cols.filter((c) => rows.some((r) => isNumeric(r[c])));
  const categoryCols = cols.filter((c) => !numericCols.includes(c) || cols.length <= 2);

  const [rowField, setRowField] = useState(categoryCols[0] || cols[0] || "");
  const [colField, setColField] = useState(categoryCols[1] || "");
  const [valueField, setValueField] = useState(numericCols[0] || "");
  const [aggFn, setAggFn] = useState("Sum");

  const pivot = useMemo(() => {
    if (!rowField || !valueField) return { rowKeys: [], colKeys: [], cells: {} };

    const agg = AGG_FNS[aggFn];
    const buckets = {};
    const rowKeysSet = new Set();
    const colKeysSet = new Set();

    rows.forEach((r) => {
      const rk = String(r[rowField] ?? "(blank)");
      const ck = colField ? String(r[colField] ?? "(blank)") : "__total__";
      const v = Number(r[valueField]);
      if (isNaN(v)) return;

      rowKeysSet.add(rk);
      colKeysSet.add(ck);
      const key = `${rk}|||${ck}`;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(v);
    });

    const rowKeys = [...rowKeysSet].sort();
    const colKeys = [...colKeysSet].sort();
    const cells = {};
    for (const [k, vals] of Object.entries(buckets)) {
      cells[k] = agg(vals);
    }

    return { rowKeys, colKeys, cells };
  }, [rows, rowField, colField, valueField, aggFn]);

  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString("en-US", { maximumFractionDigits: 2 })
      : "";

  const colTotals = pivot.colKeys.map((ck) =>
    pivot.rowKeys.reduce((sum, rk) => sum + (pivot.cells[`${rk}|||${ck}`] || 0), 0)
  );
  const grandTotal = colTotals.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700">
        <h2 className="text-white font-semibold text-lg mb-4">🔀 Pivot Table</h2>
        <div className="flex flex-wrap gap-4">
          {/* Row field */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs uppercase tracking-wider">Row</label>
            <select
              value={rowField}
              onChange={(e) => setRowField(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500"
            >
              {cols.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Column field */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs uppercase tracking-wider">Column (optional)</label>
            <select
              value={colField}
              onChange={(e) => setColField(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500"
            >
              <option value="">— None —</option>
              {cols.filter((c) => c !== rowField).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Value field */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs uppercase tracking-wider">Value</label>
            <select
              value={valueField}
              onChange={(e) => setValueField(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500"
            >
              {numericCols.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Aggregation */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs uppercase tracking-wider">Aggregation</label>
            <select
              value={aggFn}
              onChange={(e) => setAggFn(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500"
            >
              {Object.keys(AGG_FNS).map((fn) => <option key={fn} value={fn}>{fn}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {pivot.rowKeys.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-10">No data to display. Check your field selections.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider border-b border-slate-700 whitespace-nowrap">
                  {rowField}
                </th>
                {pivot.colKeys.map((ck) => (
                  <th key={ck} className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider border-b border-slate-700 whitespace-nowrap">
                    {ck === "__total__" ? valueField : ck}
                  </th>
                ))}
                <th className="text-right px-4 py-3 text-emerald-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {pivot.rowKeys.map((rk, ri) => {
                const rowTotal = pivot.colKeys.reduce((sum, ck) => sum + (pivot.cells[`${rk}|||${ck}`] || 0), 0);
                return (
                  <tr key={rk} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">{rk}</td>
                    {pivot.colKeys.map((ck) => {
                      const val = pivot.cells[`${rk}|||${ck}`];
                      return (
                        <td key={ck} className="px-4 py-2.5 text-right text-emerald-400 font-mono whitespace-nowrap">
                          {val !== undefined ? fmt(val) : <span className="text-slate-600">—</span>}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2.5 text-right text-white font-semibold font-mono whitespace-nowrap">
                      {fmt(rowTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900/50 border-t-2 border-slate-600">
                <td className="px-4 py-3 text-emerald-400 font-semibold text-xs uppercase tracking-wider">Grand Total</td>
                {colTotals.map((t, i) => (
                  <td key={i} className="px-4 py-3 text-right text-white font-semibold font-mono">{fmt(t)}</td>
                ))}
                <td className="px-4 py-3 text-right text-emerald-400 font-bold font-mono">{fmt(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}