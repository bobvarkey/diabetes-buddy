import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Heart, Activity, Droplet, AlertTriangle, ChevronDown, ChevronRight, Stethoscope } from "lucide-react";

// Antihypertensive Classes
const medicationClasses = [
  {
    class: "ACE Inhibitors",
    suffix: "-pril",
    examples: ["Ramipril", "Enalapril", "Lisinopril", "Perindopril", "Captopril"],
    mechanism: "Block conversion of angiotensin I to II → ↓ vasoconstriction, ↓ aldosterone",
    indications: ["Diabetes with proteinuria", "CKD", "Heart failure", "Post-MI", "High CV risk"],
    contraindications: ["Pregnancy", "Bilateral renal artery stenosis", "ACEi-induced angioedema", "Hyperkalemia (K+ >5.5)"],
    sideEffects: ["Dry cough (10-20%)", "Hyperkalemia", "Acute kidney injury", "Angioedema (rare)"],
    monitoring: ["Creatinine & K+ at baseline, 1-2 weeks, then annually", "Check BP response"],
    firstLine: true,
    color: "bg-blue-50 border-blue-300",
  },
  {
    class: "ARBs (Angiotensin Receptor Blockers)",
    suffix: "-sartan",
    examples: ["Losartan", "Telmisartan", "Valsartan", "Olmesartan", "Irbesartan"],
    mechanism: "Block AT1 receptor → vasodilation, ↓ aldosterone without affecting bradykinin",
    indications: ["ACEi cough intolerance", "Diabetes with proteinuria", "CKD", "Heart failure"],
    contraindications: ["Pregnancy", "Bilateral renal artery stenosis", "Hyperkalemia"],
    sideEffects: ["Hyperkalemia", "Hypotension", "Acute kidney injury", "Less cough than ACEi"],
    monitoring: ["Creatinine & K+ at baseline, 1-2 weeks, then annually", "BP response"],
    firstLine: true,
    color: "bg-blue-50 border-blue-300",
  },
  {
    class: "Calcium Channel Blockers (CCBs)",
    suffix: "-pine",
    examples: ["Amlodipine", "Nifedipine", "Diltiazem", "Verapamil"],
    mechanism: "Block L-type calcium channels → arterial vasodilation, ↓ peripheral resistance",
    indications: ["Isolated systolic HTN (elderly)", "Angina", "Black patients", "Metabolic syndrome"],
    contraindications: ["Cardiogenic shock", "Severe aortic stenosis", "Verapamil/Diltiazem: avoid with HFrEF"],
    sideEffects: ["Peripheral edema", "Flushing", "Dizziness", "Gingival hyperplasia", "Constipation (verapamil)"],
    monitoring: ["Peripheral edema", "BP response", "Heart rate (non-DHP CCBs)"],
    firstLine: true,
    color: "bg-green-50 border-green-300",
  },
  {
    class: "Thiazide Diuretics",
    suffix: "-thiazide",
    examples: ["Chlorthalidone", "Hydrochlorothiazide", "Indapamide"],
    mechanism: "Inhibit Na+/Cl- cotransporter in distal tubule → ↑ Na+ & water excretion",
    indications: ["Isolated systolic HTN", "Elderly patients", "Heart failure", "Osteoporosis prevention"],
    contraindications: ["Gout", "Severe CKD (GFR <30)", "Hyponatremia", "Addison's disease"],
    sideEffects: ["Hypokalemia", "Hyponatremia", "Hyperglycemia", "Hyperuricemia", "Dehydration"],
    monitoring: ["Electrolytes (Na+, K+) at 1-2 weeks then 6-12 monthly", "Creatinine", "Glucose", "Uric acid"],
    firstLine: true,
    color: "bg-yellow-50 border-yellow-300",
  },
  {
    class: "Beta-Blockers",
    suffix: "-olol",
    examples: ["Metoprolol", "Carvedilol", "Bisoprolol", "Atenolol", "Labetalol"],
    mechanism: "Block β-adrenergic receptors → ↓ HR, ↓ contractility, ↓ renin release",
    indications: ["Heart failure (carvedilol, bisoprolol, metoprolol)", "Post-MI", "Angina", "Rate control (AF)"],
    contraindications: ["Severe asthma/COPD", "Bradycardia (<50 bpm)", "Heart block", "Decompensated HF"],
    sideEffects: ["Fatigue", "Bradycardia", "Sexual dysfunction", "Mask hypoglycemia", "Depression"],
    monitoring: ["Heart rate", "BP", "Signs of heart failure", "Masked hypoglycemia in diabetics"],
    firstLine: false,
    color: "bg-gray-50 border-gray-300",
  },
  {
    class: "Mineralocorticoid Receptor Antagonists",
    suffix: "-none/-actone",
    examples: ["Spironolactone", "Eplerenone"],
    mechanism: "Block aldosterone receptor → Na+ excretion, K+ retention, antifibrotic",
    indications: ["Resistant HTN", "HFrEF", "Primary aldosteronism"],
    contraindications: ["Hyperkalemia", "Severe CKD", "Addison's disease"],
    sideEffects: ["Hyperkalemia", "Gynecomastia (spironolactone)", "Renal dysfunction"],
    monitoring: ["K+ and creatinine at 1 week, 1 month, then 3-6 monthly", "BP response"],
    firstLine: false,
    color: "bg-purple-50 border-purple-300",
  },
];

