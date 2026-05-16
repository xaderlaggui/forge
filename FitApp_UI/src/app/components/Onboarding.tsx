import { useState } from "react";
import { useNavigate } from "react-router";
import { Activity, ArrowRight, Target, Zap, Flame } from "lucide-react";

const GOALS = [
  { id: "build_muscle", label: "Build Muscle", icon: Zap },
  { id: "lose_weight", label: "Lose Weight", icon: Flame },
  { id: "endurance", label: "Endurance", icon: Activity },
  { id: "general_health", label: "General Health", icon: Target },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [weight, setWeight] = useState("185"); // lbs
  const [heightFeet, setHeightFeet] = useState("6");
  const [heightInches, setHeightInches] = useState("0");
  const [age, setAge] = useState("28");

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  // Calculate BMI (Weight in lbs, Height in inches)
  const totalInches = parseInt(heightFeet || "0") * 12 + parseInt(heightInches || "0");
  const weightLbs = parseFloat(weight || "0");
  let bmi = 0;
  if (totalInches > 0 && weightLbs > 0) {
    bmi = (weightLbs / (totalInches * totalInches)) * 703;
  }

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-white p-6 pb-24 font-sans selection:bg-[#D2FF00] selection:text-black">
      <header className="pt-8 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tighter uppercase text-white mb-2">
          Tell Us Your <span className="text-[#D2FF00]">Goals</span>
        </h1>
        <p className="text-[#8A8A93] text-sm">
          Select your primary objectives and enter your baseline metrics to calibrate your AI coach.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-[#8A8A93] uppercase tracking-wider mb-4">
          Select Goals
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            const Icon = goal.icon;
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`flex flex-col items-center justify-center p-5 rounded-[16px] transition-all duration-300 ${
                  isSelected
                    ? "bg-[#16161A] border border-[#D2FF00] shadow-[0_0_15px_rgba(210,255,0,0.15)] text-[#D2FF00]"
                    : "bg-[#16161A] border border-[#242429] text-[#8A8A93]"
                }`}
              >
                <Icon size={28} className="mb-3" />
                <span className={`font-semibold text-sm ${isSelected ? "text-white" : ""}`}>
                  {goal.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-[#8A8A93] uppercase tracking-wider mb-4">
          Baseline Metrics
        </h2>
        <div className="bg-[#16161A] rounded-[16px] p-5 border border-[#242429] space-y-6">
          {/* Inputs Row 1: Weight and Age */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#8A8A93] uppercase mb-2">Weight (lbs)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[#0C0C0E] border border-[#242429] rounded-lg p-3 text-white focus:outline-none focus:border-[#D2FF00] font-medium"
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#8A8A93] uppercase mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-[#0C0C0E] border border-[#242429] rounded-lg p-3 text-white focus:outline-none focus:border-[#D2FF00] font-medium"
                placeholder="0"
              />
            </div>
          </div>

          {/* Inputs Row 2: Height */}
          <div>
            <label className="block text-xs font-semibold text-[#8A8A93] uppercase mb-2">Height</label>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  className="w-full bg-[#0C0C0E] border border-[#242429] rounded-lg p-3 text-white focus:outline-none focus:border-[#D2FF00] font-medium pr-8"
                  placeholder="0"
                />
                <span className="absolute right-3 top-3 text-[#8A8A93] text-sm">ft</span>
              </div>
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  className="w-full bg-[#0C0C0E] border border-[#242429] rounded-lg p-3 text-white focus:outline-none focus:border-[#D2FF00] font-medium pr-8"
                  placeholder="0"
                />
                <span className="absolute right-3 top-3 text-[#8A8A93] text-sm">in</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="bg-[#16161A] rounded-[16px] p-6 border border-[#242429] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#8A8A93] uppercase tracking-wider mb-1">
              Current BMI
            </h3>
            <div className="text-4xl font-black tracking-tighter text-[#D2FF00]">
              {bmi > 0 ? bmi.toFixed(1) : "--"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-white/70 uppercase">Status</div>
            <div className="text-lg font-bold text-white">
              {bmi === 0 ? "N/A" : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Optimal" : bmi < 30 ? "Overweight" : "Obese"}
            </div>
          </div>
        </div>
      </section>

      <button
        onClick={() => navigate("/app")}
        className="w-full bg-[#D2FF00] text-black font-extrabold uppercase tracking-widest py-4 rounded-[16px] flex items-center justify-center gap-2 hover:bg-[#bce600] active:scale-95 transition-all shadow-[0_0_20px_rgba(210,255,0,0.2)]"
      >
        Start Training
        <ArrowRight size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
