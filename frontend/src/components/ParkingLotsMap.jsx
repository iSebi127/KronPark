import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PARKING_LOTS from '../data/parkingLots';
import ParkingLotModal from './ParkingLotModal';
import apiClient from '../apiClient';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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

export default function ParkingLotsMap() {
  const [activeModalLot, setActiveModalLot] = useState(null);
  
  // STATE-URI NOI PENTRU FILTRARE
  const [showTraffic, setShowTraffic] = useState(false);
  const [showPublic, setShowPublic] = useState(true);
  const [showPrivate, setShowPrivate] = useState(true);

  // AICI PUI CHEIA TA DE LA TOMTOM
  const TOMTOM_API_KEY = "5XDMjEY4Np7UrxSdsIA3DSQqX3fhb1BS"; 

  const openLotModal = (lot, index) => {
    const layout = generateLotLayout(index);
    setActiveModalLot({ ...lot, layout });
  };

  const handleCloseModal = () => setActiveModalLot(null);

  const handleReserve = async (spotId) => {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + 5 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      let resolvedSpotId = null;
      try {
          let searchCode = spotId;
          if (typeof spotId === 'string' && spotId.includes('-')) {
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
          console.warn(e);
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
        alert('Rezervare creată cu succes!');
        setActiveModalLot(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Eroare la crearea rezervării');
      }
    } catch (err) {
      console.error(err);
      alert('Nu s-a putut contacta serverul');
    }
  };

  // Funcție pentru a filtra parcările vizibile pe hartă
  const filteredLots = PARKING_LOTS.filter((lot) => {
    if (lot.type === 'public' && showPublic) return true;
    if (lot.type === 'private' && showPrivate) return true;
    return false;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6" data-cy="parking-lots-map">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Harta Parcări Brașov</h1>
          <p className="text-slate-400 text-sm">Filtrează și alege o zonă pentru rezervare</p>
        </div>
        
        {/* BUTOANE PENTRU FILTRARE ȘI TRAFIC */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowPublic(!showPublic)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              showPublic 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
            }`}
          >
            🏢 Publice
          </button>

          <button 
            onClick={() => setShowPrivate(!showPrivate)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              showPrivate 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
            }`}
          >
            👤 Private
          </button>

          <div className="w-px h-8 bg-slate-700 mx-1 hidden md:block"></div> {/* Separator vizual */}

          <button 
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              showTraffic 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {showTraffic ? '🚦 Ascunde Traficul' : '🚦 Arată Traficul'}
          </button>
        </div>
      </div>

      <div className="h-[70vh] rounded-xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer center={[45.657, 25.601]} zoom={13} style={{ height: '100%', width: '100%' }}>
          {/* Harta de bază */}
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='&copy; OpenStreetMap contributors' 
          />

          {/* Stratul de trafic de la TomTom (apare doar dacă showTraffic e true) */}
          {showTraffic && TOMTOM_API_KEY !== "PUNE_CHEIA_TA_AICI" && (
            <TileLayer
              url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`}
              attribution='&copy; TomTom Traffic'
              opacity={0.8}
            />
          )}

          {/* Folosim array-ul filtrat (filteredLots) în loc de PARKING_LOTS */}
          {filteredLots.map((lot, idx) => (
            <Marker
              key={lot.id}
              position={lot.coords}
              eventHandlers={{ 
                click: () => {
                  if (lot.type === 'public') {
                    openLotModal(lot, idx);
                  }
                } 
              }}
            >
              {lot.type === 'private' && (
                <Popup>
                  <div className="p-2 min-w-[180px]">
                    <h3 className="text-blue-600 font-bold border-b border-slate-200 mb-2 pb-1">
                      {lot.name}
                    </h3>
                    <div className="space-y-1 text-sm text-slate-700">
                      <p>👤 <b>Owner:</b> {lot.ownerName}</p>
                      <p>🕒 <b>Interval:</b> {lot.interval}</p>
                      <p>💰 <b>Preț:</b> <span className="text-green-600 font-bold">{lot.price}</span></p>
                      <p>📍 <b>Locație:</b> {lot.locationDetail}</p>
                    </div>
                    <button 
                      className="mt-3 w-full bg-blue-600 text-white py-1 rounded font-bold text-xs hover:bg-blue-700 transition"
                      onClick={() => alert(`Ai ales să rezervi locul lui ${lot.ownerName}`)}
                    >
                      Rezervă Loc Privat
                    </button>
                  </div>
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>
      </div>

      {activeModalLot && (
        <ParkingLotModal lot={activeModalLot} layout={activeModalLot.layout} onClose={handleCloseModal} onReserve={handleReserve} />
      )}
    </div>
  );
}