import { PatientData } from "./patient-data";

// ============================================================
// ADA 2026 COMPLETE MEDICATION DATABASE
// Priorities-first approach: CV/Kidney → Weight → Glycemic
// ============================================================

export interface MedRecommendation {
  drug: string;
  genericName: string;
  drugClass: DrugClass;
  dose: string;
  frequency: string;
  reason: string;
  priority: "first-line" | "add-on" | "adjustment" | "intensification" | "de-escalate" | "emergency";
  category: AlgorithmPriority;
  warnings: string[];
  contraindications: string[];
  adaReference: string;
  hba1cReduction: string;
  cvBenefit: boolean;
  renalBenefit: boolean;
  weightEffect: "loss" | "neutral" | "gain";
}

export type DrugClass =
  | "biguanide"
  | "sglt2i"
  | "glp1ra"
  | "dpp4i"
  | "sulfonylurea"
  | "tzd"
  | "agi"
  | "meglitinide"
  | "basal-insulin"
  | "prandial-insulin"
  | "premixed-insulin"
  | "dual-agonist"
  | "statin"
  | "ace-arb";

export type AlgorithmPriority = "cvkd-risk" | "weight-management" | "glycemic-control" | "lipid" | "current-med-review";

export interface HypoProtocol {
  trigger: string;
  immediate: string[];
  followUp: string[];
}

// ============================================================
// DRUG DATABASE — All ADA 2026 approved medications
// ============================================================

interface DrugProfile {
  name: string;
  generic: string;
  class: DrugClass;
  doses: { label: string; dose: string; frequency: string; condition?: string }[];
  hba1cReduction: string;
  cvBenefit: boolean;
  renalBenefit: boolean;
  weightEffect: "loss" | "neutral" | "gain";
  hypoRisk: "low" | "moderate" | "high";
  minEGFR: number;
  renalDoseAdjust?: { eGFRRange: [number, number]; dose: string; frequency: string }[];
  contraindications: string[];
  sideEffects: string[];
  adaReference: string;
}

