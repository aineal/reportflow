import { useState } from "react";
import FileUploader from "../components/FileUploader";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleData = (data, fileName) => {
    sessionStorage.setItem("finreport_data", JSON.stringify(data));
    sessionStorage.setItem("finreport_filename", fileName);
    navigate("/Report");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">100% Offline — Your data never leaves your device</span>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Fin<span className="text-emerald-400">Report</span> Studio
        </h1>
        <p className="text-slate-400 text-lg">
          Upload your Excel or CSV file to instantly generate beautiful financial reports with charts, tables, and PDF exports.
        </p>
      </div>
      <FileUploader onData={handleData} />
      <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg w-full text-center">
        {[
          { icon: "📊", label: "Auto Charts" },
          { icon: "📋", label: "Summary Tables" },
          { icon: "📄", label: "PDF Export" },
        ].map((f) => (
          <div key={f.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="text-2xl mb-1">{f.icon}</div>
            <div className="text-slate-300 text-sm font-medium">{f.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}