import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calculator, Pill, Wind, ArrowLeft, ArrowRight, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { AbbreviationHover, AbbrText } from "@/components/AbbreviationHover";
import LipidsOverview from "./LipidsOverview";
import LipidsAssessment from "./LipidsAssessment";
import LipidsTreatment from "./LipidsTreatment";
import RenalDoseAdjustment from "../RenalDoseAdjustment";
// import Respiratory from "../Respiratory";

export type LAIResult = {
  cat: "EHR" | "VHR" | "HR" | "MOD" | "LOW";
  sub: "A" | "B" | "C" | "";
  label: string;
  ldlTarget: string;
  nonHdlTarget: string;
  apoBTarget: string;
  intensity: string;
  drug: string;
  ldlCurrent: number;
  atTarget: boolean;
  riskFactors: string[];
};

export default function LipidsTab() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [laiResult, setLaiResult] = useState<LAIResult | null>(null);
  const [egfr, setEgfr] = useState<string>("");

  const NavHome = () => (
    <div className="flex items-center justify-between mb-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
      </Button>
      <Link to="/" className="text-[10px] text-muted-foreground/60 hover:text-foreground border border-border/40 rounded px-2 py-1 transition-colors">
        ← Mode Selector
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <NavHome />

        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <svg className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="8" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground">
              Lipid Management
            </h1>
            <p className="text-muted-foreground">
              Comprehensive lipid assessment and treatment with ACC/AHA and LAI 2023 guidelines
            </p>
            {laiResult && (
              <Badge variant="outline" className={`mt-1 ${laiResult.cat === "EHR" ? "bg-red-500/10 text-red-600 border-red-500/30" : laiResult.cat === "VHR" ? "bg-orange-500/10 text-orange-600 border-orange-500/30" : laiResult.cat === "HR" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-green-500/10 text-green-600 border-green-500/30"}`}>
                {laiResult.cat}{laiResult.sub && `-${laiResult.sub}`} — Target LDL {laiResult.ldlTarget}
              </Badge>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/50">
            <TabsTrigger value="overview" className="flex items-center gap-1.5 py-2 text-xs data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600">
              <BookOpen className="h-4 w-4" /><span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-1.5 py-2 text-xs data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600">
              <Calculator className="h-4 w-4" /><span>Risk Calc</span>
            </TabsTrigger>
            <TabsTrigger value="treatment" disabled={!laiResult} className="flex items-center gap-1.5 py-2 text-xs data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600">
              <Pill className="h-4 w-4" /><span>Rx</span>
            </TabsTrigger>
            <TabsTrigger value="copd" className="flex items-center gap-1.5 py-2 text-xs data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-600">
              <Wind className="h-4 w-4" /><span>COPD/Asthma</span>
            </TabsTrigger>
            <TabsTrigger value="renal" className="flex items-center gap-1.5 py-2 text-xs data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600">
              <AlertTriangle className="h-4 w-4" /><span>Renal</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="mt-0">
            <LipidsOverview />
          </TabsContent>

          {/* Tab 2: Risk Assessment */}
          <TabsContent value="assessment" className="mt-0">
            <LipidsAssessment onClassificationChange={setLaiResult} onNavigateToTreatment={() => setActiveTab("treatment")} />
          </TabsContent>

          {/* Tab 3: Treatment */}
          <TabsContent value="treatment" className="mt-0">
            {laiResult ? (
              <LipidsTreatment laiResult={laiResult} onBackToAssessment={() => setActiveTab("assessment")} />
            ) : (
              <div className="p-12 text-center border rounded-xl border-dashed border-muted-foreground/30">
                <Calculator className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Complete the Risk Assessment tab first to generate treatment recommendations.</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("assessment")}>
                  Go to Risk Assessment <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Tab 4: COPD/Asthma */}
          <TabsContent value="copd" className="mt-0">
            <div className='p-8'>Coming soon: Respiratory</div>
          </TabsContent>

          {/* Tab 5: Renal Dose Adjustment */}
          <TabsContent value="renal" className="mt-0">
            <RenalDoseAdjustment />
          </TabsContent>
        </Tabs>

        {/* Bottom nav */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
          </Button>
          <Link to="/" className="text-[10px] text-muted-foreground/60 hover:text-foreground border border-border/40 rounded px-2 py-1 transition-colors">
            ← Mode Selector
          </Link>
        </div>
      </div>
    </div>
  );
}