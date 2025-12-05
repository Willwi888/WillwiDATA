import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Language, ProjectType, Song } from '../types';

const AddSong: React.FC = () => {
  const navigate = useNavigate();
  const { addSong } = useData();

  const [formData, setFormData] = useState<Partial<Song>>({
    title: '',
    versionLabel: '',
    language: Language.Mandarin,
    projectType: ProjectType.Indie,
    releaseDate: new Date().toISOString().split('T')[0],
    isEditorPick: false,
    coverUrl: 'https://picsum.photos/400/400', // Default placeholder
    lyrics: '',
    description: ''
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) return alert("請輸入歌名");

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
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6">新增歌曲</h2>
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
              <label className="block text-sm font-medium text-slate-300 mb-1">發行日期</label>
              <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">封面圖片 URL</label>
              <input name="coverUrl" value={formData.coverUrl} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="https://..." />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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