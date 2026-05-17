import { useState } from "react";
import { ChevronLeft, Check, Play, Pause, X } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

export default function Workout() {
  const navigate = useNavigate();
  const [activeSet, setActiveSet] = useState<number | null>(1);
  const [isResting, setIsResting] = useState(true);
  const [keypadVisible, setKeypadVisible] = useState(false);
  const [sets, setSets] = useState([
    { id: 1, prev: "135 x 10", weight: "135", reps: "10", done: true },
    { id: 2, prev: "145 x 8", weight: "145", reps: "", done: false },
    { id: 3, prev: "145 x 8", weight: "", reps: "", done: false },
  ]);

  const toggleSet = (id: number) => {
    setSets(sets.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  return (
    <div className="flex flex-col w-full h-full relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-bg0/95 backdrop-blur-xl border-b border-b1 pt-8 px-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} className="w-[36px] h-[36px] rounded-full bg-bg2 flex items-center justify-center text-t2">
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-1.5 items-center">
            <div className="w-[14px] h-[5px] rounded-full bg-forge transition-all" />
            <div className="w-[22px] h-[5px] rounded-full bg-forge transition-all" />
            <div className="w-[14px] h-[5px] rounded-full bg-bg2 transition-all" />
            <div className="w-[14px] h-[5px] rounded-full bg-bg2 transition-all" />
          </div>

          <div className="px-3 py-1.5 rounded-full bg-forge/10 text-forge text-[13px] font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forge animate-pulse" />
            01:15
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Exercise Header */}
        <div className="mb-4">
          <h2 className="font-grotesk text-2xl font-bold text-t1">Bench Press (Barbell)</h2>
          <div className="mt-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-2.5 flex items-center gap-2">
            <span className="text-[12px] font-medium text-yellow-500">🏆 PR: 225 lbs x 3</span>
          </div>
        </div>

        {/* Sets Table */}
        <div className="bg-bg1 rounded-2xl border border-b1 overflow-hidden mb-32">
          {/* Header */}
          <div className="grid grid-cols-[28px_1fr_60px_52px_36px] gap-2 px-3.5 py-2.5 border-b border-b1 bg-[#242428]/50">
            <span className="text-[10px] font-semibold text-t3 uppercase tracking-[0.06em] text-center">Set</span>
            <span className="text-[10px] font-semibold text-t3 uppercase tracking-[0.06em] text-left">Previous</span>
            <span className="text-[10px] font-semibold text-t3 uppercase tracking-[0.06em] text-center">LBS</span>
            <span className="text-[10px] font-semibold text-t3 uppercase tracking-[0.06em] text-center">Reps</span>
            <span className="text-[10px] font-semibold text-t3 uppercase tracking-[0.06em] text-center"><Check size={12} className="mx-auto" /></span>
          </div>

          {/* Rows */}
          {sets.map((set, idx) => (
            <div 
              key={set.id} 
              className={`grid grid-cols-[28px_1fr_60px_52px_36px] gap-2 px-3.5 py-2.5 items-center border-b border-b1 last:border-0 transition-colors ${activeSet === set.id ? 'bg-forge/5' : ''}`}
            >
              <div className="text-[13px] font-medium text-t2 text-center">{idx + 1}</div>
              <div className="text-[12px] text-t3 truncate">{set.prev}</div>
              
              <button 
                onClick={() => { setActiveSet(set.id); setKeypadVisible(true); }}
                className={`bg-bg2 rounded-lg h-[34px] flex items-center justify-center text-[14px] font-semibold text-t1 border ${activeSet === set.id ? 'border-forge/50' : 'border-transparent'}`}
              >
                {set.weight || "-"}
              </button>
              
              <button 
                onClick={() => { setActiveSet(set.id); setKeypadVisible(true); }}
                className={`bg-bg2 rounded-lg h-[34px] flex items-center justify-center text-[14px] font-semibold text-t1 border ${activeSet === set.id ? 'border-forge/50' : 'border-transparent'}`}
              >
                {set.reps || "-"}
              </button>

              <button 
                onClick={() => toggleSet(set.id)}
                className={`w-[28px] h-[28px] rounded-full flex items-center justify-center mx-auto transition-colors ${set.done ? 'bg-forge text-white' : 'bg-bg3 border-[1.5px] border-b1 text-transparent'}`}
              >
                <Check size={14} strokeWidth={3} />
              </button>
            </div>
          ))}
          
          <button className="w-full py-3 text-[13px] font-semibold text-forge/80 hover:bg-bg2/50 transition-colors text-center border-t border-b1">
            + Add Set
          </button>
        </div>
      </div>

      {/* Rest Timer Widget */}
      <div className="fixed bottom-[90px] left-0 right-0 px-5 z-20 pointer-events-none">
        <div className="bg-bg1/95 backdrop-blur-xl rounded-[24px] border border-b1 p-3.5 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.4)] pointer-events-auto overflow-hidden relative">
          <div className="absolute inset-0 bg-forge/[0.03]" />
          
          <button className="w-[44px] h-[44px] rounded-full bg-bg2 flex items-center justify-center text-t2 font-semibold text-[11px] relative z-10 hover:text-white transition-colors">
            +30s
          </button>
          
          <div className="relative w-[88px] h-[88px] flex flex-col items-center justify-center z-10 group cursor-pointer" onClick={() => setIsResting(!isResting)}>
            <svg width="88" height="88" className="absolute inset-0 -rotate-90">
              <circle cx="44" cy="44" r="40" stroke="var(--bg2)" strokeWidth="4" fill="none" />
              <circle cx="44" cy="44" r="40" stroke="var(--forge)" strokeWidth="4" fill="none" strokeDasharray="251" strokeDashoffset="45" strokeLinecap="round" />
            </svg>
            <span className="font-grotesk text-[24px] font-bold text-forge drop-shadow-[0_0_12px_rgba(255,92,46,0.3)] leading-none mt-1">1:15</span>
            <span className="text-[9px] text-t3 uppercase tracking-[0.1em] mt-1">{isResting ? 'Resting' : 'Paused'}</span>
          </div>
          
          <button className="w-[44px] h-[44px] rounded-full bg-bg2 flex items-center justify-center text-t2 font-semibold text-[11px] relative z-10 hover:text-white transition-colors">
            Skip
          </button>
        </div>
      </div>

      {/* Custom Keypad Modal */}
      <AnimatePresence>
        {keypadVisible && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-bg1 border-t border-b1 p-4 pb-8 z-[60] rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-[14px] font-medium text-t1">Log Value</span>
              <button onClick={() => setKeypadVisible(false)} className="text-t3 hover:text-t1 p-1 rounded-full bg-bg2">
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "⌫"].map((key) => (
                <button 
                  key={key}
                  className="bg-bg2 hover:bg-bg3 active:bg-b1 h-[54px] rounded-xl text-[20px] font-medium text-t1 flex items-center justify-center transition-colors"
                >
                  {key}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setKeypadVisible(false)}
              className="w-full bg-forge text-white h-[54px] rounded-xl text-[16px] font-semibold mt-2 shadow-[0_0_15px_rgba(255,92,46,0.2)]"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}