import React from 'react';
import './login.css'; 

function Login({ setCurrentPage }) {
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Autentificare</h1>
          <p>Bine ai revenit la <span className="brand-name">KronPark</span></p>
        </div>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-field">
            <label>Email</label>
            <input type="email" placeholder="nume@exemplu.com" required />
          </div>

          <div className="input-field">
            <label>Parolă</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          <button type="submit" className="main-login-btn">
            Conectare
          </button>
        </form>

        <div className="login-divider">
          <span>sau</span>
        </div>

        <div className="login-footer">
          <p>Nu ai un cont?</p>
          <button onClick={() => setCurrentPage('signup')} className="auth-link">
            Creează cont nou
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;