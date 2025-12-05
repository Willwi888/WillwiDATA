import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Language, ProjectType } from '../types';

const Database: React.FC = () => {
  const { songs } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLang, setFilterLang] = useState<string>('All');
  const [filterProject, setFilterProject] = useState<string>('All');
  const [showEditorPick, setShowEditorPick] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table'); // Default to table for management

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

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white">作品資料庫</h2>
           <p className="text-slate-400 text-sm mt-1">共 {songs.length} 首歌曲</p>
        </div>
        
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                📋 清單管理
            </button>
            <button 
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                🖼️ 視覺卡片
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 mb-6 flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜尋歌名, ISRC, UPC..."
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none"
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
        >
          <option value="All">所有語言</option>
          {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select 
          className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="All">所有專案</option>
          {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button 
          onClick={() => setShowEditorPick(!showEditorPick)}
          className={`px-4 py-2 rounded-lg border transition-colors ${showEditorPick ? 'bg-brand-gold text-slate-900 border-brand-gold font-bold' : 'border-slate-600 text-slate-300 hover:border-slate-400'}`}
        >
          ★ 編輯精選
        </button>
      </div>

      {viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map(song => (
            <Link key={song.id} to={`/song/${song.id}`} className="group bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-brand-accent transition-all hover:shadow-brand-accent/20 hover:shadow-xl">
                <div className="relative aspect-square overflow-hidden">
                <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                        <p className="text-sm text-slate-400">{song.versionLabel}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">{song.language}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>{song.releaseDate}</span>
                    <span>{song.projectType}</span>
                </div>
                </div>
            </Link>
            ))}
        </div>
      ) : (
        // Table View
        <div className="overflow-x-auto bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">封面</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">歌名/版本</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ISRC</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">發行日</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">資料缺漏檢查</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">操作</th>
                    </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                    {filteredSongs.map(song => {
                        const missing = getMissingFields(song);
                        return (
                            <tr key={song.id} className="hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <img className="h-10 w-10 rounded object-cover" src={song.coverUrl} alt="" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white">{song.title}</div>
                                    <div className="text-xs text-slate-400">{song.versionLabel}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono">
                                    {song.isrc || <span className="text-red-400 italic">未輸入</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    {song.releaseDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {missing.length > 0 ? (
                                        <div className="flex gap-1">
                                            {missing.map(m => (
                                                <span key={m} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                    缺{m}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            完整
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/song/${song.id}`} className="text-brand-accent hover:text-sky-300 mr-4">
                                        編輯
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {filteredSongs.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                    沒有找到符合條件的歌曲。
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Database;