// Treatment Algorithm by Comorbidity
const treatmentAlgorithm = [
  {
    condition: "Diabetes with Proteinuria",
    firstLine: ["ACEi (Ramipril)", "OR ARB (Losartan, Telmisartan)"],
    rationale: "RENAAAL & IDNT trials: ARB reduces proteinuria progression and renal outcomes",
    targetBP: "< 130/80 mmHg",
  },
  {
    condition: "CKD with Proteinuria",
    firstLine: ["ACEi or ARB (max tolerated dose)"],
    rationale: "Slows CKD progression by reducing intraglomerular pressure",
    targetBP: "< 130/80 mmHg",
  },
  {
    condition: "Heart Failure (HFrEF)",
    firstLine: ["ACEi/ARB", "Beta-blocker (Carvedilol, Metoprolol, Bisoprolol)", "MRA (Spironolactone)"],
    rationale: "GDMT: RALES trial - Spironolactone ↓ mortality 30%; CIBIS-II, COPERNICUS - Beta-blockers improve survival",
    targetBP: "< 130/80 mmHg",
  },
  {
    condition: "Post-MI",
    firstLine: ["Beta-blocker", "ACEi (Ramipril - HOPE trial benefit)"],
    rationale: "Reduce reinfarction and mortality; HOPE trial: Ramipril ↓ CV events",
    targetBP: "< 130/80 mmHg",
  },
  {
    condition: "Stroke Prevention",
    firstLine: ["ACEi + Thiazide (Perindopril + Indapamide - PROGRESS trial)"],
    rationale: "PROGRESS: 43% reduction in recurrent stroke; BP reduction is key factor",
    targetBP: "< 130/80 mmHg",
  },
  {
    condition: "Isolated Systolic HTN (Elderly)",
    firstLine: ["Thiazide (Chlorthalidone)", "OR CCB (Amlodipine)"],
    rationale: "ALLHAT trial: Thiazide-like diuretics effective in elderly; HYVET showed benefit even in >80y",
    targetBP: "< 140/90 mmHg (or < 150/90 if >80y frail)",
  },
  {
    condition: "Black Patients",
    firstLine: ["CCB or Thiazide"],
    rationale: "Lower renin state; ACEi/ARB less effective as monotherapy",
    targetBP: "< 130/80 mmHg",
  },
  {
    condition: "Pregnancy",
    firstLine: ["Methyldopa (safest)", "Labetalol", "Nifedipine"],
    rationale: "Methyldopa most studied; ACEi/ARB absolutely contraindicated (teratogenic)",
    targetBP: "< 140/90 mmHg (CHIPS trial)",
    avoid: ["ACEi/ARB", "Spironolactone", "Atenolol"],
  },
];

