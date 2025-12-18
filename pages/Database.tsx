import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Language, ProjectType } from '../types';

const Database: React.FC = () => {
  const { songs, importData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLang, setFilterLang] = useState<string>('All');
  const [filterProject, setFilterProject] = useState<string>('All');
  const [showEditorPick, setShowEditorPick] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table'); // Default to table for management
  
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

  // Helper to check completeness
  const getMissingFields = (song: any) => {
    const missing = [];
    if (!song.isrc) missing.push('ISRC');
    if (!song.lyrics) missing.push('歌詞');
    if (!song.spotifyLink && !song.spotifyId) missing.push('Spotify');
    return missing;
  };

  // --- Export Function ---
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

  // --- Import Function ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const parsedData = JSON.parse(result);
        if (window.confirm(`確定要匯入 ${parsedData.length} 筆資料嗎？\n這將會「覆蓋」目前的資料庫。`)) {
             importData(parsedData);
        }
      } catch (err) {
        console.error(err);
        alert("匯入失敗：檔案格式不正確。");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  return (
    <div>
      <div className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-wide">作品資料庫</h2>
           <p className="text-slate-400 text-sm mt-1 font-mono">Total Tracks: {songs.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
             {/* Import/Export Buttons */}
             <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 mr-2">
                <button 
                    onClick={handleExport}
                    className="px-4 py-2 text-sm font-medium text-brand-accent hover:bg-slate-700 hover:text-white rounded-md transition-all flex items-center gap-2"
                    title="備份所有資料"
                >
                    📤 匯出 JSON
                </button>
                <div className="w-px bg-slate-700 my-1 mx-1"></div>
                <button 
                    onClick={handleImportClick}
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-700 hover:text-white rounded-md transition-all flex items-center gap-2"
                    title="還原資料 (會覆蓋現有資料)"
                >
                    📥 匯入 JSON
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="application/json" 
                    onChange={handleFileChange}
                />
             </div>

             {/* View Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 self-start md:self-auto">
                <button 
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    📋 清單
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                    🖼️ 卡片
                </button>
            </div>
        </div>
      </div>

      {/* Filter Bar - Responsive Stack */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6 flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜尋歌名, ISRC, UPC..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-brand-accent focus:border-brand-accent outline-none placeholder-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
            <select 
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none appearance-none cursor-pointer hover:border-slate-500 transition-colors"
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            >
            <option value="All">所有語言</option>
            {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select 
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none appearance-none cursor-pointer hover:border-slate-500 transition-colors"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            >
            <option value="All">所有專案</option>
            {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button 
            onClick={() => setShowEditorPick(!showEditorPick)}
            className={`px-4 py-3 rounded-lg border transition-colors whitespace-nowrap ${showEditorPick ? 'bg-brand-gold text-slate-900 border-brand-gold font-bold' : 'border-slate-700 text-slate-300 hover:border-slate-400 bg-slate-950'}`}
            >
            ★ 編輯精選
            </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map(song => (
            <Link key={song.id} to={`/song/${song.id}`} className="group bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-brand-accent transition-all hover:shadow-2xl">
                <div className="relative aspect-square overflow-hidden bg-black">
                <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                {song.isEditorPick && (
                    <div className="absolute top-2 right-2 bg-brand-gold text-slate-900 text-xs font-bold px-2 py-1 rounded shadow">
                    PICK
                    </div>
                )}
                </div>
                <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-brand-accent transition-colors">{song.title}</h3>
                        <p className="text-sm text-slate-500">{song.versionLabel}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400 border border-slate-700">{song.language}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-600 font-mono">
                    <span>{song.releaseDate}</span>
                    <span>{song.projectType}</span>
                </div>
                </div>
            </Link>
            ))}
        </div>
      ) : (
        // Table View
        <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
            <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950">
                    <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">封面</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">作品資訊</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">ISRC</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">發行日</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">完整度</th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                    </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800">
                    {filteredSongs.map(song => {
                        const missing = getMissingFields(song);
                        return (
                            <tr key={song.id} className="hover:bg-slate-800/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex-shrink-0 h-12 w-12 bg-black rounded overflow-hidden">
                                        <img className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={song.coverUrl} alt="" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-white">{song.title}</div>
                                    <div className="text-xs text-slate-500">{song.versionLabel}</div>
                                    <div className="text-xs text-slate-600 md:hidden mt-1 font-mono">{song.isrc}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono hidden md:table-cell">
                                    {song.isrc || <span className="text-red-900 bg-red-900/20 px-1 rounded">MISSING</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono hidden sm:table-cell">
                                    {song.releaseDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {missing.length > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            {missing.map(m => (
                                                <span key={m} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-900/30 text-red-400 border border-red-900/50 w-fit">
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-900/30 text-green-400 border border-green-900/50">
                                            OK
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/song/${song.id}`} className="text-slate-400 hover:text-white transition-colors border border-slate-700 px-3 py-1 rounded hover:border-white">
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {filteredSongs.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                    沒有找到符合條件的歌曲。
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Database;