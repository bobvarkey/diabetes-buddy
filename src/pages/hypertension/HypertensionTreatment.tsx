import { useState } from "react";
import { AbbreviationHover, AbbrText } from "@/components/AbbreviationHover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GitBranch,
  ChevronRight,
  RotateCcw,
  Activity,
  Heart,
  Brain,
  Baby,
  AlertTriangle,
  Info,
  Gauge,
  CheckCircle,
} from "lucide-react";

// Category colors for hypertension (orange theme)
const categoryColors = {
  accent: "#fb923c",
  bg: "rgba(251,146,60,0.12)",
  border: "rgba(251,146,60,0.2)",
};

// ===== TREATMENT ALGORITHM =====
interface AlgorithmNode {
  id: string;
  question: string;
  type: "decision" | "recommendation";
  options?: { label: string; nextId: string }[];
  recommendation?: {
    firstLine: string[];
    secondLine?: string[];
    avoid?: string[];
    notes?: string;
  };
}

const algorithmNodes: AlgorithmNode[] = [
  {
    id: "start",
    question: "What is the primary comorbidity?",
    type: "decision",
    options: [
      { label: "Diabetes (with or without proteinuria)", nextId: "diabetes" },
      { label: "CKD (GFR < 60 or proteinuria)", nextId: "ckd" },
      { label: "Heart Failure", nextId: "hf_type" },
      { label: "Coronary Artery Disease", nextId: "cad" },
      { label: "Stroke / Cerebrovascular Disease", nextId: "stroke" },
      { label: "Pregnancy", nextId: "pregnancy" },
      { label: "No major comorbidity", nextId: "uncomplicated" },
    ],
  },
  {
    id: "diabetes",
    question: "Diabetes — Is there proteinuria/albuminuria?",
    type: "decision",
    options: [
      { label: "Yes — Diabetic nephropathy / proteinuria", nextId: "diabetes_proteinuria" },
      { label: "No — Diabetes without nephropathy", nextId: "diabetes_no_proteinuria" },
    ],
  },
  {
    id: "diabetes_proteinuria",
    question: "",
    type: "recommendation",
    recommendation: {
      firstLine: ["ACEi (Ramipril / Enalapril)", "OR ARB (Losartan / Telmisartan)"],
      secondLine: ["Add CCB (Amlodipine)", "Add Thiazide-like (Chlorthalidone)"],
      avoid: ["Dual RAAS blockade (ACEi + ARB)", "Beta-blockers (mask hypoglycemia — use with caution)"],
      notes: "ACEi/ARB are renoprotective and reduce proteinuria progression. RENAAL & IDNT trials support ARB in type 2 diabetic nephropathy. Target BP < 130/80 mmHg.",
    },
  },
  {
    id: "diabetes_no_proteinuria",
    question: "",
    type: "recommendation",
    recommendation: {
      firstLine: ["ACEi / ARB", "CCB (Amlodipine)", "Thiazide-like diuretic (Chlorthalidone)"],
      secondLine: ["Combination of above classes"],
      avoid: ["Dual RAAS blockade", "High-dose thiazides (worsen glucose control)"],
      notes: "Any first-line agent is acceptable. ACEi/ARB preferred if microalbuminuria develops. Monitor glucose with thiazides. Target BP < 130/80 mmHg.",
    },
  },
  {
    id: "ckd",
    question: "CKD — Is there significant proteinuria (>300 mg/day)?",
    type: "decision",
    options: [
      { label: "Yes — Proteinuric CKD", nextId: "ckd_proteinuria" },
      { label: "No — Non-proteinuric CKD", nextId: "ckd_no_proteinuria" },
    ],
  },
  {
    id: "ckd_proteinuria",
    question: "",
    type: "recommendation",
    recommendation: {
      firstLine: ["ACEi (Ramipril)", "OR ARB (Losartan / Telmisartan)"],
      secondLine: ["Loop diuretic (Furosemide) if GFR < 30", "CCB (Amlodipine)"],
      avoid: ["Dual RAAS blockade", "Thiazides alone if GFR < 30 (ineffective)", "K-sparing diuretics if GFR < 30"],
      notes: "ACEi/ARB reduce proteinuria and slow CKD progression. Switch from thiazide to loop diuretic when GFR < 30. Monitor K+ closely with ACEi/ARB. Target BP < 130/80 mmHg.",
    },
  },
  {
    id: "ckd_no_proteinuria",
    question: "",
    type: "recommendation",
    recommendation: {
      firstLine: ["ACEi / ARB", "CCB (Amlodipine)", "Thiazide-like (if GFR > 30)"],
      secondLine: ["Loop diuretic (if GFR < 30)", "Add second agent from first-line"],
      avoid: ["Dual RAAS blockade", "K-sparing diuretics if GFR < 30"],
      notes: "No single class clearly superior without proteinuria. Choose based on other comorbidities. Adjust doses per GFR. Target BP < 130/80 mmHg.",
    },
  },
  {
    id: "hf_type",
    question: "Heart Failure — What type?",
    type: "decision",
    options: [
      { label: "HFrEF (EF ≤ 40%)", nextId: "hfref" },
      { label: "HFpEF (EF > 40%)", nextId: "hfpef" },
    ],
  },
  {
    id: "hfref",
    question: "",
    type: "recommendation",
    recommendation: {
      firstLine: [
        "ACEi / ARB (Ramipril, Enalapril, Losartan)",
        "Beta-blocker (Carvedilol, Metoprolol Succinate)",
        "Aldosterone antagonist (Spironolactone 25 mg)",
      ],
      secondLine: ["Loop diuretic (Furosemide) for volume overload"],
      avoid: ["Non-DHP CCBs (Verapamil, Diltiazem — negative inotropes)", "Moxonidine (MOXCON trial — increased mortality in HF)"],
      notes: "Guideline-directed medical therapy (GDMT): ACEi/ARB + Beta-blocker + MRA form the cornerstone. Titrate to target doses. RALES trial: Spironolactone reduces mortality by 30% in HFrEF.",
    },
  },
  {
    id: "hfpef",
    question: "",
    type: "recommendation",
    recommendation: {
      firstLine: ["Diuretics for volume control (Furosemide / Thiazide)", "Manage comorbidities (HTN, AF, CAD)"],
      secondLine: ["ACEi / ARB", "Beta-blocker for rate control if AF", "Spironolactone (may reduce hospitalizations)"],
      avoid: ["No proven mortality-reducing therapy yet"],
      notes: "Focus on symptom management, volume control, and comorbidity treatment. TOPCAT trial suggested benefit of spironolactone in some HFpEF populations. Target BP < 130/80 mmHg.",
    },
  },
  {
    id: "cad",
    question: "",
    type: "recommendation",
    recommendation: {
      firstLine: [
        "Beta-blocker (Metoprolol, Carvedilol) — especially post-MI",
        "ACEi (Ramipril) — HOPE trial benefit",
      ],
      secondLine: ["CCB (Amlodipine) if beta-blocker contraindicated or for angina", "Thiazide diuretic for additional BP control"],
      avoid: ["Short-acting nifedipine (reflex tachycardia)", "Hydralazine monotherapy (reflex tachycardia)"],
      notes: "Beta-blockers reduce reinfarction and mortality post-MI. Ramipril shown to reduce CV events in HOPE trial. Amlodipine is safe in stable CAD (CAMELOT trial). Target BP < 130/80 mmHg.",
    },
  },
  {
    id: "stroke",
    question: "",
    type: "recommendation",
    recommendation: {
      firstLine: ["ACEi + Thiazide-like diuretic (Perindopril + Indapamide — PROGRESS trial)", "ARB (Telmisartan — PROFESS trial)"],
      secondLine: ["CCB (Amlodipine)", "Any first-line agent achieving target BP"],
      avoid: ["Aggressive BP lowering in acute stroke (within 72 hours)"],
      notes: "BP reduction is the most important factor for secondary stroke prevention. PROGRESS trial: ACEi + diuretic reduced stroke recurrence by 43%. Target BP < 130/80 mmHg after stabilization.",
    },
  },
  {
    id: "pregnancy",
    question: "",
    type: "recommendation",
    recommendation: {
      firstLine: ["Methyldopa (Aldomet) — safest, most studied", "Labetalol", "Nifedipine Extended Release"],
      secondLine: ["Hydralazine (IV for severe hypertension / eclampsia)"],
      avoid: ["ACEi — TERATOGENIC (all trimesters)", "ARB — TERATOGENIC", "Spironolactone — anti-androgenic effects", "Atenolol — fetal growth restriction"],
      notes: "Methyldopa is the gold standard for chronic HTN in pregnancy. Labetalol is preferred for acute severe hypertension. ACEi/ARB are ABSOLUTELY CONTRAINDICATED — cause renal agenesis, oligohydramnios. Target BP < 140/90 mmHg (CHIPS trial).",
    },
  },
  {
    id: "uncomplicated",
    question: "Uncomplicated Hypertension — Age group?",
    type: "decision",
    options: [
      { label: "Age < 55 (or any age South Asian descent)", nextId: "young_uncomplicated" },
      { label: "Age ≥ 55 (or Black African/Caribbean descent)", nextId: "older_uncomplicated" },
    ],
  },
  {
    id: "young_uncomplicated",
    question: "",
    type: "recommendation",
    recommendation: {
      firstLine: ["ACEi (Ramipril)", "OR ARB (Losartan / Telmisartan)"],
      secondLine: ["Add CCB (Amlodipine)", "Then add Thiazide-like (Chlorthalidone)"],
      avoid: ["Beta-blockers as first-line for uncomplicated HTN (no longer recommended)"],
      notes: "NICE/BHS ACD algorithm: Step 1 = A (ACEi/ARB). Step 2 = A + C or A + D. Step 3 = A + C + D. Step 4 (resistant) = Add Spironolactone 25 mg. Target BP < 140/90 mmHg (< 130/80 if high risk).",
    },
  },
  {
    id: "older_uncomplicated",
    question: "",
    type: "recommendation",
    recommendation: {
      firstLine: ["CCB (Amlodipine)", "OR Thiazide-like diuretic (Chlorthalidone)"],
      secondLine: ["Add ACEi / ARB", "Then triple therapy (A + C + D)"],
      avoid: ["Beta-blockers as first-line (less effective for stroke prevention in elderly)"],
      notes: "CCB or thiazide preferred in older and Black patients due to lower renin states. ALLHAT trial supports thiazide-like diuretics. Step 4 (resistant): Add Spironolactone (PATHWAY-2 trial). Target BP < 140/90 mmHg.",
    },
  },
];