// Drug Interactions
const drugInteractions = [
  {
    interaction: "ACEi/ARB + Spironolactone",
    risk: "HIGH",
    effect: "Hyperkalemia",
    management: "Monitor K+ closely; avoid if K+ >5.0 or eGFR <30",
  },
  {
    interaction: "ACEi + ARB (Dual RAAS blockade)",
    risk: "HIGH",
    effect: "↑ AKI, ↑ Hyperkalemia, no mortality benefit",
    management: "AVOID - contraindicated in most patients",
  },
  {
    interaction: "Beta-blockers + Verapamil/Diltiazem",
    risk: "MODERATE",
    effect: "Severe bradycardia, heart block",
    management: "Avoid combination; if used, monitor ECG",
  },
  {
    interaction: "Thiazides + NSAIDs",
    risk: "MODERATE",
    effect: "↓ Diuretic efficacy, ↑ AKI risk",
    management: "Use lowest dose NSAID; monitor renal function",
  },
  {
    interaction: "ACEi/ARB + NSAIDs",
    risk: "MODERATE",
    effect: "Triple whammy: AKI risk",
    management: "Avoid NSAIDs if possible; monitor creatinine",
  },
];

export default function HypertensionMedicationGuide() {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"classes" | "algorithm" | "interactions">("classes");

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "classes", label: "Drug Classes", icon: Stethoscope },
          { id: "algorithm", label: "By Comorbidity", icon: Heart },
          { id: "interactions", label: "Drug Interactions", icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "classes" && (
        <div className="space-y-4">
          <Card className="clinical-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">Antihypertensive Drug Classes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medicationClasses.map((medClass) => (
                  <div
                    key={medClass.class}
                    className={`border-2 rounded-lg overflow-hidden ${medClass.color} ${
                      expandedClass === medClass.class ? "border-opacity-100" : "border-opacity-50"
                    }`}
                  >
                    <button
                      onClick={() =>
                        setExpandedClass(
                          expandedClass === medClass.class ? null : medClass.class
                        )
                      }
                      className="w-full p-4 text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{medClass.class}</span>
                        {medClass.firstLine && (
                          <Badge className="bg-success/20 text-success border-success/30">
                            First-Line
                          </Badge>
                        )}
                      </div>
                      {expandedClass === medClass.class ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>

                    {expandedClass === medClass.class && (
                      <div className="px-4 pb-4 space-y-3 border-t border-inherit pt-3">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Examples:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {medClass.examples.map((ex, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {ex}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Mechanism:</span>
                          <p className="text-sm mt-0.5">{medClass.mechanism}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs font-medium text-success">✓ Indications:</span>
                            <ul className="text-xs mt-1 space-y-0.5">
                              {medClass.indications.map((ind, i) => (
                                <li key={i}>• {ind}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-destructive">✗ Contraindications:</span>
                            <ul className="text-xs mt-1 space-y-0.5">
                              {medClass.contraindications.map((con, i) => (
                                <li key={i}>• {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-medium text-warning">⚠ Side Effects:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {medClass.sideEffects.map((se, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-warning/10">
                                {se}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-medium text-primary">📋 Monitoring:</span>
                          <ul className="text-xs mt-1 space-y-0.5">
                            {medClass.monitoring.map((mon, i) => (
                              <li key={i}>• {mon}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "algorithm" && (
        <Card className="clinical-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Heart className="h-4 w-4 text-success" />
              </div>
              <CardTitle className="text-base">Treatment Selection by Comorbidity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {treatmentAlgorithm.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{item.condition}</h3>
                    <Badge variant="outline">Target: {item.targetBP}</Badge>
                  </div>

                  <div className="mb-3">
                    <span className="text-xs text-success font-medium">First-Line:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.firstLine.map((drug, i) => (
                        <Badge key={i} className="bg-success/10 text-success border-success/30">
                          {drug}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {item.avoid && (
                    <div className="mb-2">
                      <span className="text-xs text-destructive font-medium">Avoid:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.avoid.map((drug, i) => (
                          <Badge key={i} variant="destructive" className="text-xs">
                            {drug}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Evidence: </span>{item.rationale}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "interactions" && (
        <Card className="clinical-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <CardTitle className="text-base">Important Drug Interactions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {drugInteractions.map((interaction, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    interaction.risk === "HIGH"
                      ? "border-destructive bg-destructive/5"
                      : "border-warning bg-warning/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{interaction.interaction}</span>
                    <Badge
                      variant={interaction.risk === "HIGH" ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {interaction.risk} RISK
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Effect: {interaction.effect}
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Management: </span>
                    {interaction.management}
                  </div>
                </div>
              ))}
            </div>          </CardContent>
        </Card>
      )}
    </div>
  );
}
