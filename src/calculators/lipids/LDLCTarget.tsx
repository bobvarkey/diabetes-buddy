import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionCard } from "@/components/ui/section-card";
import { 
  Target, ShieldCheck, AlertTriangle, ArrowRight, 
  Activity, Droplets, Heart, Scale, Calculator, Info 
} from "lucide-react";

// ILA (Indian Lipid Association) Risk Categories
const RISK_CATEGORIES = [
  { 
    category: "Very High Risk", 
    criteria: [
      "Established ASCVD (CAD, PAD, CVA)", 
      "Diabetes mellitus + ≥1 risk factor",
      "CKD (eGFR < 30)",
      "Familial hypercholesterolemia"
    ],
    ldlTarget: "< 50 mg/dL",
    ldlTargetMMOL: "< 1.4 mmol/L",
    color: "red"
  },
  { 
    category: "High Risk", 
    criteria: [
      "Diabetes mellitus 5+ years",
      "eGFR 30-59",
      "Age ≥ 55 with ≥1 risk factor"
    ],
    ldlTarget: "< 70 mg/dL",
    ldlTargetMMOL: "< 1.8 mmol/L",
    color: "orange"
  },
  { 
    category: "Moderate Risk", 
    criteria: [
      "Diabetes mellitus < 5 years, no complications",
      "Age ≥ 40 without major risks",
      "Multiple risk factors"
    ],
    ldlTarget: "< 100 mg/dL",
    ldlTargetMMOL: "< 2.6 mmol/L",
    color: "yellow"
  },
  { 
    category: "Low Risk", 
    criteria: [
      "No diabetes",
      "0-1 risk factors",
      "Age < 40"
    ],
    ldlTarget: "< 130 mg/dL",
    ldlTargetMMOL: "< 3.4 mmol/L",
    color: "green"
  },
];

// Risk factors for categorization
const RISK_FACTORS = [
  " hypertension", " Smoking", " Family history", " Low HDL-C", 
  " CKD (eGFR < 60)", " Albuminuria", " LVH on ECG/ECHO"
];

// Treatment recommendations by category
const TREATMENT_RECS = {
  "Very High Risk": {
    therapy: "High-intensity statin + Ezetimibe ± PCSK9i",
    statin: "Atorvastatin 40-80mg OR Rosuvastatin 20-40mg",
    addon: "Add Ezetimibe 10mg if target not met",
    followUp: "Recheck lipids at 6 weeks"
  },
  "High Risk": {
    therapy: "High-intensity statin ± Ezetimibe",
    statin: "Atorvastatin 20-40mg OR Rosuvastatin 10-20mg",
    addon: "Add Ezetimibe if needed",
    followUp: "Recheck lipids at 8-12 weeks"
  },
  "Moderate Risk": {
    therapy: "Moderate-intensity statin",
    statin: "Atorvastatin 10-20mg OR Rosuvastatin 5-10mg",
    addon: "Lifestyle modification emphasized",
    followUp: "Recheck lipids at 12 weeks"
  },
  "Low Risk": {
    therapy: "Lifestyle modification first",
    statin: "Statin if diet/exercise fails",
    addon: "Reassess in 1 year",
    followUp: "Annual check"
  },
};

