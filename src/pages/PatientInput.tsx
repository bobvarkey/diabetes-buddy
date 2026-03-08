import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PatientData, EXAMPLE_PATIENT, loadPatient, savePatient, calculateBMI, getBMICategory } from "@/lib/patient-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Save, RotateCcw, Sparkles, X, Plus } from "lucide-react";

const BLANK_PATIENT: PatientData = {
  name: "", age: 0, gender: "M", heightCm: 0, weightKg: 0, bmi: 0,
  eGFR: 90, creatinine: 1.0, hfNYHA: 0, postStrokeDysphagia: false,
  dysphagiaLevel: "none", ldl: 100, fbs: 100, rbs: 140, hba1c: 6.5,
  serialBG: [], currentMeds: [], hasT2DM: true,
};

const PatientInput = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData>(BLANK_PATIENT);
  const [newMed, setNewMed] = useState("");

  useEffect(() => {
    const saved = loadPatient();
    if (saved) setPatient(saved);
  }, []);

  const update = (field: keyof PatientData, value: any) => {
    setPatient(prev => {
      const next = { ...prev, [field]: value };
      if (field === "heightCm" || field === "weightKg") {
        next.bmi = calculateBMI(
          field === "heightCm" ? value : next.heightCm,
          field === "weightKg" ? value : next.weightKg
        );
      }
      return next;
    });
  };

  const addMed = () => {
    if (!newMed.trim()) return;
    update("currentMeds", [...patient.currentMeds, newMed.trim()]);
    setNewMed("");
  };

  const removeMed = (idx: number) => {
    update("currentMeds", patient.currentMeds.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    savePatient(patient);
    toast.success("Patient data saved");
  };

  const handleReset = () => {
    setPatient(BLANK_PATIENT);
    localStorage.removeItem("dmo_patient");
    toast.info("Cleared patient data");
  };

  const handleLoadExample = () => {
    setPatient(EXAMPLE_PATIENT);
    savePatient(EXAMPLE_PATIENT);
    toast.info("Loaded Kerala example patient");
  };

  const handleGenerate = () => {
    if (!patient.name || !patient.age || !patient.weightKg) {
      toast.error("Please fill in at least name, age, and weight");
      return;
    }
    savePatient(patient);
    toast.success("Patient saved — generating recommendations...");
    navigate("/medications");
  };

  const handleGenerateDiet = () => {
    if (!patient.name || !patient.age || !patient.weightKg) {
      toast.error("Please fill in at least name, age, and weight");
      return;
    }
    savePatient(patient);
    toast.success("Patient saved — generating diet plan...");
    navigate("/diet-plan");
  };

  const bmiCat = getBMICategory(patient.bmi);

  const numField = (label: string, field: keyof PatientData, unit?: string, step?: number) => (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={patient[field] as number}
          onChange={(e) => update(field, parseFloat(e.target.value) || 0)}
          className="h-9"
          step={step}
        />
        {unit && <span className="text-xs text-muted-foreground whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold">Patient Profile</h1>
          <p className="text-sm text-muted-foreground">ADA 2026 assessment checklist</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleLoadExample}>
            Load Example
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-3.5 h-3.5 mr-1" /> Save
          </Button>
        </div>
      </div>

      {/* Demographics */}
      <div className="clinical-card">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-primary" />
          <h3 className="section-title">Demographics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input value={patient.name} onChange={(e) => update("name", e.target.value)} className="h-9" />
          </div>
          {numField("Age", "age", "years")}
          <div>
            <Label className="text-xs text-muted-foreground">Gender</Label>
            <Select value={patient.gender} onValueChange={(v) => update("gender", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Switch checked={patient.hasT2DM} onCheckedChange={(v) => update("hasT2DM", v)} />
            <Label className="text-sm">Type 2 DM</Label>
          </div>
        </div>
      </div>

      {/* Anthropometrics */}
      <div className="clinical-card">
        <h3 className="section-title mb-4">Anthropometrics & BMI</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {numField("Height", "heightCm", "cm")}
          {numField("Weight", "weightKg", "kg", 0.1)}
          <div>
            <Label className="text-xs text-muted-foreground">BMI (auto)</Label>
            <div className="h-9 flex items-center">
              <span className={`text-xl font-heading font-bold ${bmiCat.color}`}>{patient.bmi}</span>
              <span className={`ml-2 text-xs ${bmiCat.color}`}>{bmiCat.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Renal */}
      <div className="clinical-card">
        <h3 className="section-title mb-4">Renal Function</h3>
        <div className="grid grid-cols-2 gap-4">
          {numField("eGFR", "eGFR", "mL/min")}
          {numField("Creatinine", "creatinine", "mg/dL", 0.1)}
        </div>
        {patient.eGFR < 60 && (
          <div className="mt-3 p-3 rounded-lg bg-warning/10 text-sm text-warning">
            ⚠ CKD Stage {patient.eGFR >= 30 ? "3" : patient.eGFR >= 15 ? "4" : "5"} — Medication dose adjustments required
          </div>
        )}
      </div>

      {/* Cardiac */}
      <div className="clinical-card">
        <h3 className="section-title mb-4">Heart Failure</h3>
        <div>
          <Label className="text-xs text-muted-foreground">NYHA Class</Label>
          <Select value={String(patient.hfNYHA)} onValueChange={(v) => update("hfNYHA", parseInt(v))}>
            <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No HF</SelectItem>
              <SelectItem value="1">NYHA I</SelectItem>
              <SelectItem value="2">NYHA II</SelectItem>
              <SelectItem value="3">NYHA III</SelectItem>
              <SelectItem value="4">NYHA IV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Post-Stroke */}
      <div className="clinical-card">
        <h3 className="section-title mb-4">Post-Stroke Assessment</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={patient.postStrokeDysphagia} onCheckedChange={(v) => update("postStrokeDysphagia", v)} />
            <Label className="text-sm">Post-stroke dysphagia</Label>
          </div>
          {patient.postStrokeDysphagia && (
            <div>
              <Label className="text-xs text-muted-foreground">Dysphagia Level</Label>
              <Select value={patient.dysphagiaLevel} onValueChange={(v) => update("dysphagiaLevel", v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Glycemic */}
      <div className="clinical-card">
        <h3 className="section-title mb-4">Blood Glucose & Lipids</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {numField("FBS", "fbs", "mg/dL")}
          {numField("RBS", "rbs", "mg/dL")}
          {numField("HbA1c", "hba1c", "%", 0.1)}
          {numField("LDL", "ldl", "mg/dL")}
        </div>
      </div>

      {/* Current Meds */}
      <div className="clinical-card">
        <h3 className="section-title mb-4">Current Medications</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {patient.currentMeds.map((med, i) => (
            <span key={i} className="stat-badge bg-muted text-foreground group">
              {med}
              <button onClick={() => removeMed(i)} className="ml-1 opacity-60 hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {patient.currentMeds.length === 0 && <span className="text-sm text-muted-foreground">No medications added</span>}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Metformin 500mg BD"
            value={newMed}
            onChange={e => setNewMed(e.target.value)}
            className="h-9"
            onKeyDown={e => e.key === "Enter" && addMed()}
          />
          <Button variant="outline" size="sm" onClick={addMed}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Generate buttons */}
      <div className="clinical-card border-primary/20 bg-primary/5">
        <h3 className="section-title mb-3">Generate Recommendations</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Save patient data and generate personalized ADA 2026 medication algorithm and Kerala diet plan based on entered comorbidities.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleGenerate} className="flex-1 min-w-[180px]">
            <Sparkles className="w-4 h-4 mr-2" /> Generate Medication Plan
          </Button>
          <Button onClick={handleGenerateDiet} variant="outline" className="flex-1 min-w-[180px]">
            <Sparkles className="w-4 h-4 mr-2" /> Generate Diet Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientInput;
