import React from 'react';
import { useUser } from '../context/UserContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { addCredit } = useUser();

  if (!isOpen) return null;

  const handleDonate = (amount: number, packageName: string) => {
      // Simulation of payment process
      if(window.confirm(`Confirm support of NT$ ${amount} for Willwi?`)) {
          addCredit(amount * 10, `Support: ${packageName}`); // 1 NTD = 10 Credits
          alert(`交易成功。已增加 ${amount * 10} 點 Thermal 算力。`);
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-white/10 w-full max-w-3xl overflow-hidden shadow-2xl animate-fade-in-up">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-start">
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Support Willwi</h2>
                <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Sustainable Art Project</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                Close [ESC]
            </button>
        </div>

        <div className="p-8 md:p-12">
            <p className="text-slate-400 text-xs leading-loose mb-12 max-w-xl font-light">
                您的支持將直接用於音樂製作、硬體維護以及 AI 視覺實驗的算力成本。<br/>
                這是一個獨立且長期的藝術計畫，每一份支持都將轉化為數據與頻率，留存於區塊與雲端之中。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Tier 1 */}
                <div onClick={() => handleDonate(150, 'Basic Tier')} className="group cursor-pointer bg-black/40 p-8 border border-white/5 hover:border-brand-gold/50 transition-all hover:bg-white/5">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Tier 01</span>
                        <div className="w-2 h-2 bg-slate-800 group-hover:bg-brand-gold transition-colors"></div>
                    </div>
                    <h3 className="text-white font-bold text-sm mb-2">基礎支持</h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-6">Basic Support</p>
                    <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                        <p className="text-white font-mono text-lg">NT$ 150</p>
                        <p className="text-brand-gold text-[9px] font-mono">1.5K THM</p>
                    </div>
                </div>
                
                {/* Tier 2 */}
                <div onClick={() => handleDonate(500, 'Advanced Tier')} className="group cursor-pointer bg-black/40 p-8 border border-white/5 hover:border-brand-gold/50 transition-all hover:bg-white/5 relative">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] text-brand-accent font-black uppercase tracking-widest">Tier 02</span>
                        <div className="w-2 h-2 bg-slate-800 group-hover:bg-brand-gold transition-colors"></div>
                    </div>
                    <h3 className="text-white font-bold text-sm mb-2">進階支持</h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-6">Studio Fund</p>
                    <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                        <p className="text-white font-mono text-lg">NT$ 500</p>
                        <p className="text-brand-gold text-[9px] font-mono">5.0K THM</p>
                    </div>
                </div>

                {/* Tier 3 */}
                <div onClick={() => handleDonate(1500, 'Core Tier')} className="group cursor-pointer bg-black/40 p-8 border border-white/5 hover:border-brand-gold/50 transition-all hover:bg-white/5">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] text-brand-gold font-black uppercase tracking-widest">Tier 03</span>
                        <div className="w-2 h-2 bg-slate-800 group-hover:bg-brand-gold transition-colors"></div>
                    </div>
                    <h3 className="text-white font-bold text-sm mb-2">核心支持</h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-6">Production Partner</p>
                    <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                        <p className="text-white font-mono text-lg">NT$ 1,500</p>
                        <p className="text-brand-gold text-[9px] font-mono">15K THM</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-8 gap-4">
                <p className="text-slate-600 text-[9px] uppercase tracking-widest">Crypto Support (Coming Soon)</p>
                <div className="font-mono text-[10px] text-slate-500 select-all hover:text-white transition-colors cursor-pointer">
                    0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;