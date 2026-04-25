import React, { useState } from 'react';
import './signup.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function Signup({ setCurrentPage, onAuthSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
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
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        const validationMessage = data.validationErrors
          ? Object.values(data.validationErrors).join(' ')
          : '';
        setError(validationMessage || data.message || 'Inregistrarea a esuat.');
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
    <div className="signup-container">
      <div className="bg-glow"></div>

      <div className="signup-box">
        <div className="signup-header">
          <h1>Creeaza Cont</h1>
          <p>Alatura-te comunitatii <span className="brand-name">KronPark</span></p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-field">
            <label>Nume Complet</label>
            <input
              type="text"
              name="fullName"
              placeholder="Ex: Ion Popescu"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="Minim 8 caractere"
              value={formData.password}
              onChange={handleChange}
              minLength="8"
              required
            />
          </div>

          {error && <p className="form-message error-message">{error}</p>}

          <button type="submit" className="main-signup-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Se creeaza contul...' : 'Inregistrare'}
          </button>
        </form>

        <div className="signup-divider">
          <span>sau</span>
        </div>

        <div className="signup-footer">
          <p>Ai deja un cont?</p>
          <button onClick={() => setCurrentPage('login')} className="auth-link">
            Autentifica-te
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
