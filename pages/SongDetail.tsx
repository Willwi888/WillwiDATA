import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Song, Language, ProjectType } from '../types';
import { generateMusicCritique } from '../services/geminiService';

const SongDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSong, updateSong, deleteSong } = useData();
  const [song, setSong] = useState<Song | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit State
  const [editForm, setEditForm] = useState<Partial<Song>>({});

  // AI State
  const [aiReview, setAiReview] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getSong(id);
      if (found) {
        setSong(found);
        setEditForm(found);
      } else {
        navigate('/database');
      }
    }
  }, [id, getSong, navigate]);

  if (!song) return <div className="text-white text-center mt-20">載入中...</div>;

  const handleSave = () => {
    if (song && id) {
      updateSong(id, editForm);
      setSong({ ...song, ...editForm } as Song);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (id) {
        deleteSong(id);
        navigate('/database');
    }
  };

  const handleAiGenerate = async () => {
    setLoadingAi(true);
    const review = await generateMusicCritique(song);
    setAiReview(review);
    setLoadingAi(false);
  };

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    try {
        // Handle various YouTube URL formats
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get('v') || '';
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch(e) {
        return null;
    }
  };

  const embedUrl = getYoutubeEmbedUrl(song.youtubeUrl);

  return (
    <div className="animate-fade-in">
        {/* Header / Top Section */}
        <div className="bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="relative">
                 {/* Background Blur Effect */}
                <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl" style={{ backgroundImage: `url(${song.coverUrl})` }}></div>
                
                <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-shrink-0 w-full md:w-64 group relative">
                         <img src={song.coverUrl} alt={song.title} className="w-full aspect-square object-cover rounded-xl shadow-lg" />
                         {isEditing && (
                             <div className="mt-2">
                                <label className="text-xs text-slate-400">封面 URL</label>
                                <input 
                                    className="w-full bg-slate-900/80 border border-slate-600 rounded p-1 text-xs text-white" 
                                    value={editForm.coverUrl}
                                    onChange={(e) => setEditForm({...editForm, coverUrl: e.target.value})}
                                />
                             </div>
                         )}
                    </div>
                    
                    <div className="flex-grow w-full">
                        <div className="flex justify-between items-start">
                            <div className="w-full">
                                {isEditing ? (
                                    <div className="space-y-2 mb-4">
                                        <input 
                                            className="w-full text-3xl font-bold bg-slate-900 border border-slate-500 rounded p-2 text-white"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                            placeholder="歌名"
                                        />
                                        <input 
                                            className="w-full text-lg bg-slate-900 border border-slate-500 rounded p-2 text-slate-300"
                                            value={editForm.versionLabel}
                                            onChange={(e) => setEditForm({...editForm, versionLabel: e.target.value})}
                                            placeholder="版本 (如: Acoustic Ver.)"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                                            {song.title}
                                            {song.versionLabel && <span className="text-lg md:text-2xl text-slate-400 font-normal border border-slate-600 rounded px-2">{song.versionLabel}</span>}
                                            <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-white transition-colors text-xl" title="編輯模式">
                                                ✏️
                                            </button>
                                        </h1>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {song.isEditorPick && <span className="px-3 py-1 bg-brand-gold text-slate-900 rounded-full text-xs font-bold">EDITOR'S PICK</span>}
                                            <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-xs">{song.language}</span>
                                            <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-xs">{song.projectType}</span>
                                            <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-xs">{song.releaseDate}</span>
                                        </div>
                                    </>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 bg-slate-900/50 p-4 rounded-xl border border-white/10">
                                    {['isrc', 'upc', 'spotifyId'].map(field => (
                                        <div key={field}>
                                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{field}</div>
                                            {isEditing ? (
                                                 <input 
                                                    className="w-full bg-slate-800 border border-slate-600 rounded p-1 text-sm text-white font-mono"
                                                    value={(editForm as any)[field] || ''}
                                                    onChange={(e) => setEditForm({...editForm, [field]: e.target.value})}
                                                />
                                            ) : (
                                                <div className="font-mono text-sm text-brand-accent select-all">{(song as any)[field] || '-'}</div>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                         <div className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={editForm.isEditorPick} 
                                                onChange={(e) => setEditForm({...editForm, isEditorPick: e.target.checked})}
                                                className="mr-2"
                                            />
                                            <label className="text-sm text-white">編輯精選</label>
                                        </div>
                                    )}
                                </div>
                                
                                {isEditing && (
                                    <div className="mt-4 p-4 bg-slate-900/80 rounded-lg border border-red-900/50">
                                        <h4 className="text-red-400 text-sm font-bold mb-2">危險區域</h4>
                                        <button onClick={handleDelete} className="text-red-500 hover:text-red-400 text-sm underline">刪除此歌曲</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Controls */}
                {isEditing && (
                    <div className="bg-brand-accent/10 border-t border-brand-accent/20 p-4 flex justify-end gap-4">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-300 hover:text-white">取消</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-brand-accent text-slate-900 font-bold rounded hover:bg-sky-400 shadow-lg">💾 儲存變更</button>
                    </div>
                )}
            </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left Col: Media & Links */}
            <div className="space-y-8">
                {/* 1. Player Section */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4">試聽與觀看</h3>
                    {song.spotifyId && (
                        <div className="mb-4">
                            <iframe 
                                style={{borderRadius: '12px'}} 
                                src={`https://open.spotify.com/embed/track/${song.spotifyId}?utm_source=generator&theme=0`} 
                                width="100%" 
                                height="152" 
                                frameBorder="0" 
                                allowFullScreen 
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                                loading="lazy">
                            </iframe>
                        </div>
                    )}
                    
                    {/* YouTube Embed */}
                    {embedUrl ? (
                         <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-4">
                            <iframe 
                                className="w-full h-full" 
                                src={embedUrl} 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen>
                            </iframe>
                        </div>
                    ) : (
                        !isEditing && <div className="p-4 bg-slate-900/50 rounded text-center text-slate-500 text-sm">暫無影片</div>
                    )}

                    {isEditing && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                            <label className="block text-xs text-brand-accent mb-1">YouTube 影片網址 (貼上網址自動轉換)</label>
                            <input 
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white" 
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={editForm.youtubeUrl || ''}
                                onChange={(e) => setEditForm({...editForm, youtubeUrl: e.target.value})}
                            />
                        </div>
                    )}
                </div>

                {/* 2. External Links */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                     <h3 className="text-xl font-bold text-white mb-4">外部平台連結</h3>
                     {isEditing ? (
                        <div className="space-y-3">
                            <input 
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white" 
                                placeholder="Spotify Link"
                                value={editForm.spotifyLink || ''}
                                onChange={(e) => setEditForm({...editForm, spotifyLink: e.target.value})}
                            />
                            <input 
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white" 
                                placeholder="Apple Music Link"
                                value={editForm.appleMusicLink || ''}
                                onChange={(e) => setEditForm({...editForm, appleMusicLink: e.target.value})}
                            />
                             <input 
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white" 
                                placeholder="Musixmatch URL"
                                value={editForm.musixmatchUrl || ''}
                                onChange={(e) => setEditForm({...editForm, musixmatchUrl: e.target.value})}
                            />
                             <input 
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white" 
                                placeholder="YouTube Music URL"
                                value={editForm.youtubeMusicUrl || ''}
                                onChange={(e) => setEditForm({...editForm, youtubeMusicUrl: e.target.value})}
                            />
                        </div>
                     ) : (
                        <div className="flex flex-col gap-3">
                            <a href={song.musixmatchUrl || "https://www.musixmatch.com/artist/Willwi"} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-brand-accent hover:text-slate-900 rounded-lg transition-all group">
                                <span className="font-bold">Musixmatch</span>
                                <span className="text-xs opacity-50 group-hover:opacity-100">↗</span>
                            </a>
                            <a href={song.youtubeMusicUrl || "https://music.youtube.com/channel/WillwiID"} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-brand-accent hover:text-slate-900 rounded-lg transition-all group">
                                <span className="font-bold">YouTube Music</span>
                                <span className="text-xs opacity-50 group-hover:opacity-100">↗</span>
                            </a>
                             <a href={song.spotifyLink || "https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4"} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-brand-accent hover:text-slate-900 rounded-lg transition-all group">
                                <span className="font-bold">Spotify</span>
                                <span className="text-xs opacity-50 group-hover:opacity-100">↗</span>
                            </a>
                             <a href={song.appleMusicLink || "https://music.apple.com/us/artist/willwi/1798471457"} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-brand-accent hover:text-slate-900 rounded-lg transition-all group">
                                <span className="font-bold">Apple Music</span>
                                <span className="text-xs opacity-50 group-hover:opacity-100">↗</span>
                            </a>
                        </div>
                     )}
                </div>
                
                 {/* 3. Credits */}
                 <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-2">製作團隊 Credits</h3>
                    {isEditing ? (
                        <textarea 
                             className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white h-24"
                             value={editForm.credits || ''}
                             onChange={(e) => setEditForm({...editForm, credits: e.target.value})}
                        />
                    ) : (
                        <p className="text-slate-400 text-sm whitespace-pre-line">
                            {song.credits || '暫無製作人員資訊'}
                        </p>
                    )}
                 </div>
            </div>

            {/* Right Col: Lyrics & AI */}
            <div className="lg:col-span-2 space-y-8">
                 {/* AI Review */}
                 <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 border border-indigo-500/30 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                ✨ Willwi AI 樂評
                            </h3>
                            <button 
                                onClick={handleAiGenerate}
                                disabled={loadingAi}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                            >
                                {loadingAi ? '生成中...' : '生成 AI 解析'}
                            </button>
                        </div>
                        <div className="bg-slate-950/50 rounded-xl p-4 min-h-[100px] text-slate-300 leading-relaxed whitespace-pre-line border border-white/5">
                            {aiReview ? aiReview : "點擊按鈕，讓 AI 根據中繼資料為這首歌曲撰寫專業短評。"}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">創作故事</h3>
                     {isEditing ? (
                        <textarea 
                             className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-base text-white h-32"
                             value={editForm.description || ''}
                             onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        />
                    ) : (
                        <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                            {song.description || "暫無描述。"}
                        </p>
                    )}
                </div>

                {/* Lyrics */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">歌詞</h3>
                     {isEditing ? (
                        <textarea 
                             className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-base text-white h-96 font-sans"
                             value={editForm.lyrics || ''}
                             onChange={(e) => setEditForm({...editForm, lyrics: e.target.value})}
                        />
                    ) : (
                        <div className="text-slate-300 leading-8 whitespace-pre-wrap font-sans text-lg">
                            {song.lyrics || <span className="text-slate-500 italic">尚未輸入歌詞...</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SongDetail;