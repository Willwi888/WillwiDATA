import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Language, ProjectType } from '../types';

const Database: React.FC = () => {
  const { songs, importData, undo, canUndo, playSong, currentSong } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLang, setFilterLang] = useState<string>('All');
  const [filterProject, setFilterProject] = useState<string>('All');
  const [showEditorPick, setShowEditorPick] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table'); 
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const matchesSearch = 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.isrc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.upc?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLang = filterLang === 'All' || song.language === filterLang;
      const matchesProject = filterProject === 'All' || song.projectType === filterProject;
      const matchesPick = !showEditorPick || song.isEditorPick;

      return matchesSearch && matchesLang && matchesProject && matchesPick;
    });
  }, [songs, searchTerm, filterLang, filterProject, showEditorPick]);

  const getMissingFields = (song: any) => {
    const missing = [];
    if (!song.isrc) missing.push('ISRC');
    if (!song.lyrics) missing.push('Lyrics');
    if (!song.spotifyLink && !song.spotifyId) missing.push('Spotify');
    return missing;
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(songs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Willwi_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = event.target?.result as string;
        const parsedData = JSON.parse(result);
        if (window.confirm(`Override database with ${parsedData.length} entries?`)) {
             await importData(parsedData);
        }
      } catch (err) {
        console.error(err);
        alert("Import Failed: Invalid JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <div className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Asset Database</h2>
           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Total Tracks: {songs.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
             {/* Time Machine */}
             <button
                onClick={undo}
                disabled={!canUndo}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${canUndo ? 'bg-white text-black border-white hover:bg-slate-200' : 'bg-transparent border-slate-800 text-slate-600 cursor-not-allowed'}`}
             >
                Undo Change
             </button>

             <div className="w-px bg-slate-800 h-6 hidden md:block"></div>

             {/* Import/Export */}
             <div className="flex gap-2">
                <button 
                    onClick={handleExport}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white border border-slate-800 hover:border-white transition-all"
                >
                    Export JSON
                </button>
                <button 
                    onClick={handleImportClick}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white border border-slate-800 hover:border-white transition-all"
                >
                    Import JSON
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="application/json" 
                    onChange={handleFileChange}
                />
             </div>

             <div className="w-px bg-slate-800 h-6 hidden md:block"></div>

             {/* View Toggle */}
            <div className="flex bg-slate-900 border border-slate-800">
                <button 
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                    List
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                    Grid
                </button>
            </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/50 p-4 border border-white/5 mb-8 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="SEARCH BY TITLE, ISRC, UPC..."
            className="w-full bg-black border border-white/10 px-4 py-3 text-white text-xs tracking-wide focus:border-brand-accent outline-none placeholder-slate-700 font-mono"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <select 
            className="bg-black border border-white/10 px-4 py-3 text-white text-xs outline-none appearance-none cursor-pointer hover:border-white/30 transition-colors uppercase tracking-wider"
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            >
            <option value="All">All Languages</option>
            {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select 
            className="bg-black border border-white/10 px-4 py-3 text-white text-xs outline-none appearance-none cursor-pointer hover:border-white/30 transition-colors uppercase tracking-wider"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            >
            <option value="All">All Projects</option>
            {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button 
            onClick={() => setShowEditorPick(!showEditorPick)}
            className={`px-6 py-3 border text-[10px] font-black uppercase tracking-widest transition-colors ${showEditorPick ? 'bg-brand-gold text-slate-900 border-brand-gold' : 'border-white/10 text-slate-500 hover:text-white hover:border-white'}`}
            >
            Editor's Pick
            </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSongs.map(song => (
            <div key={song.id} className="group bg-slate-900 border border-white/5 hover:border-brand-accent/50 transition-all relative">
                <Link to={`/song/${song.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-black">
                        <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-700" />
                        {song.isEditorPick && (
                            <div className="absolute top-0 right-0 bg-brand-gold text-slate-900 text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                            Pick
                            </div>
                        )}
                    </div>
                </Link>
                <div className="p-6">
                     {/* Floating Play Button */}
                     {song.spotifyId && (
                        <button 
                            onClick={(e) => { e.preventDefault(); playSong(song); }}
                            className={`absolute -top-6 right-6 w-12 h-12 flex items-center justify-center transition-all hover:scale-105 border ${currentSong?.id === song.id ? 'bg-green-500 text-white border-green-500' : 'bg-black text-white border-white/20 hover:border-brand-accent hover:text-brand-accent'}`}
                        >
                            {currentSong?.id === song.id ? (
                                <span className="animate-pulse font-bold text-xs">PLAYING</span>
                            ) : (
                                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            )}
                        </button>
                    )}

                    <Link to={`/song/${song.id}`}>
                        <div className="mb-4">
                            <h3 className="font-bold text-lg text-white group-hover:text-brand-accent transition-colors truncate tracking-wide">{song.title}</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{song.versionLabel}</p>
                        </div>
                    </Link>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                         <span className="text-[10px] uppercase tracking-widest text-slate-400">{song.language}</span>
                         <span className="text-[10px] text-slate-600 font-mono">{song.releaseDate}</span>
                    </div>
                </div>
            </div>
            ))}
        </div>
      ) : (
        // Table View
        <div className="overflow-x-auto border border-white/5">
            <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-slate-950">
                    <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] w-12">Action</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Cover</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Asset Info</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden md:table-cell">ISRC</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden sm:table-cell">Release Date</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Manage</th>
                    </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-white/5">
                    {filteredSongs.map(song => {
                        const missing = getMissingFields(song);
                        const isPlaying = currentSong?.id === song.id;
                        return (
                            <tr key={song.id} className={`hover:bg-white/5 transition-colors group ${isPlaying ? 'bg-white/5' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {song.spotifyId ? (
                                        <button 
                                            onClick={() => playSong(song)}
                                            className={`w-8 h-8 flex items-center justify-center transition-colors border ${isPlaying ? 'border-green-500 text-green-500' : 'border-slate-700 text-slate-500 hover:border-white hover:text-white'}`}
                                        >
                                            {isPlaying ? (
                                                <span className="text-[8px] font-bold">||</span> 
                                            ) : (
                                                <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                            )}
                                        </button>
                                    ) : (
                                        <span className="text-slate-800 font-mono text-xs">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-10 w-10 bg-black relative">
                                        <img className={`h-full w-full object-cover transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} grayscale group-hover:grayscale-0`} src={song.coverUrl} alt="" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`text-sm font-bold tracking-wide ${isPlaying ? 'text-brand-accent' : 'text-white'}`}>{song.title}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{song.versionLabel}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono hidden md:table-cell">
                                    {song.isrc || <span className="text-red-500/50">MISSING</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono hidden sm:table-cell">
                                    {song.releaseDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {missing.length > 0 ? (
                                        <div className="flex gap-1">
                                            {missing.map(m => (
                                                <span key={m} className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-red-900/20 text-red-500 border border-red-900/30">
                                                    Miss {m}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-green-900/20 text-green-500 border border-green-900/30">
                                            Ready
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/song/${song.id}`} className="text-slate-500 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest border border-transparent hover:border-white px-3 py-1">
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {filteredSongs.length === 0 && (
                <div className="p-20 text-center text-slate-600 text-xs uppercase tracking-widest border-t border-white/5">
                    No Assets Found.
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Database;