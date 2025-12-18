import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path 
    ? "text-brand-accent font-bold" 
    : "text-slate-400 hover:text-white transition-colors";

  const mobileLinkClass = (path: string) => `block px-3 py-2 rounded-md text-base font-medium ${location.pathname === path ? 'bg-slate-800 text-brand-accent' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <nav className="sticky top-0 z-50 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold tracking-[0.2em] text-white uppercase hover:text-brand-accent transition-colors">
                Willwi <span className="text-brand-accent text-xs tracking-normal">DB</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/" className={isActive('/')}>首頁</Link>
                <Link to="/database" className={isActive('/database')}>作品管理</Link>
                <Link to="/add" className="px-4 py-2 rounded-full border border-slate-600 text-slate-300 hover:bg-white hover:text-slate-900 transition-all text-sm font-bold">
                  + 新增作品
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/')}>首頁</Link>
              <Link to="/database" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/database')}>作品資料庫</Link>
              <Link to="/add" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-brand-accent bg-slate-800/50 mt-4 border border-brand-accent/20">
                + 新增歌曲
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {/* Remove default padding for Home to allow full bleed hero */}
        <div className={location.pathname === '/' ? '' : "max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8"}>
          {children}
        </div>
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-600 text-xs tracking-widest uppercase">
            © {new Date().getFullYear()} Willwi Music.
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs tracking-widest uppercase">
            <a href="https://musicbrainz.org/artist/526cc0f8-da20-4d2d-86a5-4bf841a6ba3c" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">MusicBrainz</a>
            <a href="https://www.musixmatch.com/artist/Willwi" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">Musixmatch</a>
            <a href="https://music.apple.com/us/artist/willwi/1798471457" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">Apple Music</a>
            <a href="https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">Spotify</a>
            <a href="https://www.youtube.com/@Willwi888" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">YouTube OAC</a>
            <a href="https://willwi.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors border-b border-slate-600 pb-0.5">Willwi.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;