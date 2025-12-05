import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const Home: React.FC = () => {
  const { songs } = useData();
  const featured = songs.find(s => s.isEditorPick) || songs[0];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
          <span className="block">Willwi</span>
          <span className="block text-brand-accent">Multilingual Music Catalog</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-slate-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          管理您的多語系創作，連結全球音樂平台。
        </p>
        <div className="mt-8 flex justify-center gap-4">
           <Link to="/database" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-slate-900 bg-brand-accent hover:bg-sky-400 md:py-4 md:text-lg md:px-10">
            進入資料庫
          </Link>
          <Link to="/add" className="w-full flex items-center justify-center px-8 py-3 border border-slate-600 text-base font-medium rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 md:py-4 md:text-lg md:px-10">
            新增作品
          </Link>
        </div>
      </div>

      {featured && (
        <div className="w-full max-w-4xl bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 mt-8">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img className="h-48 w-full object-cover md:h-full md:w-64" src={featured.coverUrl} alt={featured.title} />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-brand-accent font-semibold">編輯精選 · Editor's Pick</div>
              <Link to={`/song/${featured.id}`} className="block mt-1 text-2xl leading-tight font-bold text-white hover:underline">
                {featured.title} <span className="text-lg text-slate-400 font-normal">{featured.versionLabel}</span>
              </Link>
              <p className="mt-2 text-slate-400">{featured.description || "點擊查看詳細資訊與完整中繼資料。"}</p>
              
              <div className="mt-6 flex gap-3">
                 <Link to={`/song/${featured.id}`} className="text-white bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition">
                    查看詳情
                 </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;