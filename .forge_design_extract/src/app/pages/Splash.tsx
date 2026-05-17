import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="w-full h-full bg-[#0A0A0B] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        <h1 className="font-grotesk text-4xl font-bold tracking-[0.1em] text-forge drop-shadow-[0_0_24px_rgba(255,92,46,0.6)]">
          FORGE
        </h1>
      </motion.div>
    </div>
  );
}