// ===== POTENCY TABLE =====
type Potency = "Very high" | "High" | "Moderate" | "Moderate to low" | "Low to moderate" | "Low";

interface DrugRow {
  potency: Potency;
  drugClass: string;
  examples: string;
  startingDose: string;
  bestUse: string;
}

const drugData: DrugRow[] = [
  {
    potency: "Very high",
    drugClass: "Direct vasodilators",
    examples: "Hydralazine, minoxidil",
    startingDose: "Hydralazine 25 mg BID; minoxidil 2.5 mg daily",
    bestUse: "Resistant hypertension or special situations, usually combined with other agents due to adverse-effect burden.",
  },
  {
    potency: "High",
    drugClass: "Mineralocorticoid receptor antagonists",
    examples: "Spironolactone, eplerenone",
    startingDose: "Spironolactone 25 mg daily; eplerenone 50 mg daily",
    bestUse: "Resistant hypertension, primary aldosteronism, heart failure.",
  },
  {
    potency: "High",
    drugClass: "Thiazide / thiazide-like diuretics",
    examples: "Chlorthalidone, indapamide, hydrochlorothiazide",
    startingDose: "Chlorthalidone 12.5 mg daily; indapamide 1.25 mg daily; HCTZ 12.5–25 mg daily",
    bestUse: "First-line for uncomplicated HTN; thiazide-like agents often favored over HCTZ.",
  },
  {
    potency: "High",
    drugClass: "Dihydropyridine CCBs",
    examples: "Amlodipine, felodipine, nifedipine ER",
    startingDose: "Amlodipine 2.5–5 mg daily; felodipine 2.5–5 mg daily; nifedipine ER 30 mg daily",
    bestUse: "First-line, especially older adults, isolated systolic HTN, and combination regimens.",
  },
  {
    potency: "Moderate",
    drugClass: "ACE inhibitors",
    examples: "Lisinopril, enalapril, ramipril",
    startingDose: "Lisinopril 10 mg daily; enalapril 5 mg daily; ramipril 2.5 mg daily",
    bestUse: "CKD, diabetes with albuminuria, coronary disease, proteinuric states.",
  },
  {
    potency: "Moderate",
    drugClass: "ARBs",
    examples: "Losartan, valsartan, telmisartan",
    startingDose: "Losartan 25–50 mg daily; valsartan 80 mg daily; telmisartan 20 mg daily",
    bestUse: "Similar to ACEi when cough or ACE intolerance is an issue.",
  },
  {
    potency: "Moderate",
    drugClass: "Loop diuretics",
    examples: "Furosemide, torsemide, bumetanide",
    startingDose: "Furosemide 20–40 mg daily; torsemide 5–10 mg daily; bumetanide 0.5–1 mg daily",
    bestUse: "More useful for CKD, edema, heart failure, or volume overload than routine HTN.",
  },
  {
    potency: "Moderate to low",
    drugClass: "Central alpha-2 agonists",
    examples: "Clonidine, methyldopa, guanfacine",
    startingDose: "Clonidine 0.1 mg BID; methyldopa 250 mg BID; guanfacine 0.5–1 mg daily",
    bestUse: "Refractory HTN; methyldopa in pregnancy. Limited by sedation and rebound.",
  },
  {
    potency: "Low to moderate",
    drugClass: "Beta-blockers",
    examples: "Metoprolol, bisoprolol, atenolol, carvedilol, labetalol",
    startingDose: "Metoprolol 50 mg daily/BID; bisoprolol 2.5 mg daily; atenolol 25 mg daily",
    bestUse: "CAD, arrhythmia, post-MI, heart failure, or pregnancy (labetalol) — not uncomplicated HTN alone.",
  },
  {
    potency: "Low",
    drugClass: "Alpha-1 blockers",
    examples: "Doxazosin, terazosin, prazosin",
    startingDose: "Doxazosin 1 mg daily; terazosin 1 mg daily; prazosin 1–2 mg BID",
    bestUse: "Add-on therapy, especially with concomitant BPH.",
  },
];

