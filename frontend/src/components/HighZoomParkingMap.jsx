import React, { useEffect, useState } from 'react';
import { MapContainer, /*Rectangle,*/ useMapEvents /*, Popup*/ } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SafeRectangle from './SafeRectangle';

const FLOOR_WIDTH = 3000;
const FLOOR_HEIGHT = 2000;

// Generate a simple parking layout programmatically (returns { spots: [...] })
function generateDefaultLayout() {
  const spots = [];
  const zones = [
    { key: 'A', rows: 3, cols: 10, startY: 120, startX: 100 },
    { key: 'B', rows: 2, cols: 8, startY: 420, startX: 120 },
    { key: 'C', rows: 2, cols: 6, startY: 700, startX: 140 },
  ];
  zones.forEach(({ key, rows, cols, startY, startX }) => {
    const spotWidth = 80;
    const spotHeight = 60;
    const gapX = 20;
    const gapY = 18;
    let counter = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x1 = startX + c * (spotWidth + gapX);
        const y1 = startY + r * (spotHeight + gapY);
        const x2 = x1 + spotWidth;
        const y2 = y1 + spotHeight;
        spots.push({ id: `${key}${counter}`, status: 'free', bounds: [[y1, x1], [y2, x2]] });
        counter += 1;
      }
    }
  });
  return { spots };
}

const statusToOptions = (status) => {
  if (status === 'free') return { color: '#047857', weight: 1, fillColor: '#10b981', fillOpacity: 0.45, opacity: 1 };
  if (status === 'occupied') return { color: '#991b1b', weight: 1, fillColor: '#ef4444', fillOpacity: 0.5, opacity: 1 };
  if (status === 'reserved') return { color: '#7c2d12', weight: 1, fillColor: '#f59e0b', fillOpacity: 0.5, opacity: 1 };
  return { color: '#334155', weight: 1, fillColor: '#94a3b8', fillOpacity: 0.2, opacity: 0.8 };
};

function MapEvents({ onClick }) {
  useMapEvents({ click(e) { onClick && onClick(e); } });
  return null;
}

// helper: validate lat/lng-like array or object
function isValidLatLng(l) {
  if (!l) return false;
  if (Array.isArray(l) && l.length >= 2) return Number.isFinite(Number(l[0])) && Number.isFinite(Number(l[1]));
  if (typeof l === 'object') {
    if ('lat' in l && 'lng' in l) return Number.isFinite(Number(l.lat)) && Number.isFinite(Number(l.lng));
    if ('lat' in l && 'lon' in l) return Number.isFinite(Number(l.lat)) && Number.isFinite(Number(l.lon));
  }
  return false;
}

// validate bounds for Rectangle: [[y1,x1],[y2,x2]]
function isValidBounds(bounds) {
  if (!bounds || !Array.isArray(bounds) || bounds.length < 2) return false;
  const a = bounds[0];
  const b = bounds[1];
  if (!Array.isArray(a) || !Array.isArray(b) || a.length < 2 || b.length < 2) return false;
  const y1 = Number(a[0]);
  const x1 = Number(a[1]);
  const y2 = Number(b[0]);
  const x2 = Number(b[1]);
  return [y1, x1, y2, x2].every(Number.isFinite);
}

// compute center from rectangle bounds [[y1,x1],[y2,x2]] -> [lat, lng]
function centerFromBounds(bounds) {
  if (!bounds || !Array.isArray(bounds) || bounds.length < 2) return null;
  const y1 = Number(bounds[0][0]);
  const x1 = Number(bounds[0][1]);
  const y2 = Number(bounds[1][0]);
  const x2 = Number(bounds[1][1]);
  if (![y1, x1, y2, x2].every(Number.isFinite)) return null;
  return [ (y1 + y2) / 2, (x1 + x2) / 2 ];
}

// layout: { spots: [ {id, status, bounds}, ... ] }
const HighZoomParkingMap = ({ layout, onReserve }) => {
  const [lotLayout, setLotLayout] = useState(() => layout || generateDefaultLayout());
  // removed selected popup state: clicks on free spots will directly reserve
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (layout) setLotLayout(layout);
  }, [layout]);

  // handle click from Rectangle: receive event and spot
  const handleRectClick = (e, spot) => {
    // reserve immediately if free (no popup confirmation)
    if (spot.status === 'free') {
      setLotLayout(prev => {
        const copy = { ...prev };
        copy.spots = copy.spots.map(s => (s.id === spot.id ? { ...s, status: 'reserved' } : s));
        return copy;
      });
      if (onReserve) onReserve(spot.id);
    }

    // otherwise ignore clicks for occupied/reserved spots
  };

  const spots = lotLayout.spots || [];
  // filter out spots with invalid bounds to avoid passing NaN to Leaflet
  const spotsValid = spots.filter(s => isValidBounds(s.bounds));

  // compute a safe center using the first valid spot
  const center = spotsValid.length ? [ (Number(spotsValid[0].bounds[0][0]) + Number(spotsValid[0].bounds[1][0])) / 2, (Number(spotsValid[0].bounds[0][1]) + Number(spotsValid[0].bounds[1][1])) / 2 ] : [FLOOR_HEIGHT/2, FLOOR_WIDTH/2];

  // compute lot boundary from valid spots
  // NOTE: keep pair arrays ([y,x]) when collecting coords — avoid over-flattening which produced NaN
  const allCoords = spotsValid.flatMap(s => s.bounds); // array of [y,x]
  let boundary = null;
  if (allCoords.length) {
    const ys = allCoords.map(c => Number(c[0]));
    const xs = allCoords.map(c => Number(c[1]));
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    if ([minY, maxY, minX, maxX].every(Number.isFinite)) {
      boundary = [[minY-20, minX-20], [maxY+20, maxX+20]];
    }
  }

  const spotsToRender = spotsValid.filter(s => filter === 'all' || s.status === filter);

  return (
    <div className="w-full h-[60vh]" data-cy="lot-layout">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white font-semibold">Layout schematic</div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            data-cy="lot-filter-all"
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            Toate
          </button>
          <button
            onClick={() => setFilter('free')}
            data-cy="lot-filter-free"
            className={`px-3 py-1 rounded ${filter === 'free' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            Libere
          </button>
        </div>
      </div>

      <div className="h-full rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950">
        <MapContainer crs={L.CRS.Simple} center={center} zoom={-2} minZoom={-5} maxZoom={4} style={{ height: '100%', width: '100%' }}>
          {boundary && (
            <SafeRectangle bounds={boundary} pathOptions={{ color: '#94a3b8', weight: 2, dashArray: '6 4', fill: false }} />
          )}

          {spotsToRender.map(spot => (
            <SafeRectangle
              key={spot.id}
              bounds={spot.bounds}
              className={`parking-spot-${spot.id}`}
              pathOptions={statusToOptions(spot.status)}
              eventHandlers={{ click: (e) => handleRectClick(e, spot) }}
            />
          ))}

          <MapEvents onClick={() => { /* empty: used to clear selection */ }} />

        </MapContainer>
      </div>
    </div>
  );
};

export default HighZoomParkingMap;

