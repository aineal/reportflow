import { useState } from "react";
import jsPDF from "jspdf";

export default function ExportButton({ rows, fileName, activeSheet }) {
  const [exporting, setExporting] = useState(false);

  const exportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      const cols = rows.length ? Object.keys(rows[0]) : [];
      const colWidth = Math.min(40, (doc.internal.pageSize.getWidth() - 28) / cols.length);
      const rowHeight = 7;
      let y = 36;

      // Title
      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129);
      doc.text("FinReport Studio", 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${fileName} — ${activeSheet}`, 14, 24);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

      // Header row
      doc.setFillColor(16, 185, 129);
      doc.rect(14, y, doc.internal.pageSize.getWidth() - 28, rowHeight, "F");
      doc.setTextColor(255);
      doc.setFontSize(7);
      doc.setFont(undefined, "bold");
      cols.forEach((c, i) => {
        doc.text(String(c).slice(0, 16), 15 + i * colWidth, y + 5);
      });

      // Data rows
      doc.setFont(undefined, "normal");
      rows.slice(0, 100).forEach((row, ri) => {
        y += rowHeight;
        if (y > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 20;
        }
        if (ri % 2 === 0) {
          doc.setFillColor(245, 247, 250);
          doc.rect(14, y, doc.internal.pageSize.getWidth() - 28, rowHeight, "F");
        }
        doc.setTextColor(50);
        cols.forEach((c, i) => {
          doc.text(String(row[c] ?? "").slice(0, 16), 15 + i * colWidth, y + 5);
        });
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