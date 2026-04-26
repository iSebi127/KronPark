const ParkingLegend = () => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-slate-800">
    <p className="text-slate-600 text-xs uppercase tracking-widest font-medium">Legendă</p>
    {[
      { color: "bg-emerald-500", label: "Liber — click pentru a selecta" },
      { color: "bg-red-500", label: "Ocupat" },
      { color: "bg-amber-500", label: "Rezervat" },
    ].map(({ color, label }) => (
      <div key={label} className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-sm ${color} opacity-70`} />
        <span className="text-slate-500 text-xs">{label}</span>
      </div>
    ))}
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-70">♿</span>
      <span className="text-slate-500 text-xs">Persoane cu dizabilități</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-70">⚡</span>
      <span className="text-slate-500 text-xs">Stație EV</span>
    </div>
  </div>
);

export default ParkingLegend;