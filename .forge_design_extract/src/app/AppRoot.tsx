import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import BottomNav from "./components/BottomNav";

export default function AppRoot() {
  const location = useLocation();

  const isSplashOrLogin = location.pathname === "/" || location.pathname === "/login";

  return (
    <div className="w-full min-h-[100dvh] bg-bg0 text-t1 font-inter flex flex-col relative overflow-hidden selection:bg-forge/30">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: isSplashOrLogin ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isSplashOrLogin ? 0 : -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col h-full w-full absolute inset-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
            <Outlet />
          </div>
        </motion.div>
      </AnimatePresence>
      {!isSplashOrLogin && <BottomNav />}
    </div>
  );
}