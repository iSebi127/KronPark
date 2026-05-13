import React from 'react';
import { useNavigate } from 'react-router-dom';

function Landing({ isLoggedIn }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-slate-200">
      
      <div className="relative h-screen flex items-center justify-center text-center px-4 overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute z-0 w-full h-full object-cover"
        >
          <source src="/parking.webm" type="video/webm" />
          <source src="/parking.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/90 via-slate-900/60 to-slate-950"></div>

        <div className="relative z-10 mt-16">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight">
            KronPark
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto drop-shadow-xl font-light leading-relaxed">
            Găsește, rezervă și plătește locurile de parcare <br className="hidden md:block" /> 
            <span className="font-semibold text-white">rapid, ușor și fără stres.</span>
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(37,99,235,0.4)] active:scale-95"
              >
                Mergi la Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(37,99,235,0.4)] active:scale-95"
                >
                  Creează Cont 
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                >
                  Autentificare
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative py-24 px-4 bg-slate-950 z-20 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Cum funcționează?</h2>
            <p className="text-slate-400 text-lg">Parchezi mașina în 3 pași simpli, fără a pierde timp în trafic.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent -z-10"></div>

            <StepCard 
              number="1" 
              icon="📍" 
              title="Alegi zona" 
              description="Deschizi harta interactivă și verifici în timp real locurile publice sau private disponibile în zona ta." 
            />
            <StepCard 
              number="2" 
              icon="💻" 
              title="Rezervi locul" 
              description="Selectezi durata dorită și plătești rapid direct de pe site. Locul tău este asigurat și te așteaptă." 
            />
            <StepCard 
              number="3" 
              icon="🚘" 
              title="Parchezi liniștit" 
              description="Te ghidezi direct către locul rezervat. Fără tichete, fără monede, zero stres." 
            />
          </div>
        </div>
      </div>

      <div 
        className="relative py-24 px-4 z-20 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/imagine_descriere.png')" }}
      >
        <div className="absolute inset-0 bg-slate-950/90 z-0"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Funcționalități Premium</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon="⚡" title="Rezervare Instantă" description="Ocupă locul cu un singur click. Actualizare server în mai puțin de o secundă." />
            <FeatureCard icon="🚦" title="Trafic Live" description="Harta integrează date de trafic în timp real pentru a-ți alege ruta perfectă." />
            <FeatureCard icon="⏰" title="Notificări Smart" description="Ești atenționat cu 10 minute înainte ca sesiunea ta de parcare să expire." />
            <FeatureCard icon="👥" title="Parcări Private" description="Închiriază propriul loc de parcare când ești plecat la muncă și fă bani." />
            <FeatureCard icon="💳" title="Plăți Securizate" description="Sistem de plată integrat cu cele mai înalte standarde de securitate bancară." />
            <FeatureCard icon="🏆" title="Sistem Rewards" description="Acumulează puncte de loialitate și transformă-le în ore de parcare gratuite." />
          </div>
        </div>
      </div>

      <div className="relative py-24 px-4 bg-slate-950 z-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Iubit de șoferii brașoveni</h2>
            <p className="text-slate-400 text-lg">Peste <span className="text-blue-400 font-bold">5.000 de șoferi</span> au ales deja comoditatea KronPark.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReviewCard 
              name="Alexandru Mihai" 
              role="Șofer de Ride-Sharing"
              stars="⭐⭐⭐⭐⭐" 
              review="Absolut genială platforma! Nu mai pierd 20 de minute învârtindu-mă prin Centrul Vechi. Intru pe site, văd un loc liber, îl rezerv și merg la fix."
            />
            <ReviewCard 
              name="Elena Popescu" 
              role="Navetistă"
              stars="⭐⭐⭐⭐⭐" 
              review="Iubesc funcția care mă anunță că expiră parcarea. Am scăpat definitiv de stresul amenzilor. Interfața este curată, iar site-ul se mișcă excelent."
            />
            <ReviewCard 
              name="Cosmin V." 
              role="Turist"
              stars="⭐⭐⭐⭐⭐" 
              review="Am vizitat Brașovul în weekend, când era extrem de aglomerat. KronPark m-a salvat. Am parcat direct și am știut exact prețul dinainte."
            />
          </div>
        </div>
      </div>

      <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8 px-4 relative z-20 text-slate-400 text-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-lg font-black">P</div>
              <span className="text-xl font-black text-white">KronPark</span>
            </div>
            <p className="mb-4">Soluția ta inteligentă pentru parcări rapide și fără stres în inima României.</p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-white text-xl transition">✉️</span>
              <span className="cursor-pointer hover:text-white text-xl transition">📘</span>
              <span className="cursor-pointer hover:text-white text-xl transition">📸</span>
            </div>
          </div>

          {/* Linkuri 1 */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Platformă</h4>
            <ul className="space-y-2">
              <li><a href="/harta" className="hover:text-blue-400 transition">Harta Parcărilor</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Prețuri și Abonamente</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Devino Owner</a></li>
            </ul>
          </div>

          {/* Linkuri 2 */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Companie</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition">Despre Noi</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Cariere</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
            </ul>
          </div>

          {/* Linkuri 3 */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition">Termeni și Condiții</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Politica de Confidențialitate</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Cookie-uri</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-800 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} KronPark Brașov. Toate drepturile rezervate.</p>
        </div>
      </footer>

    </div>
  );
}

function StepCard({ number, icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center p-6 relative">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl mb-6 shadow-xl relative z-10 group-hover:scale-110 transition-transform">
        {icon}
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm border-4 border-slate-950">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-blue-500 hover:bg-slate-900/80 transition duration-300 transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(37,99,235,0.15)] group">
      <div className="text-4xl mb-4 transform group-hover:scale-110 transition duration-300 drop-shadow-md">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function ReviewCard({ name, role, stars, review }) {
  return (
    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition duration-300 flex flex-col justify-between shadow-lg">
      <div>
        <div className="text-sm mb-4 tracking-widest">{stars}</div>
        <p className="text-slate-300 italic mb-6 leading-relaxed">"{review}"</p>
      </div>
      <div className="flex items-center gap-4 border-t border-slate-800 pt-5 mt-auto">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-bold text-xl shadow-inner">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="text-white font-bold">{name}</h4>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default Landing;