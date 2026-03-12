export default function SheetSelector({ sheets, active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {sheets.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border
            ${active === s
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-white"}`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}