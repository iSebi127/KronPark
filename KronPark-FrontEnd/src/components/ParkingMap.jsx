import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import SafeRectangle from './SafeRectangle';

const ZONE_LABELS = {
  A: { label: "Zona A", description: "Intrare principală" },
  B: { label: "Zona B", description: "Nivel 2" },
  C: { label: "Zona C", description: "Acoperit" },
};

// Mock data with coordinates (bounds) for each spot. Bounds are [southWest, northEast]
const INITIAL_SPOTS = {
  A: [
    { id: "A1", status: "free", bounds: [[45.764, 21.225], [45.76415, 21.2252]] },
    { id: "A2", status: "occupied", bounds: [[45.76416, 21.225], [45.7643, 21.2252]] },
    { id: "A3", status: "free", bounds: [[45.76431, 21.225], [45.76445, 21.2252]] },
    { id: "A4", status: "reserved", bounds: [[45.76446, 21.225], [45.7646, 21.2252]] },
    { id: "A5", status: "free", bounds: [[45.76461, 21.225], [45.76475, 21.2252]] },
  ],
  B: [
    { id: "B1", status: "free", bounds: [[45.764, 21.2254], [45.76415, 21.2256]] },
    { id: "B2", status: "free", bounds: [[45.76416, 21.2254], [45.7643, 21.2256]] },
    { id: "B3", status: "occupied", bounds: [[45.76431, 21.2254], [45.76445, 21.2256]] },
    { id: "B4", status: "free", bounds: [[45.76446, 21.2254], [45.7646, 21.2256]] },
    { id: "B5", status: "free", bounds: [[45.76461, 21.2254], [45.76475, 21.2256]] },
  ],
  C: [
    { id: "C1", status: "occupied", bounds: [[45.764, 21.2258], [45.76415, 21.226]] },
    { id: "C2", status: "free", bounds: [[45.76416, 21.2258], [45.7643, 21.226]] },
    { id: "C3", status: "free", bounds: [[45.76431, 21.2258], [45.76445, 21.226]] },
    { id: "C4", status: "occupied", bounds: [[45.76446, 21.2258], [45.7646, 21.226]] },
    { id: "C5", status: "reserved", bounds: [[45.76461, 21.2258], [45.76475, 21.226]] },
  ],
};

const statusToOptions = (status) => {
  if (status === "free")
    return { color: "#10b981", weight: 1, fillColor: "#10b981", fillOpacity: 0.15 };
  if (status === "occupied")
    return { color: "#ef4444", weight: 1, fillColor: "#ef4444", fillOpacity: 0.12 };
  if (status === "reserved")
    return { color: "#f59e0b", weight: 1, fillColor: "#f59e0b", fillOpacity: 0.12 };
  return { color: "#94a3b8", weight: 1, fillColor: "#94a3b8", fillOpacity: 0.08 };
};

function MapEvents({ onClick }) {
  useMapEvents({ click(e) { onClick && onClick(e); } });
  return null;
}

// validate bounds for Rectangle: [[lat1,lng1],[lat2,lng2]]
function isValidBounds(bounds) {
  if (!bounds || !Array.isArray(bounds) || bounds.length < 2) return false;
  const a = bounds[0];
  const b = bounds[1];
  if (!Array.isArray(a) || !Array.isArray(b) || a.length < 2 || b.length < 2) return false;
  const lat1 = Number(a[0]);
  const lng1 = Number(a[1]);
  const lat2 = Number(b[0]);
  const lng2 = Number(b[1]);
  return [lat1, lng1, lat2, lng2].every(Number.isFinite);
}

