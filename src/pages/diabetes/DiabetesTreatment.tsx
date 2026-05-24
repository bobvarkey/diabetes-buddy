import React, { useState } from "react";
import { AbbreviationHover, AbbrText } from "@/components/AbbreviationHover";
import { Link } from "react-router-dom";
import { Pill, Syringe, ChevronRight, ChevronDown, ArrowRight, CheckCircle2, AlertTriangle, Heart, Activity, Scale, Brain, ArrowDown, FileText, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Algorithm Step Component
interface AlgorithmStepProps {
  step: number;
  title: string;
  description: string;
  criteria?: string;
  medications?: { name: string; class: string; notes?: string }[];
  icon: React.ReactNode;
  tone: "primary" | "accent" | "warning" | "danger";
  isLast?: boolean;
  showInsulinRef?: boolean;
  onToggleInsulinRef?: () => void;
}

const AlgorithmStep = ({ step, title, description, criteria, medications, icon, tone, isLast, showInsulinRef, onToggleInsulinRef }: AlgorithmStepProps) => {
  const getToneClasses = () => {
    switch (tone) {
      case "primary": return "border-primary/40 bg-primary/5";
      case "accent": return "border-accent/40 bg-accent/5";
      case "warning": return "border-amber-500/40 bg-amber-500/5";
      case "danger": return "border-destructive/40 bg-destructive/5";
      default: return "border-border bg-card";
    }
  };

  const getIconColor = () => {
    switch (tone) {
      case "primary": return "text-primary";
      case "accent": return "text-accent";
      case "warning": return "text-amber-500";
      case "danger": return "text-destructive";
      default: return "text-foreground";
    }
  };

  return (
    <div className="flex flex-col">
      <div className={cn("p-4 rounded-lg border-2", getToneClasses())}>
        <div className="flex items-start gap-3">
          <div className={cn("mt-0.5", getIconColor())}>{icon}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <Badge variant="outline" className="text-xs">Step {step}</Badge>
            </div>            <p className="text-sm text-muted-foreground mb-2">{description}</p>

            {criteria && (
              <div className="mb-3">
                <span className="text-xs font-medium text-primary">Criteria: </span>
                <span className="text-xs text-muted-foreground">{criteria}</span>
              </div>
            )}

            {medications && medications.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium">Medication Options:</p>
                <div className="grid gap-2">
                  {medications.map((med, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-background/50">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium"><AbbrText text={med.name} /></p>
                        <p className="text-xs text-muted-foreground"><AbbrText text={med.class} /></p>
                        {med.notes && (
                          <p className="text-xs text-primary mt-0.5"><AbbrText text={med.notes} /></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {isLast && onToggleInsulinRef && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleInsulinRef}
                    className="mt-2"
                  >
                    {showInsulinRef ? "Hide Insulin Reference" : "Show Insulin Reference Charts"}
                    <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showInsulinRef ? "rotate-90" : ""}`} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {!isLast && (
        <div className="flex justify-center py-2">
          <ArrowDown className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

// ─── Insulin Brand Reference Data ───
const INSULIN_TYPES_DATA = [
  {
    category: "Rapid-Acting (Onset: 10-15 min, Peak: 1-2h, Duration: 3-5h)",
    items: [
      { generic: "Insulin Lispro", usBrand: "Humalog", indianBrands: ["Humalog", "Lispro (Biocon)"], note: "Mealtime insulin. Inject 0-15 min before meals. Most commonly used in insulin pumps." },
      { generic: "Insulin Aspart", usBrand: "NovoLog / Fiasp", indianBrands: ["NovoRapid", "NovoLog", "Aspart (Wockhardt)"], note: "Fiasp = faster-acting aspart with niacinamide. NovoRapid is widely available in India." },
      { generic: "Insulin Glulisine", usBrand: "Apidra", indianBrands: ["Apidra"], note: "Alternative to lispro/aspart. May have slightly faster onset. Less commonly used in India." },
    ],
  },
  {
    category: "Short-Acting / Regular (Onset: 30 min, Peak: 2-4h, Duration: 5-8h)",
    items: [
      { generic: "Regular Insulin (Soluble)", usBrand: "Humulin R / Novolin R", indianBrands: ["Actrapid", "Humulin R", "Wosulin R", "Insugen R", "Insuman Rapid"], note: "IV compatible. Used for sliding scales, DKA management, and pre-meal coverage. Inject 30 min before meals." },
    ],
  },
  {
    category: "Intermediate-Acting (Onset: 2-4h, Peak: 4-10h, Duration: 10-18h)",
    items: [
      { generic: "NPH Insulin (Isophane)", usBrand: "Humulin N / Novolin N", indianBrands: ["Humulin N", "Wosulin N", "Insugen N", "Insuman Basal", "NPH (Biocon)"], note: "Cloudy suspension — must be resuspended before use. Traditionally BID dosing. Higher variability vs analogs." },
    ],
  },
  {
    category: "Long-Acting Basal (Onset: 1-2h, Peak: Flat/None, Duration: 18-24+h)",
    items: [
      { generic: "Insulin Glargine U100", usBrand: "Lantus / Basaglar", indianBrands: ["Lantus", "Basalog", "Glaritus (Wockhardt)", "Glargine (Biocon)", "Toujeo (U300)"], note: "Most prescribed basal insulin. Flat profile, once-daily dosing. U300 version has longer duration (36h)." },
      { generic: "Insulin Detemir", usBrand: "Levemir", indianBrands: ["Levemir"], note: "Duration slightly shorter than glargine (~16-20h). May require BID dosing in some patients. Lower weight gain vs glargine." },
      { generic: "Insulin Degludec", usBrand: "Tresiba", indianBrands: ["Tresiba", "Degludec (Biocon)"], note: "Ultra-long (42h). Flexible dosing (8-40h window). Lower hypoglycemia risk vs glargine. U100/U200 available." },
    ],
  },
  {
    category: "Pre-Mixed Insulins (Convenience, less flexible)",
    items: [
      { generic: "Biphasic Insulin Aspart 30 (30% aspart, 70% protamine aspart)", usBrand: "NovoMix 30", indianBrands: ["NovoMix 30"], note: "30/70 mix. BID dosing. Good for patients who struggle with multiple injections. Less flexible than basal-bolus." },
      { generic: "Biphasic Human Insulin 30/70 (30% regular, 70% NPH)", usBrand: "Humulin 70/30", indianBrands: ["Humulin 70/30", "Wosulin 30/70", "Insugen 30/70", "Mixtard 30 (Novo)"], note: "Traditional mix. Lower cost. BID dosing. Widely available in India at low cost." },
      { generic: "Biphasic Insulin Lispro 25/50", usBrand: "Humalog Mix 25/50", indianBrands: ["Humalog Mix 25"], note: "25% lispro / 75% protamine lispro. For patients needing rapid-acting component." },
    ],
  },
  {
    category: "Concentrated Insulins (for severe insulin resistance)",
    items: [
      { generic: "Insulin Glargine U300", usBrand: "Toujeo", indianBrands: ["Toujeo"], note: "3× concentrated glargine. 300 U/mL. Longer/flatter than U100. Requires ~15-20% higher dose vs U100." },
      { generic: "Insulin Degludec U200", usBrand: "Tresiba U200", indianBrands: ["Tresiba U200"], note: "2× concentrated degludec. Same profile as U100, lower injection volume." },
      { generic: "Regular U500 (Human Insulin)", usBrand: "Humulin R U-500", indianBrands: ["—"], note: "5× concentrated. For patients requiring >200 U/day of insulin. Requires careful dosing oversight." },
    ],
  },
];

// ─── Insulin Tooltip Component ───
function InsulinTooltip({ brand }: { brand: string }) {
  // Find insulin by brand name
  const found = INSULIN_TYPES_DATA.flatMap(c => c.items).find(
    i => i.generic.includes(brand) || i.usBrand.includes(brand) || i.indianBrands.some(b => b.includes(brand))
  );
  if (!found) return null;
  return (
    <div className="group relative inline-block">
      <span className="text-foreground font-medium underline decoration-dotted decoration-muted-foreground/40 cursor-help">{brand}</span>
      <div className="absolute left-0 bottom-full mb-2 w-64 hidden group-hover:block z-50">
        <div className="bg-popover text-popover-foreground text-xs p-3 rounded-lg shadow-xl border border-border">
          <p className="font-semibold mb-1">{found.generic}</p>
          <p className="text-muted-foreground mb-1.5">
            <span className="font-medium text-foreground">US: </span>{found.usBrand}
          </p>
          <p className="text-muted-foreground mb-1.5">
            <span className="font-medium text-foreground">🇮🇳 India: </span>{found.indianBrands.join(", ")}
          </p>
          <p className="text-muted-foreground">{found.note}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Insulin Reference Section ───
const InsulinReferenceSection = () => (
  <div className="mt-4">
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between gap-2">
          <span className="flex items-center gap-2"><Syringe className="h-4 w-4" /> Insulin Brand Name Reference (US & India)</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">
        {INSULIN_TYPES_DATA.map((cat, ci) => (
          <div key={ci} className="p-3 rounded-lg border border-border bg-card/50">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{cat.category}</p>
            <div className="space-y-2">
              {cat.items.map((item, ii) => (
                <div key={ii} className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-0.5">Generic</p>
                      <p className="text-foreground">{item.generic.split(" (")[0]}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-0.5">US Brand</p>
                      <p className="text-foreground"><AbbrText text={item.usBrand} /></p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-0.5">🇮🇳 India</p>
                      <p className="text-foreground"><AbbrText text={item.indianBrands.join(", ")} /></p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5"><AbbrText text={item.note} /></p>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Link to="/insulin-titration">
            <Button variant="outline" size="sm">
              Insulin Titration Tool <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Link to="/sliding-scale">
            <Button variant="outline" size="sm">
              Sliding Scale <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
);

// Treatment Algorithm Component
const TreatmentAlgorithm = () => {
  const [showInsulinRef, setShowInsulinRef] = useState(false);
  const steps: AlgorithmStepProps[] = [
    {
      step: 1,
      title: "Lifestyle Interventions",
      description: "Foundation of diabetes management for all patients",
      criteria: "All patients with type 2 diabetes",
      medications: [],
      icon: <Activity className="h-5 w-5" />,
      tone: "primary",
    },
    {
      step: 2,
      title: "Metformin First-Line",
      description: "Unless contraindicated or not tolerated",
      criteria: "HbA1c ≥6.5%, eGFR ≥30 mL/min/1.73m²",
      medications: [
        { name: "Metformin", class: "Biguanide", notes: "Start 500 mg BID, titrate to 1000 mg BID" },
      ],
      icon: <Pill className="h-5 w-5" />,
      tone: "primary",
    },
    {
      step: 3,
      title: "ASCVD / CKD / HF Present?",
      description: "Check for established cardiovascular or renal disease",
      criteria: "ASCVD, HF, or CKD with albuminuria",
      medications: [
        { name: "SGLT2 Inhibitor", class: "SGLT2i", notes: "Empagliflozin, dapagliflozin — CV/renal benefit" },
        { name: "GLP-1 Receptor Agonist", class: "GLP-1 RA", notes: "Liraglutide, semaglutide — CV benefit" },
      ],
      icon: <Heart className="h-5 w-5" />,
      tone: "accent",
    },
    {
      step: 4,
      title: "Weight Management Priority",
      description: "For patients with obesity — consider weight-centric approach",
      criteria: "BMI ≥27 kg/m² (Asian: ≥25)",
      medications: [
        { name: "GLP-1 RA / Dual GIP/GLP-1", class: "Incretin", notes: "Semaglutide, tirzepatide — superior weight loss" },
        { name: "SGLT2 Inhibitor", class: "SGLT2i", notes: "Moderate weight loss, additional CV benefit" },
      ],
      icon: <Scale className="h-5 w-5" />,
      tone: "accent",
    },
    {
      step: 5,
      title: "Dual Therapy",
      description: "Add second agent if HbA1c above target after 3 months",
      criteria: "HbA1c ≥7.5% or not at goal",
      medications: [
        { name: "DPP-4 Inhibitor", class: "DPP-4i", notes: "Sitagliptin, linagliptin — weight neutral, low hypoglycemia" },
        { name: "Pioglitazone", class: "TZD", notes: "Durable, but weight gain and edema" },
        { name: "Sulfonylurea", class: "SU", notes: "Gliclazide MR — inexpensive but hypoglycemia risk" },
      ],
      icon: <Pill className="h-5 w-5" />,
      tone: "warning",
    },
    {
      step: 6,
      title: "Triple Therapy",
      description: "Intensify if still above target",
      criteria: "HbA1c ≥8.0% on dual therapy",
      medications: [
        { name: "Triple oral combination", class: "Various", notes: "Met + DPP-4i + SGLT2i or other combinations" },
      ],
      icon: <Brain className="h-5 w-5" />,
      tone: "warning",
    },
    {
      step: 7,
      title: "Insulin-Based Therapy",
      description: "For severe hyperglycemia when oral agents insufficient",
      criteria: "HbA1c ≥9.0% OR RBS >300 mg/dL OR symptomatic",
      medications: [
        { name: "Basal Insulin", class: "Long-acting", notes: "Glargine, detemir, degludec — start 10U or 0.1-0.2 U/kg" },
        { name: "Prandial Insulin", class: "Rapid-acting", notes: "Lispro, aspart, glulisine — add if postprandial excursions" },
        { name: "NPH (Intermediate)", class: "Mixed", notes: "Can mix with Regular — see Mixing Insulin guide" },
      ],
      icon: <Syringe className="h-5 w-5" />,
      tone: "danger",
      isLast: true,
    },
  ];

  return (
    <Card className="clinical-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">ADA 2026 Treatment Algorithm</CardTitle>
          </div>
          <Link to="/diabetes/medication-algorithm">
            <Button variant="outline" size="sm">
              Full Algorithm
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <AlgorithmStep
              key={index}
              {...step}
              showInsulinRef={showInsulinRef}
              onToggleInsulinRef={step.isLast ? () => setShowInsulinRef(!showInsulinRef) : undefined}
            />
          ))}
          {showInsulinRef && <InsulinReferenceSection />}
        </div>
      </CardContent>
    </Card>
  );
};

// GLP-1 Administration Guide
const GLP1AdministrationGuide = () => {
  const [selectedGLP1, setSelectedGLP1] = useState("semaglutide");

  const glp1Options = [
    {
      id: "liraglutide",
      name: "Liraglutide (Victoza)",
      class: "GLP-1 RA",
      frequency: "Daily",
      dosing: "Start 0.6 mg → 1.2 mg → 1.8 mg",
      pen: "Prefilled pen, dial dose",
      injection: "SC abdomen, thigh, or upper arm",
      timing: "Any time of day, with or without meals",
      storage: "Refrigerate 2-8°C; in-use 30 days at room temp",
      a1cReduction: "1.0-1.5%",
      weightLoss: "3-4 kg",
      cvBenefit: "Yes (LEADER trial)",
      notes: "Nausea common — start low, titrate slowly",
    },
    {
      id: "semaglutide-sc",
      name: "Semaglutide (Ozempic)",
      class: "GLP-1 RA",
      frequency: "Weekly",
      dosing: "Start 0.25 mg → 0.5 mg → 1.0 mg → 2.0 mg",
      pen: "Prefilled pen, 4 doses per pen",
      injection: "SC abdomen, thigh, or upper arm",
      timing: "Same day each week, any time",
      storage: "Refrigerate; in-use 56 days at room temp",
      a1cReduction: "1.5-1.8%",
      weightLoss: "4-6 kg",
      cvBenefit: "Yes (SUSTAIN-6)",
      notes: "Hold if significant GI symptoms; injection site rotation",
    },
    {
      id: "dulaglutide",
      name: "Dulaglutide (Trulicity)",
      class: "GLP-1 RA",
      frequency: "Weekly",
      dosing: "Start 0.75 mg → 1.5 mg → 3.0 mg",
      pen: "Single-dose prefilled pen",
      injection: "SC abdomen, thigh, or upper arm",
      timing: "Any time, same day each week",
      storage: "Refrigerate; in-use 14 days at room temp",
      a1cReduction: "1.0-1.5%",
      weightLoss: "2-3 kg",
      cvBenefit: "Yes (REWIND)",
      notes: "Lowest injection volume; hidden needle design",
    },
    {
      id: "tirzepatide",
      name: "Tirzepatide (Mounjaro)",
      class: "Dual GIP/GLP-1",
      frequency: "Weekly",
      dosing: "Start 2.5 mg → 5 mg → 7.5 mg → 10 mg → 12.5 mg → 15 mg",
      pen: "Single-dose prefilled pen",
      injection: "SC abdomen, thigh, or upper arm",
      timing: "Same day each week, any time",
      storage: "Refrigerate; in-use 21 days at room temp",
      a1cReduction: "2.0-2.5%",
      weightLoss: "8-12 kg",
      cvBenefit: "Pending (SURPASS-CVOT)",
      notes: "Highest efficacy; GI effects dose-limiting",
    },
  ];

  const selected = glp1Options.find(g => g.id === selectedGLP1) || glp1Options[0];

  return (
    <Card className="clinical-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Syringe className="h-4 w-4 text-accent" />
          </div>
          <CardTitle className="text-base">GLP-1 Receptor Agonist Guide</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {glp1Options.map((glp1) => (
            <button
              key={glp1.id}
              onClick={() => setSelectedGLP1(glp1.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                selectedGLP1 === glp1.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {glp1.name.split(" ")[0]}
            </button>
          ))}
        </div>

        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold">{selected.name}</p>
              <p className="text-xs text-muted-foreground">{selected.class} · {selected.frequency}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">A1c ↓ {selected.a1cReduction}</Badge>
              <Badge variant="outline" className="text-xs">Weight ↓ {selected.weightLoss}</Badge>
              {selected.cvBenefit !== "No" && (
                <Badge variant="secondary" className="text-xs">CV Benefit ✓</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground block">Dosing</span>
                <span>{selected.dosing}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Injection Site</span>
                <span>{selected.injection}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Timing</span>
                <span>{selected.timing}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground block">Storage</span>
                <span>{selected.storage}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Pen Device</span>
                <span>{selected.pen}</span>
              </div>
              <div className="p-2 rounded bg-background/50">
                <span className="text-xs text-muted-foreground block">Clinical Notes</span>
                <span className="text-xs">{selected.notes}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Common Side Effects</p>
          <div className="flex flex-wrap gap-2">
            {["Nausea (~20%)", "Vomiting (~10%)", "Diarrhea (~15%)", "Constipation (~10%)", "Abdominal pain (~5%)"].map((sideEffect, i) => (
              <Badge key={i} variant="outline" className="text-xs">{sideEffect}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            GI effects usually transient (2-4 weeks). Start at lowest dose and titrate slowly.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Contraindications & Warnings</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>• Personal/family history of medullary thyroid carcinoma (MTC)</li>
                <li>• MEN2 syndrome</li>
                <li>• History of pancreatitis — use with caution</li>
                <li>• Gastroparesis — may worsen symptoms</li>
                <li>• Gallbladder disease — increased risk of cholelithiasis</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Drug Classes Comparison
const DrugClassesComparison = () => {
  const drugClasses = [
    {
      class: "Metformin",
      mechanism: "↓ Hepatic gluconeogenesis, ↑ insulin sensitivity",
      a1cReduction: "1.0-1.5%",
      weight: "Neutral",
      hypoRisk: "Low",
      advantages: ["First-line", "Cardioprotection", "Low cost", "No hypoglycemia"],
      disadvantages: ["GI side effects", "B12 deficiency", "Lactic acidosis risk", "eGFR <30 contraindicated"],
    },
    {
      class: "SGLT2 Inhibitors",
      mechanism: "↓ Renal glucose reabsorption",
      a1cReduction: "0.5-1.0%",
      weight: "Loss 2-3 kg",
      hypoRisk: "Low",
      advantages: ["CV benefit", "Renal protection", "HF benefit", "BP reduction"],
      disadvantages: ["Genital infections", "Volume depletion", "DKA risk (rare)", "Cost"],
    },
    {
      class: "GLP-1 RAs",
      mechanism: "↑ Glucose-dependent insulin, ↓ glucagon, ↓ gastric emptying",
      a1cReduction: "1.0-1.8%",
      weight: "Loss 3-6 kg",
      hypoRisk: "Low",
      advantages: ["Superior A1c reduction", "Weight loss", "CV benefit", "Once weekly options"],
      disadvantages: ["Injectable", "GI effects", "Cost", "MTC warning"],
    },
    {
      class: "DPP-4 Inhibitors",
      mechanism: "↑ Endogenous incretins",
      a1cReduction: "0.5-0.8%",
      weight: "Neutral",
      hypoRisk: "Low",
      advantages: ["Weight neutral", "Well tolerated", "Oral", "No hypoglycemia"],
      disadvantages: ["No CV benefit", "Cost", "HF risk (saxagliptin)", "Pancreatitis concern"],
    },
    {
      class: "Sulfonylureas",
      mechanism: "Stimulate insulin secretion from β-cells",
      a1cReduction: "1.0-1.5%",
      weight: "Gain 2-4 kg",
      hypoRisk: "Moderate-High",
      advantages: ["Inexpensive", "Effective", "Rapid onset"],
      disadvantages: ["Hypoglycemia", "Weight gain", "Secondary failure", "Avoid in CKD/elders"],
    },
    {
      class: "TZDs (Pioglitazone)",
      mechanism: "↑ Insulin sensitivity in muscle and fat",
      a1cReduction: "0.8-1.0%",
      weight: "Gain 3-5 kg",
      hypoRisk: "Low",
      advantages: ["Durable control", "NASH benefit", "Low hypoglycemia", "Inexpensive"],
      disadvantages: ["Weight gain", "Edema", "HF contraindication", "Fracture risk"],
    },
  ];

  return (
    <Card className="clinical-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Pill className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base">Drug Classes Quick Reference</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {drugClasses.map((drug, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium"><AbbrText text={drug.class} /></p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">A1c ↓ {drug.a1cReduction}</Badge>
                  <Badge variant={drug.hypoRisk === "Low" ? "secondary" : "destructive"} className="text-xs">
                    Hypo: {drug.hypoRisk}
                  </Badge>
                </div>
              </div>              <p className="text-xs text-muted-foreground mb-2"><AbbrText text={drug.mechanism} /></p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Weight: </span>
                  <span className={cn(
                    drug.weight.includes("Loss") ? "text-success" : drug.weight.includes("Gain") ? "text-warning" : ""
                  )}><AbbrText text={drug.weight} /></span>
                </div>
                <div>
                  <span className="text-muted-foreground">Weight: </span>
                  <span><AbbrText text={drug.weight} /></span>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="text-xs">
                  <p className="text-success font-medium mb-0.5">Pros</p>
                  <ul className="text-muted-foreground space-y-0.5">
                    {drug.advantages.slice(0, 2).map((adv, j) => (
                      <li key={j}>• {adv}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs">
                  <p className="text-destructive font-medium mb-0.5">Cons</p>
                  <ul className="text-muted-foreground space-y-0.5">
                    {drug.disadvantages.slice(0, 2).map((dis, j) => (
                      <li key={j}>• {dis}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Management Checklist
const ManagementChecklist = () => {
  const checklist = [
    { category: "Monitoring", items: [
      "HbA1c every 3 months until stable, then every 6 months",
      "SMBG or CGM for insulin-treated patients",
      "Blood pressure at every visit",
      "Weight and BMI calculation",
    ]},
    { category: "Laboratory", items: [
      "Annual comprehensive metabolic panel",
      "Annual lipid panel",
      "Annual urine albumin-to-creatinine ratio",
      "Annual eGFR (more frequent if CKD)",
      "Annual dilated eye exam",
      "Annual comprehensive foot exam",
    ]},
    { category: "Immunizations", items: [
      "Influenza annually",
      "Pneumococcal (PCV20 or PCV15 + PPSV23)",
      "Hepatitis B series (if not immune)",
      "COVID-19 per current guidelines",
    ]},
  ];

  return (
    <Card className="clinical-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-success" />
          </div>
          <CardTitle className="text-base">Annual Care Checklist</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checklist.map((section, i) => (
            <div key={i}>
              <p className="text-sm font-medium mb-2">{section.category}</p>
              <div className="space-y-1">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

import InsulinGuide from "./InsulinGuide";

// Main Component
export default function DiabetesTreatment() {
  const [activeTab, setActiveTab] = useState<"algorithm" | "glp1" | "drugs" | "insulin" | "checklist">("algorithm");

  return (
    <div className="space-y-4">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: "algorithm", label: "Treatment Algorithm", icon: Brain },
          { id: "glp1", label: "GLP-1 Guide", icon: Syringe },
          { id: "insulin", label: "Insulin Guide", icon: Activity },
          { id: "drugs", label: "Drug Classes", icon: Pill },
          { id: "checklist", label: "Care Checklist", icon: FileText },
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

      {activeTab === "algorithm" && <TreatmentAlgorithm />}
      {activeTab === "glp1" && <GLP1AdministrationGuide />}
      {activeTab === "insulin" && <InsulinGuide />}
      {activeTab === "drugs" && <DrugClassesComparison />}
      {activeTab === "checklist" && <ManagementChecklist />}
    </div>
  );
}
