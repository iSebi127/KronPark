import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PARKING_LOTS from '../data/parkingLots';
import ParkingLotModal from './ParkingLotModal';
import apiClient from '../apiClient';

// Reparare iconițe Leaflet pentru producție
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/**
 * Generează un layout de test pentru parcările publice
 */
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
  
  // State-uri pentru control vizual
  const [showTraffic, setShowTraffic] = useState(false);
  const [showPublic, setShowPublic] = useState(true);
  const [showPrivate, setShowPrivate] = useState(true);

  const TOMTOM_API_KEY = "5XDMjEY4Np7UrxSdsIA3DSQqX3fhb1BS"; 

  /**
   * Deschide modalul cu grila de locuri pentru parcări publice
   */
  const openLotModal = (lot, index) => {
    try {
      const layout = generateLotLayout(index);
      setActiveModalLot({ ...lot, layout });
    } catch (e) {
      console.warn('Could not generate layout', e);
    }
  };

  const handleCloseModal = () => setActiveModalLot(null);

  /**
   * Procesează rezervarea (atât pentru locuri publice cât și private)
   */
  const handleReserve = async (spotId, customStartTime, customEndTime) => {
    try {
      const now = new Date();
      const defaultStartTime = new Date(now.getTime() + 5 * 60 * 1000);
      const defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60 * 1000);

      const startTime = customStartTime || defaultStartTime.toISOString();
      const endTime = customEndTime || defaultEndTime.toISOString();

      let resolvedSpotId = null;
      
      // Conversie cod vizual (ex: P1-5) în ID de bază de date dacă este necesar
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
          console.warn('Error resolving spot ID, using fallback');
      }

      const spotNumericId = resolvedSpotId || (typeof spotId === 'number' ? spotId : 1);

      const response = await apiClient('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          parkingSpotId: spotNumericId,
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
      console.error(err);
      alert('Nu s-a putut contacta serverul');
    }
  };

  // Filtrare markere bazată pe butoanele din interfață
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
        
        {/* Panou Control Filtre */}
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

          <div className="w-px h-8 bg-slate-700 mx-1 hidden md:block"></div>

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
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='&copy; OpenStreetMap contributors' 
          />

          {/* Strat Trafic TomTom */}
          {showTraffic && (
            <TileLayer
              url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`}
              attribution='&copy; TomTom Traffic'
              opacity={0.8}
            />
          )}

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
                  <div className="p-3 min-w-[200px] bg-white rounded-lg">
                    <h3 className="text-blue-700 font-bold border-b border-slate-200 mb-2 pb-1 text-base uppercase">
                      📍 {lot.zone || 'Zonă Nespecificată'}
                    </h3>
                    <div className="space-y-2 text-sm text-slate-700">
                      <p><span className="font-semibold text-slate-500 text-xs uppercase block">Proprietar</span> {lot.ownerName}</p>
                      <p><span className="font-semibold text-slate-500 text-xs uppercase block">Disponibil</span> {lot.interval}</p>
                      <p><span className="font-semibold text-slate-500 text-xs uppercase block">Preț</span> <span className="text-green-600 font-bold">{lot.price}</span></p>
                      <p>
                        <span className="font-semibold text-slate-500 text-xs uppercase block">Status</span> 
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          lot.status === 'Disponibil' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {lot.status || 'Necunoscut'}
                        </span>
                      </p>
                    </div>
                    
                    {lot.status !== 'Ocupat' && (
                      <button 
                        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold text-xs transition shadow-md"
                        onClick={() => handleReserve(lot.id)}
                      >
                        Rezervă Loc Privat
                      </button>
                    )}
                  </div>
                </Popup>
              )}
            </Marker>
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