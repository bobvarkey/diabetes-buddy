import { useState } from "react";
import { AbbreviationHover } from "@/components/AbbreviationHover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Heart,
  AlertTriangle,
  Target,
  Activity,
  CheckCircle,
  Info,
} from "lucide-react";

// Category colors for hypertension (orange theme)
const categoryColors = {
  accent: "#fb923c",
  bg: "rgba(251,146,60,0.12)",
  border: "rgba(251,146,60,0.2)",
};

// ESC 2024 Blood Pressure Classification
interface BPStage {
  category: string;
  sbp: string;
  dbp: string;
  color: string;
  description: string;
}

const bpClassification: BPStage[] = [
  {
    category: "Optimal",
    sbp: "< 120",
    dbp: "< 80",
    color: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
    description: "Continue healthy lifestyle",
  },
  {
    category: "Normal",
    sbp: "120-129",
    dbp: "80-84",
    color: "bg-green-500/20 text-green-700 border-green-500/30",
    description: "Lifestyle counseling",
  },
  {
    category: "High Normal",
    sbp: "130-139",
    dbp: "85-89",
    color: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    description: "Lifestyle modification, monitor closely",
  },
  {
    category: "Grade 1 Hypertension",
    sbp: "140-159",
    dbp: "90-99",
    color: "bg-orange-500/20 text-orange-700 border-orange-500/30",
    description: "Confirm with repeated measurements; consider pharmacotherapy",
  },
  {
    category: "Grade 2 Hypertension",
    sbp: "160-179",
    dbp: "100-109",
    color: "bg-red-500/20 text-red-700 border-red-500/30",
    description: "Initiate antihypertensive therapy",
  },
  {
    category: "Grade 3 Hypertension",
    sbp: "≥ 180",
    dbp: "≥ 110",
    color: "bg-destructive/20 text-destructive border-destructive/30",
    description: "Urgent evaluation and treatment required",
  },
];

// Risk Stratification
interface RiskFactor {
  category: string;
  factors: string[];
  color: string;
}

const riskFactors: RiskFactor[] = [
  {
    category: "Low Risk",
    factors: ["No risk factors", "No target organ damage"],
    color: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
  },
  {
    category: "Moderate Risk",
    factors: [
      "1-2 risk factors",
      "No target organ damage",
      "No established CVD",
    ],
    color: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  },
  {
    category: "High Risk",
    factors: [
      "≥ 3 risk factors",
      "Target organ damage",
      "Diabetes without organ damage",
      "CKD stage 3",
    ],
    color: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  },
  {
    category: "Very High Risk",
    factors: [
      "Established CVD",
      "CKD stage ≥ 4",
      "Diabetes with organ damage",
      "Grade 3 HTN with risk factors",
    ],
    color: "bg-destructive/20 text-destructive border-destructive/30",
  },
];

// Target BP Guidelines
interface TargetBP {
  population: string;
  target: string;
  evidence: string;
}

const targetBPGuidelines: TargetBP[] = [
  {
    population: "General population (< 65 years)",
    target: "< 130/80 mmHg",
    evidence: "STEP, SPRINT trials",
  },
  {
    population: "Older adults (≥ 65 years)",
    target: "< 140/90 mmHg (SBP 130-139 if tolerated)",
    evidence: "SPRINT, HYVET trials",
  },
  {
    population: "Diabetes",
    target: "< 130/80 mmHg",
    evidence: "ACCORD, ADVANCE trials",
  },
  {
    population: "CKD with proteinuria",
    target: "< 130/80 mmHg (≤ 125/75 if heavy proteinuria)",
    evidence: "KDIGO 2021 guidelines",
  },
  {
    population: "Post-stroke",
    target: "< 130/80 mmHg",
    evidence: "PROGRESS trial",
  },
  {
    population: "CAD/PAD",
    target: "< 130/80 mmHg",
    evidence: "ESC 2024 guidelines",
  },
];

// Secondary Causes Checklist
const secondaryCauses = [
  {
    category: "Renal",
    conditions: [
      "Chronic kidney disease",
      "Polycystic kidney disease",
      "Renovascular disease",
      "Renal parenchymal disease",
    ],
  },
  {
    category: "Endocrine",
    conditions: [
      "Primary aldosteronism",
      "Cushing's syndrome",
      "Pheochromocytoma",
      "Hyper-/Hypothyroidism",
      "Hyperparathyroidism",
      "Acromegaly",
    ],
  },
  {
    category: "Vascular",
    conditions: [
      "Coarctation of aorta",
      "Takayasu arteritis",
      "Fibromuscular dysplasia",
    ],
  },
  {
    category: "Medications/Substances",
    conditions: [
      "NSAIDs",
      "Oral contraceptives",
      "Corticosteroids",
      "Calcineurin inhibitors",
      "Erythropoietin",
      "Decongestants",
      "Licorice",
      "Cocaine/Amphetamines",
    ],
  },
  {
    category: "Sleep",
    conditions: ["Obstructive sleep apnea", "Central sleep apnea"],
  },
];

