import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HighZoomParkingMap from "../components/HighZoomParkingMap";
import PARKING_LOTS from "../data/parkingLots";
import apiClient from "../apiClient";

function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function nextQuarterHour() {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function addHours(timeStr, hours) {
  const [h, m] = timeStr.split(":").map(Number);
  return `${String((h + hours) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toLocalISOString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
}

function generateLayoutForLot() {
  const rows = 4;
  const cols = 12;
  const spots = [];
  const spotWidth = 120;
  const spotHeight = 80;
  const gapX = 14;
  const gapY = 14;
  for (let r = 0; r < rows; r++) {
    const visualRow = r >= 2 ? r + 1 : r; 
    for (let c = 0; c < cols; c++) {
      const x1 = 100 + c * (spotWidth + gapX);
      const y1 = 100 + visualRow * (spotHeight + gapY);
      const sNum = `${String.fromCharCode(65 + r)}${c + 1}`;
      spots.push({
        id: sNum,
        spotNumber: sNum,
        status: "free",
        bounds: [[y1, x1], [y1 + spotHeight, x1 + spotWidth]],
      });
    }
  }
  return { spots };
}

const LotPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [formDate, setFormDate] = useState(todayString());
  const [formStart, setFormStart] = useState(nextQuarterHour());
  const [formEnd, setFormEnd] = useState(() => addHours(nextQuarterHour(), 1));
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const lotIndex = PARKING_LOTS.findIndex((l) => l.id === id);
    const lotMeta = PARKING_LOTS[lotIndex];
    if (!lotMeta) {
      navigate("/map");
      return;
    }

    setLoading(true);
    apiClient(`/api/parking-spots?lotId=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((spots) => {
        const rows = 4;
        const cols = 12;
        const spotWidth = 120;
        const spotHeight = 80;
        const gapX = 14;
        const gapY = 14;

        const perfectLayout = [];

        for (let r = 0; r < rows; r++) {
          const visualRow = r >= 2 ? r + 1 : r; 
          for (let c = 0; c < cols; c++) {
            const x1 = 100 + c * (spotWidth + gapX);
            const y1 = 100 + visualRow * (spotHeight + gapY);
            const expectedSpotNumber = `${String.fromCharCode(65 + r)}${c + 1}`;

            perfectLayout.push({
              id: expectedSpotNumber,
              spotNumber: expectedSpotNumber,
              status: "free",
              bounds: [[y1, x1], [y1 + spotHeight, x1 + spotWidth]],
            });
          }
        }

    
        const roadY1 = 100 + 2 * (spotHeight + gapY);
        const roadX1 = 100;
        const roadX2 = 100 + 12 * (spotWidth + gapX) - gapX;
        perfectLayout.push({
           id: 'main-road',
           spotNumber: 'main-road',
           status: 'road',
           bounds: [[roadY1, roadX1], [roadY1 + spotHeight, roadX2]]
        });

     
        spots.forEach((dbSpot) => {
          const visualSpot = perfectLayout.find((vs) => vs.spotNumber === dbSpot.spotNumber);
          if (visualSpot) {
            visualSpot.status = dbSpot.status === "AVAILABLE" ? "free" : "reserved";
          }
        });
        setLot({ ...lotMeta, layout: { spots: perfectLayout } });
      })
      .catch(() => {
        const specificLayout = generateLayoutForLot();
        setLot({ ...lotMeta, layout: specificLayout });
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSpotSelect = (spotId) => {
    setSelectedSpotId(spotId);
    setFormError("");
    const start = nextQuarterHour();
    setFormDate(todayString());
    setFormStart(start);
    setFormEnd(addHours(start, 1));
  };

  const handleFormSubmit = async () => {
    const startDT = new Date(`${formDate}T${formStart}:00`);
    const endDT = new Date(`${formDate}T${formEnd}:00`);
    const now = new Date();

    if (isNaN(startDT.getTime()) || isNaN(endDT.getTime())) {
      setFormError("Data sau ora invalida.");
      return;
    }
    if (startDT <= now) {
      setFormError("Ora de inceput trebuie sa fie in viitor.");
      return;
    }
    if (endDT <= startDT) {
      setFormError("Ora de sfarsit trebuie sa fie dupa ora de inceput.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient("/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          lotId: id,
          spotNumber: selectedSpotId, 
          startTime: toLocalISOString(startDT),
          endTime: toLocalISOString(endDT),
        }),
      });

      if (response.ok) {
        navigate("/dashboard");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setFormError(errorData.message || "Eroare la crearea rezervarii.");
      }
    } catch (err) {
      setFormError("Nu s-a putut contacta serverul.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24" data-cy="lot-layout-page">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" data-cy="lot-title">
              {lot?.name || "Parcare"}
            </h1>
            <p className="text-slate-400 text-sm">
              {lot?.layout?.description || "Click pe un loc verde pentru a-l rezerva"}
            </p>
          </div>
          <button onClick={() => navigate("/map")} data-cy="lot-back-to-map" className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors">
            Inapoi la harta
          </button>
        </div>

        {loading ? (
          <div className="text-slate-400" data-cy="lot-loading">Se incarca locurile...</div>
        ) : lot ? (
          <HighZoomParkingMap layout={lot.layout} onReserve={handleSpotSelect} />
        ) : null}

        {selectedSpotId && !loading && (
          <div className="mt-6 bg-slate-800 border border-slate-600 rounded-xl p-5">
            <h3 className="text-white font-semibold text-lg mb-4">
              Rezerva locul <span className="text-cyan-400">{selectedSpotId}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium">Data</label>
                <input type="date" value={formDate} min={todayString()} onChange={(e) => setFormDate(e.target.value)} className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium">Ora inceput</label>
                <input type="time" value={formStart} onChange={(e) => { setFormStart(e.target.value); if (e.target.value) setFormEnd(addHours(e.target.value, 1)); }} className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium">Ora sfarsit</label>
                <input type="time" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} className="bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
            </div>

            {formError && (
              <p className="text-red-400 text-sm mb-3">{formError}</p>
            )}

            <div className="flex gap-3">
              <button onClick={handleFormSubmit} disabled={submitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white font-semibold transition-colors">
                {submitting ? "Se salveaza..." : "Confirma rezervarea"}
              </button>
              <button onClick={() => { setSelectedSpotId(null); setFormError(""); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors">
                Anuleaza
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LotPage;