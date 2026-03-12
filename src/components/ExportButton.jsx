import { useState } from "react";
import jsPDF from "jspdf";

export default function ExportButton({ rows, fileName, activeSheet }) {
  const [exporting, setExporting] = useState(false);

  const exportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      const cols = rows.length ? Object.keys(rows[0]) : [];

      // Header
      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129);
      doc.text("FinReport Studio", 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${fileName} — ${activeSheet}`, 14, 24);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

      // Table setup
      const startY = 38;
      const rowH = 8;
      const pageW = doc.internal.pageSize.getWidth();
      const colW = Math.min(40, (pageW - 28) / cols.length);

      // Header row
      doc.setFillColor(16, 185, 129);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont(undefined, "bold");
      cols.forEach((c, i) => {
        doc.rect(14 + i * colW, startY, colW, rowH, "F");
        doc.text(String(c).slice(0, 14), 15 + i * colW, startY + 5.5);
      });

      // Data rows
      doc.setFont(undefined, "normal");
      doc.setTextColor(40, 40, 40);
      rows.slice(0, 100).forEach((row, ri) => {
        const y = startY + rowH * (ri + 1);
        if (ri % 2 === 0) {
          doc.setFillColor(245, 247, 250);
          cols.forEach((_, i) => doc.rect(14 + i * colW, y, colW, rowH, "F"));
        }
        cols.forEach((c, i) => {
          doc.text(String(row[c] ?? "").slice(0, 14), 15 + i * colW, y + 5.5);
        });

        // New page if needed
        if (y + rowH * 2 > doc.internal.pageSize.getHeight() - 10) {
          doc.addPage();
        }
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