const DRUG_DB: DrugProfile[] = [
  // === BIGUANIDE ===
  {
    name: "Metformin (Glucophage)",
    generic: "Metformin",
    class: "biguanide",
    doses: [
      { label: "Start", dose: "500mg", frequency: "OD with dinner" },
      { label: "Titrate", dose: "500mg", frequency: "BD (week 2)" },
      { label: "Target", dose: "1000mg", frequency: "BD (max 2550mg/day)" },
    ],
    hba1cReduction: "1.0-1.5%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "neutral",
    hypoRisk: "low",
    minEGFR: 30,
    renalDoseAdjust: [
      { eGFRRange: [30, 45], dose: "500mg", frequency: "BD (max 1000mg/day)" },
    ],
    contraindications: ["eGFR <30", "Acute/chronic metabolic acidosis", "Severe hepatic impairment"],
    sideEffects: ["GI (diarrhea, nausea)", "B12 deficiency (monitor annually)", "Lactic acidosis (rare)"],
    adaReference: "ADA 2026 §9.2 – Metformin as foundational therapy",
  },

  // === GLP-1 RECEPTOR AGONISTS ===
  {
    name: "Semaglutide (Ozempic)",
    generic: "Semaglutide",
    class: "glp1ra",
    doses: [
      { label: "Start", dose: "0.25mg", frequency: "Weekly SC × 4 weeks" },
      { label: "Step-up", dose: "0.5mg", frequency: "Weekly SC × 4 weeks" },
      { label: "Target", dose: "1.0mg", frequency: "Weekly SC" },
      { label: "Max", dose: "2.0mg", frequency: "Weekly SC" },
    ],
    hba1cReduction: "1.5-2.0%",
    cvBenefit: true,
    renalBenefit: true,
    weightEffect: "loss",
    hypoRisk: "low",
    minEGFR: 15,
    contraindications: ["Personal/family history of MTC", "MEN2 syndrome", "Pancreatitis history"],
    sideEffects: ["Nausea, vomiting (dose-dependent)", "Diarrhea", "Injection site reactions", "Gallbladder disease"],
    adaReference: "ADA 2026 §9.3 – GLP-1 RA proven CV benefit (SUSTAIN-6, SELECT)",
  },
  {
    name: "Liraglutide (Victoza)",
    generic: "Liraglutide",
    class: "glp1ra",
    doses: [
      { label: "Start", dose: "0.6mg", frequency: "Daily SC × 1 week" },
      { label: "Step-up", dose: "1.2mg", frequency: "Daily SC" },
      { label: "Target", dose: "1.8mg", frequency: "Daily SC" },
    ],
    hba1cReduction: "1.0-1.5%",
    cvBenefit: true,
    renalBenefit: true,
    weightEffect: "loss",
    hypoRisk: "low",
    minEGFR: 15,
    contraindications: ["Personal/family history of MTC", "MEN2 syndrome"],
    sideEffects: ["Nausea, vomiting", "Diarrhea", "Pancreatitis (rare)"],
    adaReference: "ADA 2026 §9.3 – GLP-1 RA proven CV benefit (LEADER)",
  },
  {
    name: "Dulaglutide (Trulicity)",
    generic: "Dulaglutide",
    class: "glp1ra",
    doses: [
      { label: "Start", dose: "0.75mg", frequency: "Weekly SC" },
      { label: "Target", dose: "1.5mg", frequency: "Weekly SC" },
      { label: "Max", dose: "4.5mg", frequency: "Weekly SC" },
    ],
    hba1cReduction: "1.2-1.6%",
    cvBenefit: true,
    renalBenefit: true,
    weightEffect: "loss",
    hypoRisk: "low",
    minEGFR: 15,
    contraindications: ["Personal/family history of MTC", "MEN2 syndrome"],
    sideEffects: ["Nausea, diarrhea", "Abdominal pain", "Injection site reactions"],
    adaReference: "ADA 2026 §9.3 – GLP-1 RA proven CV benefit (REWIND)",
  },
  {
    name: "Exenatide ER (Bydureon)",
    generic: "Exenatide",
    class: "glp1ra",
    doses: [
      { label: "Standard", dose: "2mg", frequency: "Weekly SC" },
    ],
    hba1cReduction: "0.8-1.3%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "loss",
    hypoRisk: "low",
    minEGFR: 45,
    contraindications: ["eGFR <45", "Personal/family MTC history"],
    sideEffects: ["Nausea", "Injection site nodules", "Diarrhea"],
    adaReference: "ADA 2026 §9.3 – GLP-1 RA (EXSCEL – neutral CV)",
  },

  // === DUAL GIP/GLP-1 AGONIST ===
  {
    name: "Tirzepatide (Mounjaro)",
    generic: "Tirzepatide",
    class: "dual-agonist",
    doses: [
      { label: "Start", dose: "2.5mg", frequency: "Weekly SC × 4 weeks" },
      { label: "Step-up 1", dose: "5mg", frequency: "Weekly SC × 4 weeks" },
      { label: "Step-up 2", dose: "7.5mg", frequency: "Weekly SC" },
      { label: "Step-up 3", dose: "10mg", frequency: "Weekly SC" },
      { label: "Max", dose: "15mg", frequency: "Weekly SC" },
    ],
    hba1cReduction: "2.0-2.6%",
    cvBenefit: true,
    renalBenefit: true,
    weightEffect: "loss",
    hypoRisk: "low",
    minEGFR: 15,
    contraindications: ["Personal/family history of MTC", "MEN2 syndrome", "Pancreatitis history"],
    sideEffects: ["Nausea, vomiting (dose-dependent)", "Diarrhea, constipation", "Decreased appetite", "Gallbladder events"],
    adaReference: "ADA 2026 §9.3 – GIP/GLP-1 dual agonist, very high efficacy (SURPASS, SURMOUNT)",
  },

  // === SGLT2 INHIBITORS ===
  {
    name: "Empagliflozin (Jardiance)",
    generic: "Empagliflozin",
    class: "sglt2i",
    doses: [
      { label: "Start", dose: "10mg", frequency: "Once daily morning" },
      { label: "Max", dose: "25mg", frequency: "Once daily morning" },
    ],
    hba1cReduction: "0.7-1.0%",
    cvBenefit: true,
    renalBenefit: true,
    weightEffect: "loss",
    hypoRisk: "low",
    minEGFR: 20,
    contraindications: ["eGFR <20", "Recurrent UTI/genital mycotic infections", "Type 1 DM"],
    sideEffects: ["Genital mycotic infections", "UTI", "Volume depletion", "Euglycemic DKA (rare)"],
    adaReference: "ADA 2026 §9.4 – SGLT2i proven CV+renal benefit (EMPA-REG, EMPEROR)",
  },
  {
    name: "Dapagliflozin (Farxiga)",
    generic: "Dapagliflozin",
    class: "sglt2i",
    doses: [
      { label: "Start", dose: "5mg", frequency: "Once daily morning" },
      { label: "Max", dose: "10mg", frequency: "Once daily morning" },
    ],
    hba1cReduction: "0.7-1.0%",
    cvBenefit: true,
    renalBenefit: true,
    weightEffect: "loss",
    hypoRisk: "low",
    minEGFR: 20,
    contraindications: ["eGFR <20", "Recurrent UTI", "Type 1 DM"],
    sideEffects: ["Genital infections", "Polyuria", "Hypotension risk", "Euglycemic DKA"],
    adaReference: "ADA 2026 §9.4 – SGLT2i proven CV+renal benefit (DECLARE, DAPA-CKD, DAPA-HF)",
  },
  {
    name: "Canagliflozin (Invokana)",
    generic: "Canagliflozin",
    class: "sglt2i",
    doses: [
      { label: "Start", dose: "100mg", frequency: "Once daily before breakfast" },
      { label: "Max", dose: "300mg", frequency: "Once daily" },
    ],
    hba1cReduction: "0.7-1.2%",
    cvBenefit: true,
    renalBenefit: true,
    weightEffect: "loss",
    hypoRisk: "low",
    minEGFR: 30,
    renalDoseAdjust: [
      { eGFRRange: [30, 60], dose: "100mg", frequency: "Once daily (max)" },
    ],
    contraindications: ["eGFR <30", "History of amputation (caution)", "Type 1 DM"],
    sideEffects: ["Genital mycotic infections", "Amputation risk (monitor feet)", "Bone fracture risk"],
    adaReference: "ADA 2026 §9.4 – SGLT2i (CANVAS, CREDENCE)",
  },

  // === DPP-4 INHIBITORS ===
  {
    name: "Sitagliptin (Januvia)",
    generic: "Sitagliptin",
    class: "dpp4i",
    doses: [
      { label: "Standard", dose: "100mg", frequency: "Once daily" },
    ],
    hba1cReduction: "0.5-0.8%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "neutral",
    hypoRisk: "low",
    minEGFR: 0,
    renalDoseAdjust: [
      { eGFRRange: [30, 50], dose: "50mg", frequency: "Once daily" },
      { eGFRRange: [0, 30], dose: "25mg", frequency: "Once daily" },
    ],
    contraindications: ["History of pancreatitis with DPP-4i", "Concurrent GLP-1 RA use (no added benefit)"],
    sideEffects: ["Nasopharyngitis", "Headache", "Pancreatitis (rare)", "Joint pain"],
    adaReference: "ADA 2026 §9.2 – DPP-4i intermediate efficacy, renal-safe with dose adjustment",
  },
  {
    name: "Linagliptin (Trajenta)",
    generic: "Linagliptin",
    class: "dpp4i",
    doses: [
      { label: "Standard", dose: "5mg", frequency: "Once daily" },
    ],
    hba1cReduction: "0.5-0.7%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "neutral",
    hypoRisk: "low",
    minEGFR: 0,
    contraindications: ["Concurrent GLP-1 RA", "History of pancreatitis with DPP-4i"],
    sideEffects: ["Nasopharyngitis", "Cough", "Pancreatitis (rare)"],
    adaReference: "ADA 2026 §9.2 – DPP-4i, NO renal dose adjustment needed (biliary excretion)",
  },
  {
    name: "Vildagliptin (Galvus)",
    generic: "Vildagliptin",
    class: "dpp4i",
    doses: [
      { label: "Standard", dose: "50mg", frequency: "BD" },
    ],
    hba1cReduction: "0.5-0.9%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "neutral",
    hypoRisk: "low",
    minEGFR: 0,
    renalDoseAdjust: [
      { eGFRRange: [0, 50], dose: "50mg", frequency: "Once daily" },
    ],
    contraindications: ["Hepatic impairment", "Concurrent GLP-1 RA"],
    sideEffects: ["Headache", "Dizziness", "Peripheral edema", "Hepatotoxicity (rare, check LFT)"],
    adaReference: "ADA 2026 §9.2 – DPP-4i, popular in Asian markets",
  },
  {
    name: "Saxagliptin (Onglyza)",
    generic: "Saxagliptin",
    class: "dpp4i",
    doses: [
      { label: "Standard", dose: "5mg", frequency: "Once daily" },
    ],
    hba1cReduction: "0.5-0.7%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "neutral",
    hypoRisk: "low",
    minEGFR: 0,
    renalDoseAdjust: [
      { eGFRRange: [0, 45], dose: "2.5mg", frequency: "Once daily" },
    ],
    contraindications: ["Heart failure (increased HF hospitalization – SAVOR-TIMI)", "Concurrent GLP-1 RA"],
    sideEffects: ["UTI", "Headache", "HF risk (caution)"],
    adaReference: "ADA 2026 §9.2 – DPP-4i, ⚠ AVOID in HF (SAVOR-TIMI 53)",
  },

  // === SULFONYLUREAS ===
  {
    name: "Glimepiride (Amaryl)",
    generic: "Glimepiride",
    class: "sulfonylurea",
    doses: [
      { label: "Start", dose: "1mg", frequency: "Once daily with breakfast" },
      { label: "Titrate", dose: "2mg", frequency: "Once daily" },
      { label: "Max", dose: "4mg", frequency: "Once daily" },
    ],
    hba1cReduction: "1.0-1.5%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "gain",
    hypoRisk: "high",
    minEGFR: 0,
    renalDoseAdjust: [
      { eGFRRange: [0, 30], dose: "1mg", frequency: "Once daily (use with extreme caution)" },
    ],
    contraindications: ["Severe hepatic insufficiency", "G6PD deficiency (some)"],
    sideEffects: ["Hypoglycemia (HIGH risk)", "Weight gain (2-3 kg)", "Rash"],
    adaReference: "ADA 2026 §9.2 – SU high efficacy but hypoglycemia+weight gain risk",
  },
  {
    name: "Gliclazide MR (Diamicron MR)",
    generic: "Gliclazide",
    class: "sulfonylurea",
    doses: [
      { label: "Start", dose: "30mg", frequency: "Once daily with breakfast" },
      { label: "Titrate", dose: "60mg", frequency: "Once daily" },
      { label: "Max", dose: "120mg", frequency: "Once daily" },
    ],
    hba1cReduction: "1.0-1.5%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "gain",
    hypoRisk: "moderate",
    minEGFR: 0,
    renalDoseAdjust: [
      { eGFRRange: [0, 30], dose: "30mg", frequency: "Once daily (caution)" },
    ],
    contraindications: ["Severe hepatic impairment", "Type 1 DM"],
    sideEffects: ["Hypoglycemia (lower than glimepiride)", "Weight gain", "GI upset"],
    adaReference: "ADA 2026 §9.2 – Preferred SU (lower hypo risk vs. glimepiride, ADVANCE trial)",
  },
  {
    name: "Glipizide (Glucotrol)",
    generic: "Glipizide",
    class: "sulfonylurea",
    doses: [
      { label: "Start", dose: "5mg", frequency: "Once daily 30min before breakfast" },
      { label: "Max", dose: "20mg", frequency: "BD (divided)" },
    ],
    hba1cReduction: "1.0-1.5%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "gain",
    hypoRisk: "high",
    minEGFR: 0,
    contraindications: ["Severe renal impairment (prefer gliclazide)"],
    sideEffects: ["Hypoglycemia", "Weight gain", "GI disturbance"],
    adaReference: "ADA 2026 §9.2 – SU, shorter acting",
  },

  // === THIAZOLIDINEDIONES (TZDs) ===
  {
    name: "Pioglitazone (Actos)",
    generic: "Pioglitazone",
    class: "tzd",
    doses: [
      { label: "Start", dose: "15mg", frequency: "Once daily" },
      { label: "Target", dose: "30mg", frequency: "Once daily" },
      { label: "Max", dose: "45mg", frequency: "Once daily" },
    ],
    hba1cReduction: "1.0-1.5%",
    cvBenefit: true,
    renalBenefit: false,
    weightEffect: "gain",
    hypoRisk: "low",
    minEGFR: 0,
    contraindications: ["NYHA III-IV heart failure", "Active bladder cancer", "Hepatic disease"],
    sideEffects: ["Weight gain (2-5 kg)", "Edema", "Bone fractures (women)", "Bladder cancer concern", "HF exacerbation"],
    adaReference: "ADA 2026 §9.2 – TZD, proven CV benefit (PROactive) but HF/weight concerns",
  },

  // === ALPHA-GLUCOSIDASE INHIBITORS ===
  {
    name: "Voglibose (Volix)",
    generic: "Voglibose",
    class: "agi",
    doses: [
      { label: "Standard", dose: "0.2mg", frequency: "TDS (before meals)" },
      { label: "Max", dose: "0.3mg", frequency: "TDS" },
    ],
    hba1cReduction: "0.5-0.8%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "neutral",
    hypoRisk: "low",
    minEGFR: 0,
    contraindications: ["Inflammatory bowel disease", "Intestinal obstruction", "Hepatic cirrhosis"],
    sideEffects: ["Flatulence", "Diarrhea", "Abdominal discomfort"],
    adaReference: "ADA 2026 §9.2 – AGI, popular in Asia for post-prandial glucose",
  },
  {
    name: "Acarbose (Glucobay)",
    generic: "Acarbose",
    class: "agi",
    doses: [
      { label: "Start", dose: "25mg", frequency: "TDS (with first bite)" },
      { label: "Target", dose: "50mg", frequency: "TDS" },
      { label: "Max", dose: "100mg", frequency: "TDS" },
    ],
    hba1cReduction: "0.5-0.8%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "neutral",
    hypoRisk: "low",
    minEGFR: 25,
    contraindications: ["eGFR <25", "IBD", "Intestinal obstruction"],
    sideEffects: ["Flatulence (common)", "Diarrhea", "Elevated LFT (rare)"],
    adaReference: "ADA 2026 §9.2 – AGI for post-prandial glucose",
  },

  // === MEGLITINIDES ===
  {
    name: "Repaglinide (NovoNorm)",
    generic: "Repaglinide",
    class: "meglitinide",
    doses: [
      { label: "Start", dose: "0.5mg", frequency: "TDS (before meals)" },
      { label: "Target", dose: "1mg", frequency: "TDS" },
      { label: "Max", dose: "4mg", frequency: "TDS (16mg/day)" },
    ],
    hba1cReduction: "0.5-1.0%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "gain",
    hypoRisk: "moderate",
    minEGFR: 0,
    contraindications: ["Severe hepatic impairment", "Co-administration with gemfibrozil"],
    sideEffects: ["Hypoglycemia (less than SU)", "Weight gain", "Upper respiratory infection"],
    adaReference: "ADA 2026 §9.2 – Meglitinide, flexible meal-time dosing",
  },

  // === BASAL INSULIN ===
  {
    name: "Insulin Glargine U-100 (Lantus/Basaglar)",
    generic: "Insulin Glargine",
    class: "basal-insulin",
    doses: [
      { label: "Start", dose: "10 units or 0.1-0.2 U/kg", frequency: "Once daily (bedtime or morning)" },
      { label: "Titrate", dose: "+2 units q3 days", frequency: "Until FBG 80-130" },
    ],
    hba1cReduction: "1.5-3.5%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "gain",
    hypoRisk: "moderate",
    minEGFR: 0,
    contraindications: ["Hypoglycemia unawareness (caution)"],
    sideEffects: ["Hypoglycemia", "Weight gain (2-4 kg)", "Injection site reactions", "Lipodystrophy"],
    adaReference: "ADA 2026 §9.5 – Basal insulin, stepwise intensification",
  },
  {
    name: "Insulin Degludec (Tresiba)",
    generic: "Insulin Degludec",
    class: "basal-insulin",
    doses: [
      { label: "Start", dose: "10 units", frequency: "Once daily (any time, consistent)" },
      { label: "Titrate", dose: "+2 units q3 days", frequency: "Until FBG 80-130" },
    ],
    hba1cReduction: "1.5-3.5%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "gain",
    hypoRisk: "low",
    minEGFR: 0,
    contraindications: [],
    sideEffects: ["Hypoglycemia (lower vs. glargine)", "Weight gain", "Injection site reactions"],
    adaReference: "ADA 2026 §9.5 – Ultra-long acting, lower nocturnal hypo (DEVOTE)",
  },

  // === PRANDIAL INSULIN ===
  {
    name: "Insulin Aspart (NovoRapid)",
    generic: "Insulin Aspart",
    class: "prandial-insulin",
    doses: [
      { label: "Start", dose: "4 units or 10% of basal", frequency: "Before largest meal" },
      { label: "Titrate", dose: "+1-2 units q3 days", frequency: "Based on post-meal BG" },
    ],
    hba1cReduction: "1.0-2.0% (added to basal)",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "gain",
    hypoRisk: "high",
    minEGFR: 0,
    contraindications: [],
    sideEffects: ["Hypoglycemia", "Weight gain", "Requires BG monitoring"],
    adaReference: "ADA 2026 §9.5 – Basal-bolus intensification",
  },

  // === PREMIXED INSULIN ===
  {
    name: "Insulin 70/30 (Mixtard/Novolin 70/30)",
    generic: "NPH/Regular 70/30",
    class: "premixed-insulin",
    doses: [
      { label: "Start", dose: "10-12 units", frequency: "BD (before breakfast & dinner)" },
      { label: "Titrate", dose: "+2 units q3 days", frequency: "Based on FBG & pre-dinner BG" },
    ],
    hba1cReduction: "1.5-2.5%",
    cvBenefit: false,
    renalBenefit: false,
    weightEffect: "gain",
    hypoRisk: "high",
    minEGFR: 0,
    contraindications: ["Erratic meal patterns"],
    sideEffects: ["Hypoglycemia", "Weight gain", "Requires consistent meals"],
    adaReference: "ADA 2026 §9.5 – Premixed, less flexible but simpler regimen",
  },
];

