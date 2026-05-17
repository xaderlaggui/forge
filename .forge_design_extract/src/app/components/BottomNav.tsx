import { NavLink } from "react-router";
import { Home, Dumbbell, PieChart, TrendingUp, Plus } from "lucide-react";

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-bg0/90 backdrop-blur-xl border-t border-b1 flex items-center justify-around px-2 z-50">
      <NavItem to="/home" icon={<Home size={22} />} label="Home" />
      <NavItem to="/workout" icon={<Dumbbell size={22} />} label="Workout" />
      
      {/* Floating Action Button */}
      <div className="relative flex-1 flex justify-center h-full">
        <button className="absolute -top-6 w-[52px] h-[52px] bg-forge text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,92,46,0.35)] border-[3px] border-bg0 hover:opacity-90 transition-opacity">
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>

      <NavItem to="/nutrition" icon={<PieChart size={22} />} label="Nutrition" />
      <NavItem to="/progress" icon={<TrendingUp size={22} />} label="Progress" />
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors ${
          isActive ? "text-forge" : "text-t3 hover:text-t2"
        }`
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
}