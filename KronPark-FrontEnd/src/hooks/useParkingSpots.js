import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const generateMockSpots = () => {
  const zones = ["A", "B", "C"];
  const spots = [];
  zones.forEach((zone) => {
    for (let i = 1; i <= 10; i++) {
      const rand = Math.random();
      spots.push({
        id: `${zone}${String(i).padStart(2, "0")}`,
        zone,
        number: i,
        status: rand < 0.5 ? "free" : rand < 0.75 ? "occupied" : "reserved",
        reservedBy: null,
        reservedUntil: null,
        type: i <= 2 ? "disabled" : i === 10 ? "ev" : "standard",
      });
    }
  });
  return spots;
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const useParkingSpots = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (USE_MOCK || !import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      setSpots(generateMockSpots());
      setLoading(false);

      const interval = setInterval(() => {
        setSpots((prev) =>
          prev.map((spot) => {
            if (Math.random() < 0.08) {
              const statuses = ["free", "occupied", "reserved"];
              return {
                ...spot,
                status: statuses[Math.floor(Math.random() * statuses.length)],
              };
            }
            return spot;
          })
        );
      }, 5000);

      return () => clearInterval(interval);
    }

    const q = query(
      collection(db, "parkingSpots"),
      orderBy("zone"),
      orderBy("number")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSpots(data);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const stats = {
    total: spots.length,
    free: spots.filter((s) => s.status === "free").length,
    occupied: spots.filter((s) => s.status === "occupied").length,
    reserved: spots.filter((s) => s.status === "reserved").length,
  };

  const spotsByZone = spots.reduce((acc, spot) => {
    if (!acc[spot.zone]) acc[spot.zone] = [];
    acc[spot.zone].push(spot);
    return acc;
  }, {});

  return { spots, spotsByZone, stats, loading, error };
};