import React from 'react';

function Navbar({ isLoggedIn, onLogout, setCurrentPage }) {
  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          className="text-2xl font-bold cursor-pointer hover:opacity-80 transition" 
          onClick={() => setCurrentPage('landing')}
        >
          🅿️ KronPark
        </div>
        
        <ul className="flex gap-6 text-sm">
          <li><button onClick={() => setCurrentPage('landing')} className="hover:text-blue-200 transition">Acasă</button></li>
        </ul>

    <div className="flex gap-2">
  {isLoggedIn ? (
    <button 
      onClick={onLogout} 
      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105"
    >
      Deconectare
    </button>
  ) : null}
</div>
      </div>
    </nav>
  );
}

export default Navbar;