// ============================================================
// ADA 2026 ALGORITHM ENGINE
// Priority: 1) CVKD Risk → 2) Weight → 3) Glycemic Control
// ============================================================

function isOnDrug(patient: PatientData, generic: string): boolean {
  return patient.currentMeds.some(m => m.toLowerCase().includes(generic.toLowerCase()));
}

function isOnDrugClass(patient: PatientData, cls: DrugClass): boolean {
  return DRUG_DB.filter(d => d.class === cls).some(d => isOnDrug(patient, d.generic));
}

function hasASCVD(patient: PatientData): boolean {
  // Post-stroke patients are automatically ASCVD+
  return true; // This app is specifically for post-stroke patients
}

function hasCKD(patient: PatientData): boolean {
  return patient.eGFR < 60;
}

function hasHF(patient: PatientData): boolean {
  return patient.hfNYHA >= 2;
}

function needsWeightManagement(patient: PatientData): boolean {
  return patient.bmi >= 25;
}

function getRecommendedDose(drug: DrugProfile, patient: PatientData): { dose: string; frequency: string } {
  // Check renal dose adjustments
  if (drug.renalDoseAdjust) {
    for (const adj of drug.renalDoseAdjust) {
      if (patient.eGFR >= adj.eGFRRange[0] && patient.eGFR < adj.eGFRRange[1]) {
        return { dose: adj.dose, frequency: adj.frequency };
      }
    }
  }
  // Return starting dose
  return { dose: drug.doses[0].dose, frequency: drug.doses[0].frequency };
}

