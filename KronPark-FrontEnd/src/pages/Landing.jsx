import React from 'react';
import { useNavigate } from 'react-router-dom';

function Landing({ isLoggedIn }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      
      {/* --- HERO SECTION --- */}
      <div className="relative min-h-screen flex items-center justify-center text-center px-4 overflow-hidden bg-gray-900">
        
        {/* CEL MAI SIMPLU COD DE VIDEO - Fără niciun JS adăugat */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute z-0 w-full h-full object-cover"
        >
          {/* Va folosi WebM pentru loop perfect. Dacă browserul e vechi, trece pe mp4 */}
          <source src="/parking.webm" type="video/webm" />
          <source src="/parking.mp4" type="video/mp4" />
        </video>

        {/* --- Textul și Butoanele --- */}
        <div className="relative z-10">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">🅿️ KronPark</h1>
          <p className="text-2xl text-white mb-8 max-w-2xl mx-auto drop-shadow-xl font-medium">
            Găsește, rezervă și plătește locurile de parcare - rapid și ușor
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30"
              >
                Mergi la Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signup')}
                  data-cy="landing-signup"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/40"
                >
                  Crează Cont
                </button>

                <button
                  onClick={() => navigate('/login')}
                  data-cy="landing-login"
                  className="bg-black/40 hover:bg-black/60 backdrop-blur-sm border-2 border-white/50 text-white hover:border-white px-8 py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 active:scale-95"
                >
                  Autentificare
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <div className="bg-gray-900 py-16 px-4 relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
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

      {/* --- FOOTER --- */}
      <footer className="bg-gray-950 border-t border-gray-800 py-8 text-center text-gray-400 relative z-20">
        <p>&copy; 2026 KronPark. Toate drepturile rezervate.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-xl border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition duration-300 transform hover:-translate-y-1">
      <h3 className="text-2xl font-bold text-blue-400 mb-2">{icon} {title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

export default Landing;