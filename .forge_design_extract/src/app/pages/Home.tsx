import { useState, useEffect } from "react";
import { Sun, Moon, MessageSquare, Play, Flame, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="flex flex-col w-full h-full pt-8 pb-8 px-5 gap-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <span className="font-grotesk text-[18px] font-bold tracking-[0.06em] text-forge">FORGE</span>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-bg2 transition-colors text-t2">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-forge to-[#FF8C5A] flex items-center justify-center text-[13px] font-bold text-white shadow-md">
            A
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div>
        <div className="text-[12px] text-t2">Good morning · Wednesday</div>
        <div className="font-grotesk text-[20px] font-semibold text-t1 mt-[2px]">Alex Mercer</div>
      </div>

      {/* Today's Plan Card */}
      <div className="relative bg-gradient-to-br from-[#1C1C20] to-[#0A0A0B] rounded-2xl border border-b1 p-[18px] overflow-hidden">
        {/* Decorative Blob */}
        <div className="absolute -top-[30px] -right-[20px] w-[100px] h-[100px] bg-forge/10 rounded-full blur-2xl"></div>
        
        <div className="text-[10px] font-semibold text-forge tracking-[0.08em] uppercase mb-1">📅 Today's Plan</div>
        <div className="font-grotesk text-[18px] font-semibold text-white mb-0.5">Upper Body Power</div>
        <div className="text-[12px] text-gray-400 mb-3.5">6 exercises · 45 min · Chest / Triceps / Shoulders</div>
        
        <div className="flex gap-[6px] mb-4">
          {["Chest", "Triceps", "Shoulders"].map(tag => (
            <span key={tag} className="inline-block px-[10px] py-[3px] rounded-full bg-[#2A2A2E] text-white text-[11px] font-medium">
              {tag}
            </span>
          ))}
        </div>
        
        <button 
          onClick={() => navigate('/workout')}
          className="w-full bg-forge text-white border-none rounded-xl text-[15px] font-semibold p-[14px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Play size={16} fill="currentColor" /> Start Workout
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3">
        {/* Macros Rings */}
        <div className="flex-1 bg-bg1 rounded-2xl border border-b1 p-4 flex flex-col items-center">
          <div className="relative w-[96px] h-[96px]">
            <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r="44" stroke="#1A2035" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="32" stroke="#251614" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="44" stroke="#0A84FF" strokeWidth="8" fill="none" strokeDasharray="276" strokeDashoffset="61" strokeLinecap="round" />
              <circle cx="50" cy="50" r="32" stroke="#FF5C2E" strokeWidth="8" fill="none" strokeDasharray="201" strokeDashoffset="56" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-t1">72%</span>
            </div>
          </div>
          <div className="flex gap-3 mt-3">
            <div className="flex flex-col items-center gap-[2px]">
              <span className="w-2 h-2 rounded-full bg-forge block" />
              <span className="text-[10px] text-t2">1.8k cal</span>
            </div>
            <div className="flex flex-col items-center gap-[2px]">
              <span className="w-2 h-2 rounded-full bg-[#0A84FF] block" />
              <span className="text-[10px] text-t2">2.4 L</span>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="flex-1 bg-bg1 rounded-2xl border border-b1 p-4 flex flex-col items-center text-center">
          <div className="w-[48px] h-[48px] rounded-full bg-forge/10 flex items-center justify-center mb-2 shadow-[0_0_16px_rgba(255,92,46,0.15)] text-forge">
            <Flame size={24} fill="currentColor" strokeWidth={1} />
          </div>
          <div className="font-grotesk text-[28px] font-bold text-t1 leading-none">12</div>
          <div className="text-[10px] text-t2 uppercase tracking-[0.06em] mt-1">Day Streak</div>
          <div className="flex gap-1 mt-3">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[8px] text-t3">{day}</span>
                <div className={`w-[6px] h-[6px] rounded-full ${i < 3 ? "bg-forge" : "bg-bg3"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Coach */}
      <div className="relative bg-bg1 rounded-2xl border border-b1 p-4 overflow-hidden shadow-[0_0_20px_rgba(255,92,46,0.04)]">
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-forge" />
        <div className="flex gap-3">
          <div className="w-[38px] h-[38px] rounded-full bg-bg2 flex items-center justify-center flex-shrink-0 text-forge">
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-forge tracking-[0.06em] uppercase mb-1">Personalized</div>
            <div className="text-[13px] text-t1 leading-relaxed">
              You're recovering well! Based on yesterday's strain, aim for 8–10 reps on top sets today.
            </div>
            <button className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-bg2 text-forge text-[12px] font-medium hover:bg-bg3 transition-colors">
              Chat with Coach <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Workouts */}
      <div>
        <div className="text-[11px] font-medium text-t3 uppercase tracking-[0.07em] mb-2">Recent Workouts</div>
        <div className="bg-bg1 rounded-2xl border border-b1 px-4">
          {[
            { title: "Leg Day - Quads", date: "Yesterday, 6:00 PM", icon: "🦵", stat: "+2 PRs" },
            { title: "Push Pull Legs", date: "Mon, 5:30 PM", icon: "🔥", stat: "" }
          ].map((workout, idx) => (
            <div key={idx} className={`flex items-center gap-3 py-3 ${idx === 0 ? 'border-b border-b1' : ''}`}>
              <div className="w-[38px] h-[38px] rounded-xl bg-bg2 flex items-center justify-center flex-shrink-0 text-lg">
                {workout.icon}
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-medium text-t1">{workout.title}</div>
                <div className="text-[11px] text-t3 mt-0.5">{workout.date}</div>
              </div>
              {workout.stat && (
                <div className="text-[11px] font-semibold text-[#34C759]">
                  {workout.stat}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}