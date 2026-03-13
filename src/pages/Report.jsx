import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SheetSelector from "../components/SheetSelector";
import SummaryCards from "../components/SummaryCards";
import DataTable from "../components/DataTable";
import ChartPanel from "../components/ChartPanel";
import ExportButton from "../components/ExportButton";

export default function Report() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [activeSheet, setActiveSheet] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("finreport_data");
    const name = sessionStorage.getItem("finreport_filename");
    if (!raw) { navigate("/"); return; }
    const parsed = JSON.parse(raw);
    setData(parsed);
    setFileName(name || "Report");
    setActiveSheet(Object.keys(parsed)[0]);
  }, []);

  if (!data || !activeSheet) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
    </div>
  );

  const rows = data[activeSheet] || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
          <div className="w-px h-5 bg-slate-600" />
          <span className="text-white font-semibold truncate max-w-xs">{fileName}</span>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 text-xs">Offline</span>
          </div>
        </div>
        <ExportButton rows={rows} fileName={fileName} activeSheet={activeSheet} />
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Sheet Selector */}
        {Object.keys(data).length > 1 && (
          <SheetSelector sheets={Object.keys(data)} active={activeSheet} onChange={setActiveSheet} />
        )}

        {/* Summary Cards */}
        <SummaryCards rows={rows} />

        {/* Charts */}
        <ChartPanel rows={rows} />

        {/* Pivot Table */}
        <PivotTable rows={rows} />

        {/* Table */}
        <DataTable rows={rows} />
      </div>
    </div>
  );
}