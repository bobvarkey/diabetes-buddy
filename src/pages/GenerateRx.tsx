import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  PatientData,
  EXAMPLE_PATIENT,
  calculateBMI,
  calculateEGFR,
} from "@/lib/patient-data";
import {
  generateMedRecommendations,
  getNextBestMedication,
  getAlgorithmPathway,
  getPathwayLabel,
  generateRecommendationText,
  downloadRecommendationsText,
} from "@/lib/med-logic";
import { assessAnemia, severityLabel, causeLabel, AnemiaInput } from "@/lib/anemia-logic";
import { Copy, Download, FileText, Sparkles, Beaker } from "lucide-react";

type ComorbidityKey =
  | "hasASCVD"
  | "hasHF"
  | "hasCKD"
  | "hasHypertension"
  | "hasObesity"
  | "hasNAFLD"
  | "hasRetinopathy"
  | "hasNeuropathy"
  | "hasPAD"
  | "hasPostStroke"
  | "hasOSA";

const COMORBIDITIES: { key: ComorbidityKey; label: string }[] = [
  { key: "hasASCVD", label: "ASCVD" },
  { key: "hasHF", label: "Heart Failure" },
  { key: "hasCKD", label: "CKD" },
  { key: "hasHypertension", label: "Hypertension" },
  { key: "hasObesity", label: "Obesity" },
  { key: "hasNAFLD", label: "NAFLD" },
  { key: "hasRetinopathy", label: "Retinopathy" },
  { key: "hasNeuropathy", label: "Neuropathy" },
  { key: "hasPAD", label: "PAD" },
  { key: "hasPostStroke", label: "Post-Stroke" },
  { key: "hasOSA", label: "OSA" },
];

