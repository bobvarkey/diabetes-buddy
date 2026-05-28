import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Scale, Calculator, Info, ChevronDown, ChevronUp, Pill, Target, Activity, AlertCircle, BookOpen, RotateCcw, Home, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ETHNICITY_GUIDELINES,
  getBmiCategory,
  getTreatmentGuidelines,
  EthnicityType,
  WEIGHT_LOSS_TARGETS,
  PREFERRED_PHARMACOTHERAPY,
  OTHER_PHARMACOTHERAPY,
  METABOLIC_SURGERY,
  TREATMENT_MONITORING,
  ADA_2025_CITATION,
} from "./obesity-guidelines";

const bmiSchema = z.object({
  height: z.coerce.number().min(100).max(250).describe("Height in cm"),
  weight: z.coerce.number().min(30).max(300).describe("Weight in kg"),
  ethnicity: z.enum(["standard", "asian-pacific", "indian"] as const),
});

type BmiFormData = z.infer<typeof bmiSchema>;

interface BmiResult {
  bmi: number;
  category: string;
  color: string;
  ethnicityName: string;
}

const TABS = [
  { key: "calculator", label: "Calculator", icon: <Calculator className="h-4 w-4" /> },
  { key: "guidelines", label: "ADA 2025 Guidelines", icon: <BookOpen className="h-4 w-4" /> },
];

