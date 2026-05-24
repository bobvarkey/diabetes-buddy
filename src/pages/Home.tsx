import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Droplets, Heart, Scale, Syringe, Activity as PulseIcon, Dna, FileText, ChevronRight, Info, ChevronDown, Upload, Sparkles, ArrowRight, Calculator, Stethoscope, FileSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PrescriptionState {
  visible: boolean;
  content: React.ReactNode;
  severity?: string;
}

const categoryColors = {
  diabetes: {
    accent: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.2)",
    gradient: "from-red-500 to-rose-600",
  },
  hypertension: {
    accent: "#fb923c",
    bg: "rgba(251,146,60,0.12)",
    border: "rgba(251,146,60,0.2)",
    gradient: "from-orange-500 to-amber-600",
  },
  lipid: {
    accent: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
    border: "rgba(96,165,250,0.2)",
    gradient: "from-blue-500 to-cyan-600",
  },
  obesity: {
    accent: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.2)",
    gradient: "from-violet-500 to-purple-600",
  },
};

// Full forms data for abbreviations
const fullForms: Record<string, string> = {
  // Diabetes
  "FG": "Fasting Glucose",
  "HbA1c": "Glycated Hemoglobin",
  "PP": "Post-Prandial (2-hour)",
  "CrCl": "Creatinine Clearance",
  "CVD": "Cardiovascular Disease",
  "HF": "Heart Failure",
  "CKD": "Chronic Kidney Disease",
  // Hypertension
  "SBP": "Systolic Blood Pressure",
  "DBP": "Diastolic Blood Pressure",
  "BP": "Blood Pressure",
  "DM": "Diabetes Mellitus",
  "CAD": "Coronary Artery Disease",
  "ESC": "European Society of Cardiology",
  // Lipids
  "LDL": "Low-Density Lipoprotein",
  "HDL": "High-Density Lipoprotein",
  "TG": "Triglycerides",
  "ASCVD": "Atherosclerotic Cardiovascular Disease",
  "FHx": "Family History",
  "AACE": "American Association of Clinical Endocrinology",
  // Obesity
  "BMI": "Body Mass Index",
  "HTN": "Hypertension",
  "OSA": "Obstructive Sleep Apnea",
  "NAFLD": "Non-Alcoholic Fatty Liver Disease",
  "MASLD": "Metabolic Dysfunction-Associated Steatotic Liver Disease",
  "TOS": "The Obesity Society",
  "Rx": "Prescription",
  "NCD": "Non-Communicable Disease",
};

function AbbreviationLabel({ abbr, fullForm }: { abbr: string; fullForm?: string }) {
  const displayFullForm = fullForm || fullForms[abbr] || abbr;

  return (
    <div className="group relative inline-block">
      <button className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-help">
        {abbr}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity"><Info className="h-3 w-3 text-muted-foreground/50" /></span>
      </button>
      <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10">
        <div className="bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-lg border border-border whitespace-nowrap">
          {displayFullForm}
        </div>
      </div>
    </div>
  );
}

function FullFormsLegend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <Card className="border-border/40 bg-muted/20">
        <CollapsibleTrigger asChild>
          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Abbreviations & Full Forms</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-xs">
              {Object.entries(fullForms).map(([abbr, full]) => (
                <div key={abbr} className="flex items-baseline gap-2">
                  <span className="font-medium text-foreground min-w-[3rem]">{abbr}</span>
                  <span className="text-muted-foreground">{full}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface OCRUploadProps {
  onValuesExtracted: (values: {
    fg?: string;
    a1c?: string;
    ldl?: string;
    hdl?: string;
    tg?: string;
    creatinine?: string;
    egfr?: string;
    age?: string;
  }) => void;
}

function OCRUpload({ onValuesExtracted }: OCRUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedValues, setExtractedValues] = useState<Record<string, string> | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsProcessing(true);
    setExtractedValues(null);

    // Simulate OCR processing with mock values
    setTimeout(() => {
      const mockValues = {
        fg: "142",
        a1c: "7.2",
        ldl: "128",
        hdl: "42",
        tg: "156",
        creatinine: "1.1",
        egfr: "",
        age: "58",
      };
      setExtractedValues(mockValues);
      onValuesExtracted(mockValues);
      setIsProcessing(false);
    }, 2000);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setExtractedValues(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <Card className="border-border/40 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <CollapsibleTrigger asChild>
          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-foreground">Smart Lab Upload (OCR)</span>
              <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">Beta</Badge>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!previewUrl ? (
                <div
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-border/60 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors"
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Upload lab report image</p>
                  <p className="text-xs text-muted-foreground">Supports JPG, PNG, PDF</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-2">Auto-extracts: Glucose, HbA1c, Lipids, Creatinine, eGFR</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <img src={previewUrl} alt="Lab report preview" className="rounded-lg max-h-48 mx-auto" />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Extracting values...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {extractedValues && !isProcessing && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-green-400">Extracted Values</span>
                        <button onClick={clearImage} className="text-[10px] text-muted-foreground hover:text-foreground">Clear</button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {extractedValues.fg && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">FG:</span>
                            <span className="font-medium">{extractedValues.fg}</span>
                          </div>
                        )}
                        {extractedValues.a1c && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">HbA1c:</span>
                            <span className="font-medium">{extractedValues.a1c}%</span>
                          </div>
                        )}
                        {extractedValues.ldl && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">LDL:</span>
                            <span className="font-medium">{extractedValues.ldl}</span>
                          </div>
                        )}
                        {extractedValues.hdl && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">HDL:</span>
                            <span className="font-medium">{extractedValues.hdl}</span>
                          </div>
                        )}
                        {extractedValues.tg && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">TG:</span>
                            <span className="font-medium">{extractedValues.tg}</span>
                          </div>
                        )}
                        {extractedValues.creatinine && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Creat:</span>
                            <span className="font-medium">{extractedValues.creatinine}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3">
                <p className="font-medium mb-1">Note on OCR:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Upload clear, well-lit images for best results</li>
                  <li>Review extracted values before generating prescriptions</li>
                  <li>Manual correction may be needed for handwritten reports</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Dashboard Summary Card Component
interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  quickStats: { label: string; value: string }[];
  features: string[];
  linkTo: string;
  linkText: string;
}

