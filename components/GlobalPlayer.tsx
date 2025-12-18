import React from 'react';
import { useData } from '../context/DataContext';

const GlobalPlayer: React.FC = () => {
  const { currentSong, closePlayer } = useData();

  if (!currentSong) return null;

  // 如果歌曲沒有 Spotify ID，則不顯示播放器（或顯示錯誤訊息）
  if (!currentSong.spotifyId) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/95 backdrop-blur-md border-t border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] animate-slide-up">
      <div className="max-w-7xl mx-auto flex items-center h-20 px-4 gap-4">
        {/* Info Area */}
        <div className="flex items-center gap-3 w-48 sm:w-64 flex-shrink-0 group">
             <div className="relative w-12 h-12 flex-shrink-0">
                 <img src={currentSong.coverUrl} className="w-full h-full rounded object-cover shadow-md bg-slate-800" alt={currentSong.title} />
                 <div className="absolute inset-0 bg-black/20 rounded"></div>
             </div>
             <div className="hidden sm:block overflow-hidden min-w-0">
                 <div className="text-white font-bold text-sm truncate group-hover:text-brand-accent transition-colors">{currentSong.title}</div>
                 <div className="text-slate-400 text-xs truncate">Willwi {currentSong.versionLabel ? `• ${currentSong.versionLabel}` : ''}</div>
             </div>
        </div>

        {/* Player Embed (Compact Mode) */}
        <div className="flex-grow h-full py-2 flex justify-center">
             <div className="w-full max-w-2xl h-full rounded-lg overflow-hidden bg-black/50">
                <iframe 
                    src={`https://open.spotify.com/embed/track/${currentSong.spotifyId}?utm_source=generator&theme=0`} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    allowFullScreen 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="eager"
                    title="Spotify Player"
                ></iframe>
             </div>
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 flex items-center">
            <button 
                onClick={closePlayer} 
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="關閉播放器"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
}

export default GlobalPlayer;