function buildRec(
  drug: DrugProfile,
  patient: PatientData,
  reason: string,
  priority: MedRecommendation["priority"],
  category: AlgorithmPriority,
): MedRecommendation {
  const recommended = getRecommendedDose(drug, patient);
  const warnings: string[] = [...drug.sideEffects.slice(0, 2)];

  // Add renal warnings
  if (drug.renalDoseAdjust && patient.eGFR < 60) {
    const adj = drug.renalDoseAdjust.find(a => patient.eGFR >= a.eGFRRange[0] && patient.eGFR < a.eGFRRange[1]);
    if (adj) warnings.unshift(`⚠ Renal dose: ${adj.dose} ${adj.frequency} (eGFR ${patient.eGFR})`);
  }
  if (patient.eGFR < drug.minEGFR) {
    warnings.unshift(`🚫 CONTRAINDICATED: eGFR ${patient.eGFR} < minimum ${drug.minEGFR}`);
  }
  if (patient.postStrokeDysphagia) {
    warnings.push("⚠ Post-stroke dysphagia: verify swallowing safety for oral meds");
  }
  if (drug.hypoRisk === "high") {
    warnings.push("⚠ HIGH hypoglycemia risk – monitor closely, educate patient");
  }
  if (drug.class === "tzd" && patient.hfNYHA >= 3) {
    warnings.unshift("🚫 CONTRAINDICATED in NYHA III-IV heart failure");
  }
  if (drug.generic === "Saxagliptin" && patient.hfNYHA >= 2) {
    warnings.unshift("🚫 AVOID: Increased HF hospitalization risk (SAVOR-TIMI 53)");
  }

  // Check if already on drug
  if (isOnDrug(patient, drug.generic)) {
    const currentMed = patient.currentMeds.find(m => m.toLowerCase().includes(drug.generic.toLowerCase()));
    warnings.unshift(`📋 Currently on: ${currentMed} – review dosing`);
  }

  return {
    drug: drug.name,
    genericName: drug.generic,
    drugClass: drug.class,
    dose: recommended.dose,
    frequency: recommended.frequency,
    reason,
    priority,
    category,
    warnings,
    contraindications: drug.contraindications,
    adaReference: drug.adaReference,
    hba1cReduction: drug.hba1cReduction,
    cvBenefit: drug.cvBenefit,
    renalBenefit: drug.renalBenefit,
    weightEffect: drug.weightEffect,
  };
}

