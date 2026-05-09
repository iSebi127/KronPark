import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar({ isLoggedIn, onLogout, userName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleMapClick = () => {
    if (isLoggedIn) {
      navigate('/map');
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      {/* ===== MODAL POP-UP ===== */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600/20 border border-blue-500/30 w-16 h-16 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🗺️</span>
              </div>
            </div>
            <h2 className="text-xl font-black text-white text-center mb-2">
              Autentificare necesară
            </h2>
            <p className="text-slate-400 text-sm text-center mb-6">
              Trebuie să fii autentificat pentru a accesa harta parcărilor.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowLoginModal(false); navigate('/login'); }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl font-bold transition-all duration-300 active:scale-95"
              >
                Log In
              </button>
              <button
                onClick={() => { setShowLoginModal(false); navigate('/signup'); }}
                className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-2xl font-bold border border-white/10 transition-all duration-300"
              >
                Creează cont
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full text-slate-500 hover:text-slate-300 py-2 text-sm transition-colors duration-300"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== NAVBAR ===== */}
      <div className="fixed top-6 left-0 right-0 z-50 px-6">
        <nav className="max-w-7xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white shadow-2xl rounded-3xl">
          <div className="px-8 py-3 grid grid-cols-3 items-center">

            {/* 1. STÂNGA: Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer group w-fit"
              onClick={() => navigate('/')}
            >
              <div className="bg-blue-600 w-9 h-9 flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/40 group-hover:scale-110 transition duration-300">
                <span className="font-black text-lg">P</span>
              </div>
              <span className="text-xl font-black tracking-tighter hidden sm:block">KronPark</span>
            </div>

            {/* 2. MIJLOC: Navigare */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => navigate('/')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${
                  location.pathname === '/'
                    ? 'text-white bg-white/10 border-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border-transparent hover:border-white/10'
                }`}
              >
                Acasă
              </button>
              <button
                onClick={handleMapClick}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${
                  location.pathname === '/map'
                    ? 'text-white bg-white/10 border-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 border-transparent hover:border-white/10'
                }`}
              >
                Hartă
              </button>
            </div>

            {/* 3. DREAPTA: Auth Buttons */}
            <div className="flex justify-end gap-2 sm:gap-5 items-center">
              {isLoggedIn ? (
                <>
                  {userName && (
                    <span className="text-sm text-slate-300 hidden sm:block">
                      👋 {userName}
                    </span>
                  )}
                  <button
                    onClick={onLogout}
                    className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-5 py-2 rounded-2xl text-xs font-bold transition-all duration-300 border border-red-500/30"
                  >
                    Ieșire
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sm font-bold text-slate-300 hover:text-white transition-colors duration-300"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/30 transition-all duration-300 active:scale-95"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

export default Navbar;