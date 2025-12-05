import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path 
    ? "text-brand-accent font-bold" 
    : "text-slate-400 hover:text-white transition-colors";

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <nav className="sticky top-0 z-50 bg-slate-900/95 border-b border-slate-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold tracking-wider text-white">
                WILLWI <span className="text-brand-accent text-sm">DATABASE</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/" className={isActive('/')}>首頁</Link>
                <Link to="/database" className={isActive('/database')}>作品管理</Link>
                <Link to="/interactive" className={`${location.pathname === '/interactive' ? 'text-brand-gold font-bold' : 'text-slate-400 hover:text-brand-gold transition-colors'}`}>
                  🍜 泡麵阿嬤開講
                </Link>
                <Link to="/add" className="px-4 py-2 rounded-md bg-brand-accent text-slate-900 font-bold hover:bg-sky-400 transition-colors">
                  + 新增歌曲
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <footer className="bg-slate-950 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Willwi Music. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="https://www.musixmatch.com/artist/Willwi" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-accent">Musixmatch</a>
            <a href="https://music.apple.com/us/artist/willwi/1798471457" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-accent">Apple Music</a>
            <a href="https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-accent">Spotify</a>
            <a href="https://www.youtube.com/@Willwi888" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-accent">YouTube OAC</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;