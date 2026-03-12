import { useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

function isNumeric(val) {
  return val !== "" && val !== null && !isNaN(Number(val));
}

export default function ChartPanel({ rows }) {
  const [chartType, setChartType] = useState("bar");

  const { labelCol, numericCols, chartData } = useMemo(() => {
    if (!rows.length) return { labelCol: "", numericCols: [], chartData: [] };
    const cols = Object.keys(rows[0]);
    const label = cols.find((c) => rows.some((r) => !isNumeric(r[c]) && r[c])) || cols[0];
    const numeric = cols.filter((c) => c !== label && rows.some((r) => isNumeric(r[c]))).slice(0, 4);
    const data = rows.slice(0, 20).map((r) => {
      const obj = { name: String(r[label]).slice(0, 18) };
      numeric.forEach((c) => { obj[c] = Number(r[c]) || 0; });
      return obj;
    });
    return { labelCol: label, numericCols: numeric, chartData: data };
  }, [rows]);

  if (!numericCols.length) return null;

  const types = ["bar", "line", "pie"];

  const renderChart = () => {
    if (chartType === "line") return (
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
        <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
        <Legend />
        {numericCols.map((c, i) => <Line key={c} type="monotone" dataKey={c} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />)}
      </LineChart>
    );

    if (chartType === "pie") {
      const pieData = chartData.slice(0, 8).map((d) => ({ name: d.name, value: d[numericCols[0]] }));
      return (
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" outerRadius={120} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
        </PieChart>
      );
    }

    return (
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
        <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
        <Legend />
        {numericCols.map((c, i) => <Bar key={c} dataKey={c} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />)}
      </BarChart>
    );
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-white font-semibold text-lg">📊 Chart View</h2>
        <div className="flex gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all border
                ${chartType === t ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-700 border-slate-600 text-slate-300 hover:border-emerald-500"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}