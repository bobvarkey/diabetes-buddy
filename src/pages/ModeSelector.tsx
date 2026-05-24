import { useNavigate } from "react-router-dom";
import { Heart, Activity, Shield, BookOpen, ChevronLeft, Menu, HelpCircle, ArrowRight, Wind, Droplets, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  { label: "Diabetes", desc: "Glycemic control & medications", icon: Heart, iconBg: "bg-red-100", iconColor: "text-red-600" },
  { label: "Hypertension", desc: "BP management & targets", icon: Activity, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "Lipids", desc: "Cholesterol & ASCVD risk", icon: Shield, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { label: "Obesity", desc: "BMI & weight management", icon: Scale, iconBg: "bg-green-100", iconColor: "text-green-600" },
  { label: "COPD/Asthma", desc: "Respiratory guidelines", icon: Wind, iconBg: "bg-cyan-100", iconColor: "text-cyan-600" },
  { label: "Kidney Disease", desc: "CKD, AKI & dosing", icon: Droplets, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
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
            <span>NCD MANAGEMENT</span>
          </span>
        </div>

        {/* Title & Description */}
        <div className="px-4 py-5 text-center">
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
            Comprehensive <span className="italic text-red-600 font-light">NCD</span> Tools
          </h1>
          <p className="text-base text-slate-600 mt-2 max-w-xs mx-auto">
            Non-communicable disease management for all 6 conditions
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
            All Tools
          </Button>
        </div>

        {/* Comprehensive NCD Tools Overview */}
        <div className="mx-4 mt-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">All 6 NCD Conditions</h2>
          <p className="text-sm text-slate-600 mb-4">Choose a condition to begin assessment</p>

          {/* 2x3 Grid - All 6 conditions */}
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

        {/* More Tools Section */}
        <div className="px-4 mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Additional Tools</h2>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Card className="cursor-pointer hover:shadow-md border-slate-200">
              <CardContent className="p-4">
                <BookOpen className="h-5 w-5 text-orange-500 mb-2" />
                <p className="font-medium text-sm">Education</p>
                <p className="text-xs text-slate-500">Patient learning</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md border-slate-200">
              <CardContent className="p-4">
                <Activity className="h-5 w-5 text-indigo-500 mb-2" />
                <p className="font-medium text-sm">Risk Calculators</p>
                <p className="text-xs text-slate-500">ASCVD, LDL targets</p>
              </CardContent>
            </Card>
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
          ncd-management.app
        </p>
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
        <HelpCircle className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}
