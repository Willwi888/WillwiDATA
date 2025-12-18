import React, { useState, useEffect, useRef } from 'react';
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
  
  // View Mode: Story or Lyric Game
  const [storyMode, setStoryMode] = useState<'desc' | 'maker'>('desc');

  // Edit State
  const [editForm, setEditForm] = useState<Partial<Song>>({});

  // AI State
  const [aiReview, setAiReview] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Image Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditForm(prev => ({ ...prev, coverUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    try {
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

  // Helper to open Musixmatch search
  const searchMusixmatch = () => {
    const query = `Willwi ${editForm.title}`;
    window.open(`https://www.musixmatch.com/search/${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="animate-fade-in pb-12">
        {/* Header / Top Section */}
        <div className="bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="relative">
                 {/* Background Blur Effect */}
                <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl" style={{ backgroundImage: `url(${song.coverUrl})` }}></div>
                
                <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-shrink-0 w-full md:w-64 group relative">
                         <img src={isEditing && editForm.coverUrl ? editForm.coverUrl : song.coverUrl} alt={song.title} className="w-full aspect-square object-cover rounded-xl shadow-lg bg-slate-900" />
                         {isEditing && (
                             <div className="mt-2 space-y-2">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full bg-brand-accent hover:bg-sky-400 text-slate-900 font-bold py-2 px-4 rounded text-xs transition-colors"
                                >
                                    📷 上傳本地封面
                                </button>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleImageUpload}
                                />
                                <div className="text-center text-xs text-slate-400">- 或輸入網址 -</div>
                                <input 
                                    className="w-full bg-slate-900/80 border border-slate-600 rounded p-1 text-xs text-white" 
                                    value={editForm.coverUrl}
                                    onChange={(e) => setEditForm({...editForm, coverUrl: e.target.value})}
                                    placeholder="https://..."
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
                                    {['isrc', 'upc', 'spotifyId', 'musicBrainzArtistId'].map(field => (
                                        <div key={field}>
                                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                                                {field === 'musicBrainzArtistId' ? 'MusicBrainz ID' : field}
                                            </div>
                                            {isEditing ? (
                                                 <input 
                                                    className="w-full bg-slate-800 border border-slate-600 rounded p-1 text-sm text-white font-mono"
                                                    value={(editForm as any)[field] || ''}
                                                    onChange={(e) => setEditForm({...editForm, [field]: e.target.value})}
                                                    placeholder={field === 'musicBrainzArtistId' ? 'UUID' : ''}
                                                />
                                            ) : (
                                                <div className="font-mono text-sm text-brand-accent select-all truncate">{(song as any)[field] || '-'}</div>
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
                            <label className="block text-xs text-brand-accent mb-1">YouTube 影片網址</label>
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
                            <div className="flex gap-2">
                                <input 
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white" 
                                    placeholder="Musixmatch URL"
                                    value={editForm.musixmatchUrl || ''}
                                    onChange={(e) => setEditForm({...editForm, musixmatchUrl: e.target.value})}
                                />
                                <button 
                                    onClick={searchMusixmatch}
                                    className="px-3 bg-slate-700 hover:bg-brand-accent hover:text-slate-900 rounded border border-slate-600 transition-colors text-xs whitespace-nowrap font-bold"
                                    title="在 Musixmatch 上搜尋這首歌"
                                >
                                    🔍 搜尋
                                </button>
                            </div>
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

            {/* Right Col: Lyrics & AI & Story/Game */}
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

                {/* Description OR Lyric Video Maker Switcher */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <div className="flex gap-6 mb-6 border-b border-slate-700">
                        <button 
                            onClick={() => setStoryMode('desc')}
                            className={`pb-3 text-lg font-bold transition-colors border-b-2 ${storyMode === 'desc' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            創作故事
                        </button>
                         <button 
                            onClick={() => setStoryMode('maker')}
                            className={`pb-3 text-lg font-bold transition-colors border-b-2 ${storyMode === 'maker' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            🎬 歌詞影片製作 (工作台)
                        </button>
                    </div>

                    {storyMode === 'desc' ? (
                         isEditing ? (
                            <textarea 
                                 className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-base text-white h-32"
                                 value={editForm.description || ''}
                                 onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            />
                        ) : (
                            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                                {song.description || "暫無描述。"}
                            </p>
                        )
                    ) : (
                        <LyricVideoMaker song={song} />
                    )}
                </div>

                {/* Lyrics Display (Static) */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">完整歌詞</h3>
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

// Sub-component for the Lyric Video Maker
const LyricVideoMaker: React.FC<{ song: Song }> = ({ song }) => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [lineIndex, setLineIndex] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    // Store synced data: { time: number, text: string }
    const [syncData, setSyncData] = useState<{time: number, text: string}[]>([]);
    
    const lyricsLines = (song.lyrics || "").split('\n').filter(l => l.trim() !== '');

    useEffect(() => {
        let interval: any;
        if (gameState === 'playing') {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 0.1);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 10);
        return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
    };

    const handleStart = () => {
        setGameState('playing');
        setLineIndex(0);
        setElapsedTime(0);
        setSyncData([]);
    };

    const handleSyncLine = () => {
        // Record the current line timestamp
        const currentLine = lyricsLines[lineIndex];
        setSyncData(prev => [...prev, { time: elapsedTime, text: currentLine }]);

        if (lineIndex < lyricsLines.length - 1) {
            setLineIndex(prev => prev + 1);
        } else {
            setGameState('finished');
        }
    };

    // Export function
    const downloadSrt = () => {
        let srtContent = "";
        syncData.forEach((item, index) => {
            // Very basic SRT formatting logic (duration assumed 3s or until next line)
            const startTime = new Date(item.time * 1000).toISOString().substr(11, 12).replace('.', ',');
            const nextTimeVal = (index < syncData.length - 1) ? syncData[index+1].time : item.time + 3;
            const endTime = new Date(nextTimeVal * 1000).toISOString().substr(11, 12).replace('.', ',');
            
            srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${item.text}\n\n`;
        });

        const blob = new Blob([srtContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${song.title}_lyrics.srt`;
        a.click();
    };

    if (!song.lyrics) return <div className="text-slate-500 p-4">請先輸入歌詞才能使用此功能。</div>;

    if (gameState === 'finished') {
        return (
            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-700">
                <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="text-green-500">✔</span> 製作完成
                    </h3>
                    <button onClick={() => setGameState('idle')} className="text-sm text-slate-400 hover:text-white">重新製作</button>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Preview Area */}
                    <div className="space-y-4">
                        <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-800">
                             <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${song.coverUrl})` }}></div>
                             <div className="relative z-10 text-center">
                                 <div className="text-5xl mb-2">🎬</div>
                                 <div className="font-bold text-white">Video Ready</div>
                             </div>
                        </div>
                        <button 
                            onClick={() => window.alert('開始渲染影片 (模擬)... 下載 MP4')}
                            className="w-full py-3 bg-brand-gold hover:bg-yellow-400 text-slate-900 font-bold rounded-lg shadow-lg transition"
                        >
                            📥 下載影片 (MP4)
                        </button>
                    </div>

                    {/* Data Area */}
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-end mb-2">
                            <h4 className="text-slate-300 font-bold text-sm">同步數據 (SRT)</h4>
                             <button onClick={downloadSrt} className="text-xs text-brand-accent hover:underline">下載字幕檔 (.srt)</button>
                        </div>
                        <div className="flex-grow bg-slate-900 rounded-lg p-2 overflow-y-auto max-h-[250px] border border-slate-700 font-mono text-xs">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-700">
                                        <th className="pb-1">Time</th>
                                        <th className="pb-1">Lyric</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {syncData.map((row, i) => (
                                        <tr key={i} className="border-b border-slate-800/50">
                                            <td className="py-1 text-green-400 pr-2">{formatTime(row.time)}</td>
                                            <td className="py-1 text-slate-300">{row.text}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative rounded-xl overflow-hidden aspect-video flex flex-col bg-slate-950 border border-slate-700 shadow-2xl">
             {/* Timeline Bar (Visual only) */}
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 z-20">
                 <div 
                    className="h-full bg-red-500 transition-all duration-100 ease-linear" 
                    style={{ width: gameState === 'playing' ? `${((lineIndex) / lyricsLines.length) * 100}%` : '0%' }}
                 ></div>
             </div>

             {/* Background */}
             <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-30" style={{ backgroundImage: `url(${song.coverUrl})` }}></div>
             
             {/* Top Status Bar */}
             <div className="relative z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
                 <div className="text-xs font-mono text-slate-400">LYRIC VIDEO MAKER V1.0</div>
                 {gameState === 'playing' && (
                     <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                         <span className="text-red-500 font-mono font-bold text-lg">{formatTime(elapsedTime)}</span>
                     </div>
                 )}
             </div>

             {/* Main Workspace */}
             <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto">
                 {gameState === 'idle' ? (
                     <div className="text-center space-y-6 bg-black/40 p-8 rounded-2xl backdrop-blur-sm border border-white/10">
                         <h3 className="text-2xl font-bold text-white tracking-wider">準備開始製作</h3>
                         <div className="text-left text-sm text-slate-300 space-y-2">
                             <p>1. 確保上方音樂播放器已準備就緒。</p>
                             <p>2. 按下播放音樂。</p>
                             <p>3. 點擊下方按鈕，並隨著節奏按「同步」。</p>
                         </div>
                         <button 
                            onClick={handleStart}
                            className="px-10 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full text-lg shadow-lg transform transition hover:scale-105"
                        >
                            ● REC 開始錄製
                         </button>
                     </div>
                 ) : (
                     <div className="w-full flex flex-col h-full justify-between pb-8">
                         {/* Lyric Display Area */}
                         <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                            {/* Previous Line Ghost */}
                            <p className="text-slate-500 text-sm h-6 transition-all">{lineIndex > 0 ? lyricsLines[lineIndex - 1] : ''}</p>
                            
                            {/* Active Line */}
                            <div className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-xl border-l-4 border-brand-accent w-full text-center">
                                <p className="text-2xl md:text-4xl font-bold text-white leading-relaxed">
                                    {lyricsLines[lineIndex]}
                                </p>
                            </div>

                            {/* Next Line Ghost */}
                            <p className="text-slate-500 text-sm h-6 transition-all">{lineIndex < lyricsLines.length - 1 ? lyricsLines[lineIndex + 1] : ''}</p>
                         </div>
                         
                         {/* Control Deck */}
                         <div className="w-full max-w-md mx-auto">
                            <button 
                                onClick={handleSyncLine}
                                className="w-full py-6 bg-slate-100 hover:bg-white text-slate-900 font-black rounded-xl text-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 transition-all border-b-8 border-slate-300 active:border-b-0 active:translate-y-2"
                            >
                                SYNC 同步
                            </button>
                            <div className="flex justify-between mt-2 px-2">
                                <span className="text-xs text-slate-400 font-mono">Lines: {lineIndex}/{lyricsLines.length}</span>
                                <span className="text-xs text-slate-400 font-mono">Mode: Manual Sync</span>
                            </div>
                         </div>
                     </div>
                 )}
             </div>
        </div>
    );
};

export default SongDetail;