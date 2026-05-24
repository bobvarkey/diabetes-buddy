import { useNavigate } from "react-router-dom";
import { Heart, Activity, Shield, BookOpen, ChevronLeft, Menu, HelpCircle, ArrowRight, Wind, Droplets, Scale, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  { label: "Diabetes", desc: "ADA 2026", icon: Heart, iconBg: "bg-red-100", iconColor: "text-red-600" },
  { label: "Hypertension", desc: "ESC/ESH 2024", icon: Activity, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "Lipids", desc: "ILA 2023", icon: Shield, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { label: "Obesity", desc: "Weight mgmt", icon: Scale, iconBg: "bg-green-100", iconColor: "text-green-600" },
  { label: "COPD/Asthma", desc: "GINA/GOLD", icon: Wind, iconBg: "bg-cyan-100", iconColor: "text-cyan-600" },
  { label: "Kidney", desc: "KDIGO 2024", icon: Droplets, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
];

export default function ModeSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-xs text-slate-400 font-medium">
        <span>12:38</span>
        <div className="flex items-center gap-2">
          <span>5G</span>
          <span>41%</span>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <ChevronLeft className="h-5 w-5 text-slate-300" />
        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-md">
            Edit
          </Button>
          <Menu className="h-5 w-5 text-slate-300" />
        </div>
      </header>

      <main className="max-w-md mx-auto pb-24 px-4">
        {/* Top Cards - Prevention & Education */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Card className="bg-slate-800 border-slate-700 cursor-pointer" onClick={() => navigate("/complex")}>
            <CardContent className="p-4">
              <p className="text-sm text-slate-300">Prevention</p>
              <p className="text-lg font-bold text-white">Guidelines</p>
              <p className="text-xs text-slate-500 mt-1">Latest recommendations</p>
              <ArrowRight className="h-4 w-4 text-slate-400 mt-2" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700 cursor-pointer" onClick={() => navigate("/complex")}>
            <CardContent className="p-4">
              <p className="text-lg font-bold text-white">Education</p>
              <p className="text-xs text-slate-500 mt-1">Clinical learning</p>
              <ArrowRight className="h-4 w-4 text-slate-400 mt-3" />
            </CardContent>
          </Card>
        </div>

        {/* Hero: Decision Support */}
        <Card className="mt-6 relative overflow-hidden" style={{ backgroundImage: "url(/assets/doctor-new.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="absolute inset-0 bg-slate-900/80" />
          <CardContent className="p-5">
            <h1 className="text-2xl font-bold">
              <span className="text-white">Data-Driven </span>
              <span className="text-blue-300">Decision Support</span>
            </h1>
            <p className="text-sm text-slate-400 mt-2 mb-4">
              Powered by PREVENT equations, ACC/AHA 2026 & LAI 2023 guidelines
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-300">Real-time risk calculation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-300">Personalized treatment targets</span>
              </div>
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3"
              onClick={() => navigate("/complex")}
            >
              Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4">
            <p className="text-3xl font-bold">98.4%</p>
            <p className="text-xs text-pink-100">Guideline Accuracy</p>
          </div>
          <div className="bg-blue-600 rounded-xl p-4">
            <Shield className="h-6 w-6 mb-1" />
            <p className="text-sm">HIPAA Compliant</p>
          </div>
        </div>

        {/* 6 NCD Modules */}
        <Card className="bg-purple-50 border-purple-100 mt-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold text-slate-800 mb-3">All 6 NCD Conditions</h2>
            <div className="grid grid-cols-3 gap-2">
              {features.map((f) => (
                <div 
                  key={f.label} 
                  className="bg-white rounded-lg p-2 text-center cursor-pointer"
                  onClick={() => navigate("/complex")}
                >
                  <div className={`w-8 h-8 ${f.iconBg} rounded-lg flex items-center justify-center mx-auto mb-1`}>
                    <f.icon className={`h-4 w-4 ${f.iconColor}`} />
                  </div>
                  <p className="text-xs font-medium text-slate-700">{f.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Biomarkers */}
        <Card className="bg-slate-800 border-slate-700 mt-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Comprehensive Biomarkers</h3>
            <div className="flex flex-wrap gap-2">
              {["LDL-C", "Non-HDL-C", "ApoB", "Lp(a)", "Total Cholesterol", "Triglycerides"].map(b => (
                <span key={b} className="px-2 py-1 bg-slate-700 rounded-full text-xs">{b}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Page Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-6 h-1.5 bg-white rounded-full" />
          <div className="w-2 h-1.5 bg-slate-600 rounded-full" />
          <div className="w-2 h-1.5 bg-slate-600 rounded-full" />
        </div>

        {/* URL */}
        <p className="text-center text-xs text-slate-500 mt-4 font-mono">
          ncd-risk.app
        </p>
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
        <HelpCircle className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}