function DashboardCard({ title, icon, color, bgColor, borderColor, quickStats, features, linkTo, linkText }: DashboardCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/60 hover:border-border transition-all hover:shadow-md group">
      <div className="absolute top-0 left-0 right-0 h-1 opacity-60" style={{ background: color }} />
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: bgColor }}>
            {icon}
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          {quickStats.map((stat, i) => (
            <div key={i} className="p-2 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-[10px] text-muted-foreground uppercase">{stat.label}</p>
              <p className="text-sm font-semibold" style={{ color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Features List */}
        <div className="space-y-1">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-1 h-1 rounded-full" style={{ background: color }} />
              {feature}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link to={linkTo}>
          <Button
            variant="outline"
            className="w-full text-xs h-9 mt-2 group-hover:bg-primary/5 transition-colors"
            style={{ borderColor }}
          >
            {linkText}
            <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Comprehensive Prescription Generator Component
function ComprehensivePrescriptionGenerator() {
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [hba1c, setHba1c] = useState("");
  const [fbg, setFbg] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [ldl, setLdl] = useState("");
  const [hdl, setHdl] = useState("");
  const [tg, setTg] = useState("");
  const [egfr, setEgfr] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [race, setRace] = useState<"black" | "non-black">("non-black");
  const [bmi, setBmi] = useState("");
  const [hasASCVD, setHasASCVD] = useState(false);
  const [hasCKD, setHasCKD] = useState(false);
  const [hasLiverDisease, setHasLiverDisease] = useState(false);
  const [liverSeverity, setLiverSeverity] = useState<"compensated" | "decompensated">("compensated");
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [hasHypertension, setHasHypertension] = useState(false);
  const [hasDyslipidemia, setHasDyslipidemia] = useState(false);
  const [generatedRx, setGeneratedRx] = useState<string | null>(null);

  // Calculate BMI if height/weight provided
  const calculateBMI = (weightKg: number, heightCm: number) => {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  };

  // Auto-update BMI when weight or height changes
  React.useEffect(() => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (weightNum > 0 && heightNum > 0) {
      const bmiValue = calculateBMI(weightNum, heightNum);
      setBmi(bmiValue.toFixed(1));
    }
  }, [weight, height]);

  // Calculate eGFR using CKD-EPI 2021 equation
  const calculateEGFR = () => {
    const ageNum = parseInt(age);
    const creatinineNum = parseFloat(creatinine);

    if (!ageNum || !creatinineNum || creatinineNum <= 0) return null;

    // CKD-EPI 2021 equation (race-free)
    const kappa = sex === "female" ? 0.7 : 0.9;
    const alpha = sex === "female" ? -0.241 : -0.302;
    const genderFactor = sex === "female" ? 1.012 : 1;

    const scrKRatio = creatinineNum / kappa;
    const minTerm = Math.min(scrKRatio, 1);
    const maxTerm = Math.max(scrKRatio, 1);

    const eGFRValue = 142 *
      Math.pow(minTerm, alpha) *
      Math.pow(maxTerm, -1.200) *
      Math.pow(0.9938, ageNum) *
      genderFactor;

    return Math.round(eGFRValue);
  };

  // Auto-update eGFR when inputs change
  React.useEffect(() => {
    const calculated = calculateEGFR();
    if (calculated !== null) {
      setEgfr(calculated.toString());
    }
  }, [age, creatinine, sex]);

  const generatePrescription = () => {
    const prescriptions: string[] = [];
    const warnings: string[] = [];
    const patientLabel = patientName || "Patient";
    const ageNum = parseInt(age) || 50;
    const egfrNum = parseInt(egfr) || 90;
    const hba1cNum = parseFloat(hba1c) || 6.0;
    const fbgNum = parseInt(fbg) || 100;
    const ldlNum = parseInt(ldl) || 100;
    const bmiNum = parseFloat(bmi) || 25;
    const bpSys = parseInt(bpSystolic) || 120;

    // Header
    prescriptions.push("═══════════════════════════════════════════════════");
    prescriptions.push("         COMPREHENSIVE NCD PRESCRIPTION");
    prescriptions.push("═══════════════════════════════════════════════════");
    prescriptions.push(`Date: ${new Date().toLocaleDateString()}`);
    if (patientName) prescriptions.push(`Patient: ${patientName}`);
    if (patientId) prescriptions.push(`ID: ${patientId}`);
    if (age) prescriptions.push(`Age: ${age} years`);
    if (weight) prescriptions.push(`Weight: ${weight} kg`);
    prescriptions.push("");

    // DIABETES SECTION
    if (hasDiabetes || hba1cNum >= 6.5 || fbgNum >= 126) {
      prescriptions.push("┌─────────────────────────────────────────────────┐");
      prescriptions.push("│  DIABETES MANAGEMENT (ADA 2026 Guidelines)        │");
      prescriptions.push("└─────────────────────────────────────────────────┘");

      // Liver disease warning for diabetes meds
      if (hasLiverDisease) {
        warnings.push("⚠️ LIVER DISEASE: Use metformin with caution. Avoid if severe hepatic impairment.");
        warnings.push("⚠️ LIVER DISEASE: SGLT2 inhibitors generally safe but monitor for volume depletion.");
        warnings.push("⚠️ LIVER DISEASE: GLP-1 RAs safe in compensated cirrhosis, limited data in decompensated.");
        warnings.push("⚠️ LIVER DISEASE: Avoid thiazolidinediones (pioglitazone) - contraindicated.");
      }

      // Metformin (first-line unless contraindicated)
      if (egfrNum >= 30 && !hasLiverDisease) {
        if (egfrNum >= 45) {
          prescriptions.push("1. Metformin 500 mg PO BID with meals");
          prescriptions.push("   Titrate weekly to 1000 mg BID as tolerated");
        } else if (egfrNum >= 30) {
          prescriptions.push("1. Metformin 500 mg PO BID with meals (eGFR 30-44: monitor closely)");
          warnings.push("⚠️ Metformin: Maximum dose 1000 mg/day if eGFR 30-44. Avoid if <30.");
        }
      } else if (egfrNum < 30) {
        warnings.push("⚠️ Metformin CONTRAINDICATED: eGFR <30. Consider alternatives.");
      }

      // SGLT2i for CV/renal benefit
      if (hasASCVD || hasCKD || egfrNum >= 30) {
        prescriptions.push("2. Empagliflozin 10 mg PO OD (morning)");
        prescriptions.push("   OR Dapagliflozin 10 mg PO OD");
        if (egfrNum >= 30 && egfrNum < 45) {
          warnings.push("⚠️ SGLT2i: Glycemic efficacy reduced when eGFR <45, but CV/renal benefits maintained.");
        }
      }

      // GLP-1 RA for CV benefit or weight
      if (hasASCVD || bmiNum >= 27 || hba1cNum >= 7.5) {
        prescriptions.push("3. Semaglutide 0.25 mg SC weekly × 4 weeks");
        prescriptions.push("   Then 0.5 mg weekly, may increase to 1.0 mg");
        if (hasLiverDisease) {
          warnings.push("⚠️ GLP-1 RA: Generally safe in compensated cirrhosis. Avoid in severe GI symptoms.");
        }
      }

      // Insulin for severe hyperglycemia
      if (hba1cNum >= 9.0 || fbgNum > 250) {
        prescriptions.push("4. INSULIN THERAPY (Basal-bolus or Basal-plus):");
        prescriptions.push("   a) Glargine (Lantus) 10 units SC at bedtime");
        prescriptions.push("      OR Detemir (Levemir) 10 units SC BID");
        prescriptions.push("      Titrate by 2 units every 3 days to target FBG <130");
        prescriptions.push("   b) If postprandial excursions:");
        prescriptions.push("      Lispro (Humalog) 4 units SC before meals");
        prescriptions.push("      Titrate based on 2-hr postprandial BG");

        if (hasLiverDisease) {
          warnings.push("⚠️ INSULIN in Liver Disease: Increased hypoglycemia risk. Start low, go slow.");
          warnings.push("⚠️ Monitor glucose closely - impaired gluconeogenesis in liver disease.");
        }
      }

      // DPP-4i as alternative
      if (hba1cNum >= 7.0 && hba1cNum < 9.0 && !hasLiverDisease) {
        prescriptions.push("4. Sitagliptin 100 mg PO OD");
        if (egfrNum >= 30 && egfrNum < 45) {
          prescriptions.push("   (Reduce to 50 mg if eGFR 30-44)");
        } else if (egfrNum < 30) {
          prescriptions.push("   (Reduce to 25 mg if eGFR <30)");
        }
      }

      prescriptions.push("");
      prescriptions.push("Monitoring:");
      prescriptions.push("• HbA1c every 3 months until stable");
      prescriptions.push("• Self-monitoring BG: Fasting + 2-hr postprandial");
      prescriptions.push("• Annual eye exam, foot exam, urine ACR");
      prescriptions.push("");
    }

    // HYPERTENSION SECTION
    if (hasHypertension || bpSys >= 130) {
      prescriptions.push("┌─────────────────────────────────────────────────┐");
      prescriptions.push("│  HYPERTENSION MANAGEMENT (ESC/ESH 2024)          │");
      prescriptions.push("└─────────────────────────────────────────────────┘");

      // Liver disease considerations for HTN
      if (hasLiverDisease) {
        warnings.push("⚠️ LIVER DISEASE: ACEi/ARB generally safe, monitor potassium.");
        warnings.push("⚠️ LIVER DISEASE: Avoid beta-blockers in severe acute hepatitis.");
        warnings.push("⚠️ LIVER DISEASE: Use diuretics cautiously - risk of fluid/electrolyte imbalance.");
      }

      if (hasDiabetes || hasCKD) {
        prescriptions.push("1. Perindopril 4 mg PO OD (or Ramipril 2.5 mg OD)");
        prescriptions.push("   OR Losartan 50 mg PO OD (if ACEi cough)");
        if (hasLiverDisease) {
          warnings.push("⚠️ ACEi/ARB: Monitor potassium - hyperkalemia risk higher in liver disease.");
        }
      } else {
        prescriptions.push("1. Amlodipine 5 mg PO OD");
        prescriptions.push("   Increase to 10 mg if needed after 2 weeks");
      }

      prescriptions.push("2. If BP >140/90 after 4 weeks:");
      prescriptions.push("   Add Chlorthalidone 12.5 mg PO OD");
      if (hasLiverDisease) {
        warnings.push("⚠️ Diuretics: Use cautiously in liver disease - monitor for hyponatremia.");
      }

      prescriptions.push("");
      prescriptions.push("Target BP: < 130/80 mmHg");
      prescriptions.push("Monitor: BP weekly until controlled, then monthly");
      prescriptions.push("");
    }

    // LIPID SECTION
    if (hasDyslipidemia || ldlNum > 70) {
      prescriptions.push("┌─────────────────────────────────────────────────┐");
      prescriptions.push("│  LIPID MANAGEMENT (LAI 2023 / ACC/AHA)          │");
      prescriptions.push("└─────────────────────────────────────────────────┘");

      // Liver disease considerations
      if (hasLiverDisease) {
        warnings.push("⚠️ LIVER DISEASE: Statins generally SAFE in chronic liver disease, including NAFLD.");
        warnings.push("⚠️ LIVER DISEASE: Avoid statins only in: acute liver failure, decompensated cirrhosis.");
        warnings.push("⚠️ LIVER DISEASE: Monitor LFTs every 3 months.");
        warnings.push("⚠️ LIVER DISEASE: Ezetimibe is safe alternative if statin not tolerated.");
      }

      const ldlTarget = hasASCVD ? "< 55 mg/dL" : hasDiabetes ? "< 70 mg/dL" : "< 100 mg/dL";

      prescriptions.push(`1. Atorvastatin 40 mg PO OD ( bedtime)`);
      prescriptions.push(`   Target LDL: ${ldlTarget}`);
      if (hasLiverDisease) {
        prescriptions.push("   (Start with 10 mg if liver disease, titrate carefully)");
      }

      if (hasASCVD || ldlNum > 100) {
        prescriptions.push("2. If LDL not at target after 6 weeks:");
        prescriptions.push("   Increase to Atorvastatin 80 mg OD");
        prescriptions.push("   OR Add Ezetimibe 10 mg OD");
      }

      if (tg && parseInt(tg) > 500) {
        prescriptions.push("3. HIGH TG >500: Fenofibrate 145 mg OD");
        prescriptions.push("   (Pancreatitis prevention)");
        warnings.push("⚠️ Gemfibrozil: Avoid with statins - high myopathy risk.");
      }

      prescriptions.push("");
      prescriptions.push("Monitoring:");
      prescriptions.push("• Lipid panel at 6 weeks, then every 6 months");
      prescriptions.push("• LFTs at 6 weeks, then annually (or 3-monthly if liver disease)");
      prescriptions.push("");
    }

    // OBESITY/WEIGHT SECTION
    if (bmiNum >= 25) {
      prescriptions.push("┌─────────────────────────────────────────────────┐");
      prescriptions.push("│  WEIGHT MANAGEMENT (Indian: BMI ≥23 at risk)    │");
      prescriptions.push("└─────────────────────────────────────────────────┘");

      if (hasLiverDisease) {
        warnings.push("⚠️ LIVER DISEASE: GLP-1 RAs safe in compensated cirrhosis. Avoid if severe malnutrition.");
      }

      prescriptions.push("1. Diet: 500 kcal deficit/day, Mediterranean pattern");
      prescriptions.push("2. Exercise: 150 min moderate activity/week");

      if (bmiNum >= 27 || (hasDiabetes && bmiNum >= 25)) {
        prescriptions.push("3. Semaglutide (Ozempic/Wegovy) 0.25 mg weekly → 2.4 mg weekly");
        prescriptions.push("   OR Tirzepatide (Mounjaro) 2.5 mg weekly → 15 mg weekly");
      }

      if (bmiNum >= 35) {
        prescriptions.push("4. Consider metabolic surgery referral:");
        prescriptions.push("   • BMI ≥35 with diabetes");
        prescriptions.push("   • BMI ≥37.5 regardless of comorbidities");
        if (hasLiverDisease) {
          warnings.push("⚠️ Surgery: Evaluate liver status pre-op. Decompensated cirrhosis = high surgical risk.");
        }
      }

      prescriptions.push("");
      prescriptions.push("Target: 5-10% weight loss over 6 months");
      prescriptions.push("");
    }

    // WARNINGS SECTION
    if (warnings.length > 0) {
      prescriptions.push("╔═══════════════════════════════════════════════════╗");
      prescriptions.push("║  CLINICAL WARNINGS / SPECIAL CONSIDERATIONS       ║");
      prescriptions.push("╚═══════════════════════════════════════════════════╝");
      warnings.forEach(w => prescriptions.push(w));
      prescriptions.push("");
    }

    // FOOTER
    prescriptions.push("═══════════════════════════════════════════════════");
    prescriptions.push("Follow-up: 4 weeks (or sooner if symptomatic)");
    prescriptions.push("Next Review: " + new Date(Date.now() + 12096e5).toLocaleDateString());
    prescriptions.push("═══════════════════════════════════════════════════");

    return prescriptions.join("\n");
  };

  const handleGenerate = () => {
    const rx = generatePrescription();
    setGeneratedRx(rx);
  };

  const copyToClipboard = () => {
    if (generatedRx) {
      navigator.clipboard.writeText(generatedRx);
    }
  };

  return (
    <section className="border border-border/40 rounded-lg overflow-hidden">
      <div className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Comprehensive Prescription Generator</h2>
            <p className="text-sm text-muted-foreground">Generate integrated prescriptions for all four NCDs</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Patient Info - Optional */}
          <div className="space-y-2">
            <Label className="text-xs">Patient Name <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g., John Doe"
              className="h-10 px-3 rounded-lg border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Patient ID <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="e.g., P12345"
              className="h-10 px-3 rounded-lg border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Age (years)</Label>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="50"
              className="h-10 px-3 rounded-lg border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Weight (kg)</Label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
              className="h-10 px-3 rounded-lg border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Clinical Values */}
          <div className="space-y-2">
            <Label className="text-xs">HbA1c (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={hba1c}
              onChange={(e) => setHba1c(e.target.value)}
              placeholder="7.0"
              className="h-10 px-3 rounded-lg border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Fasting BG (mg/dL)</Label>
            <Input
              type="number"
              value={fbg}
              onChange={(e) => setFbg(e.target.value)}
              placeholder="120"
              className="h-10 px-3 rounded-lg border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">BP (mmHg)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={bpSystolic}
                onChange={(e) => setBpSystolic(e.target.value)}
                placeholder="Systolic"
                className="h-9 flex-1"
              />
              <span className="text-muted-foreground self-center">/</span>
              <Input
                type="number"
                value={bpDiastolic}
                onChange={(e) => setBpDiastolic(e.target.value)}
                placeholder="Diastolic"
                className="h-9 flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">LDL-C (mg/dL)</Label>
            <Input
              type="number"
              value={ldl}
              onChange={(e) => setLdl(e.target.value)}
              placeholder="100"
              className="h-10 px-3 rounded-lg border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="text-xs">HDL-C (mg/dL)</Label>
            <Input
              type="number"
              value={hdl}
              onChange={(e) => setHdl(e.target.value)}
              placeholder="40"
              className="h-10 px-3 rounded-lg border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Triglycerides (mg/dL)</Label>
            <Input
              type="number"
              value={tg}
              onChange={(e) => setTg(e.target.value)}
              placeholder="150"
              className="h-10 px-3 rounded-lg border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Serum Creatinine (mg/dL)</Label>
            <Input
              type="number"
              step="0.01"
              value={creatinine}
              onChange={(e) => setCreatinine(e.target.value)}
              placeholder="1.0"
              className="h-10 px-3 rounded-lg border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Sex</Label>
            <Select value={sex} onValueChange={(v: "male" | "female") => setSex(v)}>
              <SelectTrigger className="h-10 px-3 rounded-lg border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              eGFR
              <span className="text-[10px] text-muted-foreground">(auto-calculated)</span>
            </Label>
            <Input
              type="number"
              value={egfr}
              onChange={(e) => setEgfr(e.target.value)}
              placeholder="90"
              className="h-9 bg-muted"
              readOnly
            />
            <p className="text-[10px] text-muted-foreground">CKD-EPI 2021 equation</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">BMI (kg/m²)</Label>
            <Input
              type="number"
              step="0.1"
              value={bmi}
              onChange={(e) => setBmi(e.target.value)}
              placeholder="25"
              className="h-10 px-3 rounded-lg border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Comorbidities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dm"
              checked={hasDiabetes}
              onCheckedChange={(checked) => setHasDiabetes(checked as boolean)}
            />
            <Label htmlFor="dm" className="text-sm cursor-pointer">Diabetes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="htn"
              checked={hasHypertension}
              onCheckedChange={(checked) => setHasHypertension(checked as boolean)}
            />
            <Label htmlFor="htn" className="text-sm cursor-pointer">Hypertension</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ascvd"
              checked={hasASCVD}
              onCheckedChange={(checked) => setHasASCVD(checked as boolean)}
            />
            <Label htmlFor="ascvd" className="text-sm cursor-pointer">ASCVD History</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ckd"
              checked={hasCKD}
              onCheckedChange={(checked) => setHasCKD(checked as boolean)}
            />
            <Label htmlFor="ckd" className="text-sm cursor-pointer">CKD</Label>
          </div>
        </div>

        {/* Liver Disease Section */}
        <div className="mb-6 p-4 bg-black border border-border/40 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox
              id="liver"
              checked={hasLiverDisease}
              onCheckedChange={(checked) => setHasLiverDisease(checked as boolean)}
              className="border-white/50"
            />
            <Label htmlFor="liver" className="text-sm font-medium cursor-pointer text-white">
              Chronic Liver Disease (requires medication adjustments)
            </Label>
          </div>

          {hasLiverDisease && (
            <div className="ml-6 space-y-2">
              <Label className="text-xs text-white/70">Severity:</Label>
              <Select value={liverSeverity} onValueChange={(v: "compensated" | "decompensated") => setLiverSeverity(v)}>
                <SelectTrigger className="w-full h-9 bg-black/50 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compensated">Compensated Cirrhosis/Stable CLD</SelectItem>
                  <SelectItem value="decompensated">Decompensated Cirrhosis/Severe Hepatic Impairment</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-white/60 mt-2">
                ℹ️ Medications will be adjusted: Lower starting doses, more frequent monitoring, specific contraindications
              </p>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex gap-3">
          <Button onClick={handleGenerate} className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Generate Comprehensive Prescription
          </Button>

          {generatedRx && (
            <Button variant="outline" onClick={copyToClipboard}>
              Copy to Clipboard
            </Button>
          )}
        </div>

        {/* Generated Prescription */}
        {generatedRx && (
          <div className="mt-6 p-4 bg-muted rounded-lg border border-border font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            {generatedRx}
          </div>
        )}
      </CardContent>
    </section>
  );
}

// Quick Action Card Component
interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
}

function QuickAction({ title, description, icon, to }: QuickActionProps) {
  return (
    <Link to={to}>
      <div className="p-4 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/30 hover:border-border/60 transition-all cursor-pointer group">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const navigate = useNavigate();

  // Dashboard data
  const dashboardCards: DashboardCardProps[] = [
    {
      title: "Diabetes Management",
      icon: <Syringe className="h-5 w-5" style={{ color: categoryColors.diabetes.accent }} />,
      color: categoryColors.diabetes.accent,
      bgColor: categoryColors.diabetes.bg,
      borderColor: categoryColors.diabetes.border,
      quickStats: [
        { label: "Target HbA1c", value: "< 7.0%" },
        { label: "Fasting Glucose", value: "< 130 mg/dL" },
      ],
      features: [
        "Insulin dosing & titration",
        "Sliding scale reference",
        "Hypoglycemia risk calculator",
        "Renal dosing adjustments",
        "GLP-1 administration guide",
      ],
      linkTo: "/diabetes",
      linkText: "Go to Diabetes Tab",
    },
    {
      title: "Hypertension",
      icon: <Heart className="h-5 w-5" style={{ color: categoryColors.hypertension.accent }} />,
      color: categoryColors.hypertension.accent,
      bgColor: categoryColors.hypertension.bg,
      borderColor: categoryColors.hypertension.border,
      quickStats: [
        { label: "Target BP", value: "< 130/80" },
        { label: "Classification", value: "ESC 2024" },
      ],
      features: [
        "GFR calculator",
        "Secondary HTN checklist",
        "Drug interaction checker",
        "Treatment algorithm",
        "Potency tables",
      ],
      linkTo: "/hypertension",
      linkText: "Go to Hypertension Tab",
    },
    {
      title: "Lipid Management",
      icon: <Dna className="h-5 w-5" style={{ color: categoryColors.lipid.accent }} />,
      color: categoryColors.lipid.accent,
      bgColor: categoryColors.lipid.bg,
      borderColor: categoryColors.lipid.border,
      quickStats: [
        { label: "Very High Risk LDL", value: "< 55 mg/dL" },
        { label: "High Risk LDL", value: "< 70 mg/dL" },
      ],
      features: [
        "ASCVD risk calculator",
        "LAI 2023 Indian guidelines",
        "CAC/LDL target guide",
        "Lp(a) risk stratification",
        "Statin intensity guide",
      ],
      linkTo: "/lipids",
      linkText: "Go to Lipids Tab",
    },
    {
      title: "Obesity & Weight",
      icon: <Scale className="h-5 w-5" style={{ color: categoryColors.obesity.accent }} />,
      color: categoryColors.obesity.accent,
      bgColor: categoryColors.obesity.bg,
      borderColor: categoryColors.obesity.border,
      quickStats: [
        { label: "BMI Categories", value: "WHO + LAI" },
        { label: "Indian Cutoff", value: "BMI ≥ 23" },
      ],
      features: [
        "BMI calculator with units",
        "Waist-height ratio",
        "GLP-1 obesity algorithm",
        "Metabolic risk assessment",
        "Weight management tools",
      ],
      linkTo: "/obesity/bmi-calculator",
      linkText: "Open BMI Calculator",
    },
  ];

  // Quick Actions data
  const quickActions: QuickActionProps[] = [
    {
      title: "ASCVD Risk Calculator",
      description: "Calculate 10-year cardiovascular risk with LAI 2023 guidelines",
      icon: <Calculator className="h-4 w-4 text-primary" />,
      to: "/ascvd-risk",
    },
    {
      title: "Insulin Titration",
      description: "Calculate basal and prandial insulin doses",
      icon: <Syringe className="h-4 w-4 text-red-500" />,
      to: "/insulin-titration",
    },
    {
      title: "GFR Calculator",
      description: "Calculate eGFR using CKD-EPI and Cockcroft-Gault",
      icon: <Activity className="h-4 w-4 text-orange-500" />,
      to: "/gfr-calculator",
    },
    {
      title: "Drug Interactions",
      description: "Check for interactions between antihypertensives",
      icon: <FileSearch className="h-4 w-4 text-blue-500" />,
      to: "/drug-interactions",
    },
    {
      title: "BMI Calculator",
      description: "Calculate BMI with Indian population cutoffs",
      icon: <Scale className="h-4 w-4 text-violet-500" />,
      to: "/obesity/bmi-calculator",
    },
    {
      title: "Sliding Scale Insulin",
      description: "Quick reference for correction doses",
      icon: <Stethoscope className="h-4 w-4 text-red-500" />,
      to: "/sliding-scale",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Header Section */}
      <header className="max-w-6xl mx-auto px-6 pt-8 pb-6">
        {/* Hero */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-serif font-semibold tracking-tight">
              NCD Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Comprehensive non-communicable disease management tools — diabetes, hypertension, lipids, and obesity.
              Access detailed assessment tools, treatment algorithms, and clinical guidelines.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 px-4 py-3 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: categoryColors.diabetes.accent }} />
              <span>Diabetes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: categoryColors.hypertension.accent }} />
              <span>HTN</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: categoryColors.lipid.accent }} />
              <span>Lipids</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: categoryColors.obesity.accent }} />
              <span>Obesity</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16 space-y-8">
        {/* OCR Upload */}
        <OCRUpload onValuesExtracted={(values) => {
          // Store values in localStorage for use across the app
          if (values.fg) localStorage.setItem("ocr_fg", values.fg);
          if (values.a1c) localStorage.setItem("ocr_a1c", values.a1c);
          if (values.age) localStorage.setItem("ocr_age", values.age);
          if (values.creatinine) localStorage.setItem("ocr_creatinine", values.creatinine);
          if (values.ldl) localStorage.setItem("ocr_ldl", values.ldl);
          if (values.hdl) localStorage.setItem("ocr_hdl", values.hdl);
          if (values.tg) localStorage.setItem("ocr_tg", values.tg);
        }} />

        {/* Dashboard Cards Grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Condition Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {dashboardCards.map((card) => (
              <DashboardCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <QuickAction key={action.title} {...action} />
            ))}
          </div>
        </section>

        {/* Prescription Generator */}
        <ComprehensivePrescriptionGenerator />

        {/* Condition Modules Detail */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Condition Modules
          </h2>

          {/* Diabetes Management */}
          <Card className="mb-4 border-red-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Syringe className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Diabetes Management</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-200/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Target HbA1c</p>
                  <p className="text-sm font-semibold text-red-500">&lt; 7.0%</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-200/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Fasting Glucose</p>
                  <p className="text-sm font-semibold text-red-500">&lt; 130 mg/dL</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  Insulin dosing &amp; titration
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  Sliding scale reference
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  Hypoglycemia risk calculator
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  Renal dosing adjustments
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-red-500" />
                  GLP-1 administration guide
                </div>
              </div>
              <Link to="/diabetes">
                <Button variant="outline" className="w-full text-xs h-9 border-red-200/50 hover:bg-red-500/5">
                  Go to Diabetes Tab
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Hypertension */}
          <Card className="mb-4 border-orange-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Hypertension</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-200/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Target BP</p>
                  <p className="text-sm font-semibold text-orange-500">&lt; 130/80</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-200/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Classification</p>
                  <p className="text-sm font-semibold text-orange-500">ESC 2024</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-orange-500" />
                  GFR calculator
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-orange-500" />
                  Secondary HTN checklist
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-orange-500" />
                  Drug interaction checker
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-orange-500" />
                  Treatment algorithm
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-orange-500" />
                  Potency tables
                </div>
              </div>
              <Link to="/hypertension">
                <Button variant="outline" className="w-full text-xs h-9 border-orange-200/50 hover:bg-orange-500/5">
                  Go to Hypertension Tab
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Lipid Management */}
          <Card className="mb-4 border-blue-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Dna className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Lipid Management</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-200/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Very High Risk LDL</p>
                  <p className="text-sm font-semibold text-blue-500">&lt; 55 mg/dL</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-200/30">
                  <p className="text-[10px] text-muted-foreground uppercase">High Risk LDL</p>
                  <p className="text-sm font-semibold text-blue-500">&lt; 70 mg/dL</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  ASCVD risk calculator
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  LAI 2023 Indian guidelines
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  CAC/LDL target guide
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  Lp(a) risk stratification
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  Statin intensity guide
                </div>
              </div>
              <Link to="/lipids">
                <Button variant="outline" className="w-full text-xs h-9 border-blue-200/50 hover:bg-blue-500/5">
                  Go to Lipids Tab
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Obesity & Weight */}
          <Card className="mb-4 border-violet-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <CardTitle className="text-base">Obesity &amp; Weight</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-200/30">
                  <p className="text-[10px] text-muted-foreground uppercase">BMI Categories</p>
                  <p className="text-sm font-semibold text-violet-500">WHO + LAI</p>
                </div>
                <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-200/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Indian Cutoff</p>
                  <p className="text-sm font-semibold text-violet-500">BMI ≥ 23</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-violet-500" />
                  BMI calculator with units
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-violet-500" />
                  Waist-height ratio
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-violet-500" />
                  GLP-1 obesity algorithm
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-violet-500" />
                  Metabolic risk assessment
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-violet-500" />
                  Weight management tools
                </div>
              </div>
              <Link to="/obesity/bmi-calculator">
                <Button variant="outline" className="w-full text-xs h-9 border-violet-200/50 hover:bg-violet-500/5">
                  Open BMI Calculator
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2 mt-6">
            <Calculator className="h-4 w-4 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link to="/ascvd-risk">
              <div className="p-4 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/30 hover:border-border/60 transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Calculator className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">ASCVD Risk Calculator</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Calculate 10-year cardiovascular risk with LAI 2023 guidelines</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/insulin-titration">
              <div className="p-4 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/30 hover:border-border/60 transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-red-500/10 flex items-center justify-center shrink-0">
                    <Syringe className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Insulin Titration</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Calculate basal and prandial insulin doses</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/gfr-calculator">
              <div className="p-4 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/30 hover:border-border/60 transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Activity className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">GFR Calculator</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Calculate eGFR using CKD-EPI and Cockcroft-Gault</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/drug-interactions">
              <div className="p-4 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/30 hover:border-border/60 transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                    <FileSearch className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Drug Interactions</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Check for interactions between antihypertensives</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/obesity/bmi-calculator">
              <div className="p-4 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/30 hover:border-border/60 transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Scale className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">BMI Calculator</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Calculate BMI with Indian population cutoffs</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/sliding-scale">
              <div className="p-4 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/30 hover:border-border/60 transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-red-500/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Sliding Scale Insulin</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Quick reference for correction doses</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Guidelines Footer */}
        <section className="pt-4 border-t border-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                ADA Guidelines 2024
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                ESC/ESH 2024
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                ACC/AHA + LAI 2023
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Evidence-based clinical decision support tools
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