const getPotencyColor = (potency: Potency): string => {
  switch (potency) {
    case "Very high":
      return "bg-destructive/20 text-destructive border-destructive/30";
    case "High":
      return "bg-orange-500/20 text-orange-700 border-orange-500/30";
    case "Moderate":
      return "bg-amber-500/20 text-amber-700 border-amber-500/30";
    case "Moderate to low":
    case "Low to moderate":
      return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
    case "Low":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

// ===== STROKE PREVENTION PROTOCOL =====
const strokeProtocol = {
  title: "Recurrent Stroke Prevention",
  background: "After ischemic stroke or TIA, BP reduction is the most effective intervention for preventing recurrence.",
  keyTrials: [
    { name: "PROGRESS", result: "ACEi + diuretic reduced stroke recurrence by 43%" },
    { name: "PROFESS", result: "Telmisartan (ARB) showed benefit in secondary prevention" },
    { name: "SP S3", result: "Target SBP < 130 mmHg reduces recurrent stroke risk" },
  ],
  recommendations: [
    "Start antihypertensive therapy within 24 hours if BP > 140/90 and patient stable",
    "Target BP < 130/80 mmHg for secondary stroke prevention",
    "Preferred: ACE inhibitor + Thiazide-like diuretic combination",
    "Alternative: ARB-based regimen (Telmisartan)",
    "Avoid aggressive lowering in acute stroke (< 72 hours) unless BP > 220/120",
  ],
  cautions: [
    "If thrombolysis planned: BP must be < 185/110 before treatment",
    "After thrombolysis: Maintain BP < 180/105 for 24 hours",
    "Consider permissive hypertension in acute stroke if no thrombolysis",
  ],
};

export default function HypertensionTreatment() {
  const [algorithmHistory, setAlgorithmHistory] = useState<string[]>(["start"]);

  const currentId = algorithmHistory[algorithmHistory.length - 1];
  const currentNode = algorithmNodes.find((n) => n.id === currentId);

  const selectAlgorithmOption = (nextId: string) => {
    setAlgorithmHistory((prev) => [...prev, nextId]);
  };

  const goBackAlgorithm = () => {
    if (algorithmHistory.length > 1) {
      setAlgorithmHistory((prev) => prev.slice(0, -1));
    }
  };

  const restartAlgorithm = () => setAlgorithmHistory(["start"]);

  return (
    <div className="space-y-6">
      {/* Treatment Algorithm */}
      <Card className="border-2 border-orange-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" style={{ color: categoryColors.accent }} />
              <CardTitle className="text-lg">Treatment Algorithm</CardTitle>
            </div>
            {algorithmHistory.length > 1 && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={goBackAlgorithm}>
                  ← Back
                </Button>
                <Button variant="ghost" size="sm" onClick={restartAlgorithm}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restart
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Evidence-based antihypertensive selection by comorbidity</p>
        </CardHeader>
        <CardContent>
          {/* Breadcrumb */}
          {algorithmHistory.length > 1 && (
            <div className="flex flex-wrap items-center gap-1 mb-4 text-xs text-muted-foreground">
              {algorithmHistory.map((id, i) => {
                const node = algorithmNodes.find((n) => n.id === id);
                if (!node || node.type !== "decision") return null;
                return (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3 w-3" />}
                    <span className={i === algorithmHistory.length - 1 ? "font-semibold text-foreground" : ""}>
                      {node.question.substring(0, 30)}{node.question.length > 30 ? "..." : ""}
                    </span>
                  </span>
                );
              })}
            </div>
          )}

          {currentNode?.type === "decision" && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">{currentNode.question}</h3>
              <div className="grid gap-2">
                {currentNode.options?.map((opt) => (
                  <button
                    key={opt.nextId}
                    onClick={() => selectAlgorithmOption(opt.nextId)}
                    className="text-left p-3 rounded-lg border-2 border-border hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium group-hover:text-orange-700">{opt.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentNode?.type === "recommendation" && currentNode.recommendation && (
            <div className="space-y-4">
              {/* First Line */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4" style={{ color: categoryColors.accent }} />
                  <Badge variant="outline" style={{ color: categoryColors.accent, borderColor: categoryColors.border }}>
                    First-Line
                  </Badge>
                </div>
                <ul className="space-y-1.5 ml-1">
                  {currentNode.recommendation.firstLine.map((drug, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: categoryColors.accent }} />
                      <span className="text-foreground"><AbbrText text={drug} /></span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Second Line */}
              {currentNode.recommendation.secondLine && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-muted-foreground">Second-Line / Add-on</Badge>
                  </div>
                  <ul className="space-y-1.5 ml-1">
                    {currentNode.recommendation.secondLine.map((drug, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 mt-1.5 flex-shrink-0" />
                        <span className="text-foreground"><AbbrText text={drug} /></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Avoid */}
              {currentNode.recommendation.avoid && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <Badge variant="outline" className="text-destructive border-destructive/30">Avoid / Caution</Badge>
                  </div>
                  <ul className="space-y-1.5 ml-1">
                    {currentNode.recommendation.avoid.map((drug, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                        <span className="text-foreground"><AbbrText text={drug} /></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Evidence / Notes */}
              {currentNode.recommendation.notes && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">📚 Evidence & Notes: </span>
                    <AbbrText text={currentNode.recommendation.notes} />
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drug Potency Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5" style={{ color: categoryColors.accent }} />
            <CardTitle className="text-lg">Antihypertensive Drug Potency</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">Drug efficacy comparison for clinical decision-making</p>
        </CardHeader>
        <CardContent>
          {/* Key Considerations Alert */}
          <Alert className="mb-4 border-amber-500/30 bg-amber-500/5">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-600 text-sm">
              Potency alone should not drive drug selection — consider comorbidities, side effects, and patient preferences.
              Thiazide-like diuretics (chlorthalidone, indapamide) preferred over HCTZ for cardiovascular outcomes.
            </AlertDescription>
          </Alert>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Potency</TableHead>
                  <TableHead>Drug Class</TableHead>
                  <TableHead>Examples</TableHead>
                  <TableHead>Starting Dose</TableHead>
                  <TableHead className="w-1/3">Best Use</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drugData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell>
                      <Badge variant="outline" className={getPotencyColor(row.potency)}>
                        {row.potency}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{row.drugClass}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.examples}</TableCell>
                    <TableCell className="text-sm">{row.startingDose}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.bestUse}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Clinical Pearls */}
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="pearls">
              <AccordionTrigger className="text-sm font-medium">Clinical Pearls</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium">Resistant Hypertension (≥3 drugs)</p>
                    <p className="text-xs text-muted-foreground">
                      Confirm adherence, white-coat effect, and secondary causes first. Then add spironolactone 25 mg
                      — PATHWAY-2 trial showed best add-on efficacy.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Thiazide vs Loop Diuretics</p>
                    <p className="text-xs text-muted-foreground">
                      Switch to loop diuretics (furosemide, torsemide) when eGFR &lt;30 mL/min/1.73m².
                      Thiazides lose efficacy at low GFR.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">ACEi/ARB Combination</p>
                    <p className="text-xs text-muted-foreground">
                      NEVER combine ACEi + ARB (dual RAAS blockade) — increases hyperkalemia and AKI risk
                      without additional benefit (ONTARGET/ALTITUDE trials).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Beta-Blocker Selection</p>
                    <p className="text-xs text-muted-foreground">
                      Prefer cardioselective beta-blockers (metoprolol, bisoprolol) or vasodilating beta-blockers
                      (carvedilol, labetalol). Atenolol has inferior outcomes data.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Recurrent Stroke Prevention Protocol */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" style={{ color: categoryColors.accent }} />
            <CardTitle className="text-lg">Recurrent Stroke Prevention Protocol</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{strokeProtocol.background}</p>

          {/* Key Trials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {strokeProtocol.keyTrials.map((trial, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="font-medium text-sm" style={{ color: categoryColors.accent }}>{trial.name}</p>
                <p className="text-xs text-muted-foreground">{trial.result}</p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Recommendations */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4" style={{ color: categoryColors.accent }} />
                <span className="font-medium text-sm">Recommendations</span>
              </div>
              <ul className="space-y-1.5">
                {strokeProtocol.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: categoryColors.accent }} />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <Alert className="border-red-500/30 bg-red-500/5">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-red-700 text-sm">Cautions in Acute Stroke</AlertTitle>
              <AlertDescription className="text-red-600 text-sm">
                <ul className="mt-2 space-y-1">
                  {strokeProtocol.cautions.map((caution, i) => (
                    <li key={i}>• {caution}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Pregnancy Quick Reference */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Baby className="h-5 w-5" style={{ color: categoryColors.accent }} />
            <CardTitle className="text-lg">Antihypertensives in Pregnancy</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-sm font-medium text-emerald-700 mb-2">✓ Safe Options</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Methyldopa — gold standard, most studied</li>
                <li>• Labetalol — preferred for acute severe HTN</li>
                <li>• Nifedipine SR — safe in pregnancy</li>
                <li>• Hydralazine — IV for severe HTN/eclampsia</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <p className="text-sm font-medium text-destructive mb-2">✗ Contraindicated</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• ACE inhibitors — TERATOGENIC (all trimesters)</li>
                <li>• ARBs — TERATOGENIC</li>
                <li>• Spironolactone — anti-androgenic effects</li>
                <li>• Atenolol — fetal growth restriction</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
