import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Signup from './pages/Signup';  
import Login from './pages/Login';    
import MapPage from './pages/MapPage'; 
import Dashboard from './pages/Dashboard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleAuthSuccess = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      setIsLoggedIn(false);
      localStorage.removeItem('currentUser');
      setCurrentPage('landing');
    }
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1">
        {currentPage === 'landing' && <Landing setCurrentPage={setCurrentPage} />}
        
        {currentPage === 'signup' && (
          <Signup setCurrentPage={setCurrentPage} onAuthSuccess={handleAuthSuccess} />
        )}

        {currentPage === 'login' && (
          <Login setCurrentPage={setCurrentPage} onAuthSuccess={handleAuthSuccess} />
        )}

        {currentPage === 'dashboard' && (
          <Dashboard setCurrentPage={setCurrentPage} onLogout={handleLogout} />
        )}

        {currentPage === 'map' && <MapPage />}
      </div>
    </div>
  );
}

export default App;