const ParkingMap = ({ onSpotSelect }) => {
  const [spotsByZone, setSpotsByZone] = useState(INITIAL_SPOTS);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [filter, setFilter] = useState("all");

  // flatten spots for map bounds calculation
  const allSpots = useMemo(() => Object.values(spotsByZone).flat(), [spotsByZone]);

  useEffect(() => {
    // simple realtime simulation (mock) updates every 3s
    const id = setInterval(() => {
      setSpotsByZone((prev) => {
        const copy = { ...prev };
        const zones = Object.keys(copy);
        const z = zones[Math.floor(Math.random() * zones.length)];
        const arr = copy[z].slice();
        if (!arr.length) return prev;
        const i = Math.floor(Math.random() * arr.length);
        const spot = { ...arr[i] };
        if (spot.status === "free") spot.status = Math.random() > 0.85 ? "reserved" : "occupied";
        else if (spot.status === "occupied") spot.status = Math.random() > 0.6 ? "free" : "occupied";
        else if (spot.status === "reserved") spot.status = Math.random() > 0.95 ? "free" : "reserved";
        arr[i] = spot;
        copy[z] = arr;
        return copy;
      });
    }, 3000);

    return () => clearInterval(id);
  }, []);

  const handleReserve = (spotId) => {
    setSpotsByZone((prev) => {
      const copy = { ...prev };
      for (const z of Object.keys(copy)) {
        const idx = copy[z].findIndex(s => s.id === spotId);
        if (idx !== -1) {
          if (copy[z][idx].status !== "free") return prev;
          const arr = copy[z].slice();
          arr[idx] = { ...arr[idx], status: "reserved" };
          copy[z] = arr;
          return copy;
        }
      }
      return prev;
    });
  };

  // compute center from first valid spot
  const validSpotsFlat = allSpots.filter(s => isValidBounds(s.bounds));
  const center = validSpotsFlat.length ? [
    (Number(validSpotsFlat[0].bounds[0][0]) + Number(validSpotsFlat[0].bounds[1][0])) / 2,
    (Number(validSpotsFlat[0].bounds[0][1]) + Number(validSpotsFlat[0].bounds[1][1])) / 2,
  ] : [45.764, 21.225];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Hartă Parcare</h1>
          <p className="text-slate-400 text-sm mt-0.5">Actualizat în timp real<span className="inline-block w-2 h-2 rounded-full bg-emerald-400 ml-2 animate-pulse" /></p>
        </div>
        <div className="flex gap-2">
          {Object.keys(spotsByZone).map(zone => (
            <button key={zone} onClick={() => setFilter(zone)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filter===zone?"bg-blue-600 text-white":"bg-slate-800 text-slate-400"}`}>
              Zona {zone}
            </button>
          ))}
          <button onClick={() => setFilter("all")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filter==="all"?"bg-blue-600 text-white":"bg-slate-800 text-slate-400"}`}>
            Toate
          </button>
        </div>
      </div>

      <div className="h-[70vh] rounded-xl overflow-hidden border border-slate-800">
        <MapContainer center={center} zoom={20} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {Object.entries(spotsByZone).map(([zone, arr]) => (
            arr.filter(s => isValidBounds(s.bounds)).filter(s => filter === "all" || filter === zone || filter === s.status).map(spot => (
              <SafeRectangle
                key={spot.id}
                bounds={spot.bounds}
                pathOptions={statusToOptions(spot.status)}
                eventHandlers={{
                  click: () => setSelectedSpot(spot.id),
                }}
              />
            ))
          ))}

          <MapEvents onClick={() => { setSelectedSpot(null); onSpotSelect?.(null); }} />
        </MapContainer>
      </div>

      {selectedSpot && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-6">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest">Loc selectat</p>
              <p className="text-white font-bold text-xl">{selectedSpot}</p>
              <p className="text-slate-400 text-sm">
                {(() => {
                  for (const zone of Object.keys(spotsByZone)) {
                    const s = spotsByZone[zone].find(x => x.id === selectedSpot);
                    if (s) return `Status: ${s.status}`;
                  }
                  return "";
                })()}
              </p>
            </div>

            <div className="flex gap-3">
              {(() => {
                let spotDetail = null;
                for (const zone of Object.keys(spotsByZone)) {
                  const s = spotsByZone[zone].find((x) => x.id === selectedSpot);
                  if (s) spotDetail = s;
                }
                if (!spotDetail) return null;

                return (
                  <>
                    <button
                      onClick={() => handleReserve(selectedSpot)}
                      disabled={spotDetail.status !== "free"}
                      className={`${spotDetail.status === "free" ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-slate-800 text-slate-400 cursor-not-allowed"} font-semibold px-5 py-2 rounded-xl transition-colors duration-150 text-sm`}
                    >
                      Rezervă →
                    </button>
                    <button onClick={() => setSelectedSpot(null)} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Anulează</button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMap;
