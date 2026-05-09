import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivateSpotsPanel({ isLoggedIn }) {
  const [open, setOpen] = useState(false);
  const [spots, setSpots] = useState([]);
  const [search, setSearch] = useState('');
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Incarcam locurile din localStorage de fiecare data cand se deschide panelul
  useEffect(() => {
    if (open) {
      const stored = JSON.parse(localStorage.getItem('privateSpots') || '[]');
      setSpots(stored);
    }
  }, [open]);

  // Inchide la click in afara
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
    return (
      s.address.toLowerCase().includes(q) ||
      (s.neighborhood || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q)
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
              placeholder="Caută după adresă sau zonă..."
              className="w-full bg-slate-800 border border-slate-600 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Lista locuri */}
          <div className="overflow-y-auto max-h-[420px]">
            {filtered.length === 0 ? (
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

                    {/* Adresa + zona */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <p className="text-sm font-semibold text-white leading-tight">{spot.address}</p>
                        {spot.neighborhood && (
                          <span className="text-xs text-blue-400 font-medium">{spot.neighborhood}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                          {spot.spots} {spot.spots === 1 ? 'loc' : 'locuri'}
                        </span>
                        {spot.pricePerHour !== null && spot.pricePerHour !== undefined ? (
                          <span className="text-xs text-green-400 font-bold">{spot.pricePerHour} RON/h</span>
                        ) : (
                          <span className="text-xs text-emerald-400 font-medium">Gratuit</span>
                        )}
                      </div>
                    </div>

                    {/* Descriere */}
                    {spot.description && (
                      <p className="text-xs text-slate-400 mb-1.5 leading-relaxed">{spot.description}</p>
                    )}

                    {/* Data + Program */}
                    {(spot.availableDate || spot.availableFrom || spot.availableTo) && (
                      <p className="text-xs text-slate-500 mb-1.5">
                        🗓️ {spot.availableDate ? new Date(spot.availableDate).toLocaleDateString('ro-RO') : 'Oricând'}
                        {(spot.availableFrom || spot.availableTo) && (
                          <span> &nbsp;🕐 {spot.availableFrom || '00:00'} – {spot.availableTo || '24:00'}</span>
                        )}
                      </p>
                    )}

                    {/* Footer: owner + contact */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40">
                      <span className="text-xs text-slate-500">
                        👤 {spot.ownerName} · {spot.createdAt}
                      </span>
                      <a
                        href={`tel:${spot.contact}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        📞 {spot.contact}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
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
