import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Kidney, AlertTriangle, Activity, Droplets, FileText, Scale, Calculator, Pill, ChevronRight, ArrowRight, Info, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionCard } from "@/components/ui/section-card";
import { AbbreviationHover, AbbrText } from "@/components/AbbreviationHover";

// ─── KDIGO 2024 CKD Classification ───
const CKD_STAGES = [
  { stage: "G1", gfr: "≥90", description: "Normal or high", action: "Monitor, treat underlying cause" },
  { stage: "G2", gfr: "60-89", description: "Mildly reduced", action: "Monitor, CVD risk assessment" },
  { stage: "G3a", gfr: "45-59", description: "Mildly to moderately reduced", action: "Nephrology referral, avoiding nephrotoxins" },
  { stage: "G3b", gfr: "30-44", description: "Moderately to severely reduced", action: "Nephrology referral, anemia/bone eval" },
  { stage: "G4", gfr: "15-29", description: "Severely reduced", action: "Prepare for RRT, transplant eval" },
  { stage: "G5", gfr: "<15", description: "Kidney failure", action: "RRT or transplant, palliative care" },
];

// ─── Albuminuria Categories (KDIGO) ───
const ALBUMINURIA = [
  { category: "A1", range: "<30mg/g", risk: "Normal to mildly increased", action: "General prevention" },
  { category: "A2", range: "30-300mg/g", risk: "Moderately increased", action: "RAASi, SGLT2i if DM", note: "Formerly microalbuminuria" },
  { category: "A3", range: ">300mg/g", risk: "Severely increased", action: "Nephrology referral, intensify therapy", note: "Formerly macroalbuminuria" },
];

// ─── Key Medication Dosing in CKD ───
const MEDICATIONS_CKD = [
  { drug: "Metformin", renalStatus: "Use with caution", egfr: ">45: full dose; 30-45: 500mg OD; <30: avoid", note: "Check eGFR q3-6mo, hold if sick/dehydrated" },
  { drug: "SGLT2i", renalStatus: "Continue if feasible", egfr: ">20: continue; <20: limited benefit", note: "Canagliflozin requires eGFR>20" },
  { drug: "GLP-1 RA", renalStatus: "Generally safe", egfr: "All doses if stable", note: "Liraglutide, semaglutide" },
  { drug: "Warfarin", renalStatus: "Safe but monitor", egfr: "All doses", note: "Check INR closely" },
  { drug: "Digoxin", renalStatus: "Adjust dose", egfr: "Loading normal, maintenance 50-75%", note: "Check levels, toxicity masked in hypo" },
  { drug: "Enoxaparin", renalStatus: "Accumulation risk", egfr: "Avoid at extremes", note: "Check anti-Xa if prolonged" },
  { drug: "Opioids", renalStatus: "Reduce dose", egfr: "Reduce 50% for morphine/metabolites", note: "Avoid meperidine, norpropoxyphene" },
  { drug: "Gabapentin", renalStatus: "Adjust dose", egfr: "300mg OD if <15, avoid if on dialysis", note: "Neuropathic pain, adjust per CrCl" },
];

// ─── KDIGO 2024 Proteinuria Target ───
const PROTEINURIA_TARGETS = [
  { condition: "CKD with diabetes", target: "<0.5g/day", firstLine: "SGLT2i + RAASi", notes: "Add finerenone if eGFR>25" },
  { condition: "CKD without diabetes", target: "<1.0g/day", firstLine: "RAASi (ACE-i/ARB)", notes: "Maximize, consider SGLT2i" },
  { condition: "Nephrotic syndrome", target: "<3.0g/day", firstLine: "Steroid + immunosuppression", notes: "Consider cyclosporine if steroid-resistant" },
];

// ─── RRT Modalities ───
const RRT_OPTIONS = [
  { modality: "Hemodialysis", pros: "Efficient toxins removal", cons: "Vascular access, fluid shifts", suitable: "Most patients" },
  { modality: "Peritoneal Dialysis", pros: "Home-based, flexible", cons: "Infection risk, adherence", suitable: "Residual renal function" },
  { modality: "Transplant", pros: "Best quality of life", cons: "Surgery, immunosuppression", suitable: "Eligible patients, age <75" },
  { modality: "Conservative", pros: "No procedures", cons: "Limited survival", suitable: "Frail elderly, patient choice" },
];

