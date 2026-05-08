import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PARKING_LOTS from '../data/parkingLots';
import ParkingLotModal from './ParkingLotModal';
import apiClient from '../apiClient';

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

  const handleReserve = async (spotId) => {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + 5 * 60 * 1000); // starts in 5 minutes
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1h duration

      // În loc să ghicim ID-ul numeric (care poate fi volatil între restartări Docker),
      // căutăm ID-ul real al locului folosind codul său (ex: A1, P0-1).
      let resolvedSpotId = null;
      try {
          // Normalizăm spotId dacă vine din layout-ul de pe hartă (P0-1 -> A1 pentru simplitate în maparea demonstrativă)
          let searchCode = spotId;
          if (typeof spotId === 'string' && spotId.includes('-')) {
              // Mapăm P{seed}-{counter} pe A/B/C/D + counter pentru a găsi ceva în DataInitializer
              const counter = parseInt(spotId.split('-')[1]);
              const rowIdx = Math.floor((counter - 1) / 12);
              const row = ["A", "B", "C", "D"][rowIdx] || "A";
              const num = ((counter - 1) % 12) + 1;
              searchCode = `${row}${num}`;
          }

          const spotRes = await apiClient(`/api/parking-spots/${searchCode}`);
          if (spotRes.ok) {
              const spotData = await spotRes.json();
              resolvedSpotId = spotData.id;
          }
      } catch (e) {
          console.warn('Nu s-a putut rezolva codul locului, folosim fallback:', e);
      }

      const spotNumericId = resolvedSpotId || 1;

      const response = await apiClient('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          parkingSpotId: spotNumericId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (response.ok) {
        // Option 1: Redirect to dashboard
        // window.location.href = '/dashboard';
        // Option 2: Just notify (since this is a map modal)
        alert('Rezervare creată cu succes!');
        setActiveModalLot(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Eroare la crearea rezervării');
      }
    } catch (err) {
      console.error('Error reserving spot:', err);
      alert('Nu s-a putut contacta serverul');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6" data-cy="parking-lots-map">
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
