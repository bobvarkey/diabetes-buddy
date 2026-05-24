import { useNavigate } from "react-router-dom";
import { Heart, Activity, Calculator, Shield, BookOpen, ChevronLeft, Menu, HelpCircle, Check, ArrowRight, ShieldCheck, Wind, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  { label: "Lipid Risk Calculator", desc: "AHA PREVENT 2024", icon: Heart, iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  { label: "ASCVD Assessment", desc: "10-year risk scoring", icon: Activity, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "COPD/Asthma", desc: "GOLD 2025 & GINA", icon: Wind, iconBg: "bg-cyan-100", iconColor: "text-cyan-600" },
  { label: "Kidney Disease", desc: "KDIGO 2024", icon: Droplets, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  { label: "Prevention", desc: "Latest guidelines", icon: Shield, iconBg: "bg-green-100", iconColor: "text-green-600" },
  { label: "Clinical Education", desc: "Evidence-based", icon: BookOpen, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
];

export default function ModeSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white text-xs text-slate-500">
        <span>11:31</span>
        <div className="flex items-center gap-2">
          <span>5G</span>
          <span>55%</span>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ChevronLeft className="h-5 w-5 text-slate-400" />
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-lg">
          Edit
        </Button>
        <Menu className="h-5 w-5 text-slate-400" />
      </header>

      <main className="max-w-md mx-auto pb-24">
        {/* Badge */}
        <div className="px-4 pt-6">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-600 text-xs font-semibold rounded-full">
            <Heart className="h-3 w-3" />
            CARDIOVASCULAR RISK
          </span>
        </div>

        {/* Title & Description */}
        <div className="px-4 py-4 text-center">
          <h1 className="text-3xl font-bold">
            Lipid <span className="italic text-pink-600 font-light">Risk</span> Predictor
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Precision cardiovascular risk assessment using AHA PREVENT 2024 equations
          </p>
        </div>

        {/* CTAs - side by side */}
        <div className="flex gap-3 px-4">
          <Button 
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-full py-2.5"
            onClick={() => navigate("/complex")}
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            className="flex-1 border-slate-200 text-slate-600 rounded-full py-2.5"
            onClick={() => navigate("/complex")}
          >
            Clinic ASCVD
          </Button>
        </div>

        {/* Hero Image Area - mimicking the doctor with monitors */}
        <div className="mx-4 mt-6 relative">
          <div className="w-full h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
            <div className="text-white text-center">
              <Activity className="h-16 w-16 mx-auto mb-2 opacity-80" />
              <p className="text-lg font-medium">Clinical Assessment</p>
            </div>
          </div>
          
          {/* Overlay Badge */}
          <div className="absolute bottom-3 left-3 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <Heart className="h-4 w-4 text-pink-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">10-Year ASCVD Risk</p>
              <p className="text-xs font-medium">PREVENT 2024</p>
            </div>
          </div>
        </div>

        {/* Diagnostic Arsenal Section */}
        <div className="px-4 mt-8">
          <h2 className="text-lg font-semibold mb-1">Diagnostic Arsenal</h2>
          <p className="text-sm text-slate-500 mb-4">Choose a clinical area to begin</p>

          {/* Features Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <Card 
                key={f.label}
                className="cursor-pointer hover:shadow-md transition-all border-slate-100"
                onClick={() => navigate("/complex")}
              >
                <CardContent className="p-4">
                  <div className={`w-10 h-10 ${f.iconBg} rounded-lg flex items-center justify-center mb-3`}>
                    <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-sm mb-0.5">{f.label}</h3>
                  <p className="text-xs text-slate-400">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Page Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-6 h-1 bg-slate-800 rounded-full" />
          <div className="w-2 h-1 bg-slate-300 rounded-full" />
          <div className="w-2 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Footer URL */}
        <p className="text-center text-xs text-slate-400 mt-4 font-mono truncate mx-4">
          lipid-risk.app
        </p>
      </main>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
        <HelpCircle className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}