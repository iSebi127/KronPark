import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    availableFrom: '',
    availableTo: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const e = {};
    if (!form.address.trim()) e.address = 'Adresa este obligatorie.';
    if (!form.contact.trim()) e.contact = 'Informatiile de contact sunt obligatorii.';
    if (form.spots < 1 || form.spots > 20) e.spots = 'Numarul de locuri trebuie sa fie intre 1 si 20.';
    if (form.pricePerHour !== '' && isNaN(Number(form.pricePerHour))) e.pricePerHour = 'Pretul trebuie sa fie un numar.';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const newSpot = {
      id: Date.now().toString(),
      ownerName: currentUser?.fullName || currentUser?.name || 'Utilizator anonim',
      ownerEmail: currentUser?.email || '',
      address: form.address.trim(),
      neighborhood: form.neighborhood.trim(),
      spots: Number(form.spots),
      pricePerHour: form.pricePerHour !== '' ? Number(form.pricePerHour) : null,
      description: form.description.trim(),
      contact: form.contact.trim(),
      availableDate: form.availableDate,
      availableFrom: form.availableFrom,
      availableTo: form.availableTo,
      createdAt: new Date().toLocaleDateString('ro-RO'),
    };

    const existing = JSON.parse(localStorage.getItem('privateSpots') || '[]');
    existing.unshift(newSpot);
    localStorage.setItem('privateSpots', JSON.stringify(existing));

    setSubmitted(true);
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
              onClick={() => navigate('/map')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
            >
              Mergi la hartă
            </button>
            <button
              onClick={() => { setSubmitted(false); setForm({ address: '', neighborhood: '', spots: 1, pricePerHour: '', description: '', contact: '', availableDate: '', availableFrom: '', availableTo: '' }); }}
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-8 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Adaugă loc de parcare privat</h1>
          <p className="text-slate-400 text-sm">
            Publică locul tău de parcare pentru ca alți utilizatori să îl poată folosi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

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

          {/* Cartier */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Cartier / Zonă</label>
            <input
              type="text"
              name="neighborhood"
              value={form.neighborhood}
              onChange={handleChange}
              placeholder="Ex: Centru, Bartolomeu, Schei..."
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Numar locuri + Pret */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Număr locuri <span className="text-red-400">*</span>
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
                Preț / oră (RON) <span className="text-slate-500 font-normal">— opțional</span>
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
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Data disponibilă <span className="text-slate-500 font-normal">— opțional</span>
              </label>
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
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Disponibil de la</label>
              <input
                type="time"
                name="availableFrom"
                value={form.availableFrom}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Disponibil până la</label>
              <input
                type="time"
                name="availableTo"
                value={form.availableTo}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
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
              placeholder="Ex: Loc acoperit în curtea blocului, lângă intrarea principală..."
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
          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              Publică locul de parcare
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors"
            >
              Anulează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
