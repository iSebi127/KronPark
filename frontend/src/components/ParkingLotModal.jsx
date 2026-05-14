import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ParkingGrid from './ParkingGrid';

function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function nextQuarterHour() {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function addHours(timeStr, hours) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h + hours;
  return `${String(total % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function toLocalISOString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
}

export default function ParkingLotModal({ lot, layout, onClose, onReserve }) {
  const spots = layout?.spots || [];
  const [spotsState, setSpotsState] = useState(() => (spots || []).map((s) => ({ ...s })));

  useEffect(() => {
    setSpotsState((spots || []).map((s) => ({ ...s })));
  }, [layout]);

  const [selectedLabel, setSelectedLabel] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState(todayString());
  const [formStart, setFormStart] = useState(nextQuarterHour());
  const [formEnd, setFormEnd] = useState(() => addHours(nextQuarterHour(), 1));
  const [formError, setFormError] = useState('');

  const schematic = useMemo(() => {
    const rows = 5; 
    const cols = 12;
    const map = {};
    const labelToId = {};

    (spotsState || []).forEach(spot => {
       const label = spot.spotNumber || spot.id;
       map[label] = spot.status || 'free';
       labelToId[label] = label;
    });

    return { rows, cols, map, labelToId };
  }, [spotsState]);

  function handleSelectSpot(label) {
    setSelectedLabel(label);
    setShowForm(false);
    setFormError('');
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

    const spotId = selectedLabel;
    if (!spotId) return;

    setSpotsState((prev) =>
      prev.map((s) => (s.id === spotId ? { ...s, status: 'reserved' } : s))
    );

    setShowForm(false);
    setSelectedLabel(null);

    if (onReserve) onReserve(spotId, toLocalISOString(startDT), toLocalISOString(endDT));
  }

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75" />
      <div
        className="relative bg-slate-900 w-full max-w-[1200px] rounded-2xl p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{lot?.name || 'Parcare'}</h2>
            <p className="text-sm text-slate-400">Selecteaza un loc din grila pentru a-l rezerva</p>
          </div>
          <button onClick={() => { if (onClose) onClose(); }} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white transition-colors">Iesire</button>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <ParkingGrid
            rows={schematic.rows}
            cols={schematic.cols}
            lane={{ type: 'row', index: 2, direction: 'right' }} 
            map={schematic.map}
            labelToId={schematic.labelToId}
            onSelect={handleSelectSpot}
          />

          <div className="mt-4">
            {!selectedLabel && <p className="text-sm text-slate-400">Selecteaza un loc verde din grila pentru a-l rezerva.</p>}

            {selectedLabel && !showForm && (
              <div className="flex items-center justify-between gap-3 bg-slate-700/50 rounded-lg p-3">
                <div>
                  <div className="text-xs text-slate-400">Loc selectat</div>
                  <div className="text-xl font-bold text-white">{selectedLabel}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleOpenForm} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors">Rezerva →</button>
                  <button onClick={() => setSelectedLabel(null)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-slate-200 transition-colors">Anuleaza</button>
                </div>
              </div>
            )}

            {selectedLabel && showForm && (
              <div className="bg-slate-700/60 rounded-xl p-4 border border-slate-600">
                <h3 className="text-white font-semibold text-base mb-3">Alege intervalul pentru locul <span className="text-cyan-400">{selectedLabel}</span></h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Data</label>
                    <input type="date" value={formDate} min={todayString()} onChange={(e) => setFormDate(e.target.value)} className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Ora inceput</label>
                    <input type="time" value={formStart} onChange={(e) => { setFormStart(e.target.value); if (e.target.value) setFormEnd(addHours(e.target.value, 1)); }} className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Ora sfarsit</label>
                    <input type="time" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"/>
                  </div>
                </div>
                {formError && <p className="text-red-400 text-sm mb-3">{formError}</p>}
                <div className="flex gap-2">
                  <button onClick={handleFormSubmit} className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors">Confirma rezervarea</button>
                  <button onClick={() => { setShowForm(false); setFormError(''); }} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-slate-200 transition-colors">Inapoi</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}