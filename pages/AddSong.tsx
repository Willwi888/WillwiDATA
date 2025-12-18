import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Language, ProjectType, Song } from '../types';
import { searchSpotifyTracks, SpotifyTrack } from '../services/spotifyService';

const AddSong: React.FC = () => {
  const navigate = useNavigate();
  const { addSong } = useData();

  // Spotify Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Pre-fill MusicBrainz ID for Willwi
  const [formData, setFormData] = useState<Partial<Song>>({
    title: '',
    versionLabel: '',
    language: Language.Mandarin,
    projectType: ProjectType.Indie,
    releaseDate: new Date().toISOString().split('T')[0],
    isEditorPick: false,
    coverUrl: 'https://picsum.photos/400/400', // Default placeholder
    lyrics: '',
    description: '',
    musicBrainzArtistId: '526cc0f8-da20-4d2d-86a5-4bf841a6ba3c'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSpotifySearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowResults(true);
    // Add "Willwi" to query to prioritize your songs if user just types title
    const results = await searchSpotifyTracks(`${searchQuery} artist:Willwi`);
    // If no results with artist filter, try broad search
    if (results.length === 0) {
         const broadResults = await searchSpotifyTracks(searchQuery);
         setSearchResults(broadResults);
    } else {
        setSearchResults(results);
    }
    setIsSearching(false);
  };

  const importSpotifyData = (track: SpotifyTrack) => {
    const largestImage = track.album.images[0]?.url || '';
    
    // Intelligent Version Parsing
    // 1. Check for "Title (Version)" pattern
    // 2. Check for "Title - Version" pattern
    let cleanTitle = track.name;
    let version = '';

    const parenMatch = cleanTitle.match(/^(.*?)\s*\(([^)]+)\)$/);
    if (parenMatch) {
        cleanTitle = parenMatch[1];
        version = parenMatch[2];
    } else if (cleanTitle.includes(' - ')) {
        const parts = cleanTitle.split(' - ');
        version = parts.pop() || ''; // Take the last part as version
        cleanTitle = parts.join(' - ');
    }

    setFormData(prev => ({
        ...prev,
        title: cleanTitle,
        versionLabel: version,
        releaseDate: track.album.release_date,
        coverUrl: largestImage,
        isrc: track.external_ids.isrc || '',
        upc: track.album.external_ids?.upc || track.album.external_ids?.ean || '',
        spotifyId: track.id,
        spotifyLink: track.external_urls.spotify,
        // Reset or keep other fields
    }));
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title) return alert("請輸入歌名");
    if (!formData.releaseDate) return alert("請輸入發行日期");

    try {
        const newSong: Song = {
            id: Date.now().toString(), // Simple ID generation
            title: formData.title!,
            versionLabel: formData.versionLabel || '',
            coverUrl: formData.coverUrl!,
            language: formData.language as Language,
            projectType: formData.projectType as ProjectType,
            releaseDate: formData.releaseDate!,
            isEditorPick: !!formData.isEditorPick,
            isrc: formData.isrc,
            upc: formData.upc,
            spotifyId: formData.spotifyId,
            musicBrainzArtistId: formData.musicBrainzArtistId,
            youtubeUrl: formData.youtubeUrl,
            musixmatchUrl: formData.musixmatchUrl,
            youtubeMusicUrl: formData.youtubeMusicUrl,
            spotifyLink: formData.spotifyLink,
            appleMusicLink: formData.appleMusicLink,
            lyrics: formData.lyrics,
            description: formData.description,
            credits: formData.credits
        };

        addSong(newSong);
        navigate('/database');
    } catch (error) {
        console.error("Error adding song:", error);
        alert("新增歌曲時發生錯誤，請稍後再試。");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h2 className="text-3xl font-bold text-white mb-6">新增歌曲</h2>

      {/* Spotify Import Section */}
      <div className="bg-gradient-to-r from-green-900/50 to-slate-900 p-6 rounded-xl border border-green-700/50 mb-8">
        <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            從 Spotify 快速匯入
        </h3>
        <div className="flex gap-4">
            <input 
                type="text" 
                placeholder="輸入歌名搜尋 (例如: 再愛一次)"
                className="flex-grow bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSpotifySearch()}
            />
            <button 
                onClick={handleSpotifySearch}
                disabled={isSearching}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
                {isSearching ? '搜尋中...' : '搜尋'}
            </button>
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
            <div className="mt-4 grid gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {searchResults.map(track => (
                    <div key={track.id} className="flex items-center gap-4 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer transition-colors" onClick={() => importSpotifyData(track)}>
                        <img src={track.album.images[2]?.url || track.album.images[0]?.url} className="w-12 h-12 rounded object-cover" alt="cover" />
                        <div className="flex-grow">
                            <div className="font-bold text-white">{track.name}</div>
                            <div className="text-xs text-slate-400">
                                {track.artists.map(a => a.name).join(', ')} • {track.album.name} ({track.album.release_date})
                            </div>
                        </div>
                        <button className="text-xs bg-green-900/50 text-green-400 px-3 py-1 rounded border border-green-800">
                            選用
                        </button>
                    </div>
                ))}
            </div>
        )}
         {showResults && searchResults.length === 0 && !isSearching && searchQuery && (
             <div className="mt-4 text-slate-400 text-sm">找不到相關歌曲，請嘗試不同關鍵字。</div>
         )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-slate-800 p-8 rounded-xl border border-slate-700">
        
        {/* Basic Info */}
        <section>
          <h3 className="text-xl font-semibold text-brand-accent mb-4 border-b border-slate-700 pb-2">基本資訊</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">歌名 *</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">版本標記 (如: Acoustic)</label>
              <input name="versionLabel" value={formData.versionLabel} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">語言</label>
              <select name="language" value={formData.language} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
                {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">專案類型</label>
              <select name="projectType" value={formData.projectType} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
                {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">發行日期 *</label>
              <input required type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">封面圖片 URL</label>
              <div className="flex gap-2">
                <input name="coverUrl" value={formData.coverUrl} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="https://..." />
                {formData.coverUrl && <img src={formData.coverUrl} alt="Preview" className="w-10 h-10 rounded object-cover border border-slate-600" />}
              </div>
            </div>
            <div className="flex items-center">
               <input type="checkbox" id="isEditorPick" name="isEditorPick" checked={formData.isEditorPick} onChange={handleChange} className="h-5 w-5 text-brand-accent bg-slate-900 border-slate-600 rounded" />
               <label htmlFor="isEditorPick" className="ml-2 block text-sm text-slate-300">標記為編輯精選</label>
            </div>
          </div>
        </section>

        {/* Metadata */}
        <section>
          <h3 className="text-xl font-semibold text-brand-accent mb-4 border-b border-slate-700 pb-2">識別碼 (Metadata)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">ISRC</label>
              <input name="isrc" value={formData.isrc || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono" placeholder="TW-..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">UPC</label>
              <input name="upc" value={formData.upc || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Spotify ID (URI)</label>
              <input name="spotifyId" value={formData.spotifyId || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono" placeholder="4uLU6hMC..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">MusicBrainz Artist ID</label>
              <input name="musicBrainzArtistId" value={formData.musicBrainzArtistId || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono" placeholder="UUID" />
            </div>
          </div>
        </section>

        {/* Links */}
        <section>
          <h3 className="text-xl font-semibold text-brand-accent mb-4 border-b border-slate-700 pb-2">外部連結</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">YouTube 影片連結 (Lyric Video)</label>
              <input name="youtubeUrl" value={formData.youtubeUrl || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Musixmatch 連結</label>
              <input name="musixmatchUrl" value={formData.musixmatchUrl || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">YouTube Music 連結</label>
              <input name="youtubeMusicUrl" value={formData.youtubeMusicUrl || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Spotify 直接連結</label>
              <input name="spotifyLink" value={formData.spotifyLink || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Apple Music 連結</label>
              <input name="appleMusicLink" value={formData.appleMusicLink || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </div>
          </div>
        </section>

        {/* Content */}
        <section>
          <h3 className="text-xl font-semibold text-brand-accent mb-4 border-b border-slate-700 pb-2">內容與故事</h3>
          <div className="space-y-6">
             <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">歌詞 (Lyrics)</label>
              <textarea name="lyrics" rows={6} value={formData.lyrics || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white whitespace-pre-wrap font-sans" placeholder="輸入歌詞..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">創作背景 / 描述</label>
              <textarea name="description" rows={3} value={formData.description || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">製作名單 (Credits)</label>
              <textarea name="credits" rows={2} value={formData.credits || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="詞/曲/編曲/混音..." />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4 border-t border-slate-700 pt-6">
           <button type="button" onClick={() => navigate('/database')} className="px-6 py-3 rounded-md text-slate-300 hover:text-white transition-colors">
            取消
          </button>
          <button type="submit" className="px-8 py-3 rounded-md bg-brand-accent text-slate-900 font-bold hover:bg-sky-400 transition-colors shadow-lg shadow-sky-900/50">
            儲存至資料庫
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSong;