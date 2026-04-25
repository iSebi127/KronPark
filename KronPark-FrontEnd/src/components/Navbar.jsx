import React from 'react';

function Navbar({ isLoggedIn, onLogout, setCurrentPage }) {
  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-4 px-6 shadow-lg">
      <div className="flex items-center">
        <div 
          className="text-2xl font-bold cursor-pointer hover:opacity-80 transition flex items-center gap-2" 
          onClick={() => setCurrentPage('landing')}
        >
          <div className="bg-blue-400 px-3 py-1 rounded-lg font-bold">P</div>
          KronPark
        </div>
      </div>
    </nav>
  );
}

export default Navbar;