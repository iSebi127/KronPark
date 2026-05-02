import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ParkingGrid from './ParkingGrid';

// layout: { spots: [ { id, status, bounds: [[y1,x1],[y2,x2]] }, ... ] }
export default function ParkingLotModal({ lot, layout, onClose, onReserve }) {
  const spots = layout?.spots || [];

  const [spotsState, setSpotsState] = useState(() => (spots || []).map((s) => ({ ...s })));
  useEffect(() => {
    setSpotsState((spots || []).map((s) => ({ ...s })));
  }, [layout]);

  const [selectedLabel, setSelectedLabel] = useState(null);

  function pickPattern(id) {
    if (!id) return 'straight';
    let sum = 0;
    for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i);
    const patterns = ['straight', 'L', 'U', 'cross'];
    return patterns[sum % patterns.length];
  }

  const schematic = useMemo(() => {
    const items = spotsState || [];
    const n = items.length || 0;
    if (n === 0) return { rows: 3, cols: 3, map: {}, labelToId: {} };

    const rows = 5;
    const maxCols = 18;

    let cols = Math.max(6, Math.ceil(n / 3));
    if (cols > maxCols) cols = maxCols;

    const pattern = pickPattern(lot?.id || '');

    function buildRoadMask(rowsCount, colsCount, currentPattern) {
      const mask = new Set();
      const midR = Math.floor(rowsCount / 2);
      const midC = Math.floor(colsCount / 2);

      if (currentPattern === 'straight') {
        for (let c = 0; c < colsCount; c += 1) mask.add(`${midR},${c}`);
      } else if (currentPattern === 'L') {
        for (let r = 0; r <= midR; r += 1) mask.add(`${r},0`);
        for (let c = 0; c < colsCount; c += 1) mask.add(`${midR},${c}`);
      } else if (currentPattern === 'U') {
        for (let r = 0; r < rowsCount - 1; r += 1) {
          mask.add(`${r},0`);
          mask.add(`${r},${colsCount - 1}`);
        }
        const bottom = rowsCount - 1;
        for (let c = 0; c < colsCount; c += 1) mask.add(`${bottom},${c}`);
      } else if (currentPattern === 'cross') {
        for (let c = 0; c < colsCount; c += 1) mask.add(`${midR},${c}`);
        for (let r = 0; r < rowsCount; r += 1) mask.add(`${r},${midC}`);
      } else {
        for (let c = 0; c < colsCount; c += 1) mask.add(`${midR},${c}`);
      }

      return mask;
    }

    function adjacentToRoad(r, c, roadMask, rowsCount, colsCount) {
      const checks = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
      for (const [rr, cc] of checks) {
        if (rr < 0 || rr >= rowsCount || cc < 0 || cc >= colsCount) continue;
        if (roadMask.has(`${rr},${cc}`)) return true;
      }
      return false;
    }

    let roadMask = buildRoadMask(rows, cols, pattern);
    function countAvailable(colsCount, currentRoadMask) {
      let avail = 0;
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < colsCount; c += 1) {
          if (currentRoadMask.has(`${r},${c}`)) continue;
          if (adjacentToRoad(r, c, currentRoadMask, rows, colsCount)) avail += 1;
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

    const map = {};
    const labelToId = {};
    const rowLetters = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

    const adjacentCells = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const key = `${r},${c}`;
        if (roadMask.has(key)) continue;
        if (adjacentToRoad(r, c, roadMask, rows, cols)) adjacentCells.push({ r, c });
      }
    }

    const assignMap = {};
    for (let i = 0; i < adjacentCells.length; i += 1) {
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

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const label = `${rowLetters[r]}${c + 1}`;
        const key = `${r},${c}`;
        if (roadMask.has(key)) {
          map[label] = 'road';
          labelToId[label] = null;
        } else if (Object.prototype.hasOwnProperty.call(assignMap, label)) {
          map[label] = assignMap[label];
        } else {
          map[label] = 'occupied';
          labelToId[label] = null;
        }
      }
    }

    return { rows, cols, map, labelToId };
  }, [spotsState, lot?.id]);

  function reserveById(spotId) {
    if (!spotId) return;
    setSpotsState((prev) => prev.map((s) => (s.id === spotId ? { ...s, status: 'reserved' } : s)));
    if (onReserve) onReserve(spotId);
  }

  function handleConfirmReserve() {
    const mapped = schematic.labelToId[selectedLabel];
    if (!mapped) return;
    reserveById(mapped);
    setSelectedLabel(null);
  }

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75" />
      <div
        className="relative bg-slate-900 w-full max-w-[1200px] rounded-2xl p-5 shadow-2xl"
        data-cy="parking-lot-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white" data-cy="parking-lot-title">
              {lot?.name || 'Parcare'}
            </h2>
            <p className="text-sm text-slate-400">Selecteaza un loc din grila pentru a-l rezerva</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onClose) onClose();
                window.location.href = '/map';
              }}
              data-cy="parking-lot-close"
              className="px-3 py-1 bg-red-600 rounded text-white"
            >
              Iesire pagina
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <ParkingGrid
            rows={schematic.rows}
            cols={schematic.cols}
            lane={{ type: 'row', index: Math.floor(schematic.rows / 2), direction: 'right' }}
            map={schematic.map}
            labelToId={schematic.labelToId}
            onSelect={(label) => {
              setSelectedLabel(label);
            }}
          />
          <div className="mt-3 text-sm text-slate-300">
            {selectedLabel ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400">Loc selectat</div>
                  <div className="text-lg font-bold text-white">{selectedLabel}</div>
                  <div className="text-sm text-slate-400">
                    {(() => {
                      const id = schematic.labelToId[selectedLabel];
                      const spot = spotsState.find((s) => s.id === id);
                      return spot ? `Status: ${spot.status}` : 'Loc inactiv';
                    })()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmReserve}
                    data-cy="parking-lot-reserve"
                    disabled={
                      !schematic.labelToId[selectedLabel] ||
                      spotsState.find((s) => s.id === schematic.labelToId[selectedLabel])?.status !== 'free'
                    }
                    className="px-4 py-2 bg-blue-600 rounded text-white"
                  >
                    Rezerva ->
                  </button>
                  <button onClick={() => setSelectedLabel(null)} className="px-4 py-2 bg-slate-700 rounded text-slate-200">
                    Anuleaza
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">Selecteaza un loc din grila pentru a-l rezerva</div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
