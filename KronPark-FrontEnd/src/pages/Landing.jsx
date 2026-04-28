import React from 'react';

function Landing({ setCurrentPage, isLoggedIn }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-gray-900">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-6xl font-bold text-white mb-4">🅿️ KronPark</h1>
          <p className="text-2xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Găsește, rezervă și plătește locurile de parcare - rapid și ușor
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {isLoggedIn ? (
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
              >
                Mergi la Dashboard
              </button>
            ) : (
              <>
                {/* BUTONUL DE SIGNUP (Crează Cont) */}
                <button
                  onClick={() => setCurrentPage('signup')}
                  data-cy="landing-signup"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  Crează Cont
                </button>

                {/* BUTONUL DE LOGIN (Autentificare) */}
                <button
                  onClick={() => setCurrentPage('login')}
                  data-cy="landing-login"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-6 py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 active:scale-95"
                >
                  Autentificare
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900 py-16 px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-12">De ce să alegi KronPark?</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard icon="⚡" title="Instant" description="Rezervă un loc în câteva secunde și ocupă-l imediat." />
          <FeatureCard icon="🗺️" title="Localizare în Timp Real" description="Vezi disponibilitatea locurilor în timp real pe hartă." />
          <FeatureCard icon="⏰" title="Timere Inteligente" description="Primești alertă înainte ca rezervarea să expire." />
          <FeatureCard icon="🎯" title="Gamificație" description="Câștigă puncte și deblochează nivele cu fiecare rezervare." />
          <FeatureCard icon="💳" title="Plată Sigură" description="Plați securizate și transparente, fără surprize." />
          <FeatureCard icon="📱" title="Disponibil Oriunde" description="Funcționează pe mobil, tabletă și computer." />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-8 text-center text-gray-400">
        <p>&copy; 2026 KronPark. Toate drepturile rezervate.</p>
      </footer>
    </div>
  );
}

// Componenta mică pentru carduri (FeatureCard)
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition transform hover:scale-105">
      <h3 className="text-2xl font-bold text-blue-400 mb-2">{icon} {title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

export default Landing;
