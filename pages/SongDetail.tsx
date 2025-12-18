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
  
  const [editForm, setEditForm] = useState<Partial<Song>>({});
  const [aiReview, setAiReview] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
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

  if (!song) return <div className="text-white text-center mt-20 text-xs uppercase tracking-widest">Loading Asset Data...</div>;

  const handleSave = () => {
    if (song && id) {
      updateSong(id, editForm);
      setSong({ ...song, ...editForm } as Song);
      setIsEditing(false);
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

  return (
    <div className="animate-fade-in pb-12">
        {/* Header / Top Section */}
        <div className="border border-white/5 bg-slate-900/50 p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="flex-shrink-0 w-full md:w-72 group relative">
                        <img src={isEditing && editForm.coverUrl ? editForm.coverUrl : song.coverUrl} alt={song.title} className="w-full aspect-square object-cover shadow-2xl bg-black grayscale group-hover:grayscale-0 transition-all duration-700" />
                        {isEditing && (
                            <div className="mt-4">
                            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white text-black font-bold uppercase tracking-widest py-3 text-[10px] hover:bg-slate-200 transition-colors">Upload Cover</button>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </div>
                        )}
                </div>
                
                <div className="flex-grow w-full">
                    <div className="flex justify-between items-start">
                        <div className="w-full">
                            {isEditing ? (
                                <div className="space-y-6 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Title</label>
                                            <input className="w-full text-xl font-bold bg-black border border-white/20 p-3 text-white outline-none" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Version</label>
                                            <input className="w-full text-base bg-black border border-white/20 p-3 text-slate-300 outline-none" value={editForm.versionLabel} onChange={(e) => setEditForm({...editForm, versionLabel: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <input className="bg-black border border-white/20 p-3 text-white text-xs" value={editForm.genre} onChange={(e) => setEditForm({...editForm, genre: e.target.value})} placeholder="Genre" />
                                            <div className="flex items-center gap-3 border border-white/20 p-3 bg-black">
                                                <input type="checkbox" checked={editForm.isExplicit} onChange={(e) => setEditForm({...editForm, isExplicit: e.target.checked})} className="w-4 h-4 accent-white" />
                                                <span className="text-white text-[10px] uppercase tracking-widest">Explicit Content</span>
                                            </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h1 className="text-4xl md:text-6xl font-black text-white mb-2 uppercase tracking-tight flex flex-wrap items-baseline gap-4">
                                                {song.title}
                                                {song.versionLabel && <span className="text-lg text-slate-500 font-light border-l border-slate-600 pl-4">{song.versionLabel}</span>}
                                            </h1>
                                            {song.isExplicit && <span className="inline-block mt-2 text-[10px] border border-slate-500 text-slate-400 px-1 uppercase">Explicit</span>}
                                        </div>
                                        <button onClick={() => setIsEditing(true)} className="text-slate-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest border border-slate-800 px-4 py-2 hover:border-white">
                                            Edit Data
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-4 mt-6 mb-8">
                                        {song.isEditorPick && <span className="px-3 py-1 bg-brand-gold text-slate-900 text-[10px] font-black uppercase tracking-widest">Editor's Pick</span>}
                                        <span className="px-3 py-1 border border-white/10 text-slate-400 text-[10px] uppercase tracking-widest">{song.language}</span>
                                        <span className="px-3 py-1 border border-white/10 text-slate-400 text-[10px] uppercase tracking-widest">{song.projectType}</span>
                                        {song.genre && <span className="px-3 py-1 border border-white/10 text-slate-400 text-[10px] uppercase tracking-widest">{song.genre}</span>}
                                    </div>
                                </>
                            )}

                            {/* Technical IDs */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
                                {['isrc', 'upc', 'musicBrainzId'].map(field => (
                                    <div key={field} className="bg-slate-900 p-4">
                                        <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">
                                            {field === 'musicBrainzId' ? 'MB Recording ID' : field}
                                        </div>
                                        {isEditing ? (
                                                <input className="w-full bg-black border border-white/10 p-2 text-xs text-white font-mono outline-none focus:border-white/50" value={(editForm as any)[field] || ''} onChange={(e) => setEditForm({...editForm, [field]: e.target.value})} />
                                        ) : (
                                            <div className="font-mono text-xs text-slate-300 select-all truncate">{(song as any)[field] || '—'}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 text-right">
                                <span className={`text-[9px] uppercase tracking-widest ${song.musicBrainzId ? "text-green-500" : "text-slate-600"}`}>
                                    {song.musicBrainzId ? "● MusicBrainz Synced" : "○ Local Only"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="mt-8 pt-8 border-t border-white/10 flex justify-end gap-4">
                    <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-500 hover:text-white text-[10px] uppercase font-bold tracking-widest">Cancel</button>
                    <button onClick={handleSave} className="px-8 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-slate-200">Save Asset</button>
                </div>
            )}
        </div>

        {/* DATA MANAGEMENT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            
            {/* Left Col: Platform Links */}
            <div className="lg:col-span-1 space-y-8">
                
                {/* DistroKid */}
                <div className="border border-brand-gold/30 p-6 bg-brand-gold/5">
                     <h3 className="text-xs font-black text-brand-gold uppercase tracking-[0.2em] mb-4">
                        Distribution Logic
                     </h3>
                     {isEditing ? (
                         <input 
                             className="w-full bg-black border border-brand-gold/30 p-3 text-xs text-brand-gold font-mono outline-none"
                             placeholder="HyperFollow URL"
                             value={editForm.distrokidHyperFollowLink || ''}
                             onChange={(e) => setEditForm({...editForm, distrokidHyperFollowLink: e.target.value})}
                         />
                     ) : (
                         song.distrokidHyperFollowLink ? (
                             <a href={song.distrokidHyperFollowLink} target="_blank" rel="noreferrer" className="block w-full py-3 bg-brand-gold text-slate-900 font-black text-center text-[10px] uppercase tracking-widest hover:bg-white transition-colors">
                                 Launch HyperFollow
                             </a>
                         ) : (
                             <div className="text-[10px] text-slate-500 uppercase tracking-widest text-center py-3 border border-dashed border-slate-700">No Distribution Link</div>
                         )
                     )}
                </div>

                <div className="border border-white/5 bg-slate-900 p-6">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                        Platform Index
                     </h3>
                     <div className="space-y-px bg-white/5">
                        {[
                            { label: 'Spotify', key: 'spotifyLink' },
                            { label: 'Apple Music', key: 'appleMusicLink' },
                            { label: 'YouTube Music', key: 'youtubeMusicLink' },
                            { label: 'KKBOX', key: 'kkboxLink' },
                            { label: 'Musixmatch', key: 'musixmatchLink' },
                            { label: 'StreetVoice', key: 'streetvoiceLink' }
                        ].map(platform => (
                            <div key={platform.key} className="bg-slate-900 p-3 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold w-32">{platform.label}</label>
                                {isEditing ? (
                                    <input 
                                        className="flex-1 bg-black border border-white/10 p-1 text-[10px] text-white font-mono outline-none"
                                        placeholder="URL..."
                                        value={(editForm as any)[platform.key] || ''}
                                        onChange={(e) => setEditForm({...editForm, [platform.key]: e.target.value})}
                                    />
                                ) : (
                                    (song as any)[platform.key] ? (
                                        <a href={(song as any)[platform.key]} target="_blank" rel="noreferrer" className="text-[10px] text-white hover:text-brand-accent uppercase tracking-widest flex items-center gap-2">
                                            Link <span className="opacity-50">↗</span>
                                        </a>
                                    ) : (
                                        <span className="text-[10px] text-slate-700 uppercase tracking-widest">N/A</span>
                                    )
                                )}
                            </div>
                        ))}
                     </div>
                </div>

                <div className="border border-white/5 bg-slate-900 p-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Metadata</h3>
                    {isEditing ? (
                        <div className="space-y-4">
                            <textarea className="w-full bg-black border border-white/10 p-3 text-xs text-white h-24 outline-none" value={editForm.description || ''} onChange={(e) => setEditForm({...editForm, description: e.target.value})} placeholder="Description..." />
                            <textarea className="w-full bg-black border border-white/10 p-3 text-xs text-white h-24 outline-none" value={editForm.credits || ''} onChange={(e) => setEditForm({...editForm, credits: e.target.value})} placeholder="Credits..." />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-2">Description</h4>
                                <p className="text-slate-300 text-xs leading-relaxed font-light">{song.description || '—'}</p>
                            </div>
                            <div>
                                <h4 className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-2">Credits</h4>
                                <p className="text-slate-300 text-xs whitespace-pre-line font-mono">{song.credits || '—'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Col */}
            <div className="lg:col-span-2 space-y-8">
                 {/* AI Review */}
                 <div className="border border-indigo-500/30 bg-slate-900/50 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">AI Analysis Matrix</h3>
                        <button onClick={handleAiGenerate} disabled={loadingAi} className="px-4 py-2 border border-indigo-500 text-indigo-400 text-[9px] uppercase font-bold tracking-widest hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50">
                            {loadingAi ? 'Processing...' : 'Generate Report'}
                        </button>
                    </div>
                    <div className="text-slate-300 text-sm leading-7 font-light whitespace-pre-line border-l border-indigo-900 pl-4 relative z-10">
                        {aiReview || <span className="text-slate-600 italic">No analysis data generated.</span>}
                    </div>
                </div>

                <div className="border border-white/5 bg-slate-900 p-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Lyrics Data</h3>
                     {isEditing ? (
                        <textarea 
                             className="w-full bg-black border border-white/10 p-6 text-sm text-white h-[600px] font-mono leading-relaxed outline-none focus:border-white/30"
                             value={editForm.lyrics || ''}
                             onChange={(e) => setEditForm({...editForm, lyrics: e.target.value})}
                        />
                    ) : (
                        <div className="text-slate-300 leading-9 whitespace-pre-wrap font-sans text-base pl-2">
                            {song.lyrics || <span className="text-slate-600 uppercase text-xs tracking-widest">No lyrics available.</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SongDetail;