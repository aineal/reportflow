import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportButton({ rows, fileName, activeSheet }) {
  const [exporting, setExporting] = useState(false);

  const exportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      const cols = rows.length ? Object.keys(rows[0]) : [];
      const title = `${fileName} — ${activeSheet}`;

      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129);
      doc.text("FinReport Studio", 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(title, 14, 24);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

      autoTable(doc, {
        startY: 36,
        head: [cols],
        body: rows.slice(0, 500).map((r) => cols.map((c) => r[c] ?? "")),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 14, right: 14 },
      });

      doc.save(`${fileName}_${activeSheet}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={exportPDF}
      disabled={exporting || !rows.length}
      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
    >
      {exporting ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : "📄"}
      Export PDF
    </button>
  );
}