import { useNavigate } from "react-router-dom";
import { Heart, Activity, Calculator, Scale, Syringe, Wind, ArrowRight, Menu, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Color palette matching reference
const COLORS = {
  primary: "#DC2626",    // Red for CTA
  secondary: "#2563EB",  // Blue for Edit
  accent: "#EC4899",    // Pink/magenta
};

// Feature cards for display
const features = [
  { label: "Lipid Risk Calculator", icon: Heart, color: "bg-red-100", iconColor: "text-red-600" },
  { label: "ASCVD Assessment", icon: Calculator, color: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "Hypertension Guide", icon: Activity, color: "bg-orange-100", iconColor: "text-orange-600" },
  { label: "GLP-1 Eligibility", icon: Syringe, color: "bg-purple-100", iconColor: "text-purple-600" },
];

const modes = [
  {
    id: "easy",
    title: "Easy",
    tagline: "Quick & Simple",
    description: "Fast calculators for routine decisions",
    gradient: "from-red-500 to-red-600",
  },
  {
    id: "complex", 
    title: "Complex",
    tagline: "Full Details",
    description: "Complete NCD management with all guidelines",
    gradient: "from-blue-500 to-blue-600",
  }
];

export default function ModeSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <ChevronLeft className="h-5 w-5 text-slate-400" />
            <span className="text-sm text-slate-500">Back</span>
          </div>
          <Button 
            variant="outline" 
            className="h-8 text-sm border-slate-200 text-slate-600"
            onClick={() => navigate("/complex")}
          >
            Edit
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pb-8">
        {/* Hero Section */}
        <div className="text-center py-8">
          {/* Badge */}
          <span className="inline-block px-3 py-1 bg-pink-50 text-pink-600 text-xs font-medium rounded-full mb-4">
            CARDIOVASCULAR RISK
          </span>
          
          {/* Title */}
          <h1 className="text-3xl font-bold mb-2">
            Lipid<span className="italic text-red-600 font-light">Risk</span> Predictor
          </h1>
          
          <p className="text-slate-500 text-sm mb-6">
            Precision cardiovascular risk assessment using AHA PREVENT 2024
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-3 justify-center mb-8">
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-medium"
              onClick={() => navigate("/complex")}
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              className="border-slate-200 text-slate-600 px-4 py-2.5 rounded-full"
              onClick={() => navigate("/easy")}
            >
              Easy Mode
            </Button>
          </div>

          {/* Floating Risk Card - positioned like in reference */}
          <div className="relative">
            <div className="absolute -bottom-4 left-4 bg-white rounded-xl shadow-lg border border-slate-100 p-4 flex items-center gap-3 z-10">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">10-Year ASCVD Risk</p>
                <p className="text-sm font-semibold">PREVENT 2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Diagnostic Arsenal</h2>
          <p className="text-sm text-slate-500 mb-4">Choose a clinical area to begin</p>

          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => (
              <Card 
                key={feature.label}
                className="cursor-pointer hover:shadow-md transition-shadow border-slate-100"
                onClick={() => navigate("/complex")}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center`}>
                    <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                  </div>
                  <span className="text-sm font-medium flex-1">{feature.label}</span>
                  <ArrowRight className="h-4 w-4 text-slate-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Page Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-2 h-2 bg-slate-900 rounded-full" />
          <div className="w-2 h-2 bg-slate-200 rounded-full" />
          <div className="w-2 h-2 bg-slate-200 rounded-full" />
        </div>

        {/* Footer URL */}
        <p className="text-center text-xs text-slate-400 mt-6 font-mono">
          lipid-risk.app
        </p>
      </main>
    </div>
  );
}