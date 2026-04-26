import React, { useState } from 'react';

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
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-5">
      <div className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-black text-center mb-1">
            Creeaza Cont
          </h1>
          <p className="text-slate-400 text-center text-sm">
            Alatura-te comunitatii <span className="text-blue-400 font-bold">KronPark</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1">
              Nume Complet
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="Ex: Ion Popescu"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full bg-slate-950/80 border border-slate-700 px-4 py-2 rounded-lg text-white text-sm outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="nume@exemplu.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-slate-950/80 border border-slate-700 px-4 py-2 rounded-lg text-white text-sm outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1">
              Parola
            </label>
            <input
              type="password"
              name="password"
              placeholder="Minim 8 caractere"
              value={formData.password}
              onChange={handleChange}
              minLength="8"
              required
              className="w-full bg-slate-950/80 border border-slate-700 px-4 py-2 rounded-lg text-white text-sm outline-none focus:border-blue-500 transition"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-900/50">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold py-2 rounded-lg transition duration-300 text-sm"
          >
            {isSubmitting ? 'Se creeaza contul...' : 'Inregistrare'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-b border-white/10"></div>
          <span className="text-slate-500 text-xs uppercase font-semibold">sau</span>
          <div className="flex-1 border-b border-white/10"></div>
        </div>

        <div className="text-center">
          <p className="text-slate-500 text-sm mb-2">Ai deja un cont?</p>
          <button
            onClick={() => setCurrentPage('login')}
            className="bg-none border-none text-blue-400 font-bold text-sm cursor-pointer hover:text-blue-300 transition"
          >
            Autentifica-te
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;