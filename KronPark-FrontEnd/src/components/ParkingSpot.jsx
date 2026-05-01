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
        flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold
        ${style.bg} ${style.cursor} ${style.ring}
        ${
          isSelected
            ? "ring-2 ring-blue-400 border-blue-400 bg-blue-500/20 scale-105 shadow-lg shadow-blue-500/25"
            : ""
        }
      `
      }
    >
      <div className="flex flex-col items-center leading-none">
        {icon && <span className="text-xs opacity-80">{icon}</span>}
        <span className={`text-sm ${isSelected ? "text-blue-300" : style.text}`}>{spot.id}</span>
      </div>
      <span
        className={`w-2 h-2 rounded-full ml-2 ${
          spot.status === "free" ? "bg-emerald-400" : spot.status === "occupied" ? "bg-red-400" : "bg-amber-400"
        } ${spot.status === "free" ? "animate-pulse" : ""}`}
      />
    </button>
  );
};

export default ParkingSpot;