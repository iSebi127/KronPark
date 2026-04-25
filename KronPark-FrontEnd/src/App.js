import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Signup from './signup';
import Login from './login';
<<<<<<< HEAD

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
=======
import MapPage from './pages/MapPage';
>>>>>>> feature/parking-map

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
    setCurrentPage('landing');
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
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1">
        {currentPage === 'landing' && <Landing setCurrentPage={setCurrentPage} />}
<<<<<<< HEAD
        
        {currentPage === 'signup' && (
          <Signup setCurrentPage={setCurrentPage} onAuthSuccess={handleAuthSuccess} />
        )}

        {currentPage === 'login' && (
          <Login setCurrentPage={setCurrentPage} onAuthSuccess={handleAuthSuccess} />
        )}
=======
        {currentPage === 'signup' && <Signup setCurrentPage={setCurrentPage} />}
        {currentPage === 'login' && <Login setCurrentPage={setCurrentPage} />}
        {currentPage === 'map' && <MapPage />}
>>>>>>> feature/parking-map
      </div>
    </div>
  );
}

export default App;
