import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HighZoomParkingMap from '../components/HighZoomParkingMap';
import PARKING_LOTS from '../data/parkingLots';
import apiClient from '../apiClient';

<<<<<<< HEAD
// Returneaza data de azi in format YYYY-MM-DD
function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Returneaza ora curenta rotunjita la urmatorul sfert de ora
function nextQuarterHour() {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function addHours(timeStr, hours) {
  const [h, m] = timeStr.split(':').map(Number);
  return `${String((h + hours) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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
const LotPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);

  // Spot selectat pentru rezervare
  const [selectedSpotId, setSelectedSpotId] = useState(null);

  // Formular rezervare
  const [formDate, setFormDate] = useState(todayString());
  const [formStart, setFormStart] = useState(nextQuarterHour());
  const [formEnd, setFormEnd] = useState(() => addHours(nextQuarterHour(), 1));
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const lotMeta = PARKING_LOTS.find((l) => l.id === id);
    if (!lotMeta) {
      navigate('/map');
      return;
    }

    // Incarcam locurile reale din API
    setLoading(true);
    apiClient('/api/parking-spots')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((spots) => {
        const cols = 8;
        const startY = 100;
        const startX = 100;
=======

  useEffect(() => {
    const localJson = localStorage.getItem('activeLot');
    if (localJson) {
      try {
        const parsed = JSON.parse(localJson);
        if (parsed && parsed.id === id) {
          setLot(parsed);
          return;
        }
      } catch (err) {
        // ignore
      }
    }

    const lotJson = sessionStorage.getItem('activeLot');
    if (lotJson) {
      try {
        const parsed = JSON.parse(lotJson);
        if (parsed && parsed.id === id) {
          setLot(parsed);
          return;
        }
      } catch (err) {
        // ignore
      }
    }

    const found = PARKING_LOTS.find((l) => l.id === id);
    if (found) {
      const index = PARKING_LOTS.findIndex((l) => l.id === id);

      function generateLotLayout(seed = 0) {
        const spots = [];
        const rows = 3 + (seed % 2);
        const cols = 8 + (seed % 4);
        const startY = 100;
        const startX = 100 + (seed * 20);
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
        const spotWidth = 70;
        const spotHeight = 50;
        const gapX = 14;
        const gapY = 14;
<<<<<<< HEAD

        const layoutSpots = spots.map((spot, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const x1 = startX + c * (spotWidth + gapX);
          const y1 = startY + r * (spotHeight + gapY);
          return {
            id: spot.id,
            spotNumber: spot.spotNumber,
            status: spot.status === 'AVAILABLE' ? 'free' : 'reserved',
            bounds: [[y1, x1], [y1 + spotHeight, x1 + spotWidth]],
          };
        });

        setLot({ ...lotMeta, layout: { spots: layoutSpots } });
      })
      .catch(() => {
        // Fallback cu layout fals daca API nu e disponibil
        const seed = PARKING_LOTS.findIndex((l) => l.id === id);
        const spots = [];
        const rows = 3 + (seed % 2);
        const cols = 8 + (seed % 4);
        let counter = 1;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x1 = 100 + c * 84;
            const y1 = 100 + r * 64;
            spots.push({ id: `P${seed}-${counter}`, status: 'free', bounds: [[y1, x1], [y1 + 50, x1 + 70]] });
            counter++;
          }
        }
        setLot({ ...lotMeta, layout: { spots } });
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Apelat de HighZoomParkingMap cand userul apasa pe un loc liber
  const handleSpotSelect = (spotId) => {
    setSelectedSpotId(spotId);
    setFormError('');
    const start = nextQuarterHour();
    setFormDate(todayString());
    setFormStart(start);
    setFormEnd(addHours(start, 1));
  };

  const handleFormSubmit = async () => {
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

    setSubmitting(true);
    try {
      const response = await apiClient('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          parkingSpotId: selectedSpotId,
          startTime: toLocalISOString(startDT),
          endTime: toLocalISOString(endDT),
=======
        let counter = 1;

        for (let r = 0; r < rows; r += 1) {
          for (let c = 0; c < cols; c += 1) {
            const x1 = startX + c * (spotWidth + gapX);
            const y1 = startY + r * (spotHeight + gapY);
            const x2 = x1 + spotWidth;
            const y2 = y1 + spotHeight;
            spots.push({ id: `P${seed}-${counter}`, status: 'free', bounds: [[y1, x1], [y2, x2]] });
            counter += 1;
          }
        }

        return { spots };
      }

      setLot({ ...found, layout: generateLotLayout(index) });
      return;
    }

    navigate('/map');
  }, [id, navigate]);

  const handleReserve = async (spotId) => {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + 5 * 60 * 1000); // starts in 5 minutes
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1h duration

      // În loc să ghicim ID-ul numeric (care poate fi volatil între restartări Docker),
      // căutăm ID-ul real al locului folosind codul său (ex: A1, P0-1).
      let resolvedSpotId = null;
      try {
          const spotRes = await apiClient(`/api/parking-spots/${spotId}`);
          if (spotRes.ok) {
              const spotData = await spotRes.json();
              resolvedSpotId = spotData.id;
          }
      } catch (e) {
          console.warn('Nu s-a putut rezolva codul locului via API:', e);
      }

      const spotNumericId = resolvedSpotId || 1;

      const response = await apiClient('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          parkingSpotId: spotNumericId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
        }),
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
<<<<<<< HEAD
        const errorData = await response.json().catch(() => ({}));
        setFormError(errorData.message || 'Eroare la crearea rezervarii.');
      }
    } catch (err) {
      setFormError('Nu s-a putut contacta serverul.');
    } finally {
      setSubmitting(false);
=======
        const errorData = await response.json();
        alert(errorData.message || 'Eroare la crearea rezervării');
      }
    } catch (err) {
      console.error('Could not save reservation', err);
      alert('Nu s-a putut contacta serverul');
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24" data-cy="lot-layout-page">
      <div className="max-w-6xl mx-auto px-4 py-6">
<<<<<<< HEAD
        {/* Header */}
=======
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" data-cy="lot-title">
              {lot?.name || 'Parcare'}
            </h1>
<<<<<<< HEAD
            <p className="text-slate-400 text-sm">Click pe un loc verde pentru a-l rezerva</p>
          </div>
          <button
            onClick={() => navigate('/map')}
            data-cy="lot-back-to-map"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors"
          >
            ← Inapoi la harta
          </button>
        </div>

        {/* Harta */}
        {loading ? (
          <div className="text-slate-400" data-cy="lot-loading">Se incarca locurile...</div>
        ) : lot ? (
          <HighZoomParkingMap layout={lot.layout} onReserve={handleSpotSelect} />
        ) : null}

        {/* Formular rezervare — apare sub harta cand un loc e selectat */}
        {selectedSpotId && !loading && (
          <div className="mt-6 bg-slate-800 border border-slate-600 rounded-xl p-5">
            <h3 className="text-white font-semibold text-lg mb-4">
              Rezerva locul{' '}
              <span className="text-cyan-400">
                {lot?.layout?.spots?.find((s) => s.id === selectedSpotId)?.spotNumber || `#${selectedSpotId}`}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium">Data</label>
                <input
                  type="date"
                  value={formDate}
                  min={todayString()}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium">Ora inceput</label>
                <input
                  type="time"
                  value={formStart}
                  onChange={(e) => {
                    setFormStart(e.target.value);
                    if (e.target.value) setFormEnd(addHours(e.target.value, 1));
                  }}
                  className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium">Ora sfarsit</label>
                <input
                  type="time"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                  className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
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

            {formError && <p className="text-red-400 text-sm mb-3">{formError}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleFormSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white font-semibold transition-colors"
              >
                {submitting ? 'Se salveaza...' : 'Confirma rezervarea'}
              </button>
              <button
                onClick={() => { setSelectedSpotId(null); setFormError(''); }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors"
              >
                Anuleaza
              </button>
            </div>
=======
            <p className="text-slate-400 text-sm">Vizualizare layout parcari</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/map')}
              data-cy="lot-back-to-map"
              className="bg-slate-800 text-slate-200 px-3 py-1 rounded"
            >
              Inapoi la harta
            </button>
          </div>
        </div>

        {lot ? (
          <HighZoomParkingMap layout={lot.layout} onReserve={handleReserve} />
        ) : (
          <div className="text-slate-400" data-cy="lot-loading">
            Se incarca...
>>>>>>> 030d6f99a814180dd131b9c846a09dba4fde03b0
          </div>
        )}
      </div>
    </div>
  );
};

export default LotPage;
