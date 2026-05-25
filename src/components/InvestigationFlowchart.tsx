import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  ClipboardList,
  Search,
  CheckCircle,
  ArrowRight,
  Activity,
  FlaskConical,
  Microscope,
  Heart
} from "lucide-react";

const investigationSteps = [
  {
    step: 1,
    title: "Initial Assessment",
    color: "bg-blue-500",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/5",
    items: [
      "History & Physical Examination",
      "Blood Pressure confirmation (≥3 readings)",
      "Basic metabolic panel",
      "Urinalysis"
    ],
    type: "Initial"
  },
  {
    step: 2,
    title: "Baseline Investigations",
    color: "bg-teal-500",
    borderColor: "border-teal-500/30",
    bgColor: "bg-teal-500/5",
    items: [
      "Serum creatinine, BUN, eGFR",
      "Serum electrolytes (Na+, K+)",
      "Fasting glucose, HbA1c",
      "Lipid profile",
      "ECG",
      "Urinalysis with microalbuminuria"
    ],
    type: "Investigation"
  },
  {
    step: 3,
    title: "Screen for Secondary Causes",
    color: "bg-amber-500",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/5",
    items: [
      "Aldosterone/Renin Ratio",
      "TSH, Free T4",
      "Plasma/Urine Metanephrines",
      "Overnight Dexamethasone Suppression",
      "Sleep Study (if symptomatic)",
      "Renal Doppler Ultrasound"
    ],
    type: "Screening"
  },
  {
    step: 4,
    title: "Confirmatory Testing",
    color: "bg-orange-500",
    borderColor: "border-orange-500/30",
    bgColor: "bg-orange-500/5",
    items: [
      "Saline Suppression Test (aldosteronism)",
      "CT/MRI Adrenals",
      "CTA/MRA Renal Arteries",
      "24h Urine Cortisol",
      "Adrenal Vein Sampling",
      "MIBG scan if positive"
    ],
    type: "Confirmatory"
  },
  {
    step: 5,
    title: "Targeted Treatment",
    color: "bg-emerald-500",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/5",
    items: [
      "Treat underlying cause",
      "Optimize antihypertensive therapy",
      "Monitor response",
      "Follow-up investigations"
    ],
    type: "Outcome"
  }
];

export function InvestigationFlowchart() {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Investigation Flowchart</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Systematic approach to secondary hypertension workup
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {investigationSteps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector line */}
              {index < investigationSteps.length - 1 && (
                <div className="absolute left-6 top-14 w-0.5 h-8 bg-gradient-to-b from-gray-300 to-gray-300 z-0" />
              )}

              <div className={`flex gap-4 p-4 rounded-xl border-2 ${step.borderColor} ${step.bgColor} transition-all hover:shadow-md`}>
                {/* Step Number */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full ${step.color} text-white flex items-center justify-center font-bold text-lg shadow-lg`}>
                  {step.step}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-foreground">{step.title}</h3>
                    <Badge variant="outline" className={`text-[10px] ${step.color.replace('bg-', 'border-')}`}>
                      {step.type}
                    </Badge>
                  </div>

                  <ul className="space-y-1.5">
                    {step.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full ${step.color} mt-1.5 flex-shrink-0`} />
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Arrow for next step */}
                {index < investigationSteps.length - 1 && (
                  <div className="hidden md:flex items-center">
                    <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Legend:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Initial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <span>Investigation</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Screening</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Confirmatory</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Outcome</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default InvestigationFlowchart;
