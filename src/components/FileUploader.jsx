import { useState, useRef } from "react";
import * as XLSX from "xlsx";

export default function FileUploader({ onData }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const parseFile = (file) => {
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      const sheets = {};
      wb.SheetNames.forEach((name) => {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "" });
        sheets[name] = rows;
      });
      onData(sheets, file.name);
    };
    reader.readAsBinaryString(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) parseFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all
        ${dragging ? "border-emerald-400 bg-emerald-400/5" : "border-slate-600 hover:border-emerald-500 hover:bg-slate-800/40 bg-slate-800/20"}`}
    >
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleChange} />
      <div className="text-5xl mb-4">📂</div>
      <p className="text-white font-semibold text-lg mb-1">Drop your file here</p>
      <p className="text-slate-400 text-sm">or click to browse — .xlsx, .xls, .csv supported</p>
      {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
    </div>
  );
}