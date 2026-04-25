import React, { useState } from 'react';
import './login.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function Login({ setCurrentPage, onAuthSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Autentificarea a esuat.');
        return;
      }

      onAuthSuccess(data.user);
    } catch (requestError) {
      setError('Nu s-a putut contacta serverul.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Autentificare</h1>
          <p>Bine ai revenit la <span className="brand-name">KronPark</span></p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="nume@exemplu.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-field">
            <label>Parola</label>
            <input
              type="password"
              name="password"
              placeholder="Introdu parola"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="form-message error-message">{error}</p>}

          <button type="submit" className="main-login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Se conecteaza...' : 'Conectare'}
          </button>
        </form>

        <div className="login-divider">
          <span>sau</span>
        </div>

        <div className="login-footer">
          <p>Nu ai un cont?</p>
          <button onClick={() => setCurrentPage('signup')} className="auth-link">
            Creeaza cont nou
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