export default function BmiCalculator() {
  const navigate = useNavigate();
  const [result, setResult] = useState<BmiResult | null>(null);
  const [showTreatment, setShowTreatment] = useState(false);
  const [showCutoffs, setShowCutoffs] = useState(true);
  const [showGrades, setShowGrades] = useState(false);
  const [treatmentData, setTreatmentData] = useState<ReturnType<typeof getTreatmentGuidelines>>(null);
  const [activeTab, setActiveTab] = useState("calculator");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BmiFormData>({
    resolver: zodResolver(bmiSchema),
    defaultValues: {
      ethnicity: "standard",
    },
  });

  const selectedEthnicity = watch("ethnicity") || "standard";

  const onSubmit = (data: BmiFormData) => {
    const heightM = data.height / 100;
    const bmi = data.weight / (heightM * heightM);
    const roundedBmi = Math.round(bmi * 10) / 10;

    const category = getBmiCategory(roundedBmi, data.ethnicity);
    const guideline = ETHNICITY_GUIDELINES.find((g) => g.id === data.ethnicity);

    const treatment = getTreatmentGuidelines(roundedBmi, data.ethnicity);

    setResult({
      bmi: roundedBmi,
      category: category.label,
      color: category.color,
      ethnicityName: guideline?.name || "Standard WHO",
    });
    setTreatmentData(treatment);
    setShowTreatment(false);
  };

  const reset = () => {
    setResult(null);
    setTreatmentData(null);
    setShowTreatment(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex items-center gap-3 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-md">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-rose-500 to-orange-600 bg-clip-text text-transparent truncate">
                BMI Calculator
              </h1>
              <p className="text-xs font-medium text-rose-500 dark:text-rose-400 truncate">
                Body Mass Index with Ethnicity-Specific Thresholds
              </p>
            </div>
            <div className="flex items-center gap-2 no-print shrink-0">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} title="Back to Home">
                <Home className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={reset} title="Reset Form">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-0.5 pb-2 overflow-x-auto no-print flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl px-4 py-6 space-y-6">
        {activeTab === "calculator" && (
          <>
            <Card className="clinical-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5" />
                  Enter Measurements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Ethnicity Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="ethnicity">Ethnicity / Population Group</Label>
                    <Select
                      value={selectedEthnicity}
                      onValueChange={(value: EthnicityType) => {
                        // This is handled by react-hook-form
                      }}
                      {...register("ethnicity")}
                    >
                      <SelectTrigger id="ethnicity" className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {ETHNICITY_GUIDELINES.map((guideline) => (
                          <SelectItem
                            key={guideline.id}
                            value={guideline.id}
                            className="text-slate-100 focus:bg-slate-800 focus:text-slate-100"
                          >
                            {guideline.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {ETHNICITY_GUIDELINES.find((g) => g.id === selectedEthnicity)?.description}
                    </p>
                  </div>

                  {/* Height Input */}
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="e.g., 170"
                      className="bg-slate-900 border-slate-700"
                      {...register("height", { valueAsNumber: true })}
                    />
                    {errors.height && (
                      <p className="text-xs text-red-500">Please enter a valid height (100-250 cm)</p>
                    )}
                  </div>

                  {/* Weight Input */}
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g., 70"
                      className="bg-slate-900 border-slate-700"
                      {...register("weight", { valueAsNumber: true })}
                    />
                    {errors.weight && (
                      <p className="text-xs text-red-500">Please enter a valid weight (30-300 kg)</p>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      Calculate BMI
                    </Button>
                    <Button type="button" variant="outline" onClick={reset}>
                      Reset
                    </Button>
                  </div>
                </form>

                {/* Result Display */}
                {result && (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-lg border border-border bg-card/50 p-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Body Mass Index</p>
                        <p className="text-5xl font-bold text-primary">{result.bmi}</p>
                        <p className={`mt-2 text-lg font-medium ${result.color}`}>
                          {result.category}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Using {result.ethnicityName} guidelines
                        </p>
                      </div>
                    </div>

                    {/* BMI Cut-offs Comparison */}
                    <div className="rounded-lg border border-border bg-card/50 p-4">
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-between p-0 h-auto"
                        onClick={() => setShowCutoffs(!showCutoffs)}
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <Info className="h-4 w-4" />
                          BMI Categories & Cut-offs
                        </span>
                        {showCutoffs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>

                      {showCutoffs && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-muted/30 p-3">
                            <p className="text-xs font-semibold text-center mb-2">Western (WHO)</p>
                            <table className="w-full text-xs">
                              <tbody>
                                <tr className="border-b border-border"><td className="py-1">&lt;18.5</td><td className="text-right">Underweight</td></tr>
                                <tr className="border-b border-border"><td className="py-1">18.5-24.9</td><td className="text-right">Normal</td></tr>
                                <tr className="border-b border-border"><td className="py-1">25-29.9</td><td className="text-right">Overweight</td></tr>
                                <tr className="border-b border-border"><td className="py-1">30-34.9</td><td className="text-right">Obese I</td></tr>
                                <tr><td className="py-1">≥35</td><td className="text-right">Obese II/III</td></tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="rounded-lg bg-muted/30 p-3">
                            <p className="text-xs font-semibold text-center mb-2">Asian (WHO, 2000)</p>
                            <table className="w-full text-xs">
                              <tbody>
                                <tr className="border-b border-border"><td className="py-1">&lt;18.5</td><td className="text-right">Underweight</td></tr>
                                <tr className="border-b border-border"><td className="py-1">18.5-22.9</td><td className="text-right">Normal</td></tr>
                                <tr className="border-b border-border"><td className="py-1">23-24.9</td><td className="text-right">Overweight</td></tr>
                                <tr className="border-b border-border"><td className="py-1">25-29.9</td><td className="text-right">Obese I</td></tr>
                                <tr><td className="py-1">≥30</td><td className="text-right">Obese II/III</td></tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* BMI Grades Collapsible */}
                    <div className="rounded-lg border border-border bg-card/50 p-4">
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-between p-0 h-auto"
                        onClick={() => setShowGrades(!showGrades)}
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <Target className="h-4 w-4" />
                          Obesity Grades & Treatment Targets
                        </span>
                        {showGrades ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>

                      {showGrades && (
                        <div className="mt-3 space-y-2">
                          <div className="rounded-lg bg-muted/30 p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">Grade 1 (Overweight)</p>
                              <p className="text-xs text-muted-foreground">BMI 25-29.9</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium text-primary">Target: ≥3-7% weight loss</p>
                              <p className="text-xs text-muted-foreground">Grade A</p>
                            </div>
                          </div>
                          <div className="rounded-lg bg-muted/30 p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">Grade 2 (Obesity)</p>
                              <p className="text-xs text-muted-foreground">BMI 30-34.9</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium text-primary">Target: ≥10% weight loss</p>
                              <p className="text-xs text-muted-foreground">Grade B</p>
                            </div>
                          </div>
                          <div className="rounded-lg bg-muted/30 p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">Grade 3 (Severe Obesity)</p>
                              <p className="text-xs text-muted-foreground">BMI ≥35</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium text-primary">Target: ≥15-20% weight loss</p>
                              <p className="text-xs text-muted-foreground">Grade A/B</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ADA 2025 Treatment Guidelines */}
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-between"
                        onClick={() => setShowTreatment(!showTreatment)}
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          ADA 2025 Treatment Guidelines
                        </span>
                        {showTreatment ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>

                      {showTreatment && (
                        <div className="space-y-4">
                          {/* Weight Loss Targets */}
                          <Card className="border-primary/30">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Target className="h-4 w-4 text-primary" />
                                Weight Loss Targets (ADA 2025)
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {WEIGHT_LOSS_TARGETS.map((target, i) => (
                                <div key={i} className="p-3 rounded-lg bg-card/50 border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-foreground">{target.percentage} Weight Loss</span>
                                    <Badge variant={target.grade === "A" ? "default" : "secondary"}>
                                      Grade {target.grade}
                                    </Badge>
                                  </div>
                                  <ul className="space-y-1">
                                    {target.benefits.map((benefit, j) => (
                                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        {benefit}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          {/* Treatment Monitoring */}
                          <Alert className="border-info/50 bg-info/10">
                            <Activity className="h-4 w-4" />
                            <AlertDescription className="space-y-2">
                              <p className="font-medium">Treatment Monitoring</p>
                              <div className="text-sm space-y-1">
                                <p><strong>Early Response ({TREATMENT_MONITORING.earlyResponse.timeframe}):</strong> Target {TREATMENT_MONITORING.earlyResponse.target} weight loss</p>
                                <p className="text-muted-foreground">{TREATMENT_MONITORING.earlyResponse.interpretation}</p>
                                <p className="mt-2 text-amber-400"><strong>Important:</strong> {TREATMENT_MONITORING.longTermTherapy.discontinuationWarning}</p>
                              </div>
                            </AlertDescription>
                          </Alert>

                          {/* Treatment Recommendations based on BMI */}
                          {treatmentData && (
                            <Alert className="border-amber-500/50 bg-amber-500/10">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="space-y-3">
                                <p className="font-medium">Personalized Recommendations for Current BMI:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                  {treatmentData.recommendations.map((rec, i) => (
                                    <li key={i} className="text-sm">{rec}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Pharmacotherapy Tabs */}
                          <Tabs defaultValue="preferred" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="preferred" className="flex items-center gap-1">
                                <Pill className="h-3 w-3" />
                                Preferred Agents
                              </TabsTrigger>
                              <TabsTrigger value="other">Other Options</TabsTrigger>
                            </TabsList>

                            <TabsContent value="preferred" className="space-y-3">
                              <p className="text-xs text-muted-foreground">ADA 2025 Recommended - Grade A Evidence</p>
                              {PREFERRED_PHARMACOTHERAPY.map((agent, i) => (
                                <Card key={i} className="border-primary/30 bg-primary/5">
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-base">{agent.name}</CardTitle>
                                      <Badge variant="default" className="text-xs">Preferred</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{agent.class}</p>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-muted-foreground">Dosage:</span>
                                        <p>{agent.dosage}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">A1C Reduction:</span>
                                        <p>{agent.a1cReduction}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Weight Loss:</span>
                                      <p className="font-medium text-primary">{agent.weightLoss}</p>
                                    </div>
                                    <ul className="space-y-1 mt-2">
                                      {agent.notes.map((note, j) => (
                                        <li key={j} className="text-xs text-muted-foreground flex items-start gap-1">
                                          <span className="text-primary">•</span> {note}
                                        </li>
                                      ))}
                                    </ul>
                                  </CardContent>
                                </Card>
                              ))}
                            </TabsContent>

                            <TabsContent value="other" className="space-y-3">
                              {OTHER_PHARMACOTHERAPY.map((agent, i) => (
                                <Card key={i} className="border-border">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{agent.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{agent.class}</p>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-muted-foreground">Dosage:</span>
                                        <p>{agent.dosage}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Weight Loss:</span>
                                        <p className="font-medium">{agent.weightLoss}</p>
                                      </div>
                                    </div>
                                    <ul className="space-y-1 mt-2">
                                      {agent.notes.map((note, j) => (
                                        <li key={j} className="text-xs text-muted-foreground flex items-start gap-1">
                                          <span className="text-amber-500">•</span> {note}
                                        </li>
                                      ))}
                                    </ul>
                                  </CardContent>
                                </Card>
                              ))}
                            </TabsContent>
                          </Tabs>

                          {/* Metabolic Surgery */}
                          {(result.bmi >= 30 || (selectedEthnicity !== "standard" && result.bmi >= 27.5)) && (
                            <Card className="border-red-500/30 bg-red-500/5">
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base text-red-400">
                                  <Activity className="h-4 w-4" />
                                  Metabolic Surgery Consideration
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                  BMI ≥{selectedEthnicity === "standard" ? "30" : "27.5"} (Asian/Indian populations):
                                  Consider referral for metabolic surgery evaluation per ADA 2025 (Grade A)
                                </p>
                                <div className="space-y-3">
                                  {METABOLIC_SURGERY.map((surgery, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-card/50 border border-border">
                                      <p className="font-medium text-foreground">{surgery.procedure}</p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
                                        <div>
                                          <span className="text-muted-foreground">1-year WL:</span>
                                          <p>{surgery.weightLoss1yr}</p>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">5-year WL:</span>
                                          <p>{surgery.weightLoss5yr}</p>
                                        </div>
                                        <div className="col-span-2">
                                          <span className="text-muted-foreground">Diabetes Remission (5yr):</span>
                                          <p className="font-medium text-primary">{surgery.diabetesRemission5yr}</p>
                                        </div>
                                      </div>
                                      <ul className="mt-2 space-y-1">
                                        {surgery.notes.map((note, j) => (
                                          <li key={j} className="text-xs text-muted-foreground flex items-start gap-1">
                                            <span className="text-red-400">•</span> {note}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Citation */}
                          <p className="text-xs text-muted-foreground text-center">
                            Source: {ADA_2025_CITATION}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "guidelines" && (
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" />
                ADA 2025 Obesity Guidelines Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The ADA 2025 Standards of Care include comprehensive recommendations for obesity management in diabetes:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Weight loss targets: 3-7% (Grade A), &gt;10% (Grade B), &gt;15% (Grade B), &gt;20% (Grade A)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Preferred agents: Tirzepatide, Semaglutide, Liraglutide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Metabolic surgery: BMI ≥30 (≥27.5 Asian) with uncontrolled T2DM</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Early response: &gt;5% weight loss at 3 months predicts long-term success</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground text-center mt-4">
                {ADA_2025_CITATION}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
