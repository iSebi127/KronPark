import React, { useMemo, useState } from 'react';
import ParkingSpot from './ParkingSpot';
import ParkingLegend from './ParkingLegend';

// ParkingGrid
// Props:
// - rows: number (total rows, including road row)
// - cols: number
// - lane: { type: 'row'|'col', index: number, direction: 'left'|'right'|'up'|'down' }
// - map: optional object { '<label>': 'free'|'occupied'|'reserved' }
// - onSelect: function(id) called when a free spot is selected
// Visual theme: deep navy, cyan accents, HUD look

export default function ParkingGrid({ rows = 3, cols = 8, lane = { type: 'row', index: Math.floor(3/2), direction: 'right' }, map = {}, labelToId = {}, onSelect }) {
  const [selected, setSelected] = useState(null);

  // generate labels A1.. etc by row-major
  const grid = useMemo(() => {
    const g = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rowLetter = String.fromCharCode(65 + r); // A, B, C
        const label = `${rowLetter}${c + 1}`;
        g.push({ r, c, label });
      }
    }
    return g;
  }, [rows, cols]);

  function cellIsRoad(r, c) {
    if (!lane) return false;
    if (lane.type === 'row') return r === lane.index;
    return c === lane.index;
  }

  function getStatus(label) {
    return map && map[label] ? map[label] : 'free';
  }

  function handleClick(cell) {
    const status = getStatus(cell.label);
    if (status !== 'free') return;
    setSelected(cell.label);
    onSelect && onSelect(cell.label);
  }

  const Arrow = ({ dir = 'right' }) => {
    const rot = dir === 'right' ? 0 : dir === 'left' ? 180 : dir === 'down' ? 90 : -90;
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-300 opacity-70 transform" style={{ transform: `rotate(${rot}deg)` }}>
        <path fill="currentColor" d="M12 2l7 7h-4v9h-6v-9H5z" />
      </svg>
    );
  };

  // Tailwind-based styles: deep navy, cyan accents, HUD look
  return (
    <div className="w-full p-4">
      <div className="mx-auto max-w-[1100px]">
        {/* Outer border only (no filled wall cells) */}
        <div className="bg-slate-950 rounded-xl p-4 shadow-xl border-2 border-cyan-900">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-cyan-200">Parking Layout</h3>
            <div className="text-sm text-slate-400">Click a free spot to select</div>
          </div>

          <div className="rounded-md border border-cyan-800 overflow-hidden" style={{ padding: 4 }}>
            <div
              className="grid bg-transparent"
              // make cells more compact: allow smaller min size so more cols fit without overlap
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(32px, 1fr))`, gridAutoRows: '32px', gap: '6px' }}
              role="grid"
              aria-label="parking-grid"
            >
              {grid.map((cell) => {
                const { r, c, label } = cell;
                const status = getStatus(label);
                const isRoad = status === 'road' || cellIsRoad(r, c);
                const isSelected = selected === label;

                if (isRoad) {
                  // road styling (asphalt-like)
                  return (
                    <div key={label} className="flex items-center justify-center" role="presentation">
                      <div className="w-full h-full bg-slate-900/60 rounded-sm flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-800/20 to-slate-900/40" />
                        <div className="relative z-10 flex items-center gap-1 text-cyan-300">
                          <Arrow dir={lane.direction || 'right'} />
                        </div>
                      </div>
                    </div>
                  );
                }

                // If this cell is a placeholder (no real spot mapped), render it as empty/transparent
                // This avoids showing a red 'occupied' block for non-existent slots.
                const hasRealSpot = Boolean(labelToId && labelToId[label]);
                if (status === 'occupied' && !hasRealSpot) {
                  return (
                    <div key={label} role="presentation" aria-hidden className="flex items-center justify-center">
                      <div className="w-full h-full" />
                    </div>
                  );
                }

                // parking spot: use reusable ParkingSpot component for real spots (free/occupied/reserved)
                const spotObj = { id: label, status: status, type: 'standard' };

                return (
                  <div key={label} role="gridcell" className="flex items-center justify-center">
                    <ParkingSpot
                      spot={spotObj}
                      isSelected={isSelected}
                      onClick={() => handleClick(cell)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-400 flex gap-4">
            <ParkingLegend />
          </div>
        </div>
      </div>
    </div>
  );
}
