import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Dumbbell, Utensils, TrendingUp, Users } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { name: "Home", path: "/app", icon: Home },
    { name: "Workout", path: "/app/workout", icon: Dumbbell },
    { name: "Nutrition", path: "/app/nutrition", icon: Utensils },
    { name: "Progress", path: "/app/progress", icon: TrendingUp },
    { name: "Community", path: "/app/community", icon: Users },
  ];

  return (
    <div className="bg-[#0C0C0E] text-white min-h-screen font-sans flex flex-col selection:bg-[#D2FF00] selection:text-black">
      <div className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#16161A]/90 backdrop-blur-md border-t border-[#242429] pb-[env(safe-area-inset-bottom)] z-50">
        <div className="flex justify-around items-center px-2 py-4 max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.name}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center justify-center w-16 h-12"
              >
                <Icon
                  size={24}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-[#D2FF00]" : "text-[#8A8A93]"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] mt-1 font-medium tracking-wide ${
                    isActive ? "text-[#D2FF00]" : "text-[#8A8A93]"
                  }`}
                >
                  {tab.name}
                </span>
                
                {/* Active Micro-dot */}
                {isActive && (
                  <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-[#D2FF00] shadow-[0_0_8px_rgba(210,255,0,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
