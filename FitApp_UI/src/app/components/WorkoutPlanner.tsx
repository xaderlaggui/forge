import { useState } from "react";
import { Check, Clock, Play } from "lucide-react";

export function WorkoutPlanner() {
  const [activeDay, setActiveDay] = useState(3); // Thursday
  const [sets, setSets] = useState([
    { id: 1, reps: 10, weight: 135, completed: true },
    { id: 2, reps: 8, weight: 185, completed: false },
    { id: 3, reps: 6, weight: 225, completed: false },
  ]);

  const days = [
    { label: "M", date: 12 },
    { label: "T", date: 13 },
    { label: "W", date: 14 },
    { label: "T", date: 15 },
    { label: "F", date: 16 },
    { label: "S", date: 17 },
    { label: "S", date: 18 },
  ];

  const toggleSet = (id: number) => {
    setSets(sets.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  return (
    <div className="p-6">
      {/* Header & Weekly Strip */}
      <header className="pt-8 mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase mb-6">
          Workout <span className="text-[#D2FF00]">Plan</span>
        </h1>
        
        <div className="flex justify-between items-center">
          {days.map((day, idx) => {
            const isActive = idx === activeDay;
            return (
              <button 
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={`flex flex-col items-center justify-center w-11 h-14 rounded-full transition-all ${
                  isActive 
                    ? "bg-[#D2FF00] text-black shadow-[0_0_12px_rgba(210,255,0,0.4)]" 
                    : "bg-[#16161A] text-[#8A8A93] border border-[#242429]"
                }`}
              >
                <span className={`text-[10px] font-bold uppercase mb-1 ${isActive ? "text-black" : "text-[#8A8A93]"}`}>
                  {day.label}
                </span>
                <span className={`text-sm font-black ${isActive ? "text-black" : "text-white"}`}>
                  {day.date}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Active Workout Interface */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#8A8A93] uppercase tracking-wider">Current Exercise</h2>
            <h3 className="text-xl font-black text-white tracking-tight uppercase">Barbell Bench Press</h3>
          </div>
          <div className="bg-[#16161A] p-2 rounded-lg border border-[#242429]">
             <Play size={20} className="text-[#D2FF00]" />
          </div>
        </div>

        <div className="bg-[#16161A] border border-[#242429] rounded-[16px] overflow-hidden">
          {/* Grid Header */}
          <div className="grid grid-cols-4 p-4 border-b border-[#242429] bg-[#0C0C0E]/50 text-xs font-bold text-[#8A8A93] uppercase tracking-wider">
            <div className="text-center">Set</div>
            <div className="text-center">LBS</div>
            <div className="text-center">Reps</div>
            <div className="text-center">Done</div>
          </div>
          
          {/* Grid Rows */}
          <div className="divide-y divide-[#242429]">
            {sets.map((set) => (
              <div 
                key={set.id} 
                className={`grid grid-cols-4 p-4 items-center transition-colors ${set.completed ? "bg-[#D2FF00]/5" : ""}`}
              >
                <div className="text-center font-bold text-[#8A8A93]">
                  {set.id}
                </div>
                <div className="text-center font-black text-white text-lg">
                  {set.weight}
                </div>
                <div className="text-center font-black text-white text-lg">
                  {set.reps}
                </div>
                <div className="flex justify-center">
                  <button 
                    onClick={() => toggleSet(set.id)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                      set.completed 
                        ? "bg-[#D2FF00] text-black shadow-[0_0_10px_rgba(210,255,0,0.3)]" 
                        : "bg-[#0C0C0E] border border-[#242429] text-transparent"
                    }`}
                  >
                    <Check size={16} strokeWidth={4} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rest Timer */}
      <section className="flex flex-col items-center justify-center">
        <h2 className="text-xs font-bold text-[#8A8A93] uppercase tracking-wider mb-4">Rest Timer</h2>
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Subtle glowing aura */}
          <div className="absolute inset-0 bg-[#D2FF00]/10 rounded-full blur-xl animate-pulse"></div>
          
          <svg className="w-full h-full transform -rotate-90 absolute z-10" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="transparent" stroke="#16161A" strokeWidth="4" />
            <circle 
              cx="50" cy="50" r="46" 
              fill="transparent" 
              stroke="#D2FF00" 
              strokeWidth="4" 
              strokeDasharray="289" 
              strokeDashoffset="100" 
              strokeLinecap="round" 
              className="transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(210,255,0,1)]"
            />
          </svg>
          
          <div className="relative z-20 flex flex-col items-center">
            <Clock size={20} className="text-[#D2FF00] mb-1" />
            <span className="text-3xl font-black text-white tracking-tighter">01:15</span>
          </div>
        </div>
      </section>
    </div>
  );
}
