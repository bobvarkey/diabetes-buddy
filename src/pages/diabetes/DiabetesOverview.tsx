import React from "react";
import { AlertCircle, Activity, Heart, Brain, Flame, Shield, Target, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AbbreviationHover, AbbrText } from "@/components/AbbreviationHover";

// Pathophysiology Section
const PathophysiologySection = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="clinical-card border-red-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Flame className="h-4 w-4 text-red-500" />
            </div>
            <CardTitle className="text-base">Type 1 Diabetes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Autoimmune destruction of pancreatic beta cells leading to absolute insulin deficiency.
            Typically presents in childhood or young adulthood.
          </p>
          <div className="space-y-1">
            <p className="text-xs font-medium">Key Features:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Autoantibodies present (GAD65, IA-2, ZnT8)</li>
              <li>• Rapid onset with classic symptoms</li>
              <li>• Ketosis-prone without insulin</li>
              <li>• Requires lifelong insulin therapy</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="clinical-card border-orange-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-orange-500" />
            </div>
            <CardTitle className="text-base">Type 2 Diabetes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Progressive insulin resistance with relative insulin deficiency.
            Strong genetic and lifestyle factors.
          </p>
          <div className="space-y-1">
            <p className="text-xs font-medium">Key Features:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Insulin resistance predominates initially</li>
              <li>• Beta-cell dysfunction develops over time</li>
              <li>• Often associated with obesity</li>
              <li>• May have slow, insidious onset</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="clinical-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          The "Ominous Octet" — Pathophysiologic Defects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { organ: "Brain", defect: "Neurotransmitter dysfunction", effect: "↑ Appetite" },
            { organ: "Liver", defect: "↑ Gluconeogenesis", effect: "↑ Fasting glucose" },
            { organ: "Muscle", defect: "↓ Glucose uptake", effect: "Post-prandial hyperglycemia" },
            { organ: "Fat", defect: "↑ Lipolysis", effect: "↑ FFA, insulin resistance" },
            { organ: "Gut", defect: "↓ Incretin effect", effect: "↓ Insulin secretion" },
            { organ: "α-cells", defect: "↑ Glucagon", effect: "↑ Hepatic glucose" },
            { organ: "β-cells", defect: "↓ Insulin secretion", effect: "Progressive hyperglycemia" },
            { organ: "Kidney", defect: "↑ Glucose reabsorption", effect: "Sustained hyperglycemia" },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs font-semibold text-foreground">{item.organ}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{item.defect}</p>
              <div className="mt-2 flex items-center gap-1">
                <ArrowRight className="h-3 w-3 text-red-500" />
                <span className="text-[10px] text-red-400">{item.effect}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Diagnostic Criteria Section
