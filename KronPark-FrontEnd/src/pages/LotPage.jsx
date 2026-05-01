import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HighZoomParkingMap from '../components/HighZoomParkingMap';
import PARKING_LOTS from '../data/parkingLots';

// This page loads a lot by id and shows the layout
const LotPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);

  useEffect(() => {
    // try to read from localStorage first (used when opening in new tab)
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

    // try sessionStorage as fallback
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

    // fallback: find lot in data and generate a layout
    const found = PARKING_LOTS.find(l => l.id === id);
    if (found) {
      // simple deterministic generator seeded by index
      const index = PARKING_LOTS.findIndex(l => l.id === id);
      // generate layout on the fly (same generator used elsewhere)
      function generateLotLayout(seed = 0) {
        const spots = [];
        const rows = 3 + (seed % 2);
        const cols = 8 + (seed % 4);
        const startY = 100;
        const startX = 100 + (seed * 20);
        const spotWidth = 70;
        const spotHeight = 50;
        const gapX = 14;
        const gapY = 14;
        let counter = 1;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
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

    // not found: navigate back to map
    navigate('/map');
  }, [id, navigate]);

  // onReserve: save reservation to localStorage and go to dashboard
  const handleReserve = (spotId) => {
    try {
      const now = new Date();
      const reservation = {
        id: `${id}-${spotId}-${now.getTime()}`,
        lotId: id,
        spotId,
        date: now.toISOString(),
        startTime: now.toISOString(),
        endTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), // +1h
        status: 'active',
      };

      const raw = localStorage.getItem('reservations');
      let arr = [];
      try { arr = raw ? JSON.parse(raw) : []; } catch (e) { arr = []; }
      arr.push(reservation);
      localStorage.setItem('reservations', JSON.stringify(arr));

      // navigate to dashboard so user sees the reservation
      navigate('/dashboard');
    } catch (err) {
      console.error('Could not save reservation', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{lot?.name || 'Parcare'}</h1>
            <p className="text-slate-400 text-sm">Vizualizare layout parcări</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/map')} className="bg-slate-800 text-slate-200 px-3 py-1 rounded">Înapoi la hartă</button>
          </div>
        </div>

        {lot ? <HighZoomParkingMap layout={lot.layout} onReserve={handleReserve} /> : <div className="text-slate-400">Se încarcă...</div>}
      </div>
    </div>
  );
};

export default LotPage;