export default function LDLCTargetCalculator() {
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasASCVD, setHasASCVD] = useState(false);
  const [hasCKD, setHasCKD] = useState(false);
  const [isSmoker, setIsSmoker] = useState(false);
  const [hasHTN, setHasHTN] = useState(false);
  const [hasFamilyHistory, setHasFamilyHistory] = useState(false);
  const [age, setAge] = useState("");
  const [activeTab, setActiveTab] = useState("calculator");

  // Count risk factors
  const riskFactorsCount = [isSmoker, hasHTN, hasFamilyHistory, hasCKD].filter(Boolean).length;
  const hasHighRisk = hasASCVD || hasCKD || (hasDiabetes && riskFactorsCount >= 1);

  // Determine category
  const getRiskCategory = () => {
    if (hasASCVD || hasCKD || (hasDiabetes && riskFactorsCount >= 1)) {
      return "Very High Risk";
    } else if (hasDiabetes || Number(age) >= 55 || riskFactorsCount >= 1) {
      return "High Risk";
    } else if (Number(age) >= 40 || riskFactorsCount >= 1) {
      return "Moderate Risk";
    } else {
      return "Low Risk";
    }
  };

  const riskCategory = getRiskCategory();
  const categoryData = RISK_CATEGORIES.find(c => c.category === riskCategory);
  const treatmentRec = TREATMENT_RECS[riskCategory];

  // Current LDL entry for achieving target
  const [currentLDL, setCurrentLDL] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Target className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-semibold tracking-tight">
              LDL-C Target Calculator
            </h1>
            <p className="text-muted-foreground text-sm">
              Indian Lipid Association (ILA) Guidelines 2024
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-muted/50">
            <TabsTrigger value="calculator" className="data-[state=active]:bg-blue-500/10">
              <Calculator className="h-4 w-4 mr-2" /> Assess Risk
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="data-[state=active]:bg-blue-500/10">
              <Info className="h-4 w-4 mr-2" /> ILA Targets
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="mt-0 space-y-6">
            <SectionCard title="Patient Risk Factors" icon={<ShieldCheck className="h-4 w-4" />} tone="cyan" collapsible={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasASCVD} 
                    onChange={(e) => setHasASCVD(e.target.checked)}
                    className="w-4 h-4" 
                  />
                  <span className="text-sm">Established ASCVD (CAD/PAD/CVA)</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasDiabetes} 
                    onChange={(e) => setHasDiabetes(e.target.checked)}
                    className="w-4 h-4" 
                  />
                  <span className="text-sm">Diabetes Mellitus</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasCKD} 
                    onChange={(e) => setHasCKD(e.target.checked)}
                    className="w-4 h-4" 
                  />
                  <span className="text-sm">CKD (eGFR &lt; 60)</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isSmoker} 
                    onChange={(e) => setIsSmoker(e.target.checked)}
                    className="w-4 h-4" 
                  />
                  <span className="text-sm">Current Smoker</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasHTN} 
                    onChange={(e) => setHasHTN(e.target.checked)}
                    className="w-4 h-4" 
                  />
                  <span className="text-sm">Hypertension</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasFamilyHistory} 
                    onChange={(e) => setHasFamilyHistory(e.target.checked)}
                    className="w-4 h-4" 
                  />
                  <span className="text-sm">Family History of CAD</span>
                </label>
              </div>
              
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter age"
                  className="w-full mt-1 p-2 rounded-lg border border-input bg-background"
                />
              </div>
            </SectionCard>

            {/* Risk Category Result */}
            <Card className={`border-2 ${
              riskCategory === "Very High Risk" ? "border-red-500 bg-red-50/50" :
              riskCategory === "High Risk" ? "border-orange-500 bg-orange-50/50" :
              riskCategory === "Moderate Risk" ? "border-yellow-500 bg-yellow-50/50" :
              "border-green-500 bg-green-50/50"
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Risk Category: {riskCategory}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-white/50">
                    <p className="text-sm text-muted-foreground">Target LDL-C</p>
                    <p className="text-2xl font-bold">{categoryData?.ldlTarget}</p>
                    <p className="text-xs text-muted-foreground">({categoryData?.ldlTargetMMOL})</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/50">
                    <p className="text-sm text-muted-foreground">Treatment</p>
                    <p className="text-sm font-medium">{treatmentRec?.therapy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Recommendation */}
            <SectionCard title="ILA Treatment Recommendation" icon={<ArrowRight className="h-4 w-4" />} tone="cyan" collapsible={false}>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/30">
                  <h4 className="font-semibold text-blue-700 mb-2">{treatmentRec?.therapy}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Statin:</span> {treatmentRec?.statin}
                    </div>
                    <div>
                      <span className="font-medium">Addon:</span> {treatmentRec?.addon}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Follow up: {treatmentRec?.followUp}
                </p>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Guidelines Tab */}
          <TabsContent value="guidelines" className="mt-0 space-y-6">
            <SectionCard title="ILA LDL-C Target Categories" icon={<Target className="h-4 w-4" />} tone="cyan" collapsible={false}>
              <div className="space-y-4">
                {RISK_CATEGORIES.map((cat) => (
                  <div key={cat.category} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{cat.category}</span>
                      <Badge variant="outline" className="font-mono">{cat.ldlTarget}</Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {cat.criteria.map((c, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3" /> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Additional Notes" icon={<Info className="h-4 w-4" />} tone="neutral" collapsible={false}>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• LDL-C targets are for Indian population - lower thresholds vs Western guidelines</li>
                <li>• Non-HDL-C secondary target: add 0.8 mmol/L to LDL-C goal</li>
                <li>• ApoB primary if available: &lt; 0.8 g/L for very high, &lt; 1.0 g/L for high</li>
                <li>• Consider LP(a) if &gt; 50 mg/dL - independent risk enhancer</li>
              </ul>
            </SectionCard>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 p-4 rounded-lg bg-muted/30 text-xs text-muted-foreground text-center">
          Based on Indian Lipid Association (ILA) Guidelines 2024 • For educational purposes
        </div>
      </div>
    </div>
  );
}