import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Activity,
  ClipboardList,
  Pill,
  BookOpen,
  ChevronRight,
  Stethoscope,
  Search,
  AlertTriangle
} from "lucide-react";
import HypertensionOverview from "./HypertensionOverview";
import HypertensionAssessment from "./HypertensionAssessment";
import HypertensionTreatment from "./HypertensionTreatment";
import HypertensionClinicalCards from "./HypertensionClinicalCards";

// Category colors for hypertension (orange theme)
const categoryColors = {
  accent: "#fb923c",
  bg: "rgba(251,146,60,0.12)",
  border: "rgba(251,146,60,0.2)",
  gradient: "from-orange-500 to-amber-600",
};

export default function HypertensionTab() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* Grain Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: categoryColors.bg, border: `1px solid ${categoryColors.border}` }}
          >
            <Heart className="h-6 w-6" style={{ color: categoryColors.accent }} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-semibold tracking-tight">
              Hypertension
            </h1>
            <p className="text-sm text-muted-foreground">
              Comprehensive ESC 2024 guideline-based management
            </p>
          </div>
          <Badge
            variant="outline"
            className="ml-auto"
            style={{ color: categoryColors.accent, borderColor: categoryColors.border }}
          >
            ESC 2024
          </Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Evidence-based hypertension management with classification tools, risk stratification,
          assessment calculators, and treatment algorithms. Integrates GFR calculation,
          drug interaction checking, and secondary hypertension screening.
        </p>
      </section>

      {/* Main Content Tabs */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <span>Assess</span>
            </TabsTrigger>
            <TabsTrigger value="treatment" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              <span>Treat</span>
            </TabsTrigger>
            <TabsTrigger value="workup" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Workup</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <HypertensionOverview onNavigateToEmergencies={() => setActiveTab("treatment")} onNavigateToAssessment={() => setActiveTab("assessment")} />
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <HypertensionAssessment />
          </TabsContent>

          <TabsContent value="treatment" className="space-y-6">
            <HypertensionTreatment />
          </TabsContent>
          <TabsContent value="workup" className="space-y-6">
            <HypertensionClinicalCards />
          </TabsContent>
        </Tabs>
      </section>

      {/* Quick Navigation */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <Separator className="mb-8" />
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Quick Navigation
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "GFR Calculator", icon: Activity, tab: "assessment" },
            { label: "Drug Interactions", icon: Pill, tab: "assessment" },
            { label: "Treatment Algorithm", icon: ClipboardList, tab: "treatment" },
            { label: "Potency Table", icon: BookOpen, tab: "treatment" },
            { label: "Hypertensive Emergencies", icon: AlertTriangle, tab: "treatment" },
          ].map((item) => (
            <Button
              key={item.label}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-orange-500/30"
              onClick={() => setActiveTab(item.tab)}
            >
              <item.icon className="h-5 w-5" style={{ color: categoryColors.accent }} />
              <span className="text-xs font-medium">{item.label}</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </Button>
          ))}
        </div>

        {/* Investigation Flowchart */}
        <Separator className="my-8" />
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Investigation Flowchart
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Systematic approach to secondary hypertension workup
        </p>
        <div className="space-y-2.5">
          {[
            { step: 1, title: "Initial Assessment", desc: "History & Physical Examination, BP confirmation (×3 readings), Basic metabolic panel, Urinalysis", color: "border-l-blue-500", bg: "bg-blue-500/5" },
            { step: 2, title: "Baseline Investigations", desc: "Serum creatinine, BUN, eGFR, Serum electrolytes (Na+, K+), Fasting glucose, HbA1c, Lipid profile, ECG, Urinalysis with microalbuminuria", color: "border-l-emerald-500", bg: "bg-emerald-500/5" },
            { step: 3, title: "Screen for Secondary Causes", desc: "Aldosterone/Renin Ratio, TSH/fT4, Plasma/Urine Metanephrines, Overnight Dexamethasone Suppression, Sleep study (if symptomatic), Renal Doppler Ultrasound", color: "border-l-teal-500", bg: "bg-teal-500/5" },
            { step: 4, title: "Confirmatory Testing", desc: "Saline Suppression Test (aldosteronism), CT/MRI Adrenals, CTA/MRA Renal Arteries, 24h Urine Cortisol, Adrenal Vein Sampling", color: "border-l-amber-500", bg: "bg-amber-500/5" },
            { step: 5, title: "Targeted Treatment", desc: "Treat underlying cause, Optimize antihypertensive therapy, Monitor response, Follow-up investigations", color: "border-l-green-500", bg: "bg-green-500/5" },
          ].map((s) => (
            <div key={s.step} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${s.color} ${s.bg} border border-border/30`}>
              <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {s.step}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
