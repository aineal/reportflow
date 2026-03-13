import { useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

function isNumeric(val) {
  return val !== "" && val !== null && !isNaN(Number(val));
}

function detectCol(cols, keywords) {
  return cols.find((c) => keywords.some((k) => c.toLowerCase().includes(k)));
}

function countBy(rows, col) {
  const counts = {};
  rows.forEach((r) => {
    const key = String(r[col] ?? "Unknown").slice(0, 30);
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

const TOOLTIP_STYLE = { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" };

export default function ChartPanel({ rows }) {
  const [activeTab, setActiveTab] = useState(0);

  const cols = useMemo(() => rows.length ? Object.keys(rows[0]) : [], [rows]);

  const sessionCol = useMemo(() => detectCol(cols, ["session", "session_id", "sid"]), [cols]);
  const siteCol = useMemo(() => detectCol(cols, ["site", "url", "domain", "page", "host"]), [cols]);
  const userCol = useMemo(() => detectCol(cols, ["user", "user_id", "uid", "username", "email"]), [cols]);
  const timeCol = useMemo(() => detectCol(cols, ["time", "date", "timestamp", "created", "visited"]), [cols]);
  const numericCols = useMemo(() => cols.filter((c) => rows.some((r) => isNumeric(r[c]))).slice(0, 4), [cols, rows]);

  const sessionsBySite = useMemo(() => siteCol ? countBy(rows, siteCol).slice(0, 12) : [], [rows, siteCol]);
  const sessionsByUser = useMemo(() => userCol ? countBy(rows, userCol).slice(0, 12) : [], [rows, userCol]);
  const uniqueSessions = useMemo(() => sessionCol ? new Set(rows.map((r) => r[sessionCol])).size : rows.length, [rows, sessionCol]);
  const uniqueSites = useMemo(() => siteCol ? new Set(rows.map((r) => r[siteCol])).size : 0, [rows, siteCol]);
  const uniqueUsers = useMemo(() => userCol ? new Set(rows.map((r) => r[userCol])).size : 0, [rows, userCol]);

  const timelineData = useMemo(() => {
    if (!timeCol) return [];
    const counts = {};
    rows.forEach((r) => {
      const raw = r[timeCol];
      if (!raw) return;
      const d = new Date(raw);
      if (isNaN(d)) return;
      const key = d.toISOString().slice(0, 10);
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
  }, [rows, timeCol]);

  const generalChartData = useMemo(() => {
    if (!numericCols.length) return [];
    const labelCol = cols.find((c) => !numericCols.includes(c) && rows.some((r) => !isNumeric(r[c]) && r[c])) || cols[0];
    return rows.slice(0, 20).map((r) => {
      const obj = { name: String(r[labelCol] ?? "").slice(0, 18) };
      numericCols.forEach((c) => { obj[c] = Number(r[c]) || 0; });
      return obj;
    });
  }, [rows, cols, numericCols]);

  const tabs = [
    siteCol && { label: "Sessions by Site", chart: "site" },
    userCol && { label: "Sessions by User", chart: "user" },
    timelineData.length > 1 && { label: "Timeline", chart: "timeline" },
    numericCols.length && { label: "Metrics", chart: "metrics" },
  ].filter(Boolean);

  if (!tabs.length) return null;

  const active = tabs[activeTab] || tabs[0];

  const renderChart = () => {
    if (active.chart === "site") return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={sessionsBySite} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} width={140} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="count" name="Sessions" fill="#10b981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );

    if (active.chart === "user") return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={sessionsByUser} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} width={140} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="count" name="Sessions" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );

    if (active.chart === "timeline") return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={timelineData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Line type="monotone" dataKey="count" name="Sessions" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );

    if (active.chart === "metrics") return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={generalChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend />
          {numericCols.map((c, i) => <Bar key={c} dataKey={c} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />)}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Sessions", value: uniqueSessions, color: "text-emerald-400" },
          { label: "Unique Sites", value: uniqueSites || "—", color: "text-blue-400" },
          { label: "Unique Users", value: uniqueUsers || "—", color: "text-purple-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-white font-semibold text-lg">📊 Visual Analysis</h2>
          <div className="flex gap-2 flex-wrap">
            {tabs.map((t, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border
                  ${activeTab === i ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-700 border-slate-600 text-slate-300 hover:border-emerald-500"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {renderChart()}
      </div>
    </div>
  );
}