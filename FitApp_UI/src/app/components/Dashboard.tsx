import { Flame, Droplet, Activity } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Dashboard() {
  return (
    <div className="p-6">
      {/* Header */}
      <header className="flex items-center justify-between pt-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#242429]">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1770664614894-f82c55704600?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMG1hbiUyMHBvcnRyYWl0JTIwZmFjZXxlbnwxfHx8fDE3Nzg5MDIxNjd8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0C0C0E]" />
          </div>
          <div>
            <p className="text-[#8A8A93] text-xs font-semibold uppercase tracking-wider mb-0.5">Good Morning</p>
            <h1 className="text-xl font-bold text-white tracking-tight">Alex</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#16161A] px-3 py-1.5 rounded-full border border-[#242429] shadow-[0_0_10px_rgba(210,255,0,0.1)]">
          <Flame size={16} className="text-[#D2FF00]" />
          <span className="text-[#D2FF00] font-black tracking-tight">14</span>
        </div>
      </header>

      {/* AI Coach Widget */}
      <section className="mb-8 relative">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#D2FF00]/30 to-transparent rounded-[18px] blur-sm opacity-50"></div>
        <div className="relative bg-[#16161A] border border-[#242429] rounded-[16px] p-5 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0C0C0E] border border-[#242429] flex items-center justify-center">
              <span className="text-[#D2FF00] text-xs font-black">AI</span>
            </div>
            <h2 className="text-white text-sm font-bold uppercase tracking-wide">Coach Claude</h2>
          </div>
          <p className="text-[#8A8A93] text-sm leading-relaxed">
            Good morning. Based on your <span className="text-white font-semibold">low recovery metrics</span> yesterday, I suggest a <span className="text-[#D2FF00] font-semibold">mobility flow</span> today instead of heavy lifting.
          </p>
        </div>
      </section>

      {/* Quick Metrics - Dual Rings */}
      <section>
        <h2 className="text-sm font-bold text-[#8A8A93] uppercase tracking-wider mb-4">
          Daily Progress
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Water Intake */}
          <div className="bg-[#16161A] border border-[#242429] rounded-[16px] p-5 flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0C0C0E" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#3b82f6" 
                  strokeWidth="8" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="75.36" 
                  strokeLinecap="round" 
                  className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <Droplet size={20} className="text-blue-500 mb-1" />
                <span className="text-white font-bold text-sm">2.4L</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-[#8A8A93] uppercase">Water</p>
          </div>

          {/* Activity / Calories */}
          <div className="bg-[#16161A] border border-[#242429] rounded-[16px] p-5 flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0C0C0E" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#D2FF00" 
                  strokeWidth="8" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="40" 
                  strokeLinecap="round" 
                  className="drop-shadow-[0_0_8px_rgba(210,255,0,0.4)]"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <Activity size={20} className="text-[#D2FF00] mb-1" />
                <span className="text-white font-bold text-sm">840</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-[#8A8A93] uppercase">Active Cal</p>
          </div>
        </div>
      </section>
    </div>
  );
}
