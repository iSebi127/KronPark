import React from 'react';

function Navbar({ isLoggedIn, onLogout, setCurrentPage }) {
  return (
    <div className="px-6 py-6 bg-slate-950 border-b border-white/10">
      <nav className="max-w-7xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white shadow-2xl rounded-3xl">
        <div className="px-8 py-3 grid grid-cols-3 items-center">
          
          {/* 1. STÂNGA: Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group w-fit" 
            onClick={() => setCurrentPage(isLoggedIn ? 'dashboard' : 'landing')}
          >
            <div className="bg-blue-600 w-9 h-9 flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/40 group-hover:scale-110 transition duration-300">
              <span className="font-black text-lg">P</span>
            </div>
            <span className="text-xl font-black tracking-tighter hidden sm:block">KronPark</span>
          </div>
          
          {/* 2. MIJLOC: Navigare */}
          <div className="flex justify-center gap-2">
            <button 
              onClick={() => setCurrentPage(isLoggedIn ? 'dashboard' : 'landing')}
              className="px-6 py-2 rounded-full text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/10"
            >
              Acasă
            </button>
            <button 
              onClick={() => setCurrentPage('map')} 
              className="px-6 py-2 rounded-full text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/10"
            >
              Hartă
            </button>
          </div>

          {/* 3. DREAPTA: Auth Buttons */}
          <div className="flex justify-end gap-2 sm:gap-5 items-center">
            {isLoggedIn ? (
              <button 
                onClick={onLogout} 
                className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-5 py-2 rounded-2xl text-xs font-bold transition-all duration-300 border border-red-500/30"
              >
                Ieșire
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setCurrentPage('login')} 
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors duration-300"
                >
                  Log In
                </button>
                <button 
                  onClick={() => setCurrentPage('signup')} 
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
  );
}

export default Navbar;