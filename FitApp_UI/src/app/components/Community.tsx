import { Users } from "lucide-react";

export function Community() {
  return (
    <div className="p-6 h-full flex flex-col items-center justify-center text-center mt-32">
      <div className="w-20 h-20 bg-[#16161A] border border-[#242429] rounded-full flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 bg-[#D2FF00]/10 rounded-full blur-xl animate-pulse"></div>
        <Users size={32} className="text-[#D2FF00] relative z-10" />
      </div>
      
      <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase mb-2">
        FitApp <span className="text-[#D2FF00]">Squad</span>
      </h1>
      <p className="text-[#8A8A93] text-sm max-w-[250px] mx-auto leading-relaxed">
        Connect with athletes globally. Leaderboards and challenges unlocking soon.
      </p>
      
      <button className="mt-8 px-6 py-3 bg-[#16161A] border border-[#242429] rounded-full text-white text-xs font-bold uppercase tracking-wider hover:border-[#D2FF00] transition-colors">
        Invite Friends
      </button>
    </div>
  );
}