const DiagnosticCriteriaSection = () => {
  const criteria = [
    { test: "HbA1c", threshold: "≥ 6.5%", notes: "NGSP-certified, DCCT-aligned" },
    { test: "Fasting Plasma Glucose", threshold: "≥ 126 mg/dL (7.0 mmol/L)", notes: "No caloric intake for ≥ 8 hours" },
    { test: "2-Hour OGTT", threshold: "≥ 200 mg/dL (11.1 mmol/L)", notes: "75g anhydrous glucose load" },
    { test: "Random Plasma Glucose", threshold: "≥ 200 mg/dL", notes: "With classic symptoms of hyperglycemia" },
  ];

  const prediabetes = [
    { test: "HbA1c", range: "5.7–6.4%" },
    { test: "Fasting Glucose", range: "100–125 mg/dL (IFG)" },
    { test: "2-Hour OGTT", range: "140–199 mg/dL (IGT)" },
  ];

  return (
    <div className="space-y-4">
      <Card className="clinical-card border-destructive/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-destructive" />
            </div>
            <CardTitle className="text-base">ADA Diagnostic Criteria (2026)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Confirm with repeat testing on a subsequent day unless unequivocal hyperglycemia with acute metabolic decompensation.
          </p>
          <div className="space-y-2">
            {criteria.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex-1">
                  <p className="text-sm font-medium"><AbbrText text={c.test} /></p>
                  <p className="text-xs text-muted-foreground"><AbbrText text={c.notes} /></p>
                </div>
                <Badge variant="destructive" className="text-xs">{c.threshold}</Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            Source: ADA Standards of Care in Diabetes 2026
          </p>
        </CardContent>
      </Card>

      <Card className="clinical-card border-warning/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-warning" />
            </div>
            <CardTitle className="text-base">Prediabetes Categories</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {prediabetes.map((p, i) => (
              <div key={i} className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-sm font-medium"><AbbrText text={p.test} /></p>
                <p className="text-lg font-semibold text-warning mt-1">{p.range}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-muted/30">
            <p className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" />
              Risk Reduction Priority
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1">
              <li>• Lifestyle intervention reduces T2DM risk by 58% (DPP Study)</li>
              <li>• Metformin appropriate for high-risk patients (BMI ≥35, age &lt;60, prior GDM)</li>
              <li>• Annual screening for progression to diabetes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Risk Stratification Section
const RiskStratificationSection = () => {
  const complications = [
    {
      category: "Microvascular",
      icon: <Activity className="h-4 w-4" />,
      items: [
        { name: "Diabetic Retinopathy", risk: "Leading cause of blindness 20-74y" },
        { name: "Diabetic Nephropathy", risk: "Leading cause of ESRD" },
        { name: "Diabetic Neuropathy", risk: "50% develop neuropathy" },
      ],
    },
    {
      category: "Macrovascular",
      icon: <Heart className="h-4 w-4" />,
      items: [
        { name: "ASCVD", risk: "2-4x increased risk" },
        { name: "Heart Failure", risk: "2-5x increased risk" },
        { name: "Cerebrovascular Disease", risk: "Increased stroke risk" },
      ],
    },
  ];

  const riskFactors = [
    { factor: "Duration of diabetes", impact: "Each year ↑ complication risk" },
    { factor: "HbA1c > 9%", impact: "Poor control accelerates complications" },
    { factor: "Hypertension", impact: "Major accelerator of nephropathy" },
    { factor: "Dyslipidemia", impact: "Drives macrovascular disease" },
    { factor: "Smoking", impact: "Multiplies vascular risk" },
    { factor: "Albuminuria", impact: "Marker of endothelial dysfunction" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {complications.map((comp, i) => (
          <Card key={i} className="clinical-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  {React.cloneElement(comp.icon as React.ReactElement, { className: "h-4 w-4 text-primary" })}
                </div>
                <CardTitle className="text-base">{comp.category} Complications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {comp.items.map((item, j) => (
                <div key={j} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.risk}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="clinical-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Risk Factor Modifiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {riskFactors.map((rf, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg border border-border/50">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5",
                  i < 2 ? "bg-destructive" : i < 4 ? "bg-warning" : "bg-success"
                )} />
                <div>
                  <p className="text-sm font-medium"><AbbrText text={rf.factor} /></p>
                  <p className="text-xs text-muted-foreground">{rf.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="clinical-card border-success/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-success" />
            Risk Reduction Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { metric: "HbA1c", target: "< 7%", note: "Individualize based on age/comorbidities" },
              { metric: "BP", target: "< 130/80", note: "Most adults with diabetes" },
              { metric: "LDL-C", target: "< 100", note: "Statins for age 40-75 with diabetes" },
              { metric: "Non-HDL-C", target: "< 130", note: "Alternative target if TG elevated" },
            ].map((t, i) => (
              <div key={i} className="p-3 rounded-lg bg-success/5 border border-success/20 text-center">
                <p className="text-xs text-muted-foreground"><AbbrText text={t.metric} /></p>
                <p className="text-lg font-bold text-success">{t.target}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{t.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Component
export default function DiabetesOverview() {
  return (
    <div className="space-y-6">
      <PathophysiologySection />
      <Separator />
      <DiagnosticCriteriaSection />
      <Separator />
      <RiskStratificationSection />
    </div>
  );
}
