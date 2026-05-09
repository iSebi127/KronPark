import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ParkingGrid from './ParkingGrid';

<<<<<<< HEAD
// Returneaza data de azi in format YYYY-MM-DD (pentru input type="date")
function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Returneaza ora curenta rotunjita la urmatorul sfert de ora (ex: 14:15)
function nextQuarterHour() {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Adauga N ore la un string HH:MM
function addHours(timeStr, hours) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h + hours;
  return `${String(total % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Formateaza Date ca string local (fara conversie UTC) pentru backend LocalDateTime
function toLocalISOString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
}

=======
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
// layout: { spots: [ { id, status, bounds: [[y1,x1],[y2,x2]] }, ... ] }
export default function ParkingLotModal({ lot, layout, onClose, onReserve }) {
  const spots = layout?.spots || [];

  const [spotsState, setSpotsState] = useState(() => (spots || []).map((s) => ({ ...s })));
  useEffect(() => {
    setSpotsState((spots || []).map((s) => ({ ...s })));
  }, [layout]);

  const [selectedLabel, setSelectedLabel] = useState(null);

<<<<<<< HEAD
  // Starea formularului de rezervare
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState(todayString());
  const [formStart, setFormStart] = useState(nextQuarterHour());
  const [formEnd, setFormEnd] = useState(() => addHours(nextQuarterHour(), 1));
  const [formError, setFormError] = useState('');

=======
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
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

<<<<<<< HEAD
  function handleSelectSpot(label) {
    setSelectedLabel(label);
    setShowForm(false);
    setFormError('');
    // Resetam ora la valori implicite
    const start = nextQuarterHour();
    setFormDate(todayString());
    setFormStart(start);
    setFormEnd(addHours(start, 1));
  }

  function handleOpenForm() {
    setFormError('');
    setShowForm(true);
  }

  function handleFormSubmit() {
    // Validare
    const startDT = new Date(`${formDate}T${formStart}:00`);
    const endDT = new Date(`${formDate}T${formEnd}:00`);
    const now = new Date();

    if (isNaN(startDT.getTime()) || isNaN(endDT.getTime())) {
      setFormError('Data sau ora invalida.');
      return;
    }
    if (startDT <= now) {
      setFormError('Ora de inceput trebuie sa fie in viitor.');
      return;
    }
    if (endDT <= startDT) {
      setFormError('Ora de sfarsit trebuie sa fie dupa ora de inceput.');
      return;
    }

    const spotId = schematic.labelToId[selectedLabel];
    if (!spotId) return;

    // Actualizam local statusul locului
    setSpotsState((prev) =>
      prev.map((s) => (s.id === spotId ? { ...s, status: 'reserved' } : s))
    );

    setShowForm(false);
    setSelectedLabel(null);

    if (onReserve) onReserve(spotId, toLocalISOString(startDT), toLocalISOString(endDT));
=======
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
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
  }

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75" />
      <div
        className="relative bg-slate-900 w-full max-w-[1200px] rounded-2xl p-5 shadow-2xl"
        data-cy="parking-lot-modal"
        onClick={(e) => e.stopPropagation()}
      >
<<<<<<< HEAD
        {/* Header */}
=======
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white" data-cy="parking-lot-title">
              {lot?.name || 'Parcare'}
            </h2>
            <p className="text-sm text-slate-400">Selecteaza un loc din grila pentru a-l rezerva</p>
          </div>
<<<<<<< HEAD
          <button
            onClick={() => { if (onClose) onClose(); }}
            data-cy="parking-lot-close"
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
          >
            Iesire
          </button>
        </div>

        {/* Grid */}
=======
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

>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
        <div className="bg-slate-800 rounded-lg p-4">
          <ParkingGrid
            rows={schematic.rows}
            cols={schematic.cols}
            lane={{ type: 'row', index: Math.floor(schematic.rows / 2), direction: 'right' }}
            map={schematic.map}
            labelToId={schematic.labelToId}
<<<<<<< HEAD
            onSelect={handleSelectSpot}
          />

          {/* Zona de jos: selectie loc + formular */}
          <div className="mt-4">
            {!selectedLabel && (
              <p className="text-sm text-slate-400">Selecteaza un loc verde din grila pentru a-l rezerva.</p>
            )}

            {selectedLabel && !showForm && (
              <div className="flex items-center justify-between gap-3 bg-slate-700/50 rounded-lg p-3">
                <div>
                  <div className="text-xs text-slate-400">Loc selectat</div>
                  <div className="text-xl font-bold text-white">{selectedLabel}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenForm}
                    data-cy="parking-lot-reserve"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
                  >
                    Rezerva →
                  </button>
                  <button
                    onClick={() => setSelectedLabel(null)}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-slate-200 transition-colors"
                  >
=======
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
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
                    Anuleaza
                  </button>
                </div>
              </div>
<<<<<<< HEAD
            )}

            {selectedLabel && showForm && (
              <div className="bg-slate-700/60 rounded-xl p-4 border border-slate-600">
                <h3 className="text-white font-semibold text-base mb-3">
                  Alege intervalul pentru locul <span className="text-cyan-400">{selectedLabel}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  {/* Data */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Data</label>
                    <input
                      type="date"
                      value={formDate}
                      min={todayString()}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Ora inceput */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Ora inceput</label>
                    <input
                      type="time"
                      value={formStart}
                      onChange={(e) => {
                        setFormStart(e.target.value);
                        // Actualizam automat ora de sfarsit (+1h)
                        if (e.target.value) setFormEnd(addHours(e.target.value, 1));
                      }}
                      className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Ora sfarsit */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Ora sfarsit</label>
                    <input
                      type="time"
                      value={formEnd}
                      onChange={(e) => setFormEnd(e.target.value)}
                      className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Durata calculata */}
                {formStart && formEnd && (() => {
                  const start = new Date(`${formDate}T${formStart}:00`);
                  const end = new Date(`${formDate}T${formEnd}:00`);
                  const diffMin = (end - start) / 60000;
                  if (diffMin > 0) {
                    const h = Math.floor(diffMin / 60);
                    const m = diffMin % 60;
                    return (
                      <p className="text-xs text-cyan-400 mb-3">
                        Durata: {h > 0 ? `${h}h ` : ''}{m > 0 ? `${m}min` : ''}
                      </p>
                    );
                  }
                  return null;
                })()}

                {/* Eroare */}
                {formError && (
                  <p className="text-red-400 text-sm mb-3">{formError}</p>
                )}

                {/* Butoane */}
                <div className="flex gap-2">
                  <button
                    onClick={handleFormSubmit}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors"
                  >
                    Confirma rezervarea
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setFormError(''); }}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-slate-200 transition-colors"
                  >
                    Inapoi
                  </button>
                </div>
              </div>
=======
            ) : (
              <div className="text-sm text-slate-400">Selecteaza un loc din grila pentru a-l rezerva</div>
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
