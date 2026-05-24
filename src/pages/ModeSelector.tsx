import { useNavigate } from "react-router-dom";
import { Check, Activity, Heart, Scale, Syringe, Wind, Gamepad2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const clinicalAreas = [
  { path: "/diabetes", label: "💉 Diabetes", icon: Syringe, color: "text-red-500", bg: "bg-red-50" },
  { path: "/hypertension", label: "❤️ Hypertension", icon: Heart, color: "text-orange-500", bg: "bg-orange-50" },
  { path: "/lipids", label: "💧 Lipids", icon: Scale, color: "text-blue-500", bg: "bg-blue-50" },
  { path: "/respiratory", label: "🫁 Respiratory", icon: Wind, color: "text-cyan-500", bg: "bg-cyan-50" },
  { path: "/renal", label: "🫘 Renal", icon: Gamepad2, color: "text-amber-500", bg: "bg-amber-50" },
];

const modes = [
  {
    id: "easy",
    title: "🔰 Easy Mode",
    tagline: "Quick & Simple",
    description: "Fast calculators for routine decisions. Ideal for quick checks and simple referrals.",
    features: ["BMI Calculator", "Blood Pressure staging", "Basic lipid panel", "GLP-1 eligibility"],
    color: "green",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "complex",
    title: "🧠 Complex Mode",
    tagline: "Full Details",
    description: "Complete NCD management with all guidelines, treatment algorithms, and clinical details.",
    features: ["Full clinical guidelines", "Treatment algorithms", "Drug interactions", "Prevention scoring"],
    color: "purple",
    gradient: "from-purple-500 to-violet-600",
  },
];

export default function ModeSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">NCD Toolkit</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Mode
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Select a mode to access clinical calculators and guidelines
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {modes.map((mode) => (
            <Card 
              key={mode.id}
              className={`bg-gradient-to-br ${mode.gradient} border-0 cursor-pointer hover:scale-[1.02] transition-all group overflow-hidden`}
              onClick={() => navigate(mode.id === "easy" ? "/easy" : "/complex")}
            >
              <CardContent className="p-8">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 mb-3">
                    {mode.tagline}
                  </span>
                  <h2 className="text-3xl font-bold mb-2">{mode.title.replace(/^. /, "")}</h2>
                  <p className="text-white/80 text-sm mb-4">{mode.description}</p>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {mode.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                      <Check className="h-4 w-4 text-white/50" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  variant="outline" 
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 group-hover:translate-x-2 transition-all"
                >
                  Enter {mode.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links to Clinical Areas */}
        <div>
          <h3 className="text-center text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6">
            Or Jump to a Clinical Area
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {clinicalAreas.map((area) => (
              <button
                key={area.path}
                onClick={() => navigate(`/complex${area.path}`)}
                className={`${area.bg} rounded-xl p-4 text-left hover:scale-105 transition-all group`}
              >
                <area.icon className={`h-6 w-6 ${area.color} mb-2`} />
                <span className={`block font-medium text-sm text-slate-700`}>
                  {area.label.replace(/^. /, "")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-slate-500 text-sm">
          Based on ADA, ESC/ESH, KDIGO 2024 • For educational purposes
        </div>
      </footer>
    </div>
  );
}