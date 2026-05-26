// Anemia classification + prescription engine
// Combines WHO Hb cutoffs, MCV-based workup, KDIGO 2012 for CKD-anemia

export type Sex = "M" | "F";

export interface AnemiaInput {
  age: number;
  sex: Sex;
  weightKg?: number;
  pregnant?: boolean;
  hb: number; // g/dL
  mcv?: number; // fL
  ferritin?: number; // ng/mL
  tsat?: number; // % transferrin saturation
  b12?: number; // pg/mL
  folate?: number; // ng/mL
  retic?: number; // %
  crp?: number; // mg/L
  eGFR?: number; // mL/min/1.73m2
  onDialysis?: boolean;
}

export type AnemiaSeverity = "none" | "mild" | "moderate" | "severe";
export type AnemiaMorphology =
  | "microcytic"
  | "normocytic"
  | "macrocytic"
  | "unknown";
export type AnemiaCause =
  | "iron-deficiency"
  | "b12-deficiency"
  | "folate-deficiency"
  | "anemia-of-ckd"
  | "anemia-of-chronic-disease"
  | "mixed-deficiency"
  | "unclassified";

export interface AnemiaPrescription {
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface AnemiaAssessment {
  severity: AnemiaSeverity;
  morphology: AnemiaMorphology;
  hbTarget: string;
  likelyCauses: AnemiaCause[];
  workup: string[];
  prescriptions: AnemiaPrescription[];
  warnings: string[];
  guidelineRefs: string[];
}

// WHO Hb thresholds (g/dL) for anemia
function hbThreshold(sex: Sex, age: number, pregnant?: boolean): number {
  if (age < 5) return 11.0;
  if (age < 12) return 11.5;
  if (age < 15) return 12.0;
  if (sex === "F") return pregnant ? 11.0 : 12.0;
  return 13.0;
}

export function classifySeverity(hb: number): AnemiaSeverity {
  if (hb >= 12) return "none";
  if (hb >= 10) return "mild";
  if (hb >= 7) return "moderate";
  return "severe";
}

export function classifyMorphology(mcv?: number): AnemiaMorphology {
  if (!mcv) return "unknown";
  if (mcv < 80) return "microcytic";
  if (mcv > 100) return "macrocytic";
  return "normocytic";
}

export function assessAnemia(input: AnemiaInput): AnemiaAssessment {
  const threshold = hbThreshold(input.sex, input.age, input.pregnant);
  const isAnemic = input.hb < threshold;
  const severity = isAnemic ? classifySeverity(input.hb) : "none";
  const morphology = classifyMorphology(input.mcv);

  const likelyCauses: AnemiaCause[] = [];
  const workup: string[] = [];
  const prescriptions: AnemiaPrescription[] = [];
  const warnings: string[] = [];
  const guidelineRefs: string[] = [];

  if (!isAnemic) {
    return {
      severity: "none",
      morphology,
      hbTarget: `≥ ${threshold} g/dL (WHO)`,
      likelyCauses: [],
      workup: ["No anemia by WHO criteria — no further workup needed."],
      prescriptions: [],
      warnings: [],
      guidelineRefs: ["WHO Hb cutoffs for anemia (2011)"],
    };
  }

  // Iron deficiency
  const lowFerritin =
    input.ferritin !== undefined &&
    (input.ferritin < 30 || (input.crp && input.crp > 5 && input.ferritin < 100));
  const lowTsat = input.tsat !== undefined && input.tsat < 20;

  // CKD anemia
  const isCKD = (input.eGFR !== undefined && input.eGFR < 60) || input.onDialysis;

  // Macrocytic — B12/folate
  if (morphology === "macrocytic" || input.b12 !== undefined || input.folate !== undefined) {
    if (input.b12 !== undefined && input.b12 < 200) {
      likelyCauses.push("b12-deficiency");
      prescriptions.push({
        drug: "Cyanocobalamin (Vitamin B12)",
        dose: "1000 mcg IM",
        frequency: "Daily × 1 week, then weekly × 4 weeks, then monthly",
        duration: "Lifelong if pernicious anemia / malabsorption",
        notes: "Oral 1000–2000 mcg OD acceptable if no malabsorption",
      });
    }
    if (input.folate !== undefined && input.folate < 4) {
      likelyCauses.push("folate-deficiency");
      prescriptions.push({
        drug: "Folic acid",
        dose: "5 mg PO",
        frequency: "Once daily",
        duration: "1–4 months until repletion",
        notes: "Rule out B12 deficiency first to avoid masking neuro symptoms",
      });
    }
    if (likelyCauses.length === 0) {
      workup.push("Check serum B12 and folate; consider MMA/homocysteine if borderline.");
      workup.push("Review medications (methotrexate, metformin, PPIs, anticonvulsants).");
    }
  }

  // Microcytic — iron
  if (morphology === "microcytic" || lowFerritin || lowTsat) {
    likelyCauses.push("iron-deficiency");
    workup.push("Identify source of blood loss (GI evaluation if age >50 or risk factors; menstrual history).");
    if (severity === "severe" || input.hb < 7) {
      prescriptions.push({
        drug: "Packed RBC transfusion",
        dose: "1–2 units",
        frequency: "Based on symptoms",
        duration: "Acute",
        notes: "Symptomatic anemia or Hb <7 g/dL (or <8 in cardiac disease)",
      });
    }
    prescriptions.push({
      drug: "Ferrous sulfate (or ferrous ascorbate)",
      dose: "65 mg elemental iron",
      frequency: "Once daily or alternate-day (better absorption, fewer GI effects)",
      duration: "3 months after Hb normalizes to refill stores",
      notes: "Take on empty stomach with vitamin C; avoid with calcium/tea/PPI",
    });
    if (severity !== "mild" || isCKD) {
      prescriptions.push({
        drug: "IV iron (ferric carboxymaltose / iron sucrose)",
        dose: "FCM 750–1000 mg (max 15 mg/kg) or sucrose 200 mg",
        frequency: "Single infusion or 2–3 doses 1 week apart",
        duration: "Until ferritin 100–500 / TSAT 20–30%",
        notes: "Preferred over PO if intolerance, malabsorption, CKD, or rapid repletion needed",
      });
    }
  }

  // Anemia of CKD
  if (isCKD) {
    likelyCauses.push("anemia-of-ckd");
    guidelineRefs.push("KDIGO 2012 Clinical Practice Guideline for Anemia in CKD");
    workup.push("CKD-anemia workup: TSAT, ferritin, B12, folate, retic count, CRP.");
    // Replete iron first per KDIGO
    if (
      input.tsat === undefined ||
      input.ferritin === undefined ||
      input.tsat <= 30 ||
      input.ferritin <= (input.onDialysis ? 500 : 500)
    ) {
      // already added oral/IV iron above if iron-deficient; if not, add now
      if (!likelyCauses.includes("iron-deficiency")) {
        prescriptions.push({
          drug: "IV iron (ferric carboxymaltose) — CKD",
          dose: "FCM 500–1000 mg",
          frequency: "1–3 infusions",
          duration: "Target TSAT >20% and ferritin >100 (ND-CKD) / >200 (HD-CKD)",
          notes: "KDIGO 2.1.2 — IV iron preferred in HD-CKD; oral acceptable in ND-CKD",
        });
      }
    }
    // ESA threshold
    if (input.hb < 10) {
      prescriptions.push({
        drug: "Erythropoiesis-stimulating agent (Epoetin alfa / Darbepoetin)",
        dose: "Epoetin 50–100 U/kg SC 3×/week or Darbepoetin 0.45 mcg/kg SC weekly",
        frequency: "Titrate by Hb response",
        duration: "Long-term; reassess monthly",
        notes:
          "KDIGO 3.4 — initiate when Hb 9–10 g/dL; target 10–11.5 g/dL; do not exceed 13 g/dL",
      });
      warnings.push("Address iron deficiency BEFORE starting ESA (KDIGO 2.1).");
      warnings.push("ESAs increase risk of stroke, thrombosis, HTN — caution in active malignancy/recent stroke.");
    }
    // HIF-PHI alternative
    prescriptions.push({
      drug: "HIF-PH inhibitor (Roxadustat / Daprodustat) — alternative",
      dose: "Roxadustat 70–100 mg PO 3×/week (weight-based)",
      frequency: "3 times per week",
      duration: "Long-term",
      notes: "Oral alternative to ESA; FDA-approved for dialysis-dependent CKD anemia",
    });
  }

  // Normocytic, no clear cause → ACD vs other
  if (morphology === "normocytic" && likelyCauses.length === 0) {
    likelyCauses.push("anemia-of-chronic-disease");
    workup.push("Check CRP, ferritin (>100 suggests ACD), TSAT, retic count, peripheral smear.");
    workup.push("Evaluate for chronic infection, inflammation, malignancy.");
    workup.push("Consider bone marrow if pancytopenia or unexplained.");
  }

  // Mixed
  if (likelyCauses.length > 1) {
    likelyCauses.push("mixed-deficiency");
  }

  if (likelyCauses.length === 0) {
    likelyCauses.push("unclassified");
    workup.push("Send CBC with differential, retic count, peripheral smear, iron studies, B12, folate, LFT, RFT, TSH.");
  }

  // Severity-based warnings
  if (severity === "severe") {
    warnings.push("Severe anemia — assess hemodynamic stability; consider hospitalization and transfusion.");
  }
  if (input.pregnant) {
    warnings.push("Pregnancy: prefer oral iron + folic acid; IV iron after 2nd trimester if needed.");
  }

  guidelineRefs.push("WHO Hb cutoffs (2011)");
  if (morphology === "macrocytic") guidelineRefs.push("ASH 2020 — macrocytic anemia workup");
  if (likelyCauses.includes("iron-deficiency"))
    guidelineRefs.push("BSG 2021 — IDA in adults; alternate-day oral iron (Stoffel 2017)");

  return {
    severity,
    morphology,
    hbTarget:
      isCKD ? "10–11.5 g/dL (KDIGO)" : `≥ ${threshold} g/dL (WHO)`,
    likelyCauses: Array.from(new Set(likelyCauses)),
    workup,
    prescriptions,
    warnings,
    guidelineRefs,
  };
}

export function severityLabel(s: AnemiaSeverity): string {
  return { none: "No anemia", mild: "Mild", moderate: "Moderate", severe: "Severe" }[s];
}

export function causeLabel(c: AnemiaCause): string {
  return {
    "iron-deficiency": "Iron deficiency",
    "b12-deficiency": "Vitamin B12 deficiency",
    "folate-deficiency": "Folate deficiency",
    "anemia-of-ckd": "Anemia of CKD",
    "anemia-of-chronic-disease": "Anemia of chronic disease",
    "mixed-deficiency": "Mixed deficiency",
    "unclassified": "Unclassified — needs workup",
  }[c];
}
