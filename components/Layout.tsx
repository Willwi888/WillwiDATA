import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext'; 
import GlobalPlayer from './GlobalPlayer'; 
import PaymentModal from './PaymentModal';
import { useTranslation } from '../context/LanguageContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { currentSong } = useData(); 
  const { language, setLanguage } = useTranslation();

  const isActive = (path: string) => location.pathname === path 
    ? "text-brand-accent border-b border-brand-accent" 
    : "text-slate-500 hover:text-white transition-colors";

  const mobileLinkClass = (path: string) => `block px-3 py-4 border-b border-slate-800 text-sm uppercase tracking-widest ${location.pathname === path ? 'text-brand-accent' : 'text-slate-400'}`;

  const toggleLang = () => {
      setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-brand-accent selection:text-slate-900">
      <nav className="sticky top-0 z-50 bg-slate-950/90 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-black tracking-[0.25em] text-white uppercase hover:text-brand-accent transition-colors">
                Willwi <span className="text-brand-accent text-[0.6rem] align-top tracking-widest border border-brand-accent px-1 ml-1 font-normal">DB</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10 ml-10">
                <Link to="/" className={`${isActive('/')} text-xs font-bold uppercase tracking-[0.15em] py-1`}>Home</Link>
                <Link to="/database" className={`${isActive('/database')} text-xs font-bold uppercase tracking-[0.15em] py-1`}>Catalog</Link>
                <Link to="/interactive" className={`${isActive('/interactive')} text-xs font-bold uppercase tracking-[0.15em] py-1`}>Studio</Link>
                
                <Link to="/add" className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-800 hover:border-white px-3 py-1">
                  + Add Asset
                </Link>

                {/* Support Button */}
                <button 
                  onClick={() => setIsPaymentOpen(true)}
                  className="text-brand-gold hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors border-b border-brand-gold/50 hover:border-white pb-0.5"
                >
                  Support
                </button>

                <div className="h-3 w-px bg-slate-800"></div>

                <Link to="/admin" className="text-slate-700 hover:text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  Manager
                </Link>
                
                <button onClick={toggleLang} className="text-slate-600 hover:text-white text-[10px] font-mono">
                    {language === 'zh' ? 'EN' : 'ZH'}
                </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="-mr-2 flex md:hidden items-center gap-6">
              <button 
                  onClick={() => setIsPaymentOpen(true)}
                  className="text-brand-gold font-bold text-[10px] uppercase tracking-widest border border-brand-gold px-2 py-1"
                >
                  Support
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-white focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                <div className="space-y-1.5">
                    <div className={`w-6 h-0.5 bg-current transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                    <div className={`w-6 h-0.5 bg-current transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                    <div className={`w-6 h-0.5 bg-current transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800" id="mobile-menu">
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/')}>Home</Link>
              <Link to="/database" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/database')}>Catalog</Link>
              <Link to="/interactive" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/interactive')}>Interactive Studio</Link>
              <Link to="/add" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/add')}>+ Add Asset</Link>
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/admin')}>Manager Console</Link>
            </div>
          </div>
        )}
      </nav>

      <main className={`flex-grow ${currentSong ? 'pb-24' : ''}`}> 
        <div className={location.pathname === '/' ? '' : "max-w-7xl mx-auto py-12 px-6"}>
          {children}
        </div>
      </main>

      <footer className={`bg-slate-950 border-t border-white/5 mt-auto ${currentSong ? 'pb-24' : ''}`}>
        <div className="max-w-7xl mx-auto py-12 px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-slate-600 text-[10px] tracking-[0.2em] uppercase font-bold">
            © {new Date().getFullYear()} Willwi Music.
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-[10px] tracking-[0.2em] uppercase font-bold">
            <a href="https://musicbrainz.org/artist/526cc0f8-da20-4d2d-86a5-4bf841a6ba3c" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors">MusicBrainz</a>
            <a href="https://www.musixmatch.com/artist/Willwi" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors">Musixmatch</a>
            <a href="https://music.apple.com/us/artist/willwi/1798471457" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors">Apple Music</a>
            <a href="https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors">Spotify</a>
          </div>
        </div>
      </footer>

      {/* Global Player */}
      <GlobalPlayer />
      
      {/* Donation Modal */}
      {isPaymentOpen && <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />}
    </div>
  );
};

export default Layout;