export default function RenalTab() {
  const [activeTab, setActiveTab] = useState("ckd");
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Kidney className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground">
              Renal Disease Management
            </h1>
            <p className="text-muted-foreground">
              KDIGO <AbbrText text="CKD" /> 2024 Guidelines
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
            <TabsTrigger value="ckd" className="py-2 text-sm data-[state=active]:bg-amber-500/10">
              <Kidney className="h-4 w-4 mr-1" />Stage
            </TabsTrigger>
            <TabsTrigger value="labs" className="py-2 text-sm data-[state=active]:bg-amber-500/10">
              <Activity className="h-4 w-4 mr-1" />Labs
            </TabsTrigger>
            <TabsTrigger value="meds" className="py-2 text-sm data-[state=active]:bg-amber-500/10">
              <Pill className="h-4 w-4 mr-1" />Renal Meds
            </TabsTrigger>
            <TabsTrigger value="rrt" className="py-2 text-sm data-[state=active]:bg-amber-500/10">
              <Stethoscope className="h-4 w-4 mr-1" />RRT
            </TabsTrigger>
          </TabsList>

          {/* CKD Stage Tab */}
          <TabsContent value="ckd" className="mt-0 space-y-6">
            <SectionCard title="KDIGO 2024 eGFR Classification" icon={<Calculator className="h-4 w-4" />} tone="amber" collapsible={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {CKD_STAGES.map((s) => (
                  <Card key={s.stage} className={s.gfr === "15-29" || s.gfr === "<15" ? "border-red-300 bg-red-50/50" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold">G{s.stage}</span>
                        <Badge variant="outline" className="font-mono">{s.gfr} mL/min</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{s.description}</p>
                      <p className="text-xs font-medium text-amber-600">{s.action}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Albuminuria Categories (A1-A3)" icon={<Droplets className="h-4 w-4" />} tone="neutral" collapsible={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-semibold">Category</th>
                      <th className="text-left py-2 px-3 font-semibold">Range</th>
                      <th className="text-left py-2 px-3 font-semibold">Risk Level</th>
                      <th className="text-left py-2 px-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALBUMINURIA.map((a) => (
                      <tr key={a.category} className="border-b border-border/30">
                        <td className="py-2 px-3 font-medium">A{a.category}</td>
                        <td className="py-2 px-3 font-mono text-xs">{a.range}</td>
                        <td className="py-2 px-3">{a.risk}</td>
                        <td className="py-2 px-3 text-xs">{a.action} {a.note && <span className="text-muted-foreground">({a.note})</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Combined G+A Staging (KDIGO Heat Map)" icon={<Activity className="h-4 w-4" />} tone="danger" collapsible={false}>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm"><strong>Green (Low Risk):</strong> G1-G2 + A1, G1 + A2</p>
                <p className="text-sm"><strong>Yellow (Moderate Risk):</strong> G1+A3, G3a+A1, G3a+A2</p>
                <p className="text-sm"><strong>Orange (High Risk):</strong> G3b+A1 to G3b+A3, G4+A1, G4+A2</p>
                <p className="text-sm"><strong>Red (Very High Risk):</strong> G4+A3, G5 any A</p>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Labs Tab */}
          <TabsContent value="labs" className="mt-0 space-y-6">
            <SectionCard title="Key Laboratory Targets in CKD" icon={<FileText className="h-4 w-4" />} tone="amber" collapsible={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-2">Blood Tests</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>eGFR: Every 3-12 months (stage dependent)</li>
                    <li>Creatinine: Baseline, then as eGFR</li>
                    <li>BUN: Marker of uremia if rising</li>
                    <li>Hemoglobin: Screen for anemia (Hgb &lt;13 g/dL ♂, &lt;12 g/dL ♀)</li>
                    <li>Calcium/Phosphate: If G3b+</li>
                    <li>PTH: If G3b+ or on dialysis</li>
                    <li>BNP/NT-proBNP: Heart failure/monitoring</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-2">Urine Tests</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>UACR: &lt;30 mg/g = A1 (normal)</li>
                    <li>30-300 mg/g = A2 (moderately increased)</li>
                    <li>&gt;300 mg/g = A3 (severely increased)</li>
                    <li>Sediment: Look for RBC casts, WBC</li>
                    <li>Proteinuria: Quantify 24h collection if needed</li>
                  </ul>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="When to Refer to Nephrology" icon={<ChevronRight className="h-4 w-4" />} tone="amber" collapsible={false}>
              <div className="space-y-2">
                <li className="flex items-center gap-2 text-sm"><ArrowRight className="h-4 w-4 text-amber-500" />eGFR &lt;30 mL/min (any time)</li>
                <li className="flex items-center gap-2 text-sm"><ArrowRight className="h-4 w-4 text-amber-500" />eGFR declines &gt;5 mL/min/yr</li>
                <li className="flex items-center gap-2 text-sm"><ArrowRight className="h-4 w-4 text-amber-500" />UACR &gt;300 mg/g</li>
                <li className="flex items-center gap-2 text-sm"><ArrowRight className="h-4 w-4 text-amber-500" />Hematuria with RBC casts</li>
                <li className="flex items-center gap-2 text-sm"><ArrowRight className="h-4 w-4 text-amber-500" />Resistant hypertension</li>
                <li className="flex items-center gap-2 text-sm"><ArrowRight className="h-4 w-4 text-amber-500" />Suspected hereditary disease</li>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="meds" className="mt-0 space-y-6">
            <SectionCard title="Medication Dosing in CKD" icon={<Pill className="h-4 w-4" />} tone="amber" collapsible={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-semibold">Drug</th>
                      <th className="text-left py-2 px-3 font-semibold">Renal Status</th>
                      <th className="text-left py-2 px-3 font-semibold">Dosing by eGFR</th>
                      <th className="text-left py-2 px-3 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEDICATIONS_CKD.map((m) => (
                      <tr key={m.drug} className="border-b border-border/30">
                        <td className="py-2 px-3 font-medium">{m.drug}</td>
                        <td className="py-2 px-3">{m.renalStatus}</td>
                        <td className="py-2 px-3 font-mono text-xs">{m.egfr}</td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">{m.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Proteinuria Targets & First-Line Agents" icon={<Scale className="h-4 w-4" />} tone="neutral" collapsible={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-semibold">Condition</th>
                      <th className="text-left py-2 px-3 font-semibold">Target</th>
                      <th className="text-left py-2 px-3 font-semibold">First-Line</th>
                      <th className="text-left py-2 px-3 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROTEINURIA_TARGETS.map((p) => (
                      <tr key={p.condition} className="border-b border-border/30">
                        <td className="py-2 px-3">{p.condition}</td>
                        <td className="py-2 px-3 font-mono">{p.target}</td>
                        <td className="py-2 px-3">{p.firstLine}</td>
                        <td className="py-2 px-3 text-xs">{p.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Nephrotoxic Drugs to Avoid/Avoid in CKD" icon={<AlertTriangle className="h-4 w-4" />} tone="danger" collapsible={false}>
              <div className="p-4 bg-red-50/50 rounded-lg border border-red-200/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">Avoid Completely</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>NSAIDs (ibuprofen, naproxen)</li>
                      <li>Contrast dye if possible</li>
                      <li>Methoxyflurane</li>
                      <li>Colistin, amphotericin B (conventional)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-700 mb-2">Use Caution</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Diuretics (loop): Monitor volume</li>
                      <li>Lithium: Check levels</li>
                      <li>Pemetrexed, carboplatin</li>
                      <li>Bisphosphonates (IV): Check creatinine</li>
                    </ul>
                  </div>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* RRT Tab */}
          <TabsContent value="rrt" className="mt-0 space-y-6">
            <SectionCard title="Renal Replacement Therapy Options" icon={<Stethoscope className="h-4 w-4" />} tone="amber" collapsible={false}>
              <div className="space-y-3">
                {RRT_OPTIONS.map((r) => (
                  <Card key={r.modality}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{r.modality}</h4>
                        <Badge variant="outline" className="text-xs">{r.suitable}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div><strong>Pros:</strong> {r.pros}</div>
                        <div><strong>Cons:</strong> {r.cons}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Timing of RRT Initiation" icon={<Info className="h-4 w-4" />} tone="neutral" collapsible={false}>
              <p className="text-sm mb-3">Initiate dialysis when ANY of:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <ArrowRight className="h-4 w-4 text-amber-500" />eGFR &lt;15 mL/min
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <ArrowRight className="h-4 w-4 text-amber-500" />Symptomatic uremia
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <ArrowRight className="h-4 w-4 text-amber-500" />Refractory hyperkalemia
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <ArrowRight className="h-4 w-4 text-amber-500" />Volume overload refractory
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <ArrowRight className="h-4 w-4 text-amber-500" />Acidosis (HCO3 &lt;18)
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <ArrowRight className="h-4 w-4 text-amber-500" />Pericarditis/encephalopathy
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Conservative Management (No Dialysis)" icon={<Info className="h-4 w-4" />} tone="neutral" collapsible={false}>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm">An alternative for patients who choose not to pursue dialysis or transplantation. Includes:</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Active symptom management</li>
                  <li>Advance care planning</li>
                  <li>Psychosocial support</li>
                  <li>Regular nephrology follow-up</li>
                  <li>Hospice involvement as appropriate</li>
                </ul>
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>

        {/* Footer References */}
        <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">References:</p>
              <p>KDIGO 2024 Clinical Practice Guideline for Chronic Kidney Disease</p>
              <p>Kidney Disease: Improving Global Outcomes (KDIGO)</p>
              <p className="mt-2">Always individualize based on patient preferences, comorbidities, and life expectancy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}