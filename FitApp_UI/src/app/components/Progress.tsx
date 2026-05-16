import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Progress() {
  const [timeframe, setTimeframe] = useState("1M");

  const data = [
    { date: "May 1", weight: 195 },
    { date: "May 8", weight: 193 },
    { date: "May 15", weight: 190 },
    { date: "May 22", weight: 188 },
    { date: "May 29", weight: 185 },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <header className="pt-8 mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase mb-2">
          Your <span className="text-[#D2FF00]">Progress</span>
        </h1>
        <p className="text-[#8A8A93] text-sm">Consistency compounds.</p>
      </header>

      {/* Analytics Chart */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-[#8A8A93] uppercase tracking-wider">Weight Trend</h2>
          
          {/* Segmented Toggle Pill */}
          <div className="flex bg-[#16161A] border border-[#242429] p-1 rounded-full">
            {["7D", "1M", "3M", "YTD"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  timeframe === tf 
                    ? "bg-[#242429] text-white shadow-sm" 
                    : "text-[#8A8A93] hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#16161A] border border-[#242429] rounded-[16px] p-5 h-64">
          <div className="mb-4">
            <span className="text-3xl font-black text-white tracking-tighter">185<span className="text-sm text-[#8A8A93] ml-1">lbs</span></span>
            <span className="ml-3 text-xs font-bold text-[#D2FF00] bg-[#D2FF00]/10 px-2 py-1 rounded-md">-10 lbs</span>
          </div>
          
          <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D2FF00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D2FF00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8A8A93', fontSize: 10, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8A8A93', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16161A', borderColor: '#242429', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#D2FF00' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#D2FF00" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                  style={{ filter: "drop-shadow(0px 4px 6px rgba(210, 255, 0, 0.2))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section>
        <h2 className="text-sm font-bold text-[#8A8A93] uppercase tracking-wider mb-4">Transformation</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="relative rounded-[16px] overflow-hidden border border-[#242429] aspect-[3/4]">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2lubnklMjBtYW4lMjBmaXRuZXNzfGVufDF8fHx8MTc3ODkwMjE3MXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Before Progress"
              className="w-full h-full object-cover grayscale-[30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3">
              <span className="block text-[10px] font-black text-[#D2FF00] uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm mb-1 w-max">Before</span>
              <span className="text-white text-xs font-bold shadow-sm">Jan 1, 2026</span>
            </div>
          </div>
          
          <div className="relative rounded-[16px] overflow-hidden border border-[#D2FF00] aspect-[3/4] shadow-[0_0_15px_rgba(210,255,0,0.15)]">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNjdWxhciUyMG1hbiUyMGZpdG5lc3MlMjB0cmFpbmluZ3xlbnwxfHx8fDE3Nzg5MDIxNzR8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="After Progress"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3">
              <span className="block text-[10px] font-black text-black uppercase tracking-widest bg-[#D2FF00] px-2 py-0.5 rounded shadow-sm mb-1 w-max">Current</span>
              <span className="text-white text-xs font-bold shadow-sm">May 16, 2026</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
