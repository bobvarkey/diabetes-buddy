import { PatientData } from "./patient-data";

export interface MedRecommendation {
  drug: string;
  dose: string;
  frequency: string;
  reason: string;
  priority: "first-line" | "add-on" | "adjustment" | "emergency";
  warnings: string[];
  adaReference: string;
}

export interface HypoProtocol {
  trigger: string;
  immediate: string[];
  followUp: string[];
}

export function generateMedRecommendations(patient: PatientData): MedRecommendation[] {
  const recs: MedRecommendation[] = [];

  // Rule 1: BMI >27 + HF → Semaglutide first-line
  if (patient.bmi > 27 && patient.hfNYHA >= 2) {
    recs.push({
      drug: "Semaglutide (Ozempic)",
      dose: "0.25mg",
      frequency: "Weekly SC injection",
      reason: `BMI ${patient.bmi} (>27) + HF NYHA ${patient.hfNYHA} → GLP-1 RA first-line for weight + cardioprotection`,
      priority: "first-line",
      warnings: [
        "Start 0.25mg × 4 weeks, then escalate to 0.5mg",
        "Monitor for GI side effects (nausea, vomiting)",
        "Contraindicated in personal/family MTC history",
        patient.postStrokeDysphagia ? "⚠ Post-stroke dysphagia: monitor for aspiration with nausea" : "",
      ].filter(Boolean),
      adaReference: "ADA 2026 §9.3 – GLP-1 RA preferred in T2DM + HF + Obesity",
    });
  }

  // Rule 2: eGFR 30-60 → Sitagliptin 50mg BD
  if (patient.eGFR >= 30 && patient.eGFR < 60) {
    const currentSita = patient.currentMeds.some(m => m.toLowerCase().includes("sitagliptin"));
    recs.push({
      drug: "Sitagliptin (Januvia)",
      dose: "50mg",
      frequency: "Twice daily",
      reason: `eGFR ${patient.eGFR} (30-60) → Renal-dose adjustment required. ${currentSita ? "ADJUST current 100mg to 50mg" : "Renal-safe DPP-4i"}`,
      priority: currentSita ? "adjustment" : "add-on",
      warnings: [
        "Renal dose: 50mg for eGFR 30-50, 25mg for eGFR <30",
        "Monitor renal function q3 months",
        currentSita ? "⚠ REDUCE from current 100mg dose" : "",
      ].filter(Boolean),
      adaReference: "ADA 2026 §11.2 – CKD dose adjustments for DPP-4 inhibitors",
    });
  } else if (patient.eGFR < 30) {
    recs.push({
      drug: "Sitagliptin (Januvia)",
      dose: "25mg",
      frequency: "Once daily",
      reason: `eGFR ${patient.eGFR} (<30) → Severe renal impairment dose`,
      priority: "adjustment",
      warnings: ["Nephrology review recommended", "Consider alternative if eGFR declining rapidly"],
      adaReference: "ADA 2026 §11.2",
    });
  }

  // Rule 3: RBS >250 → Empagliflozin if eGFR >20
  if (patient.rbs > 250 && patient.eGFR > 20) {
    recs.push({
      drug: "Empagliflozin (Jardiance)",
      dose: "10mg",
      frequency: "Once daily morning",
      reason: `RBS ${patient.rbs} (>250) + eGFR ${patient.eGFR} (>20) → SGLT2i for glycemic + cardio-renal benefit`,
      priority: "add-on",
      warnings: [
        "Monitor for euglycemic DKA (esp. post-stroke patients)",
        "Ensure adequate hydration",
        "Hold before surgery or acute illness",
        patient.hfNYHA >= 2 ? "✓ Additional HF benefit (EMPEROR-Reduced)" : "",
        "Monitor eGFR - stop if <20",
      ].filter(Boolean),
      adaReference: "ADA 2026 §9.4 – SGLT2i in T2DM + CKD + HF",
    });
  }

  // Voglibose assessment
  if (patient.currentMeds.some(m => m.toLowerCase().includes("voglibose"))) {
    recs.push({
      drug: "Voglibose",
      dose: "0.3mg",
      frequency: "TDS (with meals)",
      reason: "Current medication – alpha-glucosidase inhibitor for post-prandial glucose",
      priority: "adjustment",
      warnings: [
        "Limited HbA1c reduction (0.5-0.8%)",
        "GI side effects (flatulence, diarrhea)",
        "Consider de-escalation if GLP-1 RA started",
        patient.postStrokeDysphagia ? "⚠ Dysphagia: ensure tablet can be swallowed safely" : "",
      ].filter(Boolean),
      adaReference: "ADA 2026 §9.2 – Role in Asian populations",
    });
  }

  // LAI Lipid targets
  if (patient.ldl > 55) {
    recs.push({
      drug: "Rosuvastatin",
      dose: patient.ldl > 100 ? "20mg" : "10mg",
      frequency: "Once daily at bedtime",
      reason: `LDL ${patient.ldl} mg/dL → Post-stroke target <55 mg/dL (LAI very high-risk)`,
      priority: "first-line",
      warnings: [
        "Target LDL <55 mg/dL for post-stroke + DM",
        "Check LFT at 3 months",
        patient.eGFR < 60 ? "⚠ Renal dosing: max 10mg if eGFR <30" : "",
      ].filter(Boolean),
      adaReference: "ADA 2026 §10.2 + LAI Lipid Guidelines – Very high CV risk",
    });
  }

  return recs;
}

export function getHypoProtocol(patient: PatientData): HypoProtocol | null {
  const hasHypoRisk = patient.serialBG.some(bg => bg < 70) || patient.fbs < 70;
  
  return {
    trigger: "Blood glucose < 70 mg/dL",
    immediate: [
      "Moru (buttermilk) 240ml immediately – 5g fast carbs",
      "15g almonds (badam) – sustained glucose release",
      "Recheck BG in 15 minutes",
      patient.postStrokeDysphagia ? "⚠ DYSPHAGIA: Use thickened moru, avoid whole almonds → use almond paste" : "",
    ],
    followUp: [
      "If BG still <70: repeat 15g carb rule",
      "Moru every 3 hours until BG stable >100",
      "Document episode and inform physician",
      "Review sulfonylurea/insulin doses",
    ],
  };
}

export function getLipidTargets(patient: PatientData) {
  return {
    ldlTarget: 55,
    ldlCurrent: patient.ldl,
    ldlGap: patient.ldl - 55,
    trigTarget: 150,
    trigCurrent: patient.triglycerides || 0,
    hdlTarget: patient.gender === "M" ? 40 : 50,
    hdlCurrent: patient.hdl || 0,
    riskCategory: "Very High (Post-stroke + T2DM)",
  };
}
