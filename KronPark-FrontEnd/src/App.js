import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Signup from './signup';
import Login from './login';
import MapPage from './pages/MapPage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('currentUser');
    setCurrentPage('landing');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1">
        {currentPage === 'landing' && <Landing setCurrentPage={setCurrentPage} />}
        {currentPage === 'signup' && <Signup setCurrentPage={setCurrentPage} />}
        {currentPage === 'login' && <Login setCurrentPage={setCurrentPage} />}
        {currentPage === 'map' && <MapPage />}
      </div>
    </div>
  );
}

export default App;