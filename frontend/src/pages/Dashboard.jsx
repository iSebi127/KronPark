import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import PARKING_LOTS from '../data/parkingLots'; 

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);

    const pad = (num) => String(num).padStart(2, '0');

    const year = date.getFullYear().toString().slice(-2);
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
          setCurrentUser(JSON.parse(user));
      } catch (e) {
          console.error("Failed to parse user from localStorage", e);
      }
    }

    // load reservations from API
    fetchReservations();

    setLoading(false);
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await apiClient('/api/reservations/my');
      const data = await response.json();
      if (response.ok) {
        setReservations(data);
      }
    } catch (err) {
      setError('Nu s-au putut încărca rezervările');
      console.error(err);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      const response = await apiClient(`/api/reservations/${reservationId}/cancel`, {
        method: 'PATCH',
      });
      if (response.ok) {
        fetchReservations();
      }
    } catch (err) {
      console.error('Error canceling reservation:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Profil */}
        <div className="bg-gradient-to-r from-slate-900/70 to-slate-800/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                Bine ai venit! 👋
              </h1>
              <p data-cy="dashboard-user-name" className="text-slate-400 text-lg">{currentUser?.fullName}</p>
              <p data-cy="dashboard-user-email" className="text-slate-500 text-sm mt-1">{currentUser?.email}</p>
            </div>
            <div data-cy="dashboard-active-reservations-card" className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Rezervări Active</p>
              <p data-cy="dashboard-active-reservations-count" className="text-3xl font-black text-blue-400">
                {reservations.filter(r => r.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>
        {/* Butoane Navigare */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/map')}
            data-cy="dashboard-go-to-map"
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 active:scale-95"
          >
            🗺️ Mergi la Hartă
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            data-cy="dashboard-edit-profile"
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20"
          >
            👤 Editează Profil
          </button>
          <button
            onClick={onLogout}
            data-cy="dashboard-logout"
            className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-bold py-3 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/50"
          >
            🚪 Ieșire
          </button>
        </div>
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            data-cy="dashboard-tab-overview"
            className={`px-4 py-3 font-bold text-sm transition-all duration-300 border-b-2 ${
              activeTab === 'overview'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            Istoric Rezervări
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            data-cy="dashboard-tab-profile"
            className={`px-4 py-3 font-bold text-sm transition-all duration-300 border-b-2 ${
              activeTab === 'profile'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            Informații Profil
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`px-4 py-3 font-bold text-sm transition-all duration-300 border-b-2 ${
              activeTab === 'private'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            🅿️ Vezi locuri private
          </button>
        </div>
        {/* Content */}
        {activeTab === 'overview' && (
          <div data-cy="dashboard-overview-panel" className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6">Rezervările Tale</h2>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-lg mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}
            {reservations.length === 0 ? (
              <div data-cy="dashboard-empty-reservations" className="text-center py-12">
                <p className="text-slate-400 text-lg mb-4">
                  Nu ai nicio rezervare momentan
                </p>
                <button 
                  onClick={() => navigate('/map')}
                  data-cy="dashboard-empty-go-to-map"
                  className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg transition"
                >
                  Rezerva un loc acum →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => {
        
                  const lotInfo = PARKING_LOTS.find((l) => l.id === reservation.lotId);
                  const displayLotName = lotInfo ? lotInfo.name : (reservation.lotId || "Parcare");

                  return (
                    <div 
                      key={reservation.id} 
                      className="bg-slate-800/50 border border-white/5 hover:border-white/10 p-6 rounded-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl font-black text-blue-400">
                            {displayLotName}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            reservation.status === 'ACTIVE' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : reservation.status === 'EXPIRED'
                              ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                              : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          }`}>
                            {reservation.status === 'ACTIVE' ? '✓ Activ' : reservation.status === 'EXPIRED' ? 'Expirat' : 'Anulat'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          🕐 {formatDateTime(reservation.startTime)} - {formatDateTime(reservation.endTime)}
                        </p>
                        <p className="text-slate-300 font-semibold text-sm mt-1">
                          Locul #{reservation.spotNumber || reservation.spotId}
                        </p>
                      </div>
                      {reservation.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 border border-red-500/30 hover:border-red-500/50 whitespace-nowrap"
                        >
                          ✕ Anulează
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === 'private' && (
          <PrivateSpotsInline navigate={navigate} />
        )}
        {activeTab === 'profile' && (
          <div data-cy="dashboard-profile-panel" className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-8">Informații Profil</h2>
            <div className="space-y-6">
              {/* Nume */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Nume Complet
                </label>
                <input
                  type="text"
                  data-cy="profile-fullname"
                  value={currentUser?.fullName || ''}
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-700 px-4 py-3 rounded-lg text-white disabled:opacity-60 cursor-not-allowed"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  data-cy="profile-email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-700 px-4 py-3 rounded-lg text-white disabled:opacity-60 cursor-not-allowed"
                />
              </div>
              {/* Schimbare Parola */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Parola Nouă
                </label>
                <input
                  type="password"
                  placeholder="Lăsă gol dacă nu vrei să schimbi"
                  className="w-full bg-slate-950/50 border border-slate-700 px-4 py-3 rounded-lg text-white outline-none focus:border-blue-500 transition"
                />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:bg-slate-600">
                💾 Salvează Modificări
              </button>
              <div className="bg-slate-800/50 border border-white/5 p-4 rounded-lg">
                <p className="text-slate-400 text-xs">
                  ℹ️ Funcționalitatea de editare profil va fi disponibilă curând
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PrivateSpotsInline({ navigate }) {
  const [spots, setSpots] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('privateSpots') || '[]');
    setSpots(stored);
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
    <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white">Locuri de parcare private</h2>
        <button
          onClick={() => navigate('/add-private-spot')}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
        >
          + Adaugă loc
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Caută după adresă sau zonă..."
        className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-blue-500 transition-colors"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🅿️</div>
          <p className="text-slate-400 text-lg mb-4">
            {spots.length === 0
              ? 'Niciun loc privat publicat încă.'
              : 'Niciun rezultat pentru căutarea ta.'}
          </p>
          {spots.length === 0 && (
            <button
              onClick={() => navigate('/add-private-spot')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Fii primul care adaugă un loc →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((spot) => (
            <div
              key={spot.id}
              className="bg-slate-800/50 border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-white font-bold">{spot.address}</p>
                    {spot.neighborhood && (
                      <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full">
                        {spot.neighborhood}
                      </span>
                    )}
                  </div>
                  {spot.description && (
                    <p className="text-slate-400 text-sm mb-2">{spot.description}</p>
                  )}
                  {(spot.availableDate || spot.availableFrom || spot.availableTo) && (
                    <p className="text-slate-500 text-xs mb-2">
                      🗓️ {spot.availableDate ? new Date(spot.availableDate).toLocaleDateString('ro-RO') : 'Oricând'}
                      {(spot.availableFrom || spot.availableTo) && (
                        <span> &nbsp;🕐 {spot.availableFrom || '00:00'} – {spot.availableTo || '24:00'}</span>
                      )}
                    </p>
                  )}
                  <p className="text-slate-500 text-xs">
                    👤 {spot.ownerName} · {spot.createdAt}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-sm bg-slate-700 text-slate-300 px-3 py-1 rounded-full font-medium">
                    {spot.spots} {spot.spots === 1 ? 'loc' : 'locuri'}
                  </span>
                  {spot.pricePerHour !== null && spot.pricePerHour !== undefined ? (
                    <span className="text-sm text-green-400 font-bold">{spot.pricePerHour} RON/h</span>
                  ) : (
                    <span className="text-sm text-emerald-400 font-medium">Gratuit</span>
                  )}
                  <a
                    href={`tel:${spot.contact}`}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    📞 {spot.contact}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;