import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PARKING_LOTS from "../data/parkingLots"; // Aici ai locurile publice
import ParkingLotModal from "./ParkingLotModal";
import apiClient from "../apiClient";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function generateLotLayout(seed = 0) {
  const spots = [];
  const rows = 4;
  const cols = 12;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sNum = `${String.fromCharCode(65 + r)}${c + 1}`;
      spots.push({ id: sNum, spotNumber: sNum, status: "free" });
    }
  }
  return { spots };
}
const getCurrentUserEmail = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    // Decodăm partea de mijloc a token-ului JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.email; 
  } catch (e) { return null; }
};
export default function ParkingLotsMap() {
  const myEmail = getCurrentUserEmail(); // Identitatea ta
  const [activeModalLot, setActiveModalLot] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showPublic, setShowPublic] = useState(true);
  const [showPrivate, setShowPrivate] = useState(true);
  
  // STAT NOU: Aici vom salva locurile private venite de la server
  const [dbPrivateLots, setDbPrivateLots] = useState([]);

  const TOMTOM_API_KEY = "5XDMjEY4Np7UrxSdsIA3DSQqX3fhb1BS";

  // EFFECT NOU: Tragem locurile din baza de date când se deschide harta
  useEffect(() => {
    const fetchPrivateSpots = async () => {
      try {
        const response = await apiClient("/api/private-spots");
        if (response.ok) {
          const data = await response.json();
          
          // Mapăm datele de la backend să arate exact cum vrea Leaflet (Harta)
          const mappedSpots = data.map(spot => ({
            id: spot.id,
            type: "private",
            ownerName: spot.ownerName,
            coords: [spot.latitude, spot.longitude], // Harta vrea un array cu [lat, lng]
            interval: `${spot.availableFrom || '00:00'} - ${spot.availableTo || '24:00'}`,
            status: spot.status === 'AVAILABLE' ? 'Disponibil' : 'Ocupat',
            price: `${spot.price} RON/h`,
            zone: spot.zone
          }));
          
          setDbPrivateLots(mappedSpots);
        }
      } catch (error) {
        console.error("Eroare la aducerea locurilor private de pe server:", error);
      }
    };

    fetchPrivateSpots();
  }, []);

  const openLotModal = (lot, index) => {
    try {
      const layout = generateLotLayout(index);
      setActiveModalLot({ ...lot, layout });
    } catch (e) {
      console.warn("Could not generate layout", e);
    }
  };

  const handleCloseModal = () => setActiveModalLot(null);

  const handleReserve = async (spotId, customStartTime, customEndTime) => {
    try {
      const now = new Date();
      // Start la +5 min de acum, End la +1 ora
      const defaultStartTime = new Date(now.getTime() + 5 * 60 * 1000);
      const defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60 * 1000);

      const startTime = customStartTime || defaultStartTime.toISOString();
      const endTime = customEndTime || defaultEndTime.toISOString();

      // CONSTRUCȚIA PAYLOAD-ULUI CORETC
      const payload = {
        spotId: spotId, // Trimitem ID-ul locului (Long în Java)
        spotNumber: activeModalLot ? spotId : "PRIVATE", 
        lotId: activeModalLot ? activeModalLot.id : "PRIVATE",
        startTime,
        endTime,
      };

      console.log("Payload trimis către server:", payload);

      const response = await apiClient("/api/reservations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Rezervare creată cu succes!");
        setActiveModalLot(null);
        
        // OPȚIONAL: Reîmprospătează lista ca să apară "Ocupat" imediat
        // window.location.reload(); 
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Eroare la crearea rezervării");
      }
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut contacta serverul");
    }
  };

  // COMBINĂM locurile publice statice cu locurile private din Baza de Date
  const staticPublicLots = PARKING_LOTS.filter(lot => lot.type === "public");
  const allLots = [...staticPublicLots, ...dbPrivateLots];

  // FILTRĂM ce se vede pe hartă (Publice / Private)
  const filteredLots = allLots.filter((lot) => {
    if (lot.type === "public" && showPublic) return true;
    if (lot.type === "private" && showPrivate) return true;
    return false;
  });

  return (
    <div
      className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6"
      data-cy="parking-lots-map"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Harta Parcari Brasov
          </h1>
          <p className="text-slate-400 text-sm">
            Filtreaza si alege o zona pentru rezervare
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPublic(!showPublic)}
            data-cy="map-filter-public"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${showPublic ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"}`}
          >
            🏢 Publice
          </button>

          <button
            onClick={() => setShowPrivate(!showPrivate)}
            data-cy="map-filter-private"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${showPrivate ? "bg-green-600 hover:bg-green-700 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"}`}
          >
            👤 Private
          </button>

          <div className="w-px h-8 bg-slate-700 mx-1 hidden md:block"></div>

          <button
            onClick={() => setShowTraffic(!showTraffic)}
            data-cy="map-filter-traffic"
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${showTraffic ? "bg-red-500 hover:bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"}`}
          >
            {showTraffic ? "🚦 Ascunde Traficul" : "🚦 Arata Traficul"}
          </button>
        </div>
      </div>

      <div className="h-[70vh] rounded-xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer
          center={[45.657, 25.601]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {showTraffic && (
            <TileLayer
              url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${TOMTOM_API_KEY}`}
              attribution="&copy; TomTom Traffic"
              opacity={0.8}
            />
          )}

          {filteredLots.map((lot, idx) => (
            <Marker
              key={lot.id}
              position={lot.coords}
              eventHandlers={{
                click: () => {
                  if (lot.type === "public") openLotModal(lot, idx);
                },
              }}
            >
              {lot.type === "private" && (
                <Popup>
                  <div className="p-3 min-w-[200px] bg-white rounded-lg">
                    <h3 className="text-blue-700 font-bold border-b border-slate-200 mb-2 pb-1 text-base uppercase">
                      📍 {lot.zone || "Zona Nespecificata"}
                    </h3>
                    <div className="space-y-2 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold text-slate-500 text-xs uppercase block">
                          Proprietar
                        </span>{" "}
                        {lot.ownerName}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-500 text-xs uppercase block">
                          Disponibil
                        </span>{" "}
                        {lot.interval}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-500 text-xs uppercase block">
                          Pret
                        </span>{" "}
                        <span className="text-green-600 font-bold">
                          {lot.price}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold text-slate-500 text-xs uppercase block">
                          Status
                        </span>{" "}
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${lot.status === "Disponibil" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {lot.status || "Necunoscut"}
                        </span>
                      </p>
                    </div>

                    {/* --- LOGICĂ REZERVARE / PROPRIETAR --- */}
                    {lot.status === "Disponibil" && (
                      lot.ownerEmail === myEmail ? (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-center">
                          <p className="text-blue-600 font-bold text-[10px] uppercase">
                            Acesta este locul tău
                          </p>
                        </div>
                      ) : (
                        <button
                          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold text-xs transition shadow-md"
                          onClick={() => handleReserve(lot.id)}
                        >
                          Rezerva Loc Privat
                        </button>
                      )
                    )}
                  </div>
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Modalul pentru parcările publice mari */}
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