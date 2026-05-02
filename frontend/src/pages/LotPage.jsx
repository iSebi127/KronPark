import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HighZoomParkingMap from '../components/HighZoomParkingMap';
import PARKING_LOTS from '../data/parkingLots';

const LotPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);

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
        const spotWidth = 70;
        const spotHeight = 50;
        const gapX = 14;
        const gapY = 14;
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

  const handleReserve = (spotId) => {
    try {
      const now = new Date();
      const reservation = {
        id: `${id}-${spotId}-${now.getTime()}`,
        lotId: id,
        spotId,
        date: now.toISOString(),
        startTime: now.toISOString(),
        endTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        status: 'active',
      };

      const raw = localStorage.getItem('reservations');
      let arr = [];
      try {
        arr = raw ? JSON.parse(raw) : [];
      } catch (e) {
        arr = [];
      }
      arr.push(reservation);
      localStorage.setItem('reservations', JSON.stringify(arr));

      navigate('/dashboard');
    } catch (err) {
      console.error('Could not save reservation', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24" data-cy="lot-layout-page">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" data-cy="lot-title">
              {lot?.name || 'Parcare'}
            </h1>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default LotPage;