export default function GenerateRx() {
  const [patient, setPatient] = useState<PatientData>({ ...EXAMPLE_PATIENT });
  const [currentMedsText, setCurrentMedsText] = useState(EXAMPLE_PATIENT.currentMeds.join(", "));
  const [generated, setGenerated] = useState(false);
  const [anemiaLabs, setAnemiaLabs] = useState<{
    hb?: number; mcv?: number; ferritin?: number; tsat?: number; b12?: number; folate?: number; crp?: number;
  }>({ hb: undefined, mcv: undefined, ferritin: undefined, tsat: undefined, b12: undefined, folate: undefined, crp: undefined });

  // Derived values
  const bmi = useMemo(
    () => calculateBMI(patient.heightCm, patient.weightKg),
    [patient.heightCm, patient.weightKg]
  );
  const egfr = useMemo(
    () => calculateEGFR(patient.creatinine, patient.age, patient.gender),
    [patient.creatinine, patient.age, patient.gender]
  );

  const workingPatient: PatientData = {
    ...patient,
    bmi,
    eGFR: egfr || patient.eGFR,
    currentMeds: currentMedsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };

  const meds = useMemo(
    () => (generated ? generateMedRecommendations(workingPatient) : []),
    [generated, workingPatient]
  );
  const nextBest = useMemo(
    () => (generated ? getNextBestMedication(workingPatient) : null),
    [generated, workingPatient]
  );
  const pathway = useMemo(
    () => (generated ? getAlgorithmPathway(workingPatient) : null),
    [generated, workingPatient]
  );
  const anemia = useMemo(() => {
    if (!generated || anemiaLabs.hb === undefined) return null;
    const a: AnemiaInput = {
      age: workingPatient.age,
      sex: workingPatient.gender,
      hb: anemiaLabs.hb,
      mcv: anemiaLabs.mcv,
      ferritin: anemiaLabs.ferritin,
      tsat: anemiaLabs.tsat,
      b12: anemiaLabs.b12,
      folate: anemiaLabs.folate,
      crp: anemiaLabs.crp,
      eGFR: workingPatient.eGFR,
    };
    return assessAnemia(a);
  }, [generated, anemiaLabs, workingPatient]);

  const update = <K extends keyof PatientData>(key: K, value: PatientData[K]) =>
    setPatient((p) => ({ ...p, [key]: value }));

  const handleGenerate = () => {
    if (!patient.age || !patient.weightKg || !patient.heightCm || !patient.hba1c) {
      toast({
        title: "Missing inputs",
        description: "Please enter age, weight, height and HbA1c.",
        variant: "destructive",
      });
      return;
    }
    setGenerated(true);
  };

  const handleCopy = async () => {
    const text = generateRecommendationText(workingPatient, meds, nextBest);
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Prescription copied to clipboard." });
  };

  const handleDownload = () => {
    downloadRecommendationsText(workingPatient, meds, nextBest);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">NCD Prescription Generator</h1>
          <p className="text-sm text-muted-foreground">
            Enter patient data → get an ADA 2026 guideline-based T2DM prescription.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patient inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={patient.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Age (years)</Label>
            <Input
              type="number"
              value={patient.age || ""}
              onChange={(e) => update("age", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>Sex</Label>
            <Select
              value={patient.gender}
              onValueChange={(v) => update("gender", v as "M" | "F")}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Height (cm)</Label>
            <Input
              type="number"
              value={patient.heightCm || ""}
              onChange={(e) => update("heightCm", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>Weight (kg)</Label>
            <Input
              type="number"
              value={patient.weightKg || ""}
              onChange={(e) => update("weightKg", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>BMI (auto)</Label>
            <Input value={bmi || ""} readOnly className="bg-muted" />
          </div>

          <div className="space-y-1">
            <Label>HbA1c (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={patient.hba1c || ""}
              onChange={(e) => update("hba1c", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>Fasting BG (mg/dL)</Label>
            <Input
              type="number"
              value={patient.fbs || ""}
              onChange={(e) => update("fbs", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>Random BG (mg/dL)</Label>
            <Input
              type="number"
              value={patient.rbs || ""}
              onChange={(e) => update("rbs", Number(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <Label>Creatinine (mg/dL)</Label>
            <Input
              type="number"
              step="0.1"
              value={patient.creatinine || ""}
              onChange={(e) => update("creatinine", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label>eGFR (auto, mL/min)</Label>
            <Input value={egfr || patient.eGFR || ""} readOnly className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label>LDL (mg/dL)</Label>
            <Input
              type="number"
              value={patient.ldl || ""}
              onChange={(e) => update("ldl", Number(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <Label>Heart Failure NYHA</Label>
            <Select
              value={String(patient.hfNYHA)}
              onValueChange={(v) =>
                update("hfNYHA", Number(v) as PatientData["hfNYHA"])
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No HF</SelectItem>
                <SelectItem value="1">Class I</SelectItem>
                <SelectItem value="2">Class II</SelectItem>
                <SelectItem value="3">Class III</SelectItem>
                <SelectItem value="4">Class IV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Diabetes type</Label>
            <Select
              value={patient.diabetesType}
              onValueChange={(v) =>
                update("diabetesType", v as "type1" | "type2")
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="type2">Type 2</SelectItem>
                <SelectItem value="type1">Type 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={patient.hasT2DM}
                onCheckedChange={(c) => update("hasT2DM", Boolean(c))}
              />
              Has T2DM diagnosis
            </label>
          </div>

          <div className="md:col-span-3 space-y-2">
            <Label>Comorbidities</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {COMORBIDITIES.map((c) => (
                <label key={c.key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={Boolean(patient[c.key])}
                    onCheckedChange={(chk) =>
                      update(c.key, Boolean(chk) as never)
                    }
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-1">
            <Label>Current medications (comma-separated)</Label>
            <Input
              value={currentMedsText}
              onChange={(e) => setCurrentMedsText(e.target.value)}
              placeholder="e.g. Metformin 1000mg BD, Glimepiride 2mg OD"
            />
          </div>

          <div className="md:col-span-3 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <Beaker className="h-4 w-4 text-rose-500" />
              <span className="text-sm font-semibold">Anemia labs (optional — fill Hb to enable)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {([
                ["Hb (g/dL)", "hb", "0.1"],
                ["MCV (fL)", "mcv", "1"],
                ["Ferritin (ng/mL)", "ferritin", "1"],
                ["TSAT (%)", "tsat", "1"],
                ["B12 (pg/mL)", "b12", "1"],
                ["Folate (ng/mL)", "folate", "0.1"],
                ["CRP (mg/L)", "crp", "0.1"],
              ] as const).map(([label, key, step]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    step={step}
                    value={anemiaLabs[key] ?? ""}
                    onChange={(e) =>
                      setAnemiaLabs((p) => ({
                        ...p,
                        [key]: e.target.value === "" ? undefined : Number(e.target.value),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleGenerate} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate prescription
        </Button>
        {generated && (
          <>
            <Button variant="outline" onClick={handleCopy} className="gap-2">
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" /> Download .txt
            </Button>
          </>
        )}
      </div>

      {generated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Prescription
              {pathway && (
                <Badge variant="secondary">{getPathwayLabel(pathway)}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {nextBest && (
              <div className="rounded-md border-2 border-primary/40 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-semibold text-foreground">
                    Next best medication
                  </div>
                  <Badge>Score {nextBest.score}/100</Badge>
                </div>
                <div className="text-lg font-bold text-primary">
                  {nextBest.recommendation.drug}
                </div>
                <div className="text-sm">
                  <strong>Dose:</strong> {nextBest.recommendation.dose}{" "}
                  {nextBest.recommendation.frequency}
                </div>
                <div className="text-sm text-muted-foreground">
                  HbA1c reduction: {nextBest.recommendation.hba1cReduction} ·
                  Weight: {nextBest.recommendation.weightEffect} · CV benefit:{" "}
                  {nextBest.recommendation.cvBenefit ? "Yes" : "No"} · Renal
                  benefit: {nextBest.recommendation.renalBenefit ? "Yes" : "No"}
                </div>
                {nextBest.reasoning.length > 0 && (
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {nextBest.reasoning.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
                <div className="text-xs text-muted-foreground italic">
                  {nextBest.clinicalBasis}
                </div>
                {nextBest.alternatives.length > 0 && (
                  <div className="text-sm">
                    <strong>Alternatives:</strong>{" "}
                    {nextBest.alternatives.map((a) => a.drug).join(" · ")}
                  </div>
                )}
              </div>
            )}

            {meds.length > 0 && (
              <div>
                <div className="font-semibold mb-2">
                  Full recommendation list ({meds.length})
                </div>
                <div className="space-y-3">
                  {meds.map((m, i) => (
                    <div
                      key={i}
                      className="rounded-md border bg-card p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="font-medium text-foreground">
                          {i + 1}. {m.drug}
                        </div>
                        <Badge variant="outline">{m.priority}</Badge>
                      </div>
                      <div className="text-sm">
                        <strong>Dose:</strong> {m.dose} {m.frequency}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {m.reason}
                      </div>
                      {m.warnings.length > 0 && (
                        <div className="text-xs text-destructive">
                          ⚠ {m.warnings.join("; ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!nextBest && meds.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No medication recommendations could be generated. Check inputs
                (e.g. ensure T2DM is checked).
              </p>
            )}

            <Separator />
            <p className="text-xs text-muted-foreground italic">
              AI-assisted clinical decision support based on ADA 2026 guidelines.
              Always confirm with a qualified clinician.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
