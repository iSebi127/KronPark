import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ParkingGrid from './ParkingGrid';

// layout: { spots: [ { id, status, bounds: [[y1,x1],[y2,x2]] }, ... ] }
export default function ParkingLotModal({ lot, layout, onClose, onReserve }) {
  const spots = layout?.spots || [];

  // local mutable copy of spots status so UI updates without parent
  const [spotsState, setSpotsState] = useState(() => (spots || []).map(s => ({ ...s })));
  useEffect(() => { setSpotsState((spots || []).map(s => ({ ...s }))); }, [layout]);

  // selected label when using schematic grid view (e.g. 'A1')
  const [selectedLabel, setSelectedLabel] = useState(null);

  // simple deterministic pattern picker used by schematic grid builder
  function pickPattern(id) {
    if (!id) return 'straight';
    let sum = 0; for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    const patterns = ['straight', 'L', 'U', 'cross'];
    return patterns[sum % patterns.length];
  }

  // create a schematic grid mapping when schematic view is active
  const schematic = useMemo(() => {
    const items = spotsState || [];
    const n = items.length || 0;
    // default small grid when no spots
    if (n === 0) return { rows: 3, cols: 3, map: {}, labelToId: {} };

    // fixed rows to allow more complex shapes (top..bottom)
    const rows = 5;
    // reduce maximum columns to prevent schematic buttons overlapping on narrow screens
    const maxCols = 18;

    // start with a conservative column estimate and grow until we can place all spots adjacent to roads
    let cols = Math.max(6, Math.ceil(n / 3));
    if (cols > maxCols) cols = maxCols;

    const pattern = pickPattern(lot?.id || '');

    function buildRoadMask(rows, cols, pattern) {
      const mask = new Set();
      const midR = Math.floor(rows / 2);
      const midC = Math.floor(cols / 2);

      if (pattern === 'straight') {
        for (let c = 0; c < cols; c++) mask.add(`${midR},${c}`);
      } else if (pattern === 'L') {
        for (let r = 0; r <= midR; r++) mask.add(`${r},0`);
        for (let c = 0; c < cols; c++) mask.add(`${midR},${c}`);
      } else if (pattern === 'U') {
        for (let r = 0; r < rows - 1; r++) {
          mask.add(`${r},0`);
          mask.add(`${r},${cols - 1}`);
        }
        const bottom = rows - 1;
        for (let c = 0; c < cols; c++) mask.add(`${bottom},${c}`);
      } else if (pattern === 'cross') {
        for (let c = 0; c < cols; c++) mask.add(`${midR},${c}`);
        for (let r = 0; r < rows; r++) mask.add(`${r},${midC}`);
      } else {
        for (let c = 0; c < cols; c++) mask.add(`${midR},${c}`);
      }

      return mask;
    }

    function adjacentToRoad(r, c, roadMask) {
      const checks = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
      for (const [rr, cc] of checks) {
        if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue;
        if (roadMask.has(`${rr},${cc}`)) return true;
      }
      return false;
    }

    // grow cols until we have enough adjacent non-road cells for all spots or hit max
    let roadMask = buildRoadMask(rows, cols, pattern);
    function countAvailable(cols, roadMask) {
      let avail = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (roadMask.has(`${r},${c}`)) continue;
          if (adjacentToRoad(r, c, roadMask)) avail++;
        }
      }
      return avail;
    }

    while (cols < maxCols) {
      roadMask = buildRoadMask(rows, cols, pattern);
      const avail = countAvailable(cols, roadMask);
      if (avail >= n) break;
      cols += 1;
    }

    // Build map and labelToId
    const map = {};
    const labelToId = {};
    const rowLetters = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

    // collect adjacent cells in a stable order (left->right, top->bottom)
    const adjacentCells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${r},${c}`;
        if (roadMask.has(key)) continue;
        if (adjacentToRoad(r, c, roadMask)) adjacentCells.push({ r, c });
      }
    }

    // assign spots to adjacent cells (one spot per adjacent cell). We try to place all spots; if not enough cells remain placeholders.
    const assignMap = {};
    for (let i = 0; i < adjacentCells.length; i++) {
      const cell = adjacentCells[i];
      const label = `${rowLetters[cell.r]}${cell.c + 1}`;
      if (i < n) {
        assignMap[label] = items[i].status || 'occupied';
        labelToId[label] = items[i].id;
      } else {
        assignMap[label] = 'occupied';
        labelToId[label] = null;
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const label = `${rowLetters[r]}${c + 1}`;
        const key = `${r},${c}`;
        if (roadMask.has(key)) {
          map[label] = 'road';
          labelToId[label] = null;
        } else if (assignMap.hasOwnProperty(label)) {
          map[label] = assignMap[label];
        } else {
          map[label] = 'occupied';
          labelToId[label] = null;
        }
      }
    }

    return { rows, cols, map, labelToId };
  }, [spotsState, lot?.id]);

  // helper: reserve by spot id
  function reserveById(spotId) {
    if (!spotId) return;
    setSpotsState(prev => prev.map(s => s.id === spotId ? { ...s, status: 'reserved' } : s));
    onReserve && onReserve(spotId);
  }

  // confirmation handler for schematic view
  function handleConfirmReserve() {
    const mapped = schematic.labelToId[selectedLabel];
    if (!mapped) return; // safety
    reserveById(mapped);
    setSelectedLabel(null);
  }

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75" />
      <div className="relative bg-slate-900 w-full max-w-[1200px] rounded-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{lot?.name || 'Parcare'}</h2>
            <p className="text-sm text-slate-400">Selectează un loc din grilă pentru a-l rezerva</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { onClose && onClose(); window.location.href = '/map'; }} className="px-3 py-1 bg-red-600 rounded text-white">Ieșire pagină</button>
          </div>
        </div>

        {/* schematic grid rendering using ParkingGrid */}
        <div className="bg-slate-800 rounded-lg p-4">
          <ParkingGrid
            rows={schematic.rows}
            cols={schematic.cols}
            lane={{ type: 'row', index: Math.floor(schematic.rows/2), direction: 'right' }}
            map={schematic.map}
            labelToId={schematic.labelToId}
            onSelect={(label) => { setSelectedLabel(label); }}
          />
          <div className="mt-3 text-sm text-slate-300">
            {selectedLabel ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400">Loc selectat</div>
                  <div className="text-lg font-bold text-white">{selectedLabel}</div>
                  <div className="text-sm text-slate-400">{(() => {
                    const id = schematic.labelToId[selectedLabel];
                    const spot = spotsState.find(s => s.id === id);
                    return spot ? `Status: ${spot.status}` : 'Loc inactiv';
                  })()}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleConfirmReserve} disabled={!schematic.labelToId[selectedLabel] || (spotsState.find(s=>s.id===schematic.labelToId[selectedLabel])?.status!=='free')} className="px-4 py-2 bg-blue-600 rounded text-white">Rezervă →</button>
                  <button onClick={() => setSelectedLabel(null)} className="px-4 py-2 bg-slate-700 rounded text-slate-200">Anulează</button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">Selectează un loc din grilă pentru a-l rezerva</div>
            )}
          </div>
        </div>

        {/* confirmation modal removed — reservation happens via the inline button in the schematic UI */}

      </div>
    </div>,
    document.body
  );
}
