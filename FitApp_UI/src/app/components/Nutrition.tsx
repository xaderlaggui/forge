import { Search, ScanLine, Plus } from "lucide-react";

export function Nutrition() {
  const meals = [
    { name: "Breakfast", calories: 450, macros: "30P / 40C / 15F", logged: true },
    { name: "Lunch", calories: 650, macros: "50P / 60C / 20F", logged: true },
    { name: "Dinner", calories: 0, macros: "--", logged: false },
  ];

  return (
    <div className="p-6">
      {/* Header & Search */}
      <header className="pt-8 mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase mb-6">
          Nutrition <span className="text-[#D2FF00]">Tracker</span>
        </h1>
        
        <div className="relative flex items-center">
          <div className="absolute left-4 text-[#8A8A93]">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search food or scan barcode..." 
            className="w-full bg-[#16161A] border border-[#242429] rounded-full py-4 pl-12 pr-14 text-sm font-medium text-white focus:outline-none focus:border-[#D2FF00] placeholder:text-[#8A8A93] shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          />
          <button className="absolute right-2 p-2 bg-[#D2FF00] rounded-full text-black hover:bg-[#bce600] transition-colors">
            <ScanLine size={18} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Macro Ring Centerpiece */}
      <section className="mb-10 flex flex-col items-center">
        <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Protein (Inner) */}
            <circle cx="50" cy="50" r="28" fill="transparent" stroke="#16161A" strokeWidth="6" />
            <circle cx="50" cy="50" r="28" fill="transparent" stroke="#D2FF00" strokeWidth="6" strokeDasharray="175.9" strokeDashoffset="40" strokeLinecap="round" />
            
            {/* Carbs (Middle) */}
            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#16161A" strokeWidth="6" />
            <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray="238.7" strokeDashoffset="100" strokeLinecap="round" />
            
            {/* Fat (Outer) */}
            <circle cx="50" cy="50" r="48" fill="transparent" stroke="#16161A" strokeWidth="6" />
            <circle cx="50" cy="50" r="48" fill="transparent" stroke="#ef4444" strokeWidth="6" strokeDasharray="301.5" strokeDashoffset="200" strokeLinecap="round" />
          </svg>
          
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-black text-white tracking-tighter">1,100</span>
            <span className="text-[10px] font-bold text-[#8A8A93] uppercase tracking-widest">Eaten</span>
          </div>
        </div>
        
        {/* Calorie Progress Bar */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs font-bold uppercase mb-2">
            <span className="text-[#8A8A93]">Calories</span>
            <span className="text-white">1,100 / <span className="text-[#D2FF00]">2,400</span></span>
          </div>
          <div className="w-full h-3 bg-[#16161A] border border-[#242429] rounded-full overflow-hidden">
            <div className="h-full bg-[#D2FF00] w-[45%] rounded-full shadow-[0_0_10px_rgba(210,255,0,0.5)]"></div>
          </div>
        </div>
      </section>

      {/* Meal Logs */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-sm font-bold text-[#8A8A93] uppercase tracking-wider">Meal Log</h2>
        </div>
        
        <div className="space-y-3">
          {meals.map((meal, idx) => (
            <div key={idx} className="bg-[#16161A] border border-[#242429] rounded-[16px] p-4 flex items-center justify-between transition-all active:scale-[0.98]">
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg mb-1">{meal.name}</span>
                {meal.logged ? (
                  <span className="text-xs font-semibold text-[#8A8A93] tracking-wide">{meal.macros}</span>
                ) : (
                  <span className="text-xs font-medium text-[#8A8A93] italic">Not logged yet</span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {meal.logged ? (
                  <span className="text-[#D2FF00] font-black text-lg">{meal.calories} <span className="text-xs text-[#8A8A93]">kcal</span></span>
                ) : (
                  <button className="w-8 h-8 bg-[#0C0C0E] border border-[#242429] rounded-full flex items-center justify-center text-[#D2FF00] hover:border-[#D2FF00] transition-colors">
                    <Plus size={16} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
