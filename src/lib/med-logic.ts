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
  return patient.hasASCVD || patient.hasPostStroke || patient.hasPAD;
}

function hasCKD(patient: PatientData): boolean {
  return patient.hasCKD || patient.eGFR < 60;
}

function hasHF(patient: PatientData): boolean {
  return patient.hasHF || patient.hfNYHA >= 2;
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

/**
 * Determines which ADA 2026 pathway the patient falls into.
 * Based on the glucose-lowering algorithm flowchart.
 */
export type AlgorithmPathway =
  | "ascvd-predominant"
  | "hf-ckd-predominant"
  | "hypo-minimization"
  | "weight-management"
  | "cost-sensitive"
  | "general";

export function getAlgorithmPathway(patient: PatientData): AlgorithmPathway {
  const establishedASCVD = patient.hasASCVD || patient.hasPostStroke || patient.hasPAD;
  const establishedCKD = patient.hasCKD || patient.eGFR < 60;
  const establishedHF = patient.hasHF || patient.hfNYHA >= 2;

  if (establishedASCVD && !establishedHF && !establishedCKD) return "ascvd-predominant";
  if (establishedHF || establishedCKD) return "hf-ckd-predominant";
  // Without established ASCVD or CKD — check compelling needs
  if (patient.bmi >= 25 || patient.hasObesity) return "weight-management";
  // Default: minimize hypo
  return "hypo-minimization";
}

export function getPathwayLabel(pathway: AlgorithmPathway): string {
  const labels: Record<AlgorithmPathway, string> = {
    "ascvd-predominant": "ASCVD Predominates",
    "hf-ckd-predominant": "HF or CKD Predominates",
    "hypo-minimization": "Minimize Hypoglycemia",
    "weight-management": "Weight Management Priority",
    "cost-sensitive": "Cost-Sensitive Approach",
    "general": "General Glycemic Control",
  };
  return labels[pathway];
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

  const hba1c = patient.hba1c;
  const pathway = getAlgorithmPathway(patient);
  const establishedASCVD = patient.hasASCVD || patient.hasPostStroke || patient.hasPAD;
  const establishedCKD = patient.hasCKD || patient.eGFR < 60;
  const establishedHF = patient.hasHF || patient.hfNYHA >= 2;
  const hba1cAboveTarget = hba1c >= 7.0;

  // ============================================================
  // STEP 1: FIRST-LINE — Metformin + lifestyle (universal)
  // ============================================================
  if (patient.eGFR >= 30 && !isOnDrug(patient, "Metformin")) {
    const met = DRUG_DB.find(d => d.generic === "Metformin")!;
    addRec(buildRec(met, patient,
      `First-line therapy: Metformin + comprehensive lifestyle (including weight management and physical activity). eGFR ${patient.eGFR} ≥ 30 → safe. ${patient.eGFR < 45 ? "Reduced dose for CKD Stage 3b." : ""}`,
      "first-line", "glycemic-control"));
  }

  // ============================================================
  // STEP 2: ESTABLISHED ASCVD OR CKD? → Branch into pathways
  // ============================================================

  if (establishedASCVD || establishedCKD || establishedHF) {
    // ─── BRANCH A: ASCVD PREDOMINATES ───
    if (pathway === "ascvd-predominant") {
      // EITHER/OR: GLP-1 RA with proven CV benefit OR SGLT2i with proven CVD benefit
      // GLP-1 RA: strongest evidence semaglutide > liraglutide > dulaglutide > exenatide ER
      const sema = DRUG_DB.find(d => d.generic === "Semaglutide")!;
      addRec(buildRec(sema, patient,
        `ASCVD predominates → GLP-1 RA with proven CV benefit (SUSTAIN-6, SELECT). Strongest evidence. ${patient.bmi >= 27 ? "Also addresses weight management." : ""}`,
        "first-line", "cvkd-risk"));

      if (patient.eGFR >= 20) {
        const empa = DRUG_DB.find(d => d.generic === "Empagliflozin")!;
        addRec(buildRec(empa, patient,
          `ASCVD predominates → SGLT2i with proven CVD benefit, if eGFR adequate (${patient.eGFR} ≥ 20). EMPA-REG OUTCOME.`,
          "first-line", "cvkd-risk"));
      }

      // If HbA1c still above target → intensify
      if (hba1cAboveTarget) {
        // Consider adding the other class, DPP-4i (if not on GLP-1 RA), basal insulin, TZD (low dose), SU
        if (!addedClasses.has("dual-agonist") && patient.bmi >= 27) {
          const tirz = DRUG_DB.find(d => d.generic === "Tirzepatide")!;
          addRec(buildRec(tirz, patient,
            `HbA1c ${hba1c}% above target + BMI ${patient.bmi} → Dual GIP/GLP-1 agonist for maximum efficacy (SURPASS, SURMOUNT). Alternative to semaglutide.`,
            "add-on", "cvkd-risk"));
        }

        const lira = DRUG_DB.find(d => d.generic === "Liraglutide")!;
        addRec(buildRec(lira, patient,
          `ASCVD intensification → Alternative GLP-1 RA with proven CV benefit (LEADER). Consider if semaglutide not tolerated.`,
          "add-on", "cvkd-risk"));

        // Further intensification: DPP-4i, basal insulin, TZD, SU
        addIntensificationAgents(patient, hba1c, recs, addRec, addedClasses, addedGenerics, true);
      }
    }

    // ─── BRANCH B: HF OR CKD PREDOMINATES ───
    else if (pathway === "hf-ckd-predominant") {
      // PREFERABLY: SGLT2i with evidence of reducing HF and/or CKD progression (if eGFR adequate)
      // Empagliflozin & canagliflozin both shown reduction in HF and CKD progression
      if (patient.eGFR >= 20) {
        const sglt2Choice = establishedHF
          ? DRUG_DB.find(d => d.generic === "Empagliflozin")!   // EMPEROR trials
          : DRUG_DB.find(d => d.generic === "Dapagliflozin")!;  // DAPA-CKD

        addRec(buildRec(sglt2Choice, patient,
          `HF/CKD predominates → PREFERABLY SGLT2i with evidence of reducing ${establishedHF ? "HF (EMPEROR-Reduced/Preserved)" : "CKD progression (DAPA-CKD)"}. eGFR ${patient.eGFR} adequate.`,
          "first-line", "cvkd-risk"));

        // Offer alternative SGLT2i
        const altSGLT2 = establishedHF
          ? DRUG_DB.find(d => d.generic === "Dapagliflozin")!
          : DRUG_DB.find(d => d.generic === "Empagliflozin")!;
        addRec(buildRec(altSGLT2, patient,
          `Alternative SGLT2i for ${establishedHF ? "HF + CKD protection" : "CV + renal benefit"}. ${altSGLT2.adaReference}`,
          "add-on", "cvkd-risk"));
      }

      // OR if SGLT2i not tolerated/contraindicated or eGFR inadequate → GLP-1 RA with proven CV benefit
      const sema = DRUG_DB.find(d => d.generic === "Semaglutide")!;
      addRec(buildRec(sema, patient,
        `${patient.eGFR < 20 ? "eGFR < 20 → SGLT2i contraindicated. " : "If SGLT2i not tolerated/contraindicated → "}Add GLP-1 RA with proven CV benefit.`,
        patient.eGFR < 20 ? "first-line" : "add-on", "cvkd-risk"));

      // If HbA1c above target → intensify
      if (hba1cAboveTarget) {
        // AVOID TZD in HF setting
        // Choose agents demonstrating CV safety
        // DPP-4i (not saxagliptin) in HF setting, basal insulin, SU
        if (!addedClasses.has("dpp4i")) {
          // Avoid saxagliptin in HF → use linagliptin or sitagliptin
          const dpp4 = establishedHF
            ? DRUG_DB.find(d => d.generic === "Linagliptin")!    // No HF signal + no renal dose adj
            : DRUG_DB.find(d => d.generic === "Sitagliptin")!;
          const warning = establishedHF ? "DPP-4i (NOT saxagliptin) in HF setting." : "";
          addRec(buildRec(dpp4, patient,
            `HbA1c ${hba1c}% above target → ${warning} ${dpp4.name} for additional glycemic control. ${dpp4.generic === "Linagliptin" ? "No renal dose adjustment needed." : ""}`,
            "add-on", "glycemic-control"));
        }

        addIntensificationAgents(patient, hba1c, recs, addRec, addedClasses, addedGenerics, establishedHF);
      }
    }
  }

  // ============================================================
  // STEP 2 (NO): WITHOUT ESTABLISHED ASCVD OR CKD
  // ============================================================
  else {
    if (!hba1cAboveTarget) {
      // At target — no additional agents needed beyond metformin
    } else {
      // ─── COMPELLING NEED TO MINIMIZE HYPOGLYCEMIA ───
      if (pathway === "hypo-minimization" || patient.age >= 65) {
        // Prefer: DPP-4i, GLP-1 RA, SGLT2i, TZD (all low hypo risk)
        if (!addedClasses.has("dpp4i") && !addedClasses.has("glp1ra") && !addedClasses.has("dual-agonist")) {
          const lina = DRUG_DB.find(d => d.generic === "Linagliptin")!;
          addRec(buildRec(lina, patient,
            `Minimize hypoglycemia → DPP-4i: low hypo risk, weight neutral. No renal dose adjustment (biliary excretion).`,
            "add-on", "glycemic-control"));
        }

        if (!addedClasses.has("glp1ra")) {
          const sema = DRUG_DB.find(d => d.generic === "Semaglutide")!;
          addRec(buildRec(sema, patient,
            `Minimize hypoglycemia → GLP-1 RA: low hypo risk + weight loss benefit.`,
            "add-on", "glycemic-control"));
        }

        if (!addedClasses.has("sglt2i") && patient.eGFR >= 20) {
          const empa = DRUG_DB.find(d => d.generic === "Empagliflozin")!;
          addRec(buildRec(empa, patient,
            `Minimize hypoglycemia → SGLT2i: low hypo risk + CV/renal benefit.`,
            "add-on", "glycemic-control"));
        }

        // Second tier if HbA1c still above target
        if (hba1c >= 8.0) {
          // GLP-1 RA or SGLT2i add-ons, then continue with other agents
          if (!addedClasses.has("sglt2i") && patient.eGFR >= 20) {
            const dapa = DRUG_DB.find(d => d.generic === "Dapagliflozin")!;
            addRec(buildRec(dapa, patient,
              `HbA1c ${hba1c}% still above target → Add SGLT2i as second agent.`,
              "add-on", "glycemic-control"));
          }

          // Third tier: consider SU (later gen) or basal insulin with lower hypo risk
          if (hba1c >= 9.0) {
            const glic = DRUG_DB.find(d => d.generic === "Gliclazide")!;
            addRec(buildRec(glic, patient,
              `HbA1c ${hba1c}% ≥ 9 → Consider SU OR basal insulin. Choose later-generation SU (gliclazide) with lower hypo risk.`,
              "intensification", "glycemic-control"));

            const degludec = DRUG_DB.find(d => d.generic === "Insulin Degludec")!;
            addRec(buildRec(degludec, patient,
              `Consider basal insulin with lower risk of hypoglycemia. Degludec preferred over glargine for nocturnal hypo safety (DEVOTE).`,
              "intensification", "glycemic-control"));
          }
        }
      }

      // ─── COMPELLING NEED TO MINIMIZE WEIGHT GAIN / PROMOTE WEIGHT LOSS ───
      else if (pathway === "weight-management") {
        // EITHER/OR: GLP-1 RA with good efficacy for weight loss OR SGLT2i
        if (patient.bmi >= 27) {
          const tirz = DRUG_DB.find(d => d.generic === "Tirzepatide")!;
          addRec(buildRec(tirz, patient,
            `Weight management priority (BMI ${patient.bmi}) → Dual GIP/GLP-1 agonist: highest weight loss efficacy (15-20%). SURMOUNT/SURPASS trials.`,
            "first-line", "weight-management"));
        }

        const sema = DRUG_DB.find(d => d.generic === "Semaglutide")!;
        addRec(buildRec(sema, patient,
          `Weight management (BMI ${patient.bmi}) → GLP-1 RA with good efficacy for weight loss (5-15%). SELECT/STEP trials.`,
          patient.bmi >= 27 ? "add-on" : "first-line", "weight-management"));

        if (patient.eGFR >= 20) {
          const empa = DRUG_DB.find(d => d.generic === "Empagliflozin")!;
          addRec(buildRec(empa, patient,
            `Weight management → SGLT2i: modest weight loss (2-3 kg) + CV/renal benefit.`,
            "add-on", "weight-management"));
        }

        // If HbA1c still above target
        if (hba1c >= 8.0) {
          if (!addedClasses.has("sglt2i") && patient.eGFR >= 20) {
            const dapa = DRUG_DB.find(d => d.generic === "Dapagliflozin")!;
            addRec(buildRec(dapa, patient,
              `HbA1c ${hba1c}% above target → Add SGLT2i for weight-neutral glycemic control.`,
              "add-on", "weight-management"));
          }

          // If triple therapy needed and GLP-1 RA/SGLT2i not tolerated → DPP-4i (weight neutral)
          if (!addedClasses.has("dpp4i")) {
            const lina = DRUG_DB.find(d => d.generic === "Linagliptin")!;
            addRec(buildRec(lina, patient,
              `HbA1c ${hba1c}% → PREFERABLY DPP-4i (if not on GLP-1 RA) based on weight neutrality.`,
              "add-on", "glycemic-control"));
          }
        }

        // De-escalate weight-gaining agents
        if (patient.bmi >= 30 && isOnDrugClass(patient, "sulfonylurea")) {
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
  }

  // ============================================================
  // SEVERE HYPERGLYCEMIA — insulin regardless of pathway
  // ============================================================
  if (hba1c >= 9.0 && (patient.rbs > 300 || hba1c >= 10)) {
    if (!addedClasses.has("basal-insulin")) {
      const glargine = DRUG_DB.find(d => d.generic === "Insulin Glargine")!;
      addRec(buildRec(glargine, patient,
        `HbA1c ${hba1c}% + RBS ${patient.rbs} → Symptomatic hyperglycemia: basal insulin required. Start 10 units or 0.1-0.2 U/kg. Titrate +2 U q3 days to FBG 80-130.`,
        "first-line", "glycemic-control"));
    }
  } else if (hba1c >= 9.0 && !addedClasses.has("basal-insulin")) {
    const glargine = DRUG_DB.find(d => d.generic === "Insulin Glargine")!;
    addRec(buildRec(glargine, patient,
      `HbA1c ${hba1c}% (≥9) → Consider early basal insulin if oral combination insufficient. Target FBG 80-130.`,
      "intensification", "glycemic-control"));
  }

  // ============================================================
  // CURRENT MEDICATION REVIEW
  // ============================================================
  for (const med of patient.currentMeds) {
    const medLower = med.toLowerCase();
    for (const drug of DRUG_DB) {
      if (medLower.includes(drug.generic.toLowerCase()) && !addedGenerics.has(drug.generic)) {
        let isContra = false;
        if (drug.minEGFR > 0 && patient.eGFR < drug.minEGFR) isContra = true;
        if (drug.generic === "Saxagliptin" && patient.hfNYHA >= 2) isContra = true;
        if (drug.class === "tzd" && patient.hfNYHA >= 3) isContra = true;

        if (isContra) {
          addRec(buildRec(drug, patient,
            `Currently on ${med} → ⚠ CONTRAINDICATED in this patient. Discontinue and switch.`,
            "de-escalate", "current-med-review"));
        } else {
          const needsAdj = drug.renalDoseAdjust?.some(a => patient.eGFR >= a.eGFRRange[0] && patient.eGFR < a.eGFRRange[1]);
          addRec(buildRec(drug, patient,
            `Currently on ${med}. ${needsAdj ? "⚠ DOSE ADJUSTMENT needed for current renal function." : "Review: appropriate for current clinical status."}`,
            needsAdj ? "adjustment" : "add-on", "current-med-review"));
        }
        break;
      }
    }

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

  // Sort
  const priorityOrder: Record<string, number> = {
    "cvkd-risk": 0, "weight-management": 1, "glycemic-control": 2, "lipid": 3, "current-med-review": 4,
  };
  const statusOrder: Record<string, number> = {
    "first-line": 0, "adjustment": 1, "add-on": 2, "intensification": 3, "de-escalate": 4, "emergency": 5,
  };
  recs.sort((a, b) => {
    const catDiff = (priorityOrder[a.category] ?? 5) - (priorityOrder[b.category] ?? 5);
    if (catDiff !== 0) return catDiff;
    return (statusOrder[a.priority] ?? 5) - (statusOrder[b.priority] ?? 5);
  });

  return recs;
}

/**
 * Helper: add intensification agents after primary CV/Kidney agents.
 * Avoids TZD in HF. Follows the ADA 2026 stepwise approach.
 */
function addIntensificationAgents(
  patient: PatientData,
  hba1c: number,
  recs: MedRecommendation[],
  addRec: (rec: MedRecommendation) => void,
  addedClasses: Set<DrugClass>,
  addedGenerics: Set<string>,
  avoidTZD: boolean,
) {
  // Basal insulin if HbA1c very high
  if (hba1c >= 9.0 && !addedClasses.has("basal-insulin")) {
    const degludec = DRUG_DB.find(d => d.generic === "Insulin Degludec")!;
    addRec(buildRec(degludec, patient,
      `HbA1c ${hba1c}% ≥ 9 → Basal insulin for intensification. Degludec preferred (lower nocturnal hypo, DEVOTE). U100 glargine also CV-safe.`,
      "intensification", "glycemic-control"));
  }

  // SU — later generation, lower hypo
  if (hba1c >= 8.5 && !addedClasses.has("sulfonylurea") && patient.bmi < 27) {
    const glic = DRUG_DB.find(d => d.generic === "Gliclazide")!;
    addRec(buildRec(glic, patient,
      `HbA1c ${hba1c}% → Later-generation SU with lower hypo risk (gliclazide MR, ADVANCE trial). Use if cost is a factor.`,
      "intensification", "glycemic-control"));
  }

  // TZD — only if no HF
  if (!avoidTZD && hba1c >= 7.5 && !addedClasses.has("tzd") && patient.hfNYHA < 2) {
    const pio = DRUG_DB.find(d => d.generic === "Pioglitazone")!;
    addRec(buildRec(pio, patient,
      `Pioglitazone: addresses insulin resistance. CV benefit (PROactive). Low dose may be better tolerated. ⚠ Avoid in HF.`,
      "add-on", "glycemic-control"));
  }
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
