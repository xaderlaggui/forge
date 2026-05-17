import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Apple, Chrome } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/home");
  };

  return (
    <div className="w-full h-full bg-bg0 flex flex-col items-center px-6 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        <h1 className="font-grotesk text-3xl font-bold tracking-[0.06em] text-forge mb-2">FORGE</h1>
        <p className="text-t2 text-sm text-center mb-10">Sign in to track your progress.</p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-t3 w-5 h-5" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full h-14 bg-bg2 rounded-xl pl-12 pr-4 text-t1 placeholder:text-t3 focus:outline-none focus:ring-1 focus:ring-forge border border-transparent focus:border-forge transition-all"
              required
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              className="w-full h-14 bg-bg2 rounded-xl px-4 text-t1 placeholder:text-t3 focus:outline-none focus:ring-1 focus:ring-forge border border-transparent focus:border-forge transition-all"
              required
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-14 bg-forge text-white rounded-xl font-semibold text-[15px] hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
          </div>
        </form>

        <div className="w-full flex items-center my-8">
          <div className="flex-1 h-[1px] bg-b1"></div>
          <span className="px-4 text-[11px] text-t3 uppercase font-medium tracking-widest">Or continue with</span>
          <div className="flex-1 h-[1px] bg-b1"></div>
        </div>

        <div className="w-full flex gap-4">
          <button className="flex-1 h-14 bg-bg1 border border-b1 rounded-xl flex items-center justify-center hover:bg-bg2 transition-colors">
            <Apple className="w-5 h-5 text-t1" />
          </button>
          <button className="flex-1 h-14 bg-bg1 border border-b1 rounded-xl flex items-center justify-center hover:bg-bg2 transition-colors">
            <Chrome className="w-5 h-5 text-t1" />
          </button>
        </div>
        
        <p className="mt-auto text-[12px] text-t3 pt-12">
          Don't have an account? <button className="text-forge font-medium">Sign up</button>
        </p>
      </motion.div>
    </div>
  );
}