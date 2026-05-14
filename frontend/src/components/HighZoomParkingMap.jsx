import React, { useEffect, useState } from "react";
import { MapContainer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SafeRectangle from "./SafeRectangle";

const FLOOR_WIDTH = 3000;
const FLOOR_HEIGHT = 2000;

function generateDefaultLayout() {
  const spots = [];
  const zones = [
    { key: "A", rows: 3, cols: 10, startY: 120, startX: 100 },
    { key: "B", rows: 2, cols: 8, startY: 420, startX: 120 },
    { key: "C", rows: 2, cols: 6, startY: 700, startX: 140 },
  ];
  zones.forEach(({ key, rows, cols, startY, startX }) => {
    const spotWidth = 120;
    const spotHeight = 80;
    const gapX = 20;
    const gapY = 18;
    let counter = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x1 = startX + c * (spotWidth + gapX);
        const y1 = startY + r * (spotHeight + gapY);
        const x2 = x1 + spotWidth;
        const y2 = y1 + spotHeight;
        spots.push({
          id: `${key}${counter}`,
          spotNumber: `${key}${counter}`,
          status: "free",
          bounds: [
            [y1, x1],
            [y2, x2],
          ],
        });
        counter += 1;
      }
    }
  });
  return { spots };
}

const statusToOptions = (status, isSelected) => {
  if (isSelected)
    return {
      color: "#0ea5e9",
      weight: 3,
      fillColor: "#38bdf8",
      fillOpacity: 0.85,
      opacity: 1,
    };
  if (status === "free")
    return {
      color: "#047857",
      weight: 2,
      fillColor: "#10b981",
      fillOpacity: 0.6,
      opacity: 1,
    };
  if (status === "occupied")
    return {
      color: "#991b1b",
      weight: 2,
      fillColor: "#ef4444",
      fillOpacity: 0.65,
      opacity: 1,
    };
  if (status === "reserved")
    return {
      color: "#b45309",
      weight: 2,
      fillColor: "#f59e0b",
      fillOpacity: 0.65,
      opacity: 1,
    };

  if (status === "road")
    return {
      color: "#1e293b",
      weight: 1,
      fillColor: "#334155",
      fillOpacity: 0.8,
      opacity: 1,
    };
  return {
    color: "#334155",
    weight: 1,
    fillColor: "#94a3b8",
    fillOpacity: 0.2,
    opacity: 0.8,
  };
};

function isValidBounds(bounds) {
  if (!bounds || !Array.isArray(bounds) || bounds.length < 2) return false;
  const a = bounds[0];
  const b = bounds[1];
  if (!Array.isArray(a) || !Array.isArray(b) || a.length < 2 || b.length < 2)
    return false;
  const y1 = Number(a[0]),
    x1 = Number(a[1]),
    y2 = Number(b[0]),
    x2 = Number(b[1]);
  return [y1, x1, y2, x2].every(Number.isFinite);
}

function MapEvents({ onClick }) {
  useMapEvents({
    click(e) {
      onClick && onClick(e);
    },
  });
  return null;
}

const HighZoomParkingMap = ({ layout, onReserve }) => {
  const [lotLayout, setLotLayout] = useState(
    () => layout || generateDefaultLayout(),
  );
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (layout) setLotLayout(layout);
  }, [layout]);

  const handleRectClick = (e, spot) => {
    if (spot.status === "free") {
      setSelectedId(spot.id);
      if (onReserve) onReserve(spot.id);
    }
  };

  const spots = lotLayout.spots || [];
  const spotsValid = spots.filter((s) => isValidBounds(s.bounds));

  const center = spotsValid.length
    ? [
        (Number(spotsValid[0].bounds[0][0]) +
          Number(spotsValid[0].bounds[1][0])) /
          2,
        (Number(spotsValid[0].bounds[0][1]) +
          Number(spotsValid[0].bounds[1][1])) /
          2,
      ]
    : [FLOOR_HEIGHT / 2, FLOOR_WIDTH / 2];

  const allCoords = spotsValid.flatMap((s) => s.bounds);
  let boundary = null;

  if (allCoords.length) {
    const ys = allCoords.map((c) => Number(c[0]));
    const xs = allCoords.map((c) => Number(c[1]));
    const minY = Math.min(...ys),
      maxY = Math.max(...ys);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    if ([minY, maxY, minX, maxX].every(Number.isFinite)) {
      boundary = [
        [minY - 40, minX - 40],
        [maxY + 40, maxX + 40],
      ];
    }
  }

  const spotsToRender = spotsValid.filter(
    (s) => filter === "all" || s.status === filter || s.status === "road",
  );
  const freeCount = spotsValid.filter((s) => s.status === "free").length;
  const occupiedCount = spotsValid.filter(
    (s) => s.status !== "free" && s.status !== "road",
  ).length;

  return (
    <div className="w-full" data-cy="lot-layout">
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
          <span className="text-sm text-slate-300">
            Libere: <span className="text-white font-bold">{freeCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500"></div>
          <span className="text-sm text-slate-300">
            Ocupate:{" "}
            <span className="text-white font-bold">{occupiedCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
          <span className="text-sm text-slate-300">Rezervate</span>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setFilter("all")}
            data-cy="lot-filter-all"
            className={`px-3 py-1 rounded-lg text-sm font-medium ${filter === "all" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}
          >
            Toate
          </button>
          <button
            onClick={() => setFilter("free")}
            data-cy="lot-filter-free"
            className={`px-3 py-1 rounded-lg text-sm font-medium ${filter === "free" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}
          >
            Libere
          </button>
        </div>
      </div>

      <div className="h-[65vh] rounded-xl overflow-hidden border border-slate-700 relative bg-slate-900">
        <MapContainer
          crs={L.CRS.Simple}
          center={center}
          zoom={-1}
          minZoom={-5}
          maxZoom={4}
          style={{ height: "100%", width: "100%", background: "#0f172a" }}
        >
          {boundary && (
            <SafeRectangle
              bounds={boundary}
              pathOptions={{
                color: "#475569",
                weight: 2,
                dashArray: "8 4",
                fill: true,
                fillColor: "#1e293b",
                fillOpacity: 0.5,
              }}
            />
          )}
          {spotsToRender.map((spot) => (
            <SafeRectangle
              key={spot.id}
              bounds={spot.bounds}
              pathOptions={statusToOptions(spot.status, selectedId === spot.id)}
              eventHandlers={{ click: (e) => handleRectClick(e, spot) }}
            />
          ))}
          <MapEvents onClick={() => {}} />
        </MapContainer>
      </div>

      <p className="text-xs text-slate-500 mt-2 text-center">
        Click pe un loc <span className="text-emerald-400">verde</span> pentru
        a-l rezerva
      </p>
    </div>
  );
};

export default HighZoomParkingMap;
