import { useState } from "react";
import { useParkingSpots } from "../hooks/useParkingSpots";
import ParkingSpot from "./ParkingSpot";
import ParkingStats from "./ParkingStats";
import ParkingLegend from "./ParkingLegend";

const ZONE_LABELS = {
  A: { label: "Zona A", description: "Intrare principală" },
  B: { label: "Zona B", description: "Nivel 2" },
  C: { label: "Zona C", description: "Acoperit" },
};

const ParkingMap = ({ onSpotSelect }) => {
  const { spotsByZone, stats, loading, error } = useParkingSpots();
  const [filter, setFilter] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedSpot, setSelectedSpot] = useState(null);

  const handleSpotClick = (spot) => {
    if (spot.status !== "free") return;
    setSelectedSpot(spot.id === selectedSpot ? null : spot.id);
    onSpotSelect?.(spot.id === selectedSpot ? null : spot);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            Se încarcă harta parcării...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-sm text-center">
          <p className="text-red-400 font-semibold mb-2">Eroare conexiune</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const zones = Object.keys(spotsByZone).sort();
  const filteredZones =
    selectedZone === "all" ? zones : zones.filter((z) => z === selectedZone);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Hartă Parcare
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Actualizat în timp real
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 ml-2 animate-pulse" />
          </p>
        </div>
        <div className="flex gap-2">
          {["all", ...zones].map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedZone === zone
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              {zone === "all" ? "Toate" : `Zona ${zone}`}
            </button>
          ))}
        </div>
      </div>

      <ParkingStats stats={stats} />

      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "Toate locurile" },
          { value: "free", label: "Libere" },
          { value: "occupied", label: "Ocupate" },
          { value: "reserved", label: "Rezervate" },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-150 ${
              filter === value
                ? "bg-slate-200 text-slate-900"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {filteredZones.map((zone) => {
          const spots = spotsByZone[zone] || [];
          const visibleSpots =
            filter === "all" ? spots : spots.filter((s) => s.status === filter);

          return (
            <div key={zone}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-sm">{zone}</span>
                </div>
                <div>
                  <h2 className="text-slate-200 font-semibold text-sm">
                    {ZONE_LABELS[zone]?.label ?? `Zona ${zone}`}
                  </h2>
                  <p className="text-slate-500 text-xs">
                    {ZONE_LABELS[zone]?.description} ·{" "}
                    <span className="text-emerald-400">
                      {spots.filter((s) => s.status === "free").length} libere
                    </span>{" "}
                    din {spots.length}
                  </p>
                </div>
                <div className="flex-1 h-px bg-slate-800 ml-2" />
              </div>

              {visibleSpots.length === 0 ? (
                <p className="text-slate-600 text-sm italic pl-11">
                  Niciun loc {filter !== "all" ? `cu status „${filter}"` : ""} în această zonă.
                </p>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 pl-11">
                  {visibleSpots.map((spot) => (
                    <ParkingSpot
                      key={spot.id}
                      spot={spot}
                      isSelected={selectedSpot === spot.id}
                      onClick={() => handleSpotClick(spot)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ParkingLegend />

      {selectedSpot && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-6">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest">Loc selectat</p>
              <p className="text-white font-bold text-xl">{selectedSpot}</p>
            </div>
            <button
              onClick={() => onSpotSelect?.(
                (spotsByZone[selectedSpot[0]] || []).find((s) => s.id === selectedSpot)
              )}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl transition-colors duration-150 text-sm"
            >
              Rezervă →
            </button>
            <button
              onClick={() => { setSelectedSpot(null); onSpotSelect?.(null); }}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Anulează
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMap;