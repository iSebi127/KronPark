import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import MapPage from './pages/MapPage';
import Dashboard from './pages/Dashboard';
import LotPage from './pages/LotPage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // On mount: auto-sign-in if there's a saved user (i.e. user didn't explicitly log out)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setIsLoggedIn(true);
      }

      // Development helper: allow visiting the site with ?autoLogin=true to auto-login
      // This only runs in development (NODE_ENV !== 'production') to avoid changing production behavior
      if (process.env.NODE_ENV === 'development') {
        try {
          const params = new URLSearchParams(window.location.search);
          const auto = params.get('autoLogin') || params.get('auto_login');
          if (auto === 'true' || auto === '1') {
            const devUser = { id: 'dev', name: 'Developer', email: 'dev@example.com' };
            localStorage.setItem('currentUser', JSON.stringify(devUser));
            setIsLoggedIn(true);
          }
        } catch (err) {
          // ignore URL parsing errors in weird environments
          console.warn('Auto-login check failed', err);
        }
      }
    } catch (e) {
      // ignore localStorage access errors
      console.warn('Could not access localStorage on mount', e);
    }
  }, []);

  const handleAuthSuccess = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setIsLoggedIn(true);
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
    }
  };

  return (
    <BrowserRouter>
      <div className="bg-slate-950 text-white min-h-screen flex flex-col">
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Landing isLoggedIn={isLoggedIn} />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/lots/:id" element={<LotPage />} />
            <Route path="/dashboard" element={isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" />} />
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