export function generateMedRecommendations(patient: PatientData): MedRecommendation[] {
  const recs: MedRecommendation[] = [];
  const addedClasses = new Set<DrugClass>();
  const addedGenerics = new Set<string>();

  function addRec(rec: MedRecommendation) {
    if (!addedGenerics.has(rec.genericName)) {
      recs.push(rec);
      addedGenerics.add(rec.genericName);
      addedClasses.add(rec.drugClass);
    }
  }

  // ============================================================
  // PRIORITY 1: CARDIOVASCULAR & KIDNEY DISEASE RISK REDUCTION
  // ============================================================

  // Post-stroke (ASCVD) → GLP-1 RA with proven CV benefit
  if (hasASCVD(patient)) {
    // Prefer semaglutide for CV + weight, or tirzepatide for maximum efficacy
    if (patient.bmi >= 27) {
      const tirz = DRUG_DB.find(d => d.generic === "Tirzepatide")!;
      addRec(buildRec(tirz, patient,
        `Post-stroke ASCVD + BMI ${patient.bmi} → Dual GIP/GLP-1 agonist for maximum CV risk reduction + weight loss (SURMOUNT, SURPASS)`,
        "first-line", "cvkd-risk"));
    }

    const sema = DRUG_DB.find(d => d.generic === "Semaglutide")!;
    addRec(buildRec(sema, patient,
      `Post-stroke ASCVD → GLP-1 RA with proven CV benefit (SUSTAIN-6, SELECT). ${patient.bmi > 27 ? "Also addresses obesity." : ""}`,
      patient.bmi >= 27 ? "add-on" : "first-line", "cvkd-risk"));

    // If HF → SGLT2i is essential
    if (hasHF(patient) && patient.eGFR >= 20) {
      const empa = DRUG_DB.find(d => d.generic === "Empagliflozin")!;
      addRec(buildRec(empa, patient,
        `HF NYHA ${patient.hfNYHA} + eGFR ${patient.eGFR} → SGLT2i for HF + renal protection (EMPEROR-Reduced/Preserved)`,
        "first-line", "cvkd-risk"));

      // Also consider dapagliflozin as alternative
      if (patient.eGFR < 45) {
        const dapa = DRUG_DB.find(d => d.generic === "Dapagliflozin")!;
        addRec(buildRec(dapa, patient,
          `CKD Stage 3 (eGFR ${patient.eGFR}) → SGLT2i for renal progression delay (DAPA-CKD). Alternative to empagliflozin.`,
          "add-on", "cvkd-risk"));
      }
    } else if (hasCKD(patient) && patient.eGFR >= 20) {
      // CKD without HF → still needs SGLT2i
      const dapa = DRUG_DB.find(d => d.generic === "Dapagliflozin")!;
      addRec(buildRec(dapa, patient,
        `CKD (eGFR ${patient.eGFR}) → SGLT2i for renal protection (DAPA-CKD). Slows eGFR decline.`,
        "first-line", "cvkd-risk"));
    } else if (patient.eGFR >= 20) {
      // No CKD, no HF but ASCVD → still benefit from SGLT2i
      const empa = DRUG_DB.find(d => d.generic === "Empagliflozin")!;
      addRec(buildRec(empa, patient,
        `Post-stroke ASCVD → SGLT2i for additional CV benefit (EMPA-REG)`,
        "add-on", "cvkd-risk"));
    }
  }

  // ============================================================
  // PRIORITY 2: WEIGHT MANAGEMENT
  // ============================================================

  if (needsWeightManagement(patient)) {
    // If not already recommended a GLP-1 RA / dual agonist above
    if (!addedClasses.has("glp1ra") && !addedClasses.has("dual-agonist")) {
      const sema = DRUG_DB.find(d => d.generic === "Semaglutide")!;
      addRec(buildRec(sema, patient,
        `BMI ${patient.bmi} (≥25) → GLP-1 RA for weight management (5-15% weight loss expected)`,
        "first-line", "weight-management"));
    }

    // Avoid weight-gaining drugs note
    if (patient.bmi >= 30) {
      // Flag if on SU or TZD
      if (isOnDrugClass(patient, "sulfonylurea")) {
        const glic = DRUG_DB.find(d => d.generic === "Gliclazide")!;
        recs.push({
          ...buildRec(glic, patient, "", "de-escalate", "weight-management"),
          reason: `BMI ${patient.bmi} (≥30) + on sulfonylurea → Consider de-escalation/switch to weight-neutral agent. SU causes 2-3 kg weight gain.`,
          warnings: ["Consider replacing with DPP-4i or dose reduction if GLP-1 RA started", "High hypo risk with concurrent GLP-1 RA"],
        });
        addedGenerics.add("Gliclazide");
      }
    }
  }

  // ============================================================
  // PRIORITY 3: GLYCEMIC CONTROL
  // ============================================================

  const hba1c = patient.hba1c;
  const rbs = patient.rbs;

  // Metformin — foundational therapy if eGFR allows
  if (patient.eGFR >= 30 && !isOnDrug(patient, "Metformin")) {
    const met = DRUG_DB.find(d => d.generic === "Metformin")!;
    addRec(buildRec(met, patient,
      `Foundational therapy for T2DM. eGFR ${patient.eGFR} ≥ 30 → Safe to use. ${patient.eGFR < 45 ? "Reduced dose for CKD." : ""}`,
      addedClasses.size > 0 ? "add-on" : "first-line", "glycemic-control"));
  }

  // HbA1c-based intensification
  if (hba1c >= 7.0 && hba1c < 8.0) {
    // Moderate: dual therapy
    if (!addedClasses.has("dpp4i") && !addedClasses.has("glp1ra") && !addedClasses.has("dual-agonist")) {
      // DPP-4i as add-on if GLP-1 RA not used
      const lina = DRUG_DB.find(d => d.generic === "Linagliptin")!;
      addRec(buildRec(lina, patient,
        `HbA1c ${hba1c}% (7-8) → Add DPP-4i for additional 0.5-0.7% reduction. No renal dose adjustment needed.`,
        "add-on", "glycemic-control"));
    }
  } else if (hba1c >= 8.0 && hba1c < 9.0) {
    // High: triple therapy or intensification
    if (!addedClasses.has("sglt2i") && patient.eGFR >= 20) {
      const empa = DRUG_DB.find(d => d.generic === "Empagliflozin")!;
      addRec(buildRec(empa, patient,
        `HbA1c ${hba1c}% (≥8) → Add SGLT2i for glycemic + CV benefit`,
        "add-on", "glycemic-control"));
    }

    // Consider SU only if not obese and no better options
    if (!addedClasses.has("sulfonylurea") && patient.bmi < 25 && !isOnDrugClass(patient, "sulfonylurea")) {
      const glic = DRUG_DB.find(d => d.generic === "Gliclazide")!;
      addRec(buildRec(glic, patient,
        `HbA1c ${hba1c}% (≥8) + BMI ${patient.bmi} (<25) → Gliclazide MR (preferred SU, lower hypo risk). Use if cost is a factor.`,
        "add-on", "glycemic-control"));
    }
  } else if (hba1c >= 9.0) {
    // Very high: consider insulin
    if (rbs > 300 || hba1c >= 10) {
      // Symptomatic hyperglycemia → insulin
      const glargine = DRUG_DB.find(d => d.generic === "Insulin Glargine")!;
      addRec(buildRec(glargine, patient,
        `HbA1c ${hba1c}% (≥9) + RBS ${rbs} → Basal insulin needed for glycemic control. Start with 10 units or 0.1-0.2 U/kg. Titrate +2 units q3 days to FBG target.`,
        "first-line", "glycemic-control"));

      // Consider degludec for lower hypo risk
      const degludec = DRUG_DB.find(d => d.generic === "Insulin Degludec")!;
      addRec(buildRec(degludec, patient,
        `Alternative basal insulin: lower nocturnal hypoglycemia risk (DEVOTE). Preferred if hypo risk is a concern.`,
        "add-on", "glycemic-control"));
    } else {
      // HbA1c 9-10 without severe symptoms → intensify orals + consider basal
      if (!addedClasses.has("sulfonylurea") && patient.bmi < 27) {
        const glic = DRUG_DB.find(d => d.generic === "Gliclazide")!;
        addRec(buildRec(glic, patient,
          `HbA1c ${hba1c}% (≥9) → Gliclazide MR for potent glucose lowering. Titrate slowly.`,
          "add-on", "glycemic-control"));
      }

      const glargine = DRUG_DB.find(d => d.generic === "Insulin Glargine")!;
      addRec(buildRec(glargine, patient,
        `HbA1c ${hba1c}% (≥9) → Consider early basal insulin if oral combination insufficient. Target FBG 80-130.`,
        "intensification", "glycemic-control"));
    }
  }

  // Pioglitazone — only if no HF and insulin resistance dominant
  if (hba1c >= 7.5 && patient.hfNYHA < 2 && patient.bmi >= 30 && !addedClasses.has("tzd") && !isOnDrugClass(patient, "tzd")) {
    const pio = DRUG_DB.find(d => d.generic === "Pioglitazone")!;
    addRec(buildRec(pio, patient,
      `HbA1c ${hba1c}% + BMI ${patient.bmi} + No HF → Pioglitazone addresses insulin resistance. CV benefit (PROactive). Caution: weight gain, edema.`,
      "add-on", "glycemic-control"));
  }

  // ============================================================
  // CURRENT MEDICATION REVIEW
  // ============================================================

  for (const med of patient.currentMeds) {
    const medLower = med.toLowerCase();

    // Check each current med against drug database
    for (const drug of DRUG_DB) {
      if (medLower.includes(drug.generic.toLowerCase()) && !addedGenerics.has(drug.generic)) {
        // Check if contraindicated
        let isContra = false;
        if (drug.minEGFR > 0 && patient.eGFR < drug.minEGFR) isContra = true;
        if (drug.generic === "Saxagliptin" && patient.hfNYHA >= 2) isContra = true;
        if (drug.class === "tzd" && patient.hfNYHA >= 3) isContra = true;

        if (isContra) {
          addRec(buildRec(drug, patient,
            `Currently on ${med} → ⚠ CONTRAINDICATED in this patient. Discontinue and switch.`,
            "de-escalate", "current-med-review"));
        } else {
          // Check renal dose adjustment needed
          const needsAdj = drug.renalDoseAdjust?.some(a => patient.eGFR >= a.eGFRRange[0] && patient.eGFR < a.eGFRRange[1]);
          addRec(buildRec(drug, patient,
            `Currently on ${med}. ${needsAdj ? "⚠ DOSE ADJUSTMENT needed for current renal function." : "Review: appropriate for current clinical status."}`,
            needsAdj ? "adjustment" : "add-on", "current-med-review"));
        }
        break;
      }
    }

    // Voglibose special handling (common in India)
    if (medLower.includes("voglibose") && !addedGenerics.has("Voglibose")) {
      const vogl = DRUG_DB.find(d => d.generic === "Voglibose")!;
      addRec(buildRec(vogl, patient,
        `Currently on ${med}. Limited HbA1c reduction (0.5-0.8%). Consider de-escalation if GLP-1 RA or SGLT2i started.`,
        "adjustment", "current-med-review"));
    }
  }

  // ============================================================
  // LIPID MANAGEMENT (Post-stroke LAI targets)
  // ============================================================

  if (patient.ldl > 55) {
    const statin: MedRecommendation = {
      drug: patient.ldl > 100 ? "Rosuvastatin 20mg" : "Rosuvastatin 10mg",
      genericName: "Rosuvastatin",
      drugClass: "statin",
      dose: patient.ldl > 100 ? "20mg" : "10mg",
      frequency: "Once daily at bedtime",
      reason: `LDL ${patient.ldl} mg/dL → Post-stroke target <55 mg/dL (LAI very high-risk). ${patient.ldl > 100 ? "High-intensity statin required." : "Moderate-high intensity."}`,
      priority: "first-line",
      category: "lipid",
      warnings: [
        "Target LDL <55 mg/dL for post-stroke + DM",
        "Check LFT at 3 months",
        patient.eGFR < 30 ? "⚠ Renal dosing: max 10mg if eGFR <30" : "",
        patient.ldl > 100 ? "Consider adding ezetimibe 10mg if target not met at 3 months" : "",
      ].filter(Boolean),
      contraindications: ["Active liver disease", "Pregnancy"],
      adaReference: "ADA 2026 §10.2 + LAI Lipid Guidelines – Very high CV risk",
      hba1cReduction: "N/A",
      cvBenefit: true,
      renalBenefit: false,
      weightEffect: "neutral",
    };
    addRec(statin);

    // Ezetimibe if LDL very high
    if (patient.ldl > 100) {
      recs.push({
        drug: "Ezetimibe (Zetia)",
        genericName: "Ezetimibe",
        drugClass: "statin",
        dose: "10mg",
        frequency: "Once daily",
        reason: `LDL ${patient.ldl} > 100 → Add ezetimibe to statin if LDL not at target after 3 months. Reduces LDL by additional 15-20%.`,
        priority: "add-on",
        category: "lipid",
        warnings: ["Usually combined with statin", "Check LFT"],
        contraindications: ["Active liver disease"],
        adaReference: "ADA 2026 §10.2 – Combination lipid therapy",
        hba1cReduction: "N/A",
        cvBenefit: true,
        renalBenefit: false,
        weightEffect: "neutral",
      });
    }
  }

  // Sort by priority order
  const priorityOrder: Record<string, number> = {
    "cvkd-risk": 0,
    "weight-management": 1,
    "glycemic-control": 2,
    "lipid": 3,
    "current-med-review": 4,
  };
  const statusOrder: Record<string, number> = {
    "first-line": 0,
    "adjustment": 1,
    "add-on": 2,
    "intensification": 3,
    "de-escalate": 4,
    "emergency": 5,
  };

  recs.sort((a, b) => {
    const catDiff = (priorityOrder[a.category] ?? 5) - (priorityOrder[b.category] ?? 5);
    if (catDiff !== 0) return catDiff;
    return (statusOrder[a.priority] ?? 5) - (statusOrder[b.priority] ?? 5);
  });

  return recs;
}

