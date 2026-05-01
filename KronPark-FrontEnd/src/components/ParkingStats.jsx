const ParkingStats = ({ stats }) => {
  const cards = [
    {
      label: "Total locuri",
      value: stats.total,
      color: "text-slate-300",
      bg: "bg-slate-800/60 border-slate-700/50",
      bar: null,
    },
    {
      label: "Libere",
      value: stats.free,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      bar: "bg-emerald-500",
      pct: stats.total ? Math.round((stats.free / stats.total) * 100) : 0,
    },
    {
      label: "Ocupate",
      value: stats.occupied,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      bar: "bg-red-500",
      pct: stats.total ? Math.round((stats.occupied / stats.total) * 100) : 0,
    },
    {
      label: "Rezervate",
      value: stats.reserved,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      bar: "bg-amber-500",
      pct: stats.total ? Math.round((stats.reserved / stats.total) * 100) : 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(({ label, value, color, bg, bar, pct }) => (
        <div
          key={label}
          data-cy={`parking-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
          className={`rounded-2xl border p-4 ${bg} backdrop-blur-sm`}
        >
          <p className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-1">
            {label}
          </p>
          <p data-cy="parking-stat-value" className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
          {bar && pct !== undefined && (
            <div className="mt-2">
              <div className="h-1 rounded-full bg-slate-700/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-slate-600 text-xs mt-1">{pct}%</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ParkingStats;