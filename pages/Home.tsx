import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

// 替換此處為您的形象照 URL。如果是在本地開發，可以放在 public 資料夾。
const ARTIST_HERO_IMAGE = "https://p17.zdusercontent.com/attachment/572742/nGBWtmpTNA1gAhYLblesSXoiZ?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..DuNguqol2WAk3WiKEt2srw.Mbfpe6C7F0kNE5DFsRseRfcLpnmsFIJX6bbXNEIUD8vwVC42QZeqW2_-5mxN3DnaFJZ_jmssgO1yGm440mPn2JGjfN6LCYLEKR3XZl4w9DnHsnClS3IbVUkRZWlmhMaxWj3TI3K6hz-1ZSVYRSLDVZxMLLIzrC5X_6o_4E--8wu1cRwuPTlOef1AEgDS5ynUn4Dy7MS7sgZmhiw3Vcu1jxnIKwdnIZJm1VaZf9_9EXwmxDISSDzzZFp5J3sSW9D1vKO8oM8hzB-CXggM0R44sHQutGNCcKc5pt2F9UZSVfw.1y_aP3hPN5ziOiWi6Kf9hw"; 

const Home: React.FC = () => {
  const { songs } = useData();
  const featured = songs.find(s => s.isEditorPick) || songs[0];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-slate-950">
      
      {/* Hero Image Section - Mobile: Top (50vh), Desktop: Left (50%) */}
      {/* Changed bg-center to bg-top to ensure face is visible */}
      <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-auto overflow-hidden bg-black group">
        <div 
            className="absolute inset-0 bg-cover bg-top bg-no-repeat opacity-90 transition-transform duration-[2s] ease-out group-hover:scale-105"
            style={{ backgroundImage: `url(${ARTIST_HERO_IMAGE})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/20"></div>
        
        {/* Mobile Overlay Text */}
        <div className="absolute bottom-4 left-4 lg:hidden">
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase drop-shadow-xl">Willwi</h2>
        </div>
      </div>

      {/* Content Section - Mobile: Bottom, Desktop: Right */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-slate-950 text-white relative">
        <div className="max-w-lg mx-auto lg:mx-0">
          
          <h1 className="hidden lg:block text-6xl xl:text-8xl font-black tracking-tighter uppercase mb-6 text-white">
            Willwi
          </h1>
          
          <div className="h-1 w-20 bg-brand-accent mb-8"></div>
          
          <h2 className="text-3xl md:text-4xl font-bold tracking-wide text-white mb-6 uppercase leading-tight">
            Willwi Music Catalog.
          </h2>
          
          <p className="text-slate-400 text-lg leading-relaxed mb-10 font-light border-l-2 border-slate-700 pl-4">
            Reborn on Feb 25th.<br/>
            Simply to leave a record of existence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link 
                to="/database" 
                className="px-8 py-4 bg-brand-accent text-slate-900 font-black text-center uppercase tracking-widest hover:bg-white transition-all shadow-lg hover:shadow-brand-accent/50"
            >
              DATABASE
            </Link>
            <Link 
                to="/interactive" 
                className="px-8 py-4 border border-slate-600 text-slate-300 font-bold text-center uppercase tracking-widest hover:border-white hover:text-white transition-colors"
            >
              INTERACTIVE
            </Link>
          </div>

          {/* Featured Song Mini Player */}
          {featured && (
            <div className="border-t border-slate-800 pt-8 mt-auto">
              <p className="text-[10px] font-bold text-brand-accent uppercase tracking-[0.2em] mb-4">Latest Release / Featured</p>
              <Link to={`/song/${featured.id}`} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-900/50 p-3 rounded-xl transition-colors -mx-3 border border-transparent hover:border-slate-800">
                <img src={featured.coverUrl} className="w-16 h-16 object-cover rounded shadow-lg grayscale group-hover:grayscale-0 transition-all duration-500" alt="cover" />
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-accent transition-colors">{featured.title}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">{featured.releaseDate}</p>
                </div>
                <div className="ml-auto w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 group-hover:border-brand-accent group-hover:text-brand-accent transition-all">
                   →
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;