// ============================================================
// HYPO PROTOCOL & LIPID TARGETS (unchanged)
// ============================================================

export function getHypoProtocol(patient: PatientData): HypoProtocol {
  return {
    trigger: "Blood glucose < 70 mg/dL",
    immediate: [
      "Moru (buttermilk) 240ml immediately – 5g fast carbs",
      "15g almonds (badam) – sustained glucose release",
      "Recheck BG in 15 minutes",
      patient.postStrokeDysphagia ? "⚠ DYSPHAGIA: Use thickened moru, avoid whole almonds → use almond paste" : "",
    ].filter(Boolean),
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

export function getDrugClassLabel(cls: DrugClass): string {
  const labels: Record<DrugClass, string> = {
    "biguanide": "Biguanide",
    "sglt2i": "SGLT2 Inhibitor",
    "glp1ra": "GLP-1 Receptor Agonist",
    "dpp4i": "DPP-4 Inhibitor",
    "sulfonylurea": "Sulfonylurea",
    "tzd": "Thiazolidinedione",
    "agi": "α-Glucosidase Inhibitor",
    "meglitinide": "Meglitinide",
    "basal-insulin": "Basal Insulin",
    "prandial-insulin": "Prandial Insulin",
    "premixed-insulin": "Premixed Insulin",
    "dual-agonist": "Dual GIP/GLP-1 Agonist",
    "statin": "Statin / Lipid",
    "ace-arb": "ACE/ARB",
  };
  return labels[cls] || cls;
}

export function getCategoryLabel(cat: AlgorithmPriority): string {
  const labels: Record<AlgorithmPriority, string> = {
    "cvkd-risk": "① CV & Kidney Risk Reduction",
    "weight-management": "② Weight Management",
    "glycemic-control": "③ Glycemic Control",
    "lipid": "④ Lipid Management",
    "current-med-review": "⑤ Current Medication Review",
  };
  return labels[cat] || cat;
}
