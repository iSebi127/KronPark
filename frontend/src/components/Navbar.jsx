import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Navbar({ isLoggedIn, onLogout, userName }) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative z-50 px-6 py-6 bg-slate-950 border-b border-white/10">
      <nav className="max-w-7xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white shadow-2xl rounded-3xl">
        <div className="px-8 py-3 grid grid-cols-3 items-center">
          
          <div 
            className="flex items-center gap-2 cursor-pointer group w-fit" 
            onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}
          >
            <div className="bg-blue-600 w-9 h-9 flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/40 group-hover:scale-110 transition duration-300">
              <span className="font-black text-lg">P</span>
            </div>
            <span className="text-xl font-black tracking-tighter hidden sm:block">KronPark</span>
          </div>
          
          <div className="flex justify-center gap-2">
            <Link to={isLoggedIn ? '/dashboard' : '/'} className="px-6 py-2 rounded-full text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/10">
              Acasă
            </Link>
            <Link to="/map" className="px-6 py-2 rounded-full text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/10">
              Hartă
            </Link>
          </div>

          <div className="flex justify-end gap-2 sm:gap-5 items-center">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 focus:outline-none group"
                >
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white hidden sm:block transition-colors duration-300">
                    {userName ? userName : "Contul meu"}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-transparent group-hover:border-blue-500 flex items-center justify-center text-lg transition-all duration-300 shadow-md">
                    👤
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col transform transition-all">
                    
                    <div className="px-4 py-4 border-b border-slate-700/60 bg-slate-800/30">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Conectat ca</p>
                      <p className="text-sm font-bold text-white truncate">{userName ? userName : "Contul meu"}</p>
                    </div>
                    
                    <div className="flex flex-col py-2">
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/dashboard');
                        }}
                        className="px-5 py-2.5 text-left text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-3"
                      >
                        ⚙️ Setări cont
                      </button>

                      <div className="h-px bg-slate-700/60 my-1 mx-3"></div>

                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onLogout();
                        }}
                        className="px-5 py-2.5 text-left text-sm font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors flex items-center gap-3"
                      >
                        🚪 Ieșire
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  data-cy="navbar-login"
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors duration-300"
                >
                  Log In
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  data-cy="navbar-signup"
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