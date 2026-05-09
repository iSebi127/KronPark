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

// Fallback generator only used if API call fails
function generateFallbackLayout(seed = 0) {
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

export default function ParkingLotsMap() {
  const [activeModalLot, setActiveModalLot] = useState(null);
  const [loadingLot, setLoadingLot] = useState(false);

  const openLotModal = async (lot, index) => {
    setLoadingLot(true);
    try {
      const res = await apiClient('/api/parking-spots');
      if (res.ok) {
        const spots = await res.json();

        // Build visual bounds for each spot using the same grid logic as the fallback
        const cols = 8 + (index % 4);
        const startY = 100;
        const startX = 100 + (index * 20);
        const spotWidth = 70;
        const spotHeight = 50;
        const gapX = 14;
        const gapY = 14;

        const layoutSpots = spots.map((spot, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const x1 = startX + c * (spotWidth + gapX);
          const y1 = startY + r * (spotHeight + gapY);
          return {
            id: spot.id,                                                    // real numeric DB ID
            spotNumber: spot.spotNumber,
            status: spot.status === 'AVAILABLE' ? 'free' : 'reserved',     // real status from API
            bounds: [[y1, x1], [y1 + spotHeight, x1 + spotWidth]],
          };
        });

        setActiveModalLot({ ...lot, layout: { spots: layoutSpots } });
      } else {
        // API returned error — use fallback so UI still works
        setActiveModalLot({ ...lot, layout: generateFallbackLayout(index) });
      }
    } catch (e) {
      console.warn('Could not fetch parking spots, using fallback layout', e);
      setActiveModalLot({ ...lot, layout: generateFallbackLayout(index) });
    } finally {
      setLoadingLot(false);
    }
  };

  const handleCloseModal = () => setActiveModalLot(null);

  // spotId = ID-ul real din DB, startTime/endTime = ISO strings din formular
  const handleReserve = async (spotId, startTime, endTime) => {
    try {
      const response = await apiClient('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          parkingSpotId: spotId,
          startTime,
          endTime,
        }),
      });

      if (response.ok) {
        alert('Rezervare creată cu succes!');
        setActiveModalLot(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
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
        <div className="text-sm text-slate-400">
          {loadingLot ? 'Se încarcă locurile...' : 'Click marker pentru detalii'}
        </div>
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
        <ParkingLotModal
          lot={activeModalLot}
          layout={activeModalLot.layout}
          onClose={handleCloseModal}
          onReserve={handleReserve}
        />
      )}
    </div>
  );
}
