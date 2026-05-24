import { useNavigate } from "react-router-dom";
import { Heart, Activity, Calculator, Shield, BookOpen, ChevronLeft, Menu, HelpCircle, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  { label: "Lipid Risk Calculator", desc: "AHA PREVENT 2024 equations", icon: Heart, color: "bg-pink-500", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  { label: "ASCVD Assessment", desc: "10-year risk scoring", icon: Activity, color: "bg-blue-500", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "Prevention Guidelines", desc: "Latest recommendations", icon: Shield, color: "bg-green-500", iconBg: "bg-green-100", iconColor: "text-green-600" },
  { label: "Education", desc: "Clinical learning", icon: BookOpen, color: "bg-orange-500", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
];

const labs = [
  "LDL-C", "Non-HDL-C", "ApoB", "Lp(a)", "Total Cholesterol", "Triglycerides"
];

export default function ModeSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* iOS Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white text-xs text-slate-500">
        <span>11:31</span>
        <div className="flex items-center gap-2">
          <span>5G</span>
          <span>55%</span>
          <div className="w-5 h-3 border border-slate-400 rounded-sm">
            <div className="h-1.5 bg-green-500 rounded-sm" style={{ width: '60%' }} />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ChevronLeft className="h-5 w-5 text-slate-400" />
          <span className="text-sm text-slate-400">Back</span>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-full">
          Edit
        </Button>
        <Menu className="h-5 w-5 text-slate-400" />
      </header>

      <main className="max-w-md mx-auto px-4 pb-24">
        {/* Badge */}
        <div className="py-4">
          <span className="inline-block px-3 py-1 bg-pink-50 text-pink-600 text-xs font-semibold rounded-full">
            CARDIOVASCULAR RISK
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-1">
          NCD <span className="italic text-red-600 font-light">Risk</span> Predictor
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Precision cardiovascular risk management
        </p>

        {/* Feature Grid 2x2 */}
        <div className="grid grid-cols-2 gap-3 mb-8">
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
                <h3 className="font-semibold text-sm mb-1">{f.label}</h3>
                <p className="text-xs text-slate-400">{f.desc}</p>
                <ArrowRight className="h-4 w-4 text-slate-300 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Decision Support Section */}
        <Card className="mb-4 border-slate-100">
          <CardContent className="p-4">
            <h2 className="font-bold mb-2">Data-Driven <span className="text-blue-600">Decision Support</span></h2>
            <p className="text-sm text-slate-500 mb-4">
              Powered by PREVENT equations, ACC/AHA 2026 & LAI 2023 guidelines
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Real-time risk calculation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>Personalized treatment targets</span>
              </div>
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2.5"
              onClick={() => navigate("/complex")}
            >
              Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white">
            <p className="text-3xl font-bold">98.4%</p>
            <p className="text-xs text-pink-100">Guideline Accuracy</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <ShieldCheck className="h-6 w-6 mb-1" />
            <p className="text-sm">HIPAA Compliant</p>
          </div>
        </div>

        {/* Lab Values Card */}
        <Card className="mb-4 border-slate-100 bg-purple-50 border-purple-100">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Comprehensive Diagnostics</h3>
            <div className="flex flex-wrap gap-2">
              {labs.map((lab) => (
                <span key={lab} className="px-2 py-1 bg-white rounded-lg text-xs font-medium">
                  {lab}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-6 h-1 bg-slate-800 rounded-full" />
          <div className="w-2 h-1 bg-slate-300 rounded-full" />
          <div className="w-2 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* URL Footer */}
        <p className="text-center text-xs text-slate-400 mt-4 font-mono">
          ncd-risk.app
        </p>
      </main>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
        <HelpCircle className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}