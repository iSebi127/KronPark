import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient'; // Adăugăm clientul API

export default function PrivateSpotsPanel({ isLoggedIn }) {
  const [open, setOpen] = useState(false);
  const [spots, setSpots] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Acum descărcăm datele de pe backend, nu din localStorage
  useEffect(() => {
    if (open) {
      setLoading(true);
      apiClient('/api/private-spots')
        .then(res => res.json())
        .then(data => {
          setSpots(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Eroare la încărcarea locurilor", err);
          setLoading(false);
        });
    }
  }, [open]);

  // Închide la click în afară
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = spots.filter((s) => {
    const q = search.toLowerCase();
    // Căutăm după zona sau numele proprietarului (câmpurile din Java)
    return (
      (s.zone || '').toLowerCase().includes(q) ||
      (s.ownerName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative" ref={panelRef}>
      {/* Buton trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Locuri de parcare private"
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all duration-300 border
          ${open
            ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
            : 'text-slate-300 hover:text-white hover:bg-white/10 border-transparent hover:border-white/10'
          }`}
      >
        <span className="text-base">🅿️</span>
        <span className="hidden sm:block">Privat</span>
        {spots.length > 0 && (
          <span className="bg-blue-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
            {spots.length > 9 ? '9+' : spots.length}
          </span>
        )}
      </button>

      {/* Panel dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">

          {/* Header panel */}
          <div className="px-4 py-3 border-b border-slate-700/60 bg-slate-800/40 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Parcări private</h3>
              <p className="text-xs text-slate-400">Locuri oferite de alți utilizatori</p>
            </div>
            {isLoggedIn && (
              <button
                onClick={() => { setOpen(false); navigate('/add-private-spot'); }}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                + Adaugă
              </button>
            )}
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-slate-700/40">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută după zonă sau proprietar..."
              className="w-full bg-slate-800 border border-slate-600 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Lista locuri */}
          <div className="overflow-y-auto max-h-[420px]">
            {loading ? (
              <div className="px-4 py-10 text-center text-slate-400 text-sm">Se încarcă...</div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="text-3xl mb-2">🅿️</div>
                <p className="text-slate-400 text-sm font-medium">
                  {spots.length === 0
                    ? 'Niciun loc privat publicat încă.'
                    : 'Niciun rezultat pentru căutarea ta.'}
                </p>
                {isLoggedIn && spots.length === 0 && (
                  <button
                    onClick={() => { setOpen(false); navigate('/add-private-spot'); }}
                    className="mt-3 text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    Fii primul care adaugă un loc!
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-700/40">
                {filtered.map((spot) => (
                  <div key={spot.id} className="px-4 py-3 hover:bg-slate-800/50 transition-colors">

                    {/* Zona + Pret */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <p className="text-sm font-semibold text-white leading-tight">📍 Zona {spot.zone}</p>
                        <span className="text-xs text-blue-400 font-medium">Status: {spot.status}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                          1 loc
                        </span>
                        {spot.price > 0 ? (
                          <span className="text-xs text-green-400 font-bold">{spot.price} RON/h</span>
                        ) : (
                          <span className="text-xs text-emerald-400 font-medium">Gratuit</span>
                        )}
                      </div>
                    </div>

                    {/* Data + Program */}
                    <p className="text-xs text-slate-500 mb-1.5 mt-2">
                       🕐 {spot.availableFrom || '00:00'} – {spot.availableTo || '24:00'}
                    </p>

                    {/* Footer: owner */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40">
                      <span className="text-xs text-slate-400">
                        👤 Proprietar: <span className="font-bold text-slate-300">{spot.ownerName}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Panel */}
          {!isLoggedIn && (
            <div className="px-4 py-3 border-t border-slate-700/60 bg-slate-800/30 text-center">
              <p className="text-xs text-slate-400">
                <span
                  onClick={() => { setOpen(false); navigate('/login'); }}
                  className="text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
                >
                  Conectează-te
                </span>{' '}
                pentru a adăuga propriul loc de parcare.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}