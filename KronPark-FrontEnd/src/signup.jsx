import React from 'react';
import './signup.css';

function Signup({ setCurrentPage }) {
  return (
    <div className="signup-container">
      {/* Element decorativ de fundal (opțional pentru extra stil) */}
      <div className="bg-glow"></div>
      
      <div className="signup-box">
        <div className="signup-header">
          <h1>Creează Cont</h1>
          <p>Alătură-te comunității <span className="brand-name">KronPark</span></p>
        </div>

        <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-field">
            <label>Nume Complet</label>
            <input type="text" placeholder="Ex: Ion Popescu" required />
          </div>

          <div className="input-field">
            <label>Email</label>
            <input type="email" placeholder="nume@exemplu.com" required />
          </div>

          <div className="input-field">
            <label>Parolă</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          <button type="submit" className="main-signup-btn">
            Înregistrare
          </button>
        </form>

        <div className="signup-divider">
          <span>sau</span>
        </div>

        <div className="signup-footer">
          <p>Ai deja un cont?</p>
          <button onClick={() => setCurrentPage('login')} className="auth-link">
            Autentifică-te
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;