export default function HypertensionOverview() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Alert for Emergency */}
      <Alert className="border-amber-500/40 bg-amber-500/5">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-700">Hypertensive Crisis Threshold</AlertTitle>
        <AlertDescription className="text-amber-600 text-sm">
          BP ≥ 180/120 mmHg requires immediate evaluation. If accompanied by acute target organ damage
          (encephalopathy, pulmonary edema, AKI, aortic dissection), treat as hypertensive emergency.
        </AlertDescription>
      </Alert>

      {/* BP Classification Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" style={{ color: categoryColors.accent }} />
            <CardTitle className="text-lg">ESC 2024 BP Classification</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on office blood pressure measurements (mmHg)
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium">Category</th>
                  <th className="text-center py-3 px-2 font-medium"><AbbreviationHover term="SBP">SBP</AbbreviationHover></th>
                  <th className="text-center py-3 px-2 font-medium"><AbbreviationHover term="DBP">DBP</AbbreviationHover></th>
                  <th className="text-left py-3 px-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {bpClassification.map((stage, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedStage(selectedStage === stage.category ? null : stage.category)}
                  >
                    <td className="py-3 px-2">
                      <Badge variant="outline" className={stage.color}>
                        {stage.category}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-2 font-medium">{stage.sbp}</td>
                    <td className="text-center py-3 px-2 font-medium">{stage.dbp}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{stage.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground">
              <Info className="h-3 w-3 inline mr-1" />
              <strong>Note:</strong> When systolic and diastolic values fall into different categories,
              the higher category applies. Classification should be based on at least 2 readings on
              2 separate occasions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Stratification */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" style={{ color: categoryColors.accent }} />
            <CardTitle className="text-lg">Risk Stratification</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on cardiovascular risk factors, target organ damage, and associated conditions
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskFactors.map((risk, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border/60 hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={risk.color}>
                    {risk.category}
                  </Badge>
                </div>
                <ul className="space-y-1">
                  {risk.factors.map((factor, fIndex) => (
                    <li key={fIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-1 flex-shrink-0" style={{ color: categoryColors.accent }} />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="cv-risk-factors">
              <AccordionTrigger className="text-sm font-medium">
                CV Risk Factors Details
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium">Major Risk Factors:</p>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>• Age (men ≥ 55, women ≥ 65)</li>
                      <li>• Smoking</li>
                      <li>• Dyslipidemia</li>
                      <li>• Family history of premature CVD</li>
                      <li>• Obesity (BMI ≥ 30 kg/m²)</li>
                      <li>• Abdominal obesity (men ≥ 102cm, women ≥ 88cm)</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Target Organ Damage:</p>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>• Left ventricular hypertrophy</li>
                      <li>• Carotid intima-media thickening</li>
                      <li>• Decreased eGFR or elevated creatinine</li>
                      <li>• Microalbuminuria</li>
                      <li>• Retinal changes</li>
                      <li>• Atherosclerotic plaques</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Target BP Guidelines */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" style={{ color: categoryColors.accent }} />
            <CardTitle className="text-lg">Target Blood Pressure Guidelines</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {targetBPGuidelines.map((guideline, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 gap-2"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{guideline.population}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    style={{ color: categoryColors.accent, borderColor: categoryColors.border }}
                  >
                    {guideline.target}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{guideline.evidence}</span>
                </div>
              </div>
            ))}
          </div>

          <Alert className="mt-4 border-blue-500/30 bg-blue-500/5">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-600 text-sm">
              Individualize targets based on tolerability. SPRINT trial showed benefit of
              SBP &lt; 120 mmHg in high-risk patients, but may not be appropriate for all.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Secondary Causes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" style={{ color: categoryColors.accent }} />
            <CardTitle className="text-lg">Secondary Causes of Hypertension</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Consider screening when: onset &lt; 30 years, resistant HTN, sudden onset,
            severe HTN, or hypokalemia with normal sodium
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {secondaryCauses.map((category, index) => (
              <div key={index} className="p-3 rounded-lg border border-border/50">
                <p className="text-sm font-medium mb-2" style={{ color: categoryColors.accent }}>
                  {category.category}
                </p>
                <ul className="space-y-1">
                  {category.conditions.map((condition, cIndex) => (
                    <li key={cIndex} className="text-xs text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs font-medium text-amber-700 mb-2">Screening Recommendations</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Primary aldosteronism: Screen if hypokalemia, resistant HTN, or adrenal incidentaloma</li>
              <li>• Renovascular disease: Consider if sudden onset, flash pulmonary edema, or asymmetric kidneys</li>
              <li>• Pheochromocytoma: Screen if episodic symptoms, family history, or adrenal mass</li>
              <li>• Cushing's: Screen if central obesity, purple striae, proximal myopathy</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
