import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GLP1Administration = () => {
  const [expandedMed, setExpandedMed] = useState<string | null>("semaglutide");

  const glp1Medications = [
    {
      id: "semaglutide",
      name: "Semaglutide",
      brands: ["Ozempic", "Wegovy", "Rybelsus"],
      frequency: "Once weekly (subcutaneous)",
      doses: {
        ozempic: [
          { dose: "0.25 mg", indication: "Starting dose", week: "Weeks 0-4" },
          { dose: "0.5 mg", indication: "Maintenance/Escalation", week: "Weeks 4-8" },
          { dose: "1.0 mg", indication: "Escalation", week: "Weeks 8-12" },
          { dose: "2.4 mg", indication: "Maximum effective dose", week: "Week 12+" },
        ],
        wegovy: [
          { dose: "0.25 mg", indication: "Starting dose", week: "Weeks 0-4" },
          { dose: "0.5 mg", indication: "Escalation", week: "Weeks 4-8" },
          { dose: "1.0 mg", indication: "Escalation", week: "Weeks 8-12" },
          { dose: "1.7 mg", indication: "Escalation", week: "Weeks 12-16" },
          { dose: "2.4 mg", indication: "Maximum dose", week: "Week 16+" },
        ],
      },
      storage: "Refrigerate 2-8°C before use. After first use: room temp up to 30°C for 56 days",
      administrationTips: [
        "Inject subcutaneously in abdomen, thigh, or upper arm",
        "Rotate injection sites to prevent lipohypertrophy",
        "Can be taken any day of the week, maintain weekly schedule",
        "May give with or without meals",
        "Allow 15-30 min for pen to reach room temperature before use",
      ],
    },
    {
      id: "liraglutide",
      name: "Liraglutide",
      brands: ["Victoza", "Saxenda"],
      frequency: "Once daily (subcutaneous)",
      doses: {
        victoza: [
          { dose: "0.6 mg", indication: "Starting dose", week: "Week 1" },
          { dose: "1.2 mg", indication: "Escalation", week: "Week 2" },
          { dose: "1.8 mg", indication: "Escalation", week: "Week 3+" },
        ],
        saxenda: [
          { dose: "0.6 mg", indication: "Starting dose", week: "Week 1" },
          { dose: "1.2 mg", indication: "Escalation", week: "Week 2" },
          { dose: "1.8 mg", indication: "Escalation", week: "Week 3" },
          { dose: "2.4 mg", indication: "Escalation", week: "Week 4" },
          { dose: "3.0 mg", indication: "Maximum dose", week: "Week 5+" },
        ],
      },
      storage: "Refrigerate 2-8°C. After first use: max 30°C for 30 days",
      administrationTips: [
        "Daily injection at same time of day (usually morning or evening)",
        "Inject into abdomen, thigh, or upper arm",
        "Use new needle for each injection",
        "Can eat before, during, or after injection",
        "Gradual dose escalation reduces GI side effects",
      ],
    },
    {
      id: "dulaglutide",
      name: "Dulaglutide",
      brands: ["Trulicity"],
      frequency: "Once weekly (subcutaneous)",
      doses: {
        trulicity: [
          { dose: "0.75 mg", indication: "Starting dose", week: "Weeks 0-4" },
          { dose: "1.5 mg", indication: "Standard maintenance", week: "Weeks 4+" },
          { dose: "3.0 mg", indication: "Escalation", week: "Weeks 4+" },
          { dose: "4.5 mg", indication: "Maximum dose", week: "Weeks 4+" },
        ],
      },
      storage: "Refrigerate 2-8°C. After first use: up to 30°C for 14 days",
      administrationTips: [
        "Pre-filled pen, ready to use",
        "Inject any time of day, same day each week",
        "Abdomen, thigh, or upper arm injection",
        "Minimal dose titration - faster to therapeutic dose",
        "Can switch injection day as long as 3 days apart",
      ],
    },
    {
      id: "tirzepatide",
      name: "Tirzepatide (GLP-1/GIP Agonist)",
      brands: ["Mounjaro", "Zepbound"],
      frequency: "Once weekly (subcutaneous)",
      doses: {
        mounjaro: [
          { dose: "2.5 mg", indication: "Starting dose", week: "Weeks 0-4" },
          { dose: "5.0 mg", indication: "Escalation", week: "Weeks 4-8" },
          { dose: "7.5 mg", indication: "Escalation", week: "Weeks 8-12" },
          { dose: "10.0 mg", indication: "Escalation", week: "Weeks 12-16" },
          { dose: "12.5 mg", indication: "Escalation", week: "Weeks 16-20" },
          { dose: "15.0 mg", indication: "Maximum dose", week: "Week 20+" },
        ],
      },
      storage: "Refrigerate 2-8°C. After first use: room temp max 30°C for 21 days",
      administrationTips: [
        "Dual GLP-1/GIP receptor agonist - enhanced efficacy",
        "Inject same day each week, any time of day",
        "Abdomen, thigh, or upper arm",
        "Stronger weight loss and glycemic effect than GLP-1 alone",
        "More frequent titration required",
      ],
    },
  ];

  const injectionSites = [
    {
      area: "Abdomen",
      icon: "🫀",
      details: "2 fingers away from navel, lateral lower abdomen preferred",
      pros: "Best absorption, easiest self-administration",
      cons: "More GI side effects if tender",
    },
    {
      area: "Thigh",
      icon: "🦵",
      details: "Outer aspect, front or back, 4 fingers below hip",
      pros: "Good alternative, less GI disturbance",
      cons: "Slightly slower absorption",
    },
    {
      area: "Upper Arm",
      icon: "💪",
      details: "Back of upper arm, middle third",
      pros: "Discreet, good for rotation",
      cons: "Requires assistance or more dexterity",
    },
  ];

  const commonSideEffects = [
    {
      effect: "Nausea",
      onset: "Days 1-3",
      management: "Take anti-nausea meds, small frequent meals, ginger tea, slower titration",
      resolve: "Usually resolves within 1-2 weeks",
    },
    {
      effect: "Vomiting",
      onset: "Days 2-7",
      management: "Notify provider, may need anti-emetic, consider dose pause",
      resolve: "2-3 weeks with management",
    },
    {
      effect: "Constipation/Diarrhea",
      onset: "Week 1-2",
      management: "Increase fiber, water, psyllium husk, stool softeners",
      resolve: "Usually improves by week 3-4",
    },
    {
      effect: "Abdominal Pain",
      onset: "Days 1-4",
      management: "Use heating pad, antispasmodics, small meals, slow movement",
      resolve: "Typically 3-5 days",
    },
    {
      effect: "Appetite Suppression",
      onset: "Day 1",
      management: "Monitor nutrition, ensure adequate protein intake, supplements if needed",
      resolve: "Persists (desired effect)",
    },
    {
      effect: "Pancreatitis (rare)",
      onset: "Variable",
      management: "STOP immediately, seek emergency care if severe upper abdominal pain",
      resolve: "Monitor with amylase/lipase levels",
    },
  ];

  const safetyConsiderations = [
    "Monitor for medullary thyroid carcinoma (MTC) symptoms: neck swelling, persistent cough, difficulty swallowing",
    "Contraindicated in personal/family history of MTC or MEN-2",
    "Adjust other diabetes meds to prevent hypoglycemia",
    "Dehydration risk - ensure adequate fluid intake",
    "Monitor renal function (can cause acute kidney injury in dehydration)",
    "Gallbladder effects - report right upper quadrant pain",
    "May affect diabetic retinopathy - coordinate with ophthalmology",
    "Pregnancy: most GLP-1s Category C/D - discontinue if pregnancy planned",
    "Drug interactions: slower gastric emptying may affect other oral medications",
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">GLP-1 Agonist Administration</h1>
        <p className="text-muted-foreground">
          Comprehensive guide to GLP-1 receptor agonist medications, dosing, and injection techniques
        </p>
      </div>

      {/* Quick Overview */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h2 className="font-bold mb-3 text-lg">Quick Reference</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold block">Route:</span>
            <span className="text-muted-foreground">Subcutaneous</span>
          </div>
          <div>
            <span className="font-semibold block">Frequency:</span>
            <span className="text-muted-foreground">Daily or Weekly</span>
          </div>
          <div>
            <span className="font-semibold block">Onset:</span>
            <span className="text-muted-foreground">30 min - 1 hour</span>
          </div>
          <div>
            <span className="font-semibold block">Peak:</span>
            <span className="text-muted-foreground">8-12 hours</span>
          </div>
        </div>
      </Card>

      {/* Medications */}
      <Card className="p-6">
        <h2 className="text-2xl font-heading font-bold mb-4">GLP-1 Medications & Dosing</h2>
        <div className="space-y-3">
          {glp1Medications.map((med) => (
            <div
              key={med.id}
              className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedMed(expandedMed === med.id ? null : med.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg">{med.name}</h3>
                  <p className="text-sm text-muted-foreground">{med.brands.join(", ")}</p>
                </div>
                <span className="text-2xl">{expandedMed === med.id ? "▼" : "▶"}</span>
              </div>
              <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-2 rounded inline-block">
                {med.frequency}
              </p>

              {expandedMed === med.id && (
                <div className="mt-4 space-y-4 border-t pt-4">
                  {Object.entries(med.doses).map(([brand, dosing]) => (
                    <div key={brand}>
                      <h4 className="font-semibold capitalize mb-2">{brand}</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Dose</th>
                            <th className="text-left py-2">Indication</th>
                            <th className="text-left py-2">Timeline</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dosing.map((d, idx) => (
                            <tr key={idx} className="border-b hover:bg-muted/50">
                              <td className="py-2 font-medium text-blue-600 dark:text-blue-400">
                                {d.dose}
                              </td>
                              <td className="py-2 text-muted-foreground">{d.indication}</td>
                              <td className="py-2 text-muted-foreground">{d.week}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}

                  <div>
                    <h4 className="font-semibold mb-2">Storage</h4>
                    <p className="text-sm bg-amber-50 dark:bg-amber-950/20 p-3 rounded">
                      {med.storage}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Administration Tips</h4>
                    <ul className="text-sm space-y-1">
                      {med.administrationTips.map((tip, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Injection Technique */}
      <Card className="p-6">
        <h2 className="text-2xl font-heading font-bold mb-4">Injection Technique & Sites</h2>

        <Tabs defaultValue="technique" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="technique">Step-by-Step</TabsTrigger>
            <TabsTrigger value="sites">Injection Sites</TabsTrigger>
          </TabsList>

          <TabsContent value="technique" className="space-y-4">
            <div className="space-y-4">
              {[
                {
                  step: "1. Prepare",
                  details: [
                    "Wash hands thoroughly",
                    "Gather supplies: pen/syringe, new needle, alcohol swab",
                    "Allow cold medication to reach room temperature (15-30 min)",
                    "Inspect for particles or discoloration (should be clear)",
                  ],
                },
                {
                  step: "2. Select Site",
                  details: [
                    "Choose injection site (abdomen, thigh, or upper arm)",
                    "Rotate sites to prevent lipohypertrophy",
                    "Avoid areas with scars, bruises, or infections",
                    "Mark rotation pattern on calendar",
                  ],
                },
                {
                  step: "3. Prepare Site",
                  details: [
                    "Pinch skin firmly with thumb and forefinger",
                    "Clean area with alcohol swab in circular motion",
                    "Wait 10-15 seconds for alcohol to dry completely",
                    "DO NOT touch cleaned area",
                  ],
                },
                {
                  step: "4. Inject",
                  details: [
                    "Hold pen/syringe at 90° angle to skin",
                    "Push needle straight through skin in one motion",
                    "Inject medication slowly (take 5-10 seconds)",
                    "Keep needle in skin for 10 seconds after injection",
                  ],
                },
                {
                  step: "5. Complete",
                  details: [
                    "Remove needle carefully and apply pressure briefly",
                    "Do NOT recap needle (if syringe)",
                    "Dispose in sharps container",
                    "Note time, dose, and site in log",
                  ],
                },
              ].map((section, idx) => (
                <div
                  key={idx}
                  className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20"
                >
                  <h4 className="font-bold text-lg mb-3">{section.step}</h4>
                  <ul className="space-y-2">
                    {section.details.map((detail, didx) => (
                      <li key={didx} className="flex gap-2 text-sm">
                        <span className="text-blue-600 font-bold">→</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sites">
            <div className="grid md:grid-cols-3 gap-4">
              {injectionSites.map((site, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="text-4xl mb-3">{site.icon}</div>
                  <h4 className="font-bold text-lg mb-2">{site.area}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{site.details}</p>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-green-600">✓ Pros:</span>
                      <p className="text-muted-foreground">{site.pros}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-amber-600">⚠ Cons:</span>
                      <p className="text-muted-foreground">{site.cons}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-bold mb-2">Rotation Pattern Example</h4>
              <p className="text-sm text-muted-foreground mb-3">
                To prevent lipohypertrophy (fat lumps):
              </p>
              <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">Week 1<br/>Abd L</div>
                <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded">Week 2<br/>Abd R</div>
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded">Week 3<br/>Thigh L</div>
                <div className="p-2 bg-green-200 dark:bg-green-800 rounded">Week 4<br/>Thigh R</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Then repeat with upper arms, thighs, and abdomen in different spots
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Side Effects Management */}
      <Card className="p-6">
        <h2 className="text-2xl font-heading font-bold mb-4">Side Effects & Management</h2>
        <div className="space-y-3">
          {commonSideEffects.map((se, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">
                  {se.effect === "Nausea"
                    ? "🤢"
                    : se.effect === "Vomiting"
                      ? "🤮"
                      : se.effect === "Constipation/Diarrhea"
                        ? "🚽"
                        : se.effect === "Abdominal Pain"
                          ? "🤕"
                          : se.effect === "Appetite Suppression"
                            ? "🍽️"
                            : "⚠️"}
                </span>
                <div className="flex-1">
                  <h4 className="font-bold">{se.effect}</h4>
                  <p className="text-xs text-muted-foreground">Onset: {se.onset}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Management:</span>
                  <p className="text-muted-foreground">{se.management}</p>
                </div>
                <div>
                  <span className="font-semibold">Resolution:</span>
                  <p className="text-muted-foreground">{se.resolve}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Safety Considerations */}
      <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
        <h2 className="text-2xl font-heading font-bold mb-4">⚠️ Safety Considerations</h2>
        <ul className="space-y-2">
          {safetyConsiderations.map((safety, idx) => (
            <li key={idx} className="flex gap-3 text-sm">
              <span className="text-red-600 font-bold">✗</span>
              <span>{safety}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Medication Interactions */}
      <Card className="p-6">
        <h2 className="text-2xl font-heading font-bold mb-4">Important Medication Interactions</h2>
        <div className="space-y-3">
          {[
            {
              drug: "Sulfonylureas (Glyburide, Glipizide)",
              concern: "Increased hypoglycemia risk",
              action: "Reduce SU dose when starting GLP-1",
            },
            {
              drug: "Insulin",
              concern: "Hypoglycemia risk",
              action: "Reduce insulin doses; monitor closely",
            },
            {
              drug: "Oral Medications",
              concern: "Slower gastric emptying may reduce absorption",
              action: "Take 1-2 hours before GLP-1 injection",
            },
            {
              drug: "ACE-I / ARB",
              concern: "Risk of acute kidney injury in dehydration",
              action: "Monitor renal function, ensure hydration",
            },
            {
              drug: "NSAIDs",
              concern: "Dehydration/renal impairment risk",
              action: "Use alternative analgesics when possible",
            },
          ].map((interaction, idx) => (
            <div key={idx} className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
                {interaction.drug}
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-1">
                <span className="font-semibold">Concern:</span> {interaction.concern}
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <span className="font-semibold">Action:</span> {interaction.action}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Monitoring Parameters */}
      <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <h2 className="text-2xl font-heading font-bold mb-4">✓ Monitoring Parameters</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { param: "HbA1c", frequency: "Every 3 months", target: "<7% or individualized" },
            { param: "Fasting Glucose", frequency: "Weekly initially", target: "80-130 mg/dL" },
            { param: "Weight", frequency: "Weekly", target: "Track for dose adjustment" },
            { param: "Blood Pressure", frequency: "Monthly", target: "<130/80 mmHg" },
            { param: "Renal Function (eGFR, Cr)", frequency: "Baseline, then 6-12 months", target: "eGFR >30" },
            { param: "Pancreatic Enzymes (if symptoms)", frequency: "PRN", target: "Normal range" },
            { param: "Thyroid (TSH if hx of thyroid)", frequency: "Annually", target: "Normal" },
            { param: "Lipid Panel", frequency: "6-12 months", target: "Individual goals" },
          ].map((monitor, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <h4 className="font-bold">{monitor.param}</h4>
              <p className="text-xs text-muted-foreground">Frequency: {monitor.frequency}</p>
              <p className="text-sm mt-1">
                <span className="font-semibold">Target:</span> {monitor.target}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default GLP1Administration;
