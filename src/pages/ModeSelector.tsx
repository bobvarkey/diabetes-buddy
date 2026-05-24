import { useNavigate } from "react-router-dom";
import { Heart, Activity, Shield, BookOpen, ChevronLeft, Menu, HelpCircle, ArrowRight, Wind, Droplets, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  { label: "Cholesterol Panel", desc: "Full lipid profile", icon: Heart, iconBg: "bg-red-100", iconColor: "text-red-600" },
  { label: "ASCVD Risk Score", desc: "10-year cardiovascular", icon: Activity, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "LDL-C Target", desc: "ILA 2024 goals", icon: Bell, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { label: "Blood Pressure", desc: "HTN management", icon: Shield, iconBg: "bg-green-100", iconColor: "text-green-600" },
  { label: "Weight & BMI", desc: "Obesity tracking", icon: Droplets, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  { label: "Patient Education", desc: "Learning modules", icon: BookOpen, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
];

export default function ModeSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white text-xs text-slate-600 font-medium">
        <span>11:31</span>
        <div className="flex items-center gap-2">
          <span>5G</span>
          <span>55%</span>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <ChevronLeft className="h-5 w-5 text-slate-700" />
        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-md">
            Edit
          </Button>
          <Menu className="h-5 w-5 text-slate-700" />
        </div>
      </header>

      <main className="max-w-md mx-auto pb-24">
        {/* Badge */}
        <div className="px-4 pt-6">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            <Heart className="h-3 w-3 fill-current" />
            <span>CARDIOVASCULAR RISK</span>
          </span>
        </div>

        {/* Title & Description */}
        <div className="px-4 py-5 text-center">
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900">
            Lipid <span className="italic text-red-600 font-light">Risk</span> Predictor
          </h1>
          <p className="text-base text-slate-600 mt-2 max-w-xs mx-auto">
            Precision cardiovascular risk assessment using AHA PREVENT 2024 equations
          </p>
        </div>

        {/* CTAs */}
        <div className="flex gap-3 px-4">
          <Button 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full py-3"
            onClick={() => navigate("/complex")}
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            className="flex-1 border-2 border-slate-200 text-slate-600 font-medium rounded-full py-3 hover:bg-slate-50"
            onClick={() => navigate("/complex")}
          >
            Clinic ASCVD
          </Button>
        </div>

        {/* Hero Image */}
        <div className="mx-4 mt-6 relative">
          <div className="w-full h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500 via-pink-400 to-pink-600 flex items-center justify-center">
            <div className="text-white text-center">
              <Activity className="h-14 w-14 mx-auto mb-2 opacity-90" />
              <p className="text-base font-semibold">Clinical Decision Support</p>
            </div>
          </div>
          
          {/* Overlay Card */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="h-4 w-4 text-red-600 fill-current" />
            </div>
            <div>
              <p className="text-xs text-slate-500">10-Year ASCVD Risk</p>
              <p className="text-xs font-bold text-slate-800">PREVENT 2024</p>
            </div>
          </div>
        </div>

        {/* Diagnostic Arsenal */}
        <div className="px-4 mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Diagnostic Arsenal</h2>
          <p className="text-base text-slate-600 mb-4">Choose a clinical area to begin</p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <Card 
                key={f.label}
                className="cursor-pointer hover:shadow-md transition-all border-slate-200"
                onClick={() => navigate("/complex")}
              >
                <CardContent className="p-4">
                  <div className={`w-10 h-10 ${f.iconBg} rounded-lg flex items-center justify-center mb-3`}>
                    <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-0.5">{f.label}</h3>
                  <p className="text-xs text-slate-500">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Page Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-6 h-1.5 bg-slate-900 rounded-full" />
          <div className="w-2 h-1.5 bg-slate-300 rounded-full" />
          <div className="w-2 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* URL */}
        <p className="text-center text-xs text-slate-400 mt-4 font-mono">
          lipid-risk.app
        </p>
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
        <HelpCircle className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}