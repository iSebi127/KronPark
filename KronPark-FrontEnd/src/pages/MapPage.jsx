import { useState } from "react";
import ParkingMap from "../components/ParkingMap";

const MapPage = () => {
  const [selectedSpot, setSelectedSpot] = useState(null);

  const handleSpotSelect = (spot) => {
    setSelectedSpot(spot);
    if (spot) {
      console.log("Loc selectat pentru rezervare:", spot);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="container mx-auto">
        <ParkingMap onSpotSelect={handleSpotSelect} />
      </main>
    </div>
  );
};

export default MapPage;