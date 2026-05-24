import { useState, useEffect } from "react";
import { Pill, FlaskConical, Search, AlertTriangle, Calculator, RotateCcw, ArrowLeftRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";

type Sex = "male" | "female";
type CreatinineUnit = "mgdl" | "umol";

// ============ eGFR Calculation (CKD-EPI 2021) ============
function calculateCkdEpi(creatinine: number, age: number, sex: Sex): number {
  if (!creatinine || !age || !sex) return 0;
  const isFemale = sex === "female";
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const sexMultiplier = isFemale ? 1.012 : 1.0;
  const crRatio = creatinine / kappa;
  const minRatio = Math.min(crRatio, 1);
  const maxRatio = Math.max(crRatio, 1);
  const gfr = 142 * Math.pow(minRatio, alpha) * Math.pow(maxRatio, -1.200) * Math.pow(0.9938, age) * sexMultiplier;
  return Math.round(gfr * 10) / 10;
}

function getGfrStage(gfr: number): { stage: string; label: string; color: string } {
  if (gfr >= 90) return { stage: "G1", label: "Normal or High", color: "bg-green-100 text-green-700 border-green-200" };
  if (gfr >= 60) return { stage: "G2", label: "Mildly Decreased", color: "bg-green-100 text-green-700 border-green-200" };
  if (gfr >= 45) return { stage: "G3a", label: "Mild-Moderate", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
  if (gfr >= 30) return { stage: "G3b", label: "Moderate-Severe", color: "bg-orange-100 text-orange-700 border-orange-200" };
  if (gfr >= 15) return { stage: "G4", label: "Severely Decreased", color: "bg-red-100 text-red-700 border-red-200" };
  return { stage: "G5", label: "Kidney Failure", color: "bg-red-200 text-red-800 border-red-300" };
}

// ============ Drug Dosing Data ============
type DoseEntry = {
  drug: string;
  drugClass: string;
  normalDose: string;
  eGFR60_89: string;
  eGFR45_59: string;
  eGFR30_44: string;
  eGFR15_29: string;
  eGFRBelow15: string;
  notes: string;
};

const RENAL_DATA: DoseEntry[] = [
  {
    drug: "Metformin",
    drugClass: "Biguanide",
    normalDose: "500–2000 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "Max 1000 mg/day",
    eGFR15_29: "Contraindicated",
    eGFRBelow15: "Contraindicated",
    notes: "Do not initiate if eGFR <30. Reassess if <45.",
  },
  {
    drug: "Empagliflozin",
    drugClass: "SGLT2 Inhibitor",
    normalDose: "10–25 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "No adjustment",
    eGFR15_29: "Do not initiate; may continue",
    eGFRBelow15: "Contraindicated",
    notes: "CV/renal benefit persists at lower eGFR.",
  },
  {
    drug: "Dapagliflozin",
    drugClass: "SGLT2 Inhibitor",
    normalDose: "5–10 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "No adjustment",
    eGFR15_29: "Do not initiate; may continue",
    eGFRBelow15: "Contraindicated",
    notes: "Approved for CKD/HF regardless of diabetes.",
  },
  {
    drug: "Canagliflozin",
    drugClass: "SGLT2 Inhibitor",
    normalDose: "100–300 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "Max 100 mg/day",
    eGFR30_44: "Max 100 mg/day",
    eGFR15_29: "Contraindicated",
    eGFRBelow15: "Contraindicated",
    notes: "Monitor amputation risk.",
  },
  {
    drug: "Semaglutide (SC)",
    drugClass: "GLP-1 RA",
    normalDose: "0.25–2 mg/week",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "No adjustment",
    eGFR15_29: "Use with caution",
    eGFRBelow15: "Limited data",
    notes: "CV benefit proven.",
  },
  {
    drug: "Liraglutide",
    drugClass: "GLP-1 RA",
    normalDose: "0.6–1.8 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "No adjustment",
    eGFR15_29: "Use with caution",
    eGFRBelow15: "Not recommended",
    notes: "CV benefit proven.",
  },
  {
    drug: "Dulaglutide",
    drugClass: "GLP-1 RA",
    normalDose: "0.75–4.5 mg/week",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "No adjustment",
    eGFR15_29: "Use with caution",
    eGFRBelow15: "Not recommended",
    notes: "Weekly injection.",
  },
  {
    drug: "Sitagliptin",
    drugClass: "DPP-4 Inhibitor",
    normalDose: "25–100 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "50 mg/day",
    eGFR15_29: "25 mg/day",
    eGFRBelow15: "25 mg/day",
    notes: "Adjust dose by eGFR.",
  },
  {
    drug: "Linagliptin",
    drugClass: "DPP-4 Inhibitor",
    normalDose: "5 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "No adjustment",
    eGFR15_29: "No adjustment",
    eGFRBelow15: "No adjustment",
    notes: "No dose adjustment needed.",
  },
  {
    drug: "Glimepiride",
    drugClass: "Sulfonylurea",
    normalDose: "1–8 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "Reduce dose",
    eGFR30_44: "Reduce dose",
    eGFR15_29: "Avoid",
    eGFRBelow15: "Avoid",
    notes: "Risk of hypoglycemia.",
  },
  {
    drug: "Gliclazide",
    drugClass: "Sulfonylurea",
    normalDose: "30–120 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "Use low dose",
    eGFR15_29: "Avoid",
    eGFRBelow15: "Avoid",
    notes: "Partial oxidation.",
  },
  {
    drug: "Rosuvastatin",
    drugClass: "Statin",
    normalDose: "5–20 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "Start 5 mg",
    eGFR15_29: "Start 5 mg", 
    eGFRBelow15: "Start 5 mg",
    notes: "Pooled data for high-intensity.",
  },
  {
    drug: "Atorvastatin",
    drugClass: "Statin",
    normalDose: "20–80 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "No adjustment",
    eGFR15_29: "Use with caution",
    eGFRBelow15: "Use with caution",
    notes: "PK not significantly changed.",
  },
  {
    drug: "Spironolactone",
    drugClass: "MRA",
    normalDose: "12.5–50 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "Use with caution",
    eGFR30_44: "Avoid",
    eGFR15_29: "Avoid",
    eGFRBelow15: "Avoid",
    notes: "Hyperkalemia risk.",
  },
  {
    drug: "Furosemide",
    drugClass: "Loop Diuretic",
    normalDose: "20–80 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "May need higher",
    eGFR15_29: "May need higher",
    eGFRBelow15: "Higher doses",
    notes: "Diminished response at low eGFR.",
  },
  {
    drug: "Amlodipine",
    drugClass: "CCB",
    normalDose: "2.5–10 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "No adjustment",
    eGFR30_44: "No adjustment",
    eGFR15_29: "No adjustment",
    eGFRBelow15: "No adjustment",
    notes: "No dose adjustment.",
  },
  {
    drug: "Lisinopril",
    drugClass: "ACE Inhibitor",
    normalDose: "5–40 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "Use with caution",
    eGFR30_44: "Start low",
    eGFR15_29: "Avoid",
    eGFRBelow15: "Avoid",
    notes: "_monitor K+ and eGFR.",
  },
  {
    drug: "Losartan",
    drugClass: "ARB",
    normalDose: "50–100 mg/day",
    eGFR60_89: "No adjustment",
    eGFR45_59: "Use with caution",
    eGFR30_44: "Start low",
    eGFR15_29: "Avoid",
    eGFRBelow15: "Avoid",
    notes: "Monitor K+ and eGFR.",
  },
];

function getDoseByEGFR(entry: DoseEntry, gfr: number | null): { dose: string; highlight: boolean } {
  if (gfr === null) return { dose: entry.normalDose, highlight: false };
  if (gfr >= 60) return { dose: entry.eGFR60_89, highlight: gfr < 90 };
  if (gfr >= 45) return { dose: entry.eGFR45_59, highlight: true };
  if (gfr >= 30) return { dose: entry.eGFR30_44, highlight: true };
  if (gfr >= 15) return { dose: entry.eGFR15_29, highlight: true };
  return { dose: entry.eGFRBelow15, highlight: true };
}

// ============ Main Component ============
export default function RenalDoseAdjustment() {
  const [creatinine, setCreatinine] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex | null>(null);
  const [unit, setUnit] = useState<CreatinineUnit>("mgdl");
  const [customEgfr, setCustomEgfr] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  
  const calculatedGfr = calculateCkdEpi(
    parseFloat(creatinine) * (unit === "umol" ? 1/88.42 : 1),
    parseFloat(age),
    sex
  );
  
  const effectiveGfr = useCustom && customEgfr ? parseFloat(customEgfr) : (calculatedGfr > 0 ? calculatedGfr : null);
  const stage = effectiveGfr ? getGfrStage(effectiveGfr) : null;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Clear custom when using calculator
  useEffect(() => {
    if (calculatedGfr > 0) setUseCustom(false);
  }, [creatinine, age, sex]);

  const drugClasses = ["all", ...new Set(RENAL_DATA.map(d => d.drugClass))];
  
  const filtered = RENAL_DATA.filter(d => {
    const matchesSearch = d.drug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      d.drugClass.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "all" || d.drugClass === selectedClass;
    return matchesSearch && matchesClass;
  });

  const reset = () => {
    setCreatinine("");
    setAge("");
    setSex(null);
    setCustomEgfr("");
    setUseCustom(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* eGFR Calculator Card */}
      <Card className="mb-4 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5 text-blue-600" />
            eGFR Calculator (CKD-EPI 2021)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <Label className="text-xs">Creatinine</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder={unit === "mgdl" ? "1.2" : "106"}
                  value={creatinine}
                  onChange={(e) => setCreatinine(e.target.value)}
                  className="h-9"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUnit(unit === "mgdl" ? "umol" : "mgdl")}
                  className="h-9 px-2"
                >
                  {unit === "mgdl" ? "mg/dL" : "µmol"}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">Age (years)</Label>
              <Input
                type="number"
                placeholder="65"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <Label className="text-xs">Sex</Label>
            <div className="flex gap-2 mt-1">
              <Button
                variant={sex === "male" ? "default" : "outline"}
                size="sm"
                onClick={() => setSex("male")}
                className="flex-1"
              >
                Male
              </Button>
              <Button
                variant={sex === "female" ? "default" : "outline"}
                size="sm"
                onClick={() => setSex("female")}
                className="flex-1"
              >
                Female
              </Button>
            </div>
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">OR enter manually</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Manual eGFR Override */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="useCustom"
              checked={useCustom}
              onChange={(e) => setUseCustom(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="useCustom" className="text-xs">Enter eGFR directly:</Label>
            <Input
              type="number"
              placeholder="e.g. 45"
              value={customEgfr}
              onChange={(e) => {
                setCustomEgfr(e.target.value);
                if (e.target.value) setUseCustom(true);
              }}
              disabled={!useCustom}
              className="h-9 w-20"
            />
            <span className="text-sm text-slate-500">mL/min/1.73m²</span>
          </div>

          {/* Results Display */}
          {(effectiveGfr || calculatedGfr > 0) && (
            <div className="flex items-center justify-between bg-slate-100 rounded-lg p-3">
              <div>
                <p className="text-xs text-slate-500">Calculated eGFR</p>
                <p className="text-2xl font-bold text-slate-800">
                  {effectiveGfr?.toFixed(1) ?? "—"}
                  <span className="text-sm font-normal ml-1">mL/min</span>
                </p>
              </div>
              {stage && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${stage.color}`}>
                  {stage.stage}: {stage.label}
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>

      {/* AKI Diagnostic Criteria - KDIGO 2012 */}
      <Card className="mb-4 border-amber-200 bg-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            AKI Diagnostic Criteria (KDIGO 2012)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700 mb-3">
            Patient meets <strong>AKI</strong> definition if <strong>ANY ONE</strong> of:
          </p>
          <ul className="space-y-2 mb-3">
            <li className="flex items-start gap-2 text-sm">
              <span className="font-bold text-amber-600">1.</span>
              <span>Increase in SCr <strong>≥0.3 mg/dL</strong> within <strong>48 hours</strong></span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="font-bold text-amber-600">2.</span>
              <span>Increase in SCr <strong>≥1.5× baseline</strong> (known or presumed within <strong>7 days</strong>)</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="font-bold text-amber-600">3.</span>
              <span><strong>Oliguria:</strong> Urine output <strong>&lt;0.5 mL/kg/h</strong> for <strong>6 hours</strong></span>
            </li>
          </ul>
          
          {/* AKI Severity Stages */}
          <p className="text-sm font-semibold text-amber-800 mb-2 mt-4">AKI Severity Stage:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-yellow-100 rounded p-2">
              <p className="font-bold">Stage 1</p>
              <p className="text-slate-600">1.5-1.9× baseline</p>
              <p className="text-slate-600">or ≥0.3 mg/dL</p>
            </div>
            <div className="bg-orange-100 rounded p-2">
              <p className="font-bold">Stage 2</p>
              <p className="text-slate-600">2.0-2.9× baseline</p>
            </div>
            <div className="bg-red-100 rounded p-2">
              <p className="font-bold">Stage 3</p>
              <p className="text-slate-600">≥3.0× baseline</p>
              <p className="text-slate-600">or SCr ≥4.0</p>
              <p className="text-slate-600">or RRT</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </Card>

      {/* Drug Dosing Table */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="h-5 w-5 text-purple-600" />
            Drug Dose Adjustment by eGFR
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search & Filter */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search drug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-9 px-2 rounded border bg-white"
            >
              {drugClasses.map(c => (
                <option key={c} value={c}>{c === "all" ? "All Classes" : c}</option>
              ))}
            </select>
          </div>

          {/* Warning if eGFR < 30 */}
          {effectiveGfr && effectiveGfr < 30 && (
            <div className="flex items-center gap-2 p-2 mb-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-red-700">
                Many drugs are contraindicated or require dose reduction below eGFR 30
              </span>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Drug</TableHead>
                  <TableHead className="text-xs">Class</TableHead>
                  <TableHead className="text-xs">Adjusted Dose</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d, i) => {
                  const { dose, highlight } = getDoseByEGFR(d, effectiveGfr);
                  return (
                    <TableRow key={i} className={highlight ? "bg-yellow-50" : ""}>
                      <TableCell className="font-medium text-sm">{d.drug}</TableCell>
                      <TableCell className="text-xs text-slate-500">{d.drugClass}</TableCell>
                      <TableCell>
                        <span className={highlight ? "font-bold text-blue-700" : "text-slate-600"}>
                          {dose}
                        </span>
                        {d.notes && highlight && (
                          <p className="text-xs text-slate-400 mt-0.5">{d.notes}</p>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-slate-400 py-4">No drugs found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
