// ============================================================
// DIABETIC KETOACIDOSIS (DKA) & HYPEROSMOLAR HYPERGLYCEMIC
// STATE (HHS) TREATMENT ALGORITHM
// Adult emergency management based on clinical best practices
// ============================================================

export type HyperglycemicCrisisType = "dka" | "hhs" | "mixed_dka_hhs" | "unable_to_determine";
export type KetosisLevel = "none" | "mild" | "moderate" | "severe";
export type AcidosisLevel = "none" | "mild" | "moderate" | "severe";
export type MentalStatus = "alert" | "lethargic" | "stuporous" | "comatose";
export type HemodynamicStatus = "stable" | "compensated" | "decompensated_shock";

export interface DKA_HHS_Input {
  // Vital signs
  vital_signs: {
    systolic_bp: number;
    diastolic_bp: number;
    heart_rate: number;
    respiratory_rate: number;
    temperature_celsius: number;
    mental_status: MentalStatus;
  };

  // Laboratory values
  labs: {
    glucose_mg_dl: number;
    pH: number;
    pCO2_mmhg: number;
    bicarbonate_meq_l: number;
    anion_gap: number;
    serum_ketones?: "negative" | "small" | "moderate" | "large";
    beta_hydroxybutyrate_mmol_l?: number;
    sodium_meq_l: number;
    potassium_meq_l: number;
    chloride_meq_l: number;
    creatinine_mg_dl: number;
    BUN_mg_dl?: number;
    osmolality_mosm_kg?: number;
    urine_ketones?: "negative" | "small" | "moderate" | "large";
    ECG_findings?: string;
  };

  // Clinical context
  clinical_context: {
    diabetes_type: "type1" | "type2" | "unknown";
    known_diabetes: boolean;
    precipitating_cause?: string;
    current_insulin_status: "none" | "basal_only" | "basal_bolus" | "iv_insulin" | "unknown";
    recent_illness: boolean;
    recent_medication_change: boolean;
    pregnancy: boolean;
    on_sglt2i: boolean;
    urine_output_ml_per_hour?: number;
  };

  // Intake/Output
  fluid_status: {
    estimated_volume_deficit_liters?: number;
    recent_intake_last_24h_ml?: number;
    urine_output_last_4h_ml?: number;
  };
}

export interface DerivedCrisisFeatures {
  crisis_type: HyperglycemicCrisisType;
  ketosis_level: KetosisLevel;
  acidosis_level: AcidosisLevel;
  severity_classification: "mild" | "moderate" | "severe";
  hemodynamic_status: HemodynamicStatus;
  corrected_sodium: number;
  corrected_osmolality: number;
  anion_gap_closure_rate: string; // "expected", "slow", "accelerated"
}

export interface TreatmentStep {
  step_number: number;
  name: string;
  priority: "immediate" | "early" | "ongoing";
  actions: string[];
  monitoring: string[];
  safety_alerts: string[];
}

export interface DKA_HHS_ManagementPlan {
  status: "ok" | "incomplete";
  crisis_diagnosis: DerivedCrisisFeatures;
  initial_stabilization: TreatmentStep[];
  fluid_management: TreatmentStep[];
  insulin_therapy: TreatmentStep[];
  electrolyte_management: TreatmentStep[];
  glucose_management: TreatmentStep[];
  monitoring_frequencies: Record<string, string>;
  resolution_criteria: Record<string, string[]>;
  transition_to_subq: TreatmentStep[];
  critical_safety_alerts: string[];
  treatment_contraindications: string[];
}

// ============================================================
// DIAGNOSTIC CLASSIFICATION
// ============================================================

