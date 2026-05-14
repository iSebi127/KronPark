import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient'; // Asigură-te că calea este corectă

export default function AddPrivateSpot() {
  const navigate = useNavigate();

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser')); } catch { return null; }
  })();

  const [form, setForm] = useState({
    address: '',
    neighborhood: '',
    spots: 1,
    pricePerHour: '',
    description: '',
    contact: '',
    availableDate: '',
    availableFrom: '', // Ex: "08:00"
    availableTo: '',   // Ex: "18:00"
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const e = {};
    if (!form.address.trim()) e.address = 'Adresa este obligatorie.';
    if (!form.neighborhood.trim()) e.neighborhood = 'Zona/Cartierul este obligatoriu.';
    if (!form.contact.trim()) e.contact = 'Informațiile de contact sunt obligatorii.';
    if (!form.pricePerHour) e.pricePerHour = 'Prețul este obligatoriu.';
    if (!form.availableFrom) e.availableFrom = 'Ora de început este obligatorie.';
    if (!form.availableTo) e.availableTo = 'Ora de sfârșit este obligatorie.';
    if (form.spots < 1 || form.spots > 20) e.spots = 'Numărul de locuri trebuie să fie între 1 și 20.';
    if (form.pricePerHour !== '' && isNaN(Number(form.pricePerHour))) e.pricePerHour = 'Prețul trebuie să fie un număr.';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { 
      setErrors(errs); 
      return; 
    }

    setIsSubmitting(true);

    // Creăm payload-ul EXACT pe structura PrivateSpotRequest.java
    const payload = {
      ownerName: currentUser?.fullName || currentUser?.name || 'Utilizator anonim',
      latitude: 45.6579, // Hardcodat temporar pt Brașov, până pui un pin pe hartă
      longitude: 25.6011, // Hardcodat temporar pt Brașov
      availableFrom: form.availableFrom, // Așteaptă format "HH:mm"
      availableTo: form.availableTo,     // Așteaptă format "HH:mm"
      price: parseFloat(form.pricePerHour), // Așteaptă BigDecimal/Number
      zone: form.neighborhood.trim() // Backend-ul cere "zone", noi îi dăm "neighborhood"
    };

    try {
      // Facem request-ul real către backend
      const response = await apiClient('/api/private-spots', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errData = await response.json().catch(() => ({}));
        alert('Eroare la salvare: ' + (errData.message || 'Te rugăm să încerci din nou.'));
      }
    } catch (err) {
      console.error(err);
      alert('Eroare de conexiune la server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-2">Loc adăugat cu succes!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Locul tău de parcare privat a fost publicat și este vizibil pentru alți utilizatori.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/harta')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
            >
              Mergi la hartă
            </button>
            <button
              onClick={() => { 
                setSubmitted(false); 
                setForm({ address: '', neighborhood: '', spots: 1, pricePerHour: '', description: '', contact: '', availableDate: '', availableFrom: '', availableTo: '' }); 
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors"
            >
              Adaugă alt loc
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Adaugă loc de parcare privat</h1>
          <p className="text-slate-400 text-sm">
            Publică locul tău de parcare pentru ca alți utilizatori să îl poată folosi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-slate-900 p-8 rounded-2xl border border-white/10 shadow-xl">

          {/* Adresa */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Adresa <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Ex: Str. Lungă nr. 10, Brașov"
              className={`w-full bg-slate-800 border ${errors.address ? 'border-red-500' : 'border-slate-600'} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors`}
            />
            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Cartier / Zonă */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Cartier / Zonă <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="neighborhood"
              value={form.neighborhood}
              onChange={handleChange}
              placeholder="Ex: Centru Civic, Coresi..."
              className={`w-full bg-slate-800 border ${errors.neighborhood ? 'border-red-500' : 'border-slate-600'} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors`}
            />
            {errors.neighborhood && <p className="text-red-400 text-xs mt-1">{errors.neighborhood}</p>}
          </div>

          {/* Numar locuri + Pret */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Număr locuri
              </label>
              <input
                type="number"
                name="spots"
                min="1"
                max="20"
                value={form.spots}
                onChange={handleChange}
                className={`w-full bg-slate-800 border ${errors.spots ? 'border-red-500' : 'border-slate-600'} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors`}
              />
              {errors.spots && <p className="text-red-400 text-xs mt-1">{errors.spots}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Preț / oră (RON) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="pricePerHour"
                min="0"
                step="0.5"
                value={form.pricePerHour}
                onChange={handleChange}
                placeholder="Ex: 5"
                className={`w-full bg-slate-800 border ${errors.pricePerHour ? 'border-red-500' : 'border-slate-600'} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors`}
              />
              {errors.pricePerHour && <p className="text-red-400 text-xs mt-1">{errors.pricePerHour}</p>}
            </div>
          </div>

          {/* Data + Program disponibil */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Data disponibilă</label>
              <input
                type="date"
                name="availableDate"
                value={form.availableDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Disponibil de la <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                name="availableFrom"
                value={form.availableFrom}
                onChange={handleChange}
                className={`w-full bg-slate-800 border ${errors.availableFrom ? 'border-red-500' : 'border-slate-600'} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Până la <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                name="availableTo"
                value={form.availableTo}
                onChange={handleChange}
                className={`w-full bg-slate-800 border ${errors.availableTo ? 'border-red-500' : 'border-slate-600'} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors`}
              />
            </div>
          </div>

          {/* Descriere */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Descriere <span className="text-slate-500 font-normal">— opțional</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Ex: Loc acoperit în curtea blocului..."
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Contact (telefon / email) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Ex: 0722 123 456 sau ion@email.com"
              className={`w-full bg-slate-800 border ${errors.contact ? 'border-red-500' : 'border-slate-600'} text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors`}
            />
            {errors.contact && <p className="text-red-400 text-xs mt-1">{errors.contact}</p>}
          </div>

          {/* Submit */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Se salvează...' : 'Publică locul de parcare'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors"
            >
              Anulează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}