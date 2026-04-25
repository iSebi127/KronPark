import { db } from "./firebaseConfig.js";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const ZONES = ["A", "B", "C"];
const SPOTS_PER_ZONE = 10;

const generateSpots = () => {
  const spots = [];
  ZONES.forEach((zone) => {
    for (let i = 1; i <= SPOTS_PER_ZONE; i++) {
      spots.push({
        id: `${zone}${String(i).padStart(2, "0")}`,
        zone,
        number: i,
        status: "free",
        reservedBy: null,
        reservedUntil: null,
        type: i <= 2 ? "disabled" : i === SPOTS_PER_ZONE ? "ev" : "standard",
      });
    }
  });
  return spots;
};

export const seedSpots = async () => {
  const spots = generateSpots();
  const promises = spots.map((spot) =>
    setDoc(doc(db, "parkingSpots", spot.id), {
      ...spot,
      updatedAt: serverTimestamp(),
    })
  );
  await Promise.all(promises);
  console.log(`✅ Seeded ${spots.length} parking spots`);
};