export function classifyHyperglycemicCrisis(input: DKA_HHS_Input): DerivedCrisisFeatures {
  const labs = input.labs;
  const vitals = input.vital_signs;

  // Determine ketosis level
  let ketosis_level: KetosisLevel = "none";
  if (labs.beta_hydroxybutyrate_mmol_l === undefined) {
    if (labs.serum_ketones === "large") ketosis_level = "severe";
    else if (labs.serum_ketones === "moderate") ketosis_level = "moderate";
    else if (labs.serum_ketones === "small") ketosis_level = "mild";
  } else {
    if (labs.beta_hydroxybutyrate_mmol_l >= 5) ketosis_level = "severe";
    else if (labs.beta_hydroxybutyrate_mmol_l >= 3) ketosis_level = "moderate";
    else if (labs.beta_hydroxybutyrate_mmol_l >= 1) ketosis_level = "mild";
  }

  // Determine acidosis level
  let acidosis_level: AcidosisLevel = "none";
  if (labs.pH < 7.1) acidosis_level = "severe";
  else if (labs.pH < 7.2) acidosis_level = "moderate";
  else if (labs.pH < 7.30) acidosis_level = "mild";

  // Calculate corrected sodium (normal ~140 mEq/L)
  const corrected_sodium = labs.sodium_meq_l + (labs.glucose_mg_dl - 100) * 0.016;

  // Calculate effective osmolality
  const corrected_osmolality = 2 * labs.sodium_meq_l + labs.glucose_mg_dl / 18 + (labs.BUN_mg_dl || 0) / 2.8;

  // Classify crisis type
  let crisis_type: HyperglycemicCrisisType;
  const is_hyperglycemic = labs.glucose_mg_dl >= 250;
  const has_ketosis = ketosis_level !== "none";
  const has_acidosis = acidosis_level !== "none";
  const is_hyperosmolar = (labs.osmolality_mosm_kg || corrected_osmolality) > 320;

  if (has_ketosis && has_acidosis && !is_hyperosmolar) {
    crisis_type = "dka";
  } else if (is_hyperosmolar && !has_acidosis && labs.glucose_mg_dl >= 600) {
    crisis_type = "hhs";
  } else if ((has_ketosis || has_acidosis) && is_hyperosmolar) {
    crisis_type = "mixed_dka_hhs";
  } else {
    crisis_type = "unable_to_determine";
  }

  // Determine severity
  let severity_classification: "mild" | "moderate" | "severe";
  if (crisis_type === "dka") {
    if (labs.pH >= 7.25 && labs.bicarbonate_meq_l >= 15) severity_classification = "mild";
    else if (labs.pH >= 7.10 && labs.bicarbonate_meq_l >= 10) severity_classification = "moderate";
    else severity_classification = "severe";
  } else if (crisis_type === "hhs") {
    if (corrected_osmolality < 320) severity_classification = "mild";
    else if (corrected_osmolality < 330) severity_classification = "moderate";
    else severity_classification = "severe";
  } else {
    severity_classification = "moderate";
  }

  // Determine hemodynamic status
  let hemodynamic_status: HemodynamicStatus;
  if (vitals.systolic_bp < 90 || (vitals.heart_rate > 120 && vitals.mental_status !== "alert")) {
    hemodynamic_status = "decompensated_shock";
  } else if (vitals.systolic_bp < 100 || (vitals.heart_rate > 100 && input.fluid_status.estimated_volume_deficit_liters && input.fluid_status.estimated_volume_deficit_liters > 5)) {
    hemodynamic_status = "compensated";
  } else {
    hemodynamic_status = "stable";
  }

  // Estimate anion gap closure rate
  let anion_gap_closure_rate = "expected";
  if (labs.anion_gap > 16 && crisis_type === "dka") anion_gap_closure_rate = "expected";
  if (labs.creatinine_mg_dl > 3) anion_gap_closure_rate = "slow";

  return {
    crisis_type,
    ketosis_level,
    acidosis_level,
    severity_classification,
    hemodynamic_status,
    corrected_sodium,
    corrected_osmolality,
    anion_gap_closure_rate,
  };
}

// ============================================================
// TREATMENT ALGORITHM
// ============================================================

