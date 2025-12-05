import React, { useState, useRef, useEffect } from 'react';
import { GenerateContentResponse } from "@google/genai";
import { getGeminiClient, GRANDMA_SYSTEM_INSTRUCTION } from '../services/geminiService';
import { useData } from '../context/DataContext';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Interactive: React.FC = () => {
  const { songs } = useData();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '哎喲！歡迎來到泡麵聲學院！我是泡麵阿嬤啦～肚子餓了嗎？還是想聽聽我家 Willwi 的歌？快坐下來聊聊！🍜' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat
  useEffect(() => {
    const client = getGeminiClient();
    if (client) {
      // Provide context about songs to the grandma
      const songContext = songs.map(s => `${s.title} (${s.language})`).join(', ');
      
      chatRef.current = client.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: GRANDMA_SYSTEM_INSTRUCTION + `\n目前資料庫裡有的歌曲：${songContext}`,
        }
      });
    }
  }, [songs]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessageStream({ message: userMsg });
      
      let fullText = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]); // Add placeholder

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1].text = fullText;
            return newMsgs;
          });
        }
      }
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "哎呀，阿嬤的網路好像怪怪的，大概是泡麵湯灑到數據機了... 再試一次看看？" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 min-h-[600px] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-gold to-orange-500 p-6 flex items-center gap-6">
            <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-4xl">
                    👵
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
            </div>
            <div>
                <h2 className="text-3xl font-bold text-slate-900">泡麵聲學院交誼廳</h2>
                <p className="text-slate-900/80 font-medium">校長：泡麵阿嬤 (AI Powered)</p>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow p-6 overflow-y-auto bg-slate-900/50 space-y-6 h-[500px]">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                        max-w-[80%] rounded-2xl p-4 text-base leading-relaxed shadow-lg
                        ${msg.role === 'user' 
                            ? 'bg-brand-accent text-slate-900 rounded-tr-none' 
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-300'}
                    `}>
                        {msg.role === 'model' && <div className="text-xs font-bold text-orange-600 mb-1">泡麵阿嬤</div>}
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white text-slate-500 rounded-2xl rounded-tl-none p-4 shadow-lg border border-slate-300">
                        <span className="animate-pulse">阿嬤正在打字 (可能在吃泡麵)... 🍜</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
            <div className="flex gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="跟阿嬤聊聊 Willwi 的音樂或是泡麵..."
                    className="flex-grow bg-slate-900 border border-slate-600 rounded-full px-6 py-3 text-white focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                    disabled={isLoading}
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-brand-gold hover:bg-orange-400 text-slate-900 font-bold rounded-full px-8 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    發送
                </button>
            </div>
            <div className="text-center mt-2 text-xs text-slate-500">
                由 Gemini AI 驅動 · 內容僅供娛樂
            </div>
        </div>
      </div>

      {/* Interactive Links Suggestion */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="https://www.youtube.com/@Willwi888" target="_blank" rel="noreferrer" className="block p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-brand-gold transition-colors text-center group">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📺</div>
              <h3 className="font-bold text-white">觀看 MV</h3>
              <p className="text-xs text-slate-400">去 YouTube 看看 Willwi</p>
          </a>
           <a href="https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4" target="_blank" rel="noreferrer" className="block p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-brand-gold transition-colors text-center group">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎧</div>
              <h3 className="font-bold text-white">聆聽作品</h3>
              <p className="text-xs text-slate-400">Spotify 串流播放</p>
          </a>
           <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="block p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-brand-gold transition-colors text-center group">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📸</div>
              <h3 className="font-bold text-white">追蹤 IG</h3>
              <p className="text-xs text-slate-400">關注最新動態</p>
          </a>
      </div>
    </div>
  );
};

export default Interactive;