const STATUS_STYLES = {
  free: {
    bg: "bg-emerald-500/15 hover:bg-emerald-500/30 border-emerald-500/40 hover:border-emerald-400",
    text: "text-emerald-400",
    cursor: "cursor-pointer",
    ring: "hover:ring-2 hover:ring-emerald-500/50",
  },
  occupied: {
    bg: "bg-red-500/15 border-red-500/30",
    text: "text-red-400",
    cursor: "cursor-not-allowed",
    ring: "",
  },
  reserved: {
    bg: "bg-amber-500/15 border-amber-500/30",
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
      className={`
        relative aspect-square rounded-xl border transition-all duration-200
        flex flex-col items-center justify-center gap-0.5
        ${style.bg} ${style.cursor} ${style.ring}
        ${
          isSelected
            ? "ring-2 ring-blue-400 border-blue-400 bg-blue-500/20 scale-105 shadow-lg shadow-blue-500/25"
            : ""
        }
      `}
    >
      {icon && (
        <span className="text-xs leading-none opacity-70">{icon}</span>
      )}
      <span
        className={`text-xs font-bold leading-none ${
          isSelected ? "text-blue-300" : style.text
        }`}
      >
        {spot.id}
      </span>
      <span
        className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
          spot.status === "free"
            ? "bg-emerald-400"
            : spot.status === "occupied"
            ? "bg-red-400"
            : "bg-amber-400"
        } ${spot.status === "free" ? "animate-pulse" : ""}`}
      />
    </button>
  );
};

export default ParkingSpot;