import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import MapPage from './pages/MapPage';
import Dashboard from './pages/Dashboard';
import LotPage from './pages/LotPage';
import AddPrivateSpot from './pages/AddPrivateSpot';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setIsLoggedIn(true);
        setCurrentUser(JSON.parse(savedUser));
      }

      if (process.env.NODE_ENV === 'development') {
        try {
          const params = new URLSearchParams(window.location.search);
          const auto = params.get('autoLogin') || params.get('auto_login');
          if (auto === 'true' || auto === '1') {
            const devUser = { id: 'dev', name: 'Developer', email: 'dev@example.com' };
            localStorage.setItem('currentUser', JSON.stringify(devUser));
            setIsLoggedIn(true);
            setCurrentUser(devUser);
          }
        } catch (err) {
          console.warn(err);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleAuthSuccess = (user, token) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (token) {
      localStorage.setItem('jwtToken', token);
    }
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggedIn(false);
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('jwtToken');
    }
  };

  const getUserFullName = () => {
    if (!currentUser) return "";
    if (currentUser.firstName && currentUser.lastName) return `${currentUser.firstName} ${currentUser.lastName}`;
    if (currentUser.fullName) return currentUser.fullName;
    if (currentUser.name) return currentUser.name;
    return "Contul meu"; 
  };

  return (
    <BrowserRouter>
      <div className="bg-slate-950 text-white min-h-screen flex flex-col">
        <Navbar 
          isLoggedIn={isLoggedIn} 
          onLogout={handleLogout} 
          userName={getUserFullName()} 
        />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Landing isLoggedIn={isLoggedIn} />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/lots/:id" element={<LotPage />} />
            <Route path="/dashboard" element={isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" />} />
            <Route path="/add-private-spot" element={isLoggedIn ? <AddPrivateSpot /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/signup" element={<Signup onAuthSuccess={handleAuthSuccess} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;