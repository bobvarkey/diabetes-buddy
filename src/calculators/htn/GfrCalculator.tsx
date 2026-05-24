import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, RotateCcw, ArrowLeftRight } from "lucide-react";

type CreatinineUnit = "mgdl" | "umol";
type Sex = "male" | "female" | null;

// Conversion: 1 mg/dL = 88.42 µmol/L
const UMOL_TO_MGDL = 1 / 88.42;

export interface GfrResult {
  gfr: number;
  stage: string;
  label: string;
  creatinine: number;
  age: number;
  sex: "male" | "female";
}

function calculateCkdEpi(creatinine: number, age: number, sex: "male" | "female"): number {
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

export function getGfrStage(gfr: number): { stage: string; label: string; color: string } {
  if (gfr >= 90) return { stage: "G1", label: "Normal or High", color: "bg-success/20 text-success border-success/30" };
  if (gfr >= 60) return { stage: "G2", label: "Mildly Decreased", color: "bg-success/20 text-success border-success/30" };
  if (gfr >= 45) return { stage: "G3a", label: "Mild-Moderate Decrease", color: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30" };
  if (gfr >= 30) return { stage: "G3b", label: "Moderate-Severe Decrease", color: "bg-orange-500/20 text-orange-700 border-orange-500/30" };
  if (gfr >= 15) return { stage: "G4", label: "Severely Decreased", color: "bg-destructive/20 text-destructive border-destructive/30" };
  return { stage: "G5", label: "Kidney Failure", color: "bg-destructive/30 text-destructive border-destructive/40" };
}

interface GfrCalculatorProps {
  onResultChange?: (result: GfrResult | null) => void;
}

export default function GfrCalculator({ onResultChange }: GfrCalculatorProps) {
  const [creatinine, setCreatinine] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex>(null);
  const [unit, setUnit] = useState<CreatinineUnit>("mgdl");
  const [result, setResult] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleUnit = () => {
    const crVal = parseFloat(creatinine);
    if (!isNaN(crVal) && crVal > 0) {
      if (unit === "mgdl") {
        setCreatinine((crVal * 88.42).toFixed(0));
      } else {
        setCreatinine((crVal * UMOL_TO_MGDL).toFixed(2));
      }
    }
    setUnit((prev) => (prev === "mgdl" ? "umol" : "mgdl"));
    setErrors((p) => ({ ...p, creatinine: "" }));
  };

  const getCreatinineMgdl = (): number => {
    const val = parseFloat(creatinine);
    return unit === "umol" ? val * UMOL_TO_MGDL : val;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const crVal = parseFloat(creatinine);
    const maxVal = unit === "mgdl" ? 30 : 2652;

    if (!creatinine.trim() || isNaN(crVal) || crVal <= 0 || crVal > maxVal) {
      newErrors.creatinine = unit === "mgdl"
        ? "Enter valid creatinine (0.1-30 mg/dL)"
        : "Enter valid creatinine (9-2652 µmol/L)";
    }
    if (!age.trim() || isNaN(parseInt(age)) || parseInt(age) < 18 || parseInt(age) > 120) {
      newErrors.age = "Enter valid age (18-120)";
    }
    if (!sex) {
      newErrors.sex = "Select sex";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculate = () => {
    if (!validate()) return;
    const crMgdl = getCreatinineMgdl();
    const gfr = calculateCkdEpi(crMgdl, parseInt(age), sex!);
    setResult(gfr);
    const stageInfo = getGfrStage(gfr);
    onResultChange?.({
      gfr,
      stage: stageInfo.stage,
      label: stageInfo.label,
      creatinine: crMgdl,
      age: parseInt(age),
      sex: sex!,
    });
  };

  const reset = () => {
    setCreatinine("");
    setAge("");
    setSex(null);
    setUnit("mgdl");
    setResult(null);
    setErrors({});
    onResultChange?.(null);
  };

  const stage = result !== null ? getGfrStage(result) : null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-muted/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">GFR Calculator (CKD-EPI 2021)</CardTitle>
          </div>
          {result !== null && (
            <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Race-free CKD-EPI equation for adults ≥18 years</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="gfr-creatinine" className="text-sm font-medium">
                Serum Creatinine ({unit === "mgdl" ? "mg/dL" : "µmol/L"})
              </Label>
              <button
                type="button"
                onClick={toggleUnit}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              >
                <ArrowLeftRight className="h-3 w-3" />
                {unit === "mgdl" ? "µmol/L" : "mg/dL"}
              </button>
            </div>
            <Input
              id="gfr-creatinine"
              type="number"
              step={unit === "mgdl" ? "0.01" : "1"}
              min={unit === "mgdl" ? "0.1" : "9"}
              max={unit === "mgdl" ? "30" : "2652"}
              placeholder={unit === "mgdl" ? "e.g. 1.2" : "e.g. 106"}
              value={creatinine}
              onChange={(e) => {
                setCreatinine(e.target.value);
                if (errors.creatinine) setErrors((p) => ({ ...p, creatinine: "" }));
              }}
              className={errors.creatinine ? "border-destructive" : ""}
            />
            {errors.creatinine && <p className="text-xs text-destructive">{errors.creatinine}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gfr-age" className="text-sm font-medium">
              Age (years)
            </Label>
            <Input
              id="gfr-age"
              type="number"
              min="18"
              max="120"
              placeholder="e.g. 55"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                if (errors.age) setErrors((p) => ({ ...p, age: "" }));
              }}
              className={errors.age ? "border-destructive" : ""}
            />
            {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Sex</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={sex === "male" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setSex("male");
                  if (errors.sex) setErrors((p) => ({ ...p, sex: "" }));
                }}
              >
                Male
              </Button>
              <Button
                type="button"
                variant={sex === "female" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setSex("female");
                  if (errors.sex) setErrors((p) => ({ ...p, sex: "" }));
                }}
              >
                Female
              </Button>
            </div>
            {errors.sex && <p className="text-xs text-destructive">{errors.sex}</p>}
          </div>
        </div>

        <Button onClick={calculate} className="w-full sm:w-auto">
          <Calculator className="h-4 w-4 mr-2" />
          Calculate eGFR
        </Button>

        {result !== null && stage && (
          <div className="mt-4 p-4 rounded-lg bg-card border-2 border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Estimated GFR</p>
                <p className="text-3xl font-bold text-foreground">
                  {result} <span className="text-sm font-normal text-muted-foreground">mL/min/1.73m²</span>
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1">
                <Badge className={stage.color}>
                  Stage {stage.stage}
                </Badge>
                <span className="text-xs text-muted-foreground">{stage.label}</span>
              </div>
            </div>
            {result < 60 && (
              <p className="mt-3 text-xs text-destructive font-medium border-t border-border pt-3">
                ⚠️ GFR &lt; 60: Review renal dosing adjustments for all medications above
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
