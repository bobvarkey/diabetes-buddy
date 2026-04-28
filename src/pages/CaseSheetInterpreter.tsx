import { useState } from "react";
import { PatientData, savePatient, getDefaultPatient } from "@/lib/patient-data";
import { extractFromText, extractFromImage } from "@/lib/case-sheet-extractor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, ChevronLeft, Check, Minus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CaseSheetInterpreter = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"text" | "image">("text");
  const [rawText, setRawText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [extracted, setExtracted] = useState<Partial<PatientData> | null>(null);
  const [edited, setEdited] = useState<Partial<PatientData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"input" | "preview" | "done">("input");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WEBP)");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = { target: { files: e.dataTransfer.files } } as any;
      handleFileChange(input);
    }
  };

  const handleExtract = async () => {
    setError("");
    setLoading(true);

    try {
      let result: Partial<PatientData>;

      if (mode === "text") {
        result = await extractFromText(rawText);
      } else {
        if (!imageFile) throw new Error("No image selected");
        const base64 = imagePreview.split(",")[1];
        const mimeType = imageFile.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
        result = await extractFromImage(base64, mimeType);
      }

      setExtracted(result);
      setEdited(result);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
      toast.error(err instanceof Error ? err.message : "Failed to extract data");
    } finally {
      setLoading(false);
    }
  };

  const handlePopulate = () => {
    if (!edited) return;

    const defaultPatient = getDefaultPatient();
    const merged: PatientData = {
      ...defaultPatient,
      ...edited,
      // Ensure required fields
      name: edited.name || defaultPatient.name,
      age: edited.age || defaultPatient.age,
      weightKg: edited.weightKg || defaultPatient.weightKg,
      // Recalculate derived fields if source fields changed
      bmi: edited.bmi || defaultPatient.bmi,
    };

    savePatient(merged);
    setStep("done");
    toast.success("Patient data populated! Navigating...");

    setTimeout(() => {
      navigate("/medications");
    }, 1500);
  };

  const updateExtractedField = (field: keyof PatientData, value: any) => {
    if (edited) {
      setEdited({ ...edited, [field]: value });
    }
  };

  if (step === "done") {
    return (
      <div className="space-y-6 animate-slide-in max-w-2xl mx-auto">
        <div className="rounded-xl p-8 text-center bg-success/10 border border-success/20">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-success mb-2">Success!</h2>
          <p className="text-sm text-muted-foreground mb-2">Patient data populated successfully.</p>
          <p className="text-xs text-muted-foreground">Redirecting to medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in max-w-3xl mx-auto">
      {/* Hero Header */}
      <div className="rounded-xl p-6 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <h1 className="text-3xl font-heading font-bold mb-2">Case Sheet Interpreter</h1>
        <p className="text-sm text-primary-foreground/80">
          Upload a photo of a clinical case sheet or paste notes to auto-extract patient data.
          <br />
          All processing happens in your browser — no data is stored or sent anywhere.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-destructive mb-1">Setup Required</p>
            <p>{error}</p>
            {error.includes("API key") && (
              <p className="mt-2 text-xs bg-muted/50 p-2 rounded font-mono">
                Create/edit <strong>.env.local</strong> and add your Anthropic API key:
                <br />
                VITE_ANTHROPIC_API_KEY=sk-ant-...
              </p>
            )}
          </div>
        </div>
      )}

      {step === "input" && (
        <div className="clinical-card border border-border">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "text" | "image")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Paste Text</TabsTrigger>
              <TabsTrigger value="image">Upload Image</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Paste clinical notes, discharge summary, OPD sheet, or any case sheet text
              </p>
              <Textarea
                placeholder="Paste case notes, discharge summary, lab reports, etc..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
            </TabsContent>

            <TabsContent value="image" className="space-y-3">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">Drag and drop your image</p>
                <p className="text-xs text-muted-foreground mb-4">or click to browse (JPG, PNG, WEBP)</p>
                <label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/90">
                    Choose File
                  </span>
                </label>
              </div>
              {imagePreview && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <img src={imagePreview} alt="case sheet" className="max-h-48 rounded" />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleExtract}
              disabled={loading || (mode === "text" ? !rawText.trim() : !imageFile)}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Extract Patient Data
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && extracted && edited && (
        <div className="space-y-4">
          <div className="rounded-xl p-4 bg-info/10 border border-info/20">
            <p className="text-sm text-info font-medium">
              ✓ Data extracted! Review and edit any fields before populating.
            </p>
          </div>

          {/* Demographics */}
          <div className="clinical-card border border-border">
            <h3 className="font-heading font-semibold text-sm mb-3">Demographics</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Name</label>
                <Input
                  value={edited.name || ""}
                  onChange={(e) => updateExtractedField("name", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Age (years)</label>
                <Input
                  type="number"
                  value={edited.age || ""}
                  onChange={(e) => updateExtractedField("age", parseInt(e.target.value) || 0)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Gender</label>
                <select
                  value={edited.gender || ""}
                  onChange={(e) => updateExtractedField("gender", e.target.value)}
                  className="h-8 w-full px-2 rounded border border-input bg-background text-sm"
                >
                  <option value="">—</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Height (cm)</label>
                <Input
                  type="number"
                  value={edited.heightCm || ""}
                  onChange={(e) => updateExtractedField("heightCm", parseInt(e.target.value) || 0)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Weight (kg)</label>
                <Input
                  type="number"
                  value={edited.weightKg || ""}
                  onChange={(e) => updateExtractedField("weightKg", parseFloat(e.target.value) || 0)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Diabetes Type</label>
                <select
                  value={edited.diabetesType || ""}
                  onChange={(e) => updateExtractedField("diabetesType", e.target.value)}
                  className="h-8 w-full px-2 rounded border border-input bg-background text-sm"
                >
                  <option value="">—</option>
                  <option value="type1">Type 1</option>
                  <option value="type2">Type 2</option>
                </select>
              </div>
            </div>
          </div>

          {/* Labs */}
          <div className="clinical-card border border-border">
            <h3 className="font-heading font-semibold text-sm mb-3">Labs (mg/dL or %)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {[
                { key: "fbs" as const, label: "FBS" },
                { key: "rbs" as const, label: "RBS" },
                { key: "hba1c" as const, label: "HbA1c (%)" },
                { key: "ldl" as const, label: "LDL" },
                { key: "hdl" as const, label: "HDL" },
                { key: "triglycerides" as const, label: "Triglycerides" },
                { key: "totalCholesterol" as const, label: "Total Cholesterol" },
                { key: "creatinine" as const, label: "Creatinine" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground block mb-1">{label}</label>
                  <Input
                    type="number"
                    value={edited[key] || ""}
                    onChange={(e) => updateExtractedField(key, parseFloat(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Comorbidities */}
          <div className="clinical-card border border-border">
            <h3 className="font-heading font-semibold text-sm mb-3">Comorbidities</h3>
            <div className="space-y-2 text-sm">
              {[
                { key: "hasT2DM" as const, label: "Type 2 DM" },
                { key: "hasHypertension" as const, label: "Hypertension" },
                { key: "hasASCVD" as const, label: "ASCVD" },
                { key: "hasCKD" as const, label: "CKD" },
                { key: "hasHF" as const, label: "Heart Failure" },
                { key: "hasPAD" as const, label: "PAD" },
                { key: "hasRetinopathy" as const, label: "Retinopathy" },
                { key: "hasNeuropathy" as const, label: "Neuropathy" },
                { key: "hasNAFLD" as const, label: "NAFLD" },
                { key: "hasOSA" as const, label: "OSA" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <label className="text-xs">{label}</label>
                  <Switch
                    checked={!!edited[key]}
                    onCheckedChange={(v) => updateExtractedField(key, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div className="clinical-card border border-border">
            <h3 className="font-heading font-semibold text-sm mb-3">Current Medications</h3>
            <div className="space-y-2">
              {edited.currentMeds?.map((med, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <Input
                    value={med}
                    onChange={(e) => {
                      const meds = [...(edited.currentMeds || [])];
                      meds[i] = e.target.value;
                      updateExtractedField("currentMeds", meds);
                    }}
                    placeholder="e.g., Metformin 500mg BID"
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const meds = edited.currentMeds || [];
                      updateExtractedField(
                        "currentMeds",
                        meds.filter((_, idx) => idx !== i)
                      );
                    }}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  updateExtractedField("currentMeds", [...(edited.currentMeds || []), ""]);
                }}
                className="w-full h-8 text-xs"
              >
                + Add Medication
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Input
            </Button>
            <Button onClick={handlePopulate} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Populate Patient Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseSheetInterpreter;
