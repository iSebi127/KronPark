import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PARKING_LOTS from '../data/parkingLots';
import ParkingLotModal from './ParkingLotModal';

// default icon fix for Leaflet in CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Simple generator re-used: small layout scaled by lot index
function generateLotLayout(seed = 0) {
  const spots = [];
  const rows = 3 + (seed % 2); // vary a bit
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

export default function ParkingLotsMap() {
  const [activeModalLot, setActiveModalLot] = useState(null);

  const openLotModal = (lot, index) => {
    const layout = generateLotLayout(index);
    setActiveModalLot({ ...lot, layout });
  };

  const handleCloseModal = () => setActiveModalLot(null);

  const handleReserve = (spotId) => {
    // replicate reservation behavior: save to localStorage and close modal
    try {
      const now = new Date();
      const reservation = {
        id: `${activeModalLot.id}-${spotId}-${now.getTime()}`,
        lotId: activeModalLot.id,
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
    } catch (err) {
      console.error('Could not save reservation', err);
    } finally {
      setActiveModalLot(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Harta Parcări Brașov</h1>
          <p className="text-slate-400 text-sm">Alege o parcare pentru a vedea layoutul ei</p>
        </div>
        <div className="text-sm text-slate-400">Click marker pentru detalii</div>
      </div>

      <div className="h-[70vh] rounded-xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer center={[45.657,25.601]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />

          {PARKING_LOTS.map((lot, idx) => (
            <Marker
              key={lot.id}
              position={lot.coords}
              eventHandlers={{ click: () => openLotModal(lot, idx) }}
            />
          ))}
        </MapContainer>
      </div>

      {activeModalLot && (
        <ParkingLotModal lot={activeModalLot} layout={activeModalLot.layout} onClose={handleCloseModal} onReserve={handleReserve} />
      )}
    </div>
  );
}
