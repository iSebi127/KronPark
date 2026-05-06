const STATUS_STYLES = {
  free: {
    bg: "bg-emerald-500/10 hover:bg-emerald-500/25 border-emerald-500/30 hover:border-emerald-400",
    text: "text-emerald-400",
    cursor: "cursor-pointer",
    ring: "hover:ring-2 hover:ring-emerald-500/40",
  },
  occupied: {
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
    cursor: "cursor-not-allowed",
    ring: "",
  },
  reserved: {
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    cursor: "cursor-not-allowed",
    ring: "",
  },
};

const TYPE_ICONS = {
  standard: null,
  disabled: "♿",
  ev: "⚡",
};

const ParkingSpot = ({ spot, isSelected, onClick }) => {
  const style = STATUS_STYLES[spot.status] || STATUS_STYLES.free;
  const icon = TYPE_ICONS[spot.type];

  return (
    <button
      onClick={onClick}
      disabled={spot.status !== "free"}
      data-cy={`parking-spot-${spot.id}`}
      data-status={spot.status}
      title={`Loc ${spot.id} — ${
        spot.status === "free"
          ? "Liber"
          : spot.status === "occupied"
          ? "Ocupat"
          : "Rezervat"
      }${spot.type !== "standard" ? ` (${spot.type})` : ""}`}
      className={
        `
        relative rounded-md border transition-all duration-200
        w-full h-full flex items-center justify-center gap-1 px-1 py-0.5 text-[10px] font-semibold
        ${style.bg} ${style.cursor} ${style.ring}
        ${
          isSelected
            ? "ring-2 ring-blue-400 border-blue-400 bg-blue-500/20 scale-105 shadow-lg shadow-blue-500/25"
            : ""
        }
      `
      }
    >
      <div className="flex items-center gap-1 leading-none w-full justify-center">
        {icon && <span className="text-[9px] opacity-80">{icon}</span>}
        <span className={`${isSelected ? "text-blue-300" : style.text} truncate`}>{spot.id}</span>
        <span
          style={{ width: 8, height: 8 }}
          className={`rounded-full ${
            spot.status === "free" ? "bg-emerald-400" : spot.status === "occupied" ? "bg-red-400" : "bg-amber-400"
          } ${spot.status === "free" ? "animate-pulse" : ""}`}
        />
      </div>
    </button>
  );
};

export default ParkingSpot;