export function generateDKA_HHS_ManagementPlan(input: DKA_HHS_Input): DKA_HHS_ManagementPlan {
  const crisis = classifyHyperglycemicCrisis(input);
  const labs = input.labs;
  const vitals = input.vital_signs;
  const critical_alerts: string[] = [];
  const contraindications: string[] = [];

  // === CRITICAL ALERTS ===
  if (crisis.hemodynamic_status === "decompensated_shock") {
    critical_alerts.push("SHOCK PRESENT — Aggressive fluid resuscitation required. Consider vasopressors if SBP remains <90 after 1-2L fluids.");
  }
  if (labs.potassium_meq_l < 3.3) {
    critical_alerts.push("SEVERE HYPOKALEMIA — Do NOT start insulin until K+ ≥3.3. Replace potassium immediately.");
  }
  if (vitals.mental_status === "comatose") {
    critical_alerts.push("ALTERED MENTAL STATUS — Rule out cerebral edema, hypoglycemia, other CNS event. Arrange ICU monitoring.");
  }
  if (labs.pH < 6.8) {
    critical_alerts.push("SEVERE ACIDOSIS (pH <6.8) — Consider bicarbonate therapy per protocol. Escalate to ICU.");
  }
  if (input.clinical_context.on_sglt2i) {
    critical_alerts.push("SGLT2i USE NOTED — Consider euglycemic DKA risk. Monitor glucose and anion gap closely despite normal glucose.");
  }

  // === CONTRAINDICATIONS ===
  if (input.clinical_context.pregnancy) {
    contraindications.push("Pregnant patient — involve obstetrics and maternal-fetal medicine.");
  }

  // === INITIAL STABILIZATION ===
  const initial_stabilization: TreatmentStep[] = [
    {
      step_number: 1,
      name: "Rapid Assessment",
      priority: "immediate",
      actions: [
        "Check ABCs (airway, breathing, circulation).",
        "Obtain IV access (2 large-bore IVs recommended).",
        "Establish continuous cardiac monitoring.",
        "Send stat labs: CBC, BMP, VBG, troponin, lipase, urinalysis, β-hydroxybutyrate, lactate.",
        "Obtain portable chest X-ray if altered mental status or respiratory distress.",
        "Obtain ECG if K+ abnormal or cardiac symptoms.",
      ],
      monitoring: ["Vital signs q15-30min", "Mental status q30min"],
      safety_alerts: ["Do not delay IV access for lab confirmation.", "If altered mental status, also consider hypoglycemia as cause."],
    },
  ];

  // === FLUID MANAGEMENT ===
  const initial_bolus = crisis.hemodynamic_status === "decompensated_shock" ? "1-2 L over 1-2 hours" : "500 mL to 1 L over 1 hour";
  const fluid_management: TreatmentStep[] = [
    {
      step_number: 2,
      name: "Fluid Resuscitation",
      priority: "immediate",
      actions: [
        `Start isotonic crystalloid (0.9% NaCl or LR) immediately: ${initial_bolus} initial bolus.`,
        `Reassess after initial bolus. If hypotensive or in shock, continue aggressive resuscitation.`,
        `After initial stabilization, change to 0.45% NaCl or 5% dextrose-containing fluids based on corrected sodium and osmolality.`,
        `Target urine output: 200-300 mL/hour (or 0.5 mL/kg/hour).`,
        `Adjust fluid rate based on hemodynamics, urine output, and trend in osmolality.`,
      ],
      monitoring: ["Urine output q1h initially", "Corrected sodium and osmolality q4h", "Fluid balance chart"],
      safety_alerts: [
        "Avoid hypotonic fluids initially (risk of cerebral edema).",
        "Monitor for fluid overload, especially in renal impairment or heart failure.",
        "In HHS, avoid overly rapid correction of osmolality (target 3 mOsm/kg/hour reduction).",
      ],
    },
  ];

  // === POTASSIUM MANAGEMENT ===
  let potassium_action = "";
  if (labs.potassium_meq_l < 3.3) {
    potassium_action = "HOLD INSULIN. Replace K+ to ≥3.3 mEq/L before starting insulin. Use 20-40 mEq/L in IV fluids or central line if severe.";
  } else if (labs.potassium_meq_l <= 5.2) {
    potassium_action = "Start K+ replacement with IV fluids (10-20 mEq/L) to target 4.0-5.0 mEq/L. Begin insulin therapy.";
  } else {
    potassium_action = "Do NOT give K+ initially. Recheck K+ q2h. Begin insulin therapy and closely monitor for hyperkalemia.";
  }

  const electrolyte_management: TreatmentStep[] = [
    {
      step_number: 3,
      name: "Electrolyte Management",
      priority: "early",
      actions: [potassium_action, "Monitor Na+, Cl-, K+, CO3- q2-4h initially. Plot anion gap trend.", "Phosphate replacement as needed if severe."],
      monitoring: ["K+ before insulin and q2h initially", "Full electrolytes q4h until stable"],
      safety_alerts: ["Risk of cardiac arrhythmia if K+ <3.0 or >6.0. Obtain ECG if abnormal.", "Insulin causes K+ shift into cells — risk of hypokalemia."],
    },
  ];

  // === INSULIN THERAPY ===
  const weight_kg = 75; // Default assumption; should be in input
  const insulin_bolus = input.clinical_context.diabetes_type === "type1" ? `0.1 U/kg (${0.1 * weight_kg} U)` : `0.05-0.1 U/kg`;
  const insulin_drip = `0.05-0.1 U/kg/hour (${0.05 * weight_kg}-${0.1 * weight_kg} U/hour)`;

  const insulin_therapy: TreatmentStep[] = [
    {
      step_number: 4,
      name: "Insulin Therapy",
      priority: "early",
      actions: [
        `Start IV regular insulin ONLY after potassium is ≥3.3 mEq/L and initial fluids given.`,
        `Initial IV bolus: ${insulin_bolus} (optional; some protocols start without bolus).`,
        `Continuous IV infusion: ${insulin_drip}.`,
        `Target glucose reduction: 100 mg/dL per hour initially (max 200 mg/dL/hour).`,
        `When glucose reaches ~250 mg/dL, add dextrose to IV fluids and reduce insulin to 0.02-0.05 U/kg/hour.`,
        `Continue insulin until anion gap closes (DKA) or osmolality improves (HHS).`,
      ],
      monitoring: ["Glucose q1h initially", "Anion gap q2h", "Osmolality trend"],
      safety_alerts: ["Do not start insulin if K+ <3.3.", "Beware hypoglycemia during transition phase.", "Consider ICU monitoring for insulin drip."],
    },
  ];

  // === GLUCOSE MANAGEMENT ===
  const glucose_management: TreatmentStep[] = [
    {
      step_number: 5,
      name: "Glucose and Dextrose Management",
      priority: "ongoing",
      actions: [
        "Once glucose reaches ~250 mg/dL, add dextrose to IV fluids (5% or 10% dextrose in 0.45% NaCl).",
        "Target glucose 150-250 mg/dL during acute phase (allows continued insulin action while preventing hypoglycemia).",
        "Continue insulin infusion throughout recovery phase even as glucose improves, until anion gap closed (DKA) or osmolality <310 (HHS).",
      ],
      monitoring: ["Glucose q1h during insulin drip", "Point-of-care β-hydroxybutyrate or serum ketones"],
      safety_alerts: ["Risk of hypoglycemia if insulin not reduced when glucose falls.", "Euglycemic DKA can occur with SGLT2i use — may present with normal glucose and low anion gap."],
    },
  ];

  // === MONITORING FREQUENCIES ===
  const monitoring_frequencies: Record<string, string> = {
    glucose: "Every 1 hour initially; every 4 hours once stable",
    electrolytes: "Every 2-4 hours until stable; then q6-8h",
    arterial_or_venous_gas: "Baseline, 4 hours, then q6-8h or as clinically indicated",
    anion_gap: "Every 2 hours until closed",
    osmolality: "Every 4-6 hours in HHS",
    urinalysis: "Baseline; monitor for ketones and glucose",
    urine_output: "Every 1 hour",
  };

  // === RESOLUTION CRITERIA ===
  const resolution_criteria: Record<string, string[]> = {
    DKA: [
      "Glucose < 250 mg/dL",
      "pH > 7.30",
      "Bicarbonate ≥ 18 mEq/L",
      "Anion gap ≤ 12 mEq/L (or normal for lab)",
      "Serum or urine ketones small or negative",
    ],
    HHS: [
      "Effective osmolality < 310 mOsm/kg",
      "Glucose 200-300 mg/dL (controlled)",
      "Mental status alert or clearly improving",
      "Hemodynamically stable",
    ],
  };

  // === TRANSITION TO SUBCUTANEOUS INSULIN ===
  const transition_to_subq: TreatmentStep[] = [
    {
      step_number: 9,
      name: "Transition to Subcutaneous Insulin",
      priority: "ongoing",
      actions: [
        "Criteria: Resolution criteria met AND patient able to eat or on stable nutrition.",
        "Continue IV insulin for 1-2 hours after first SQ dose to prevent recurrence.",
        "Calculate total daily dose from IV infusion rate (mL/hour × insulin conc / 100 × 24).",
        "Use basal-bolus regimen: ~50% basal, ~50% divided with meals.",
        "Adjust based on home regimen and type 1 vs type 2 diabetes.",
        "Educate on sick-day management, signs of recurrence, and follow-up.",
      ],
      monitoring: ["Glucose q4h during transition", "Electrolytes before discharge"],
      safety_alerts: ["Do not stop IV insulin before SQ insulin is given.", "Arrange endocrinology follow-up within 1-2 weeks."],
    },
  ];

  return {
    status: crisis.crisis_type === "unable_to_determine" ? "incomplete" : "ok",
    crisis_diagnosis: crisis,
    initial_stabilization,
    fluid_management,
    insulin_therapy,
    electrolyte_management,
    glucose_management,
    monitoring_frequencies,
    resolution_criteria,
    transition_to_subq,
    critical_safety_alerts: critical_alerts,
    treatment_contraindications: contraindications,
  };
}
