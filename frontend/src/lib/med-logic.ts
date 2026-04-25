import { PatientData } from './patient-data';

export interface MedRecommendation {
  drug: string;
  genericName: string;
  drugClass: DrugClass;
  dose: string;
  frequency: string;
  reason: string;
  priority: 'first-line' | 'add-on' | 'adjustment' | 'intensification' | 'de-escalate' | 'emergency';
  category: AlgorithmPriority;
  warnings: string[];
  contraindications: string[];
  adaReference: string;
  hba1cReduction: string;
  cvBenefit: boolean;
  renalBenefit: boolean;
  weightEffect: 'loss' | 'neutral' | 'gain';
}

export type DrugClass =
  | 'biguanide' | 'sglt2i' | 'glp1ra' | 'dpp4i' | 'sulfonylurea' | 'tzd'
  | 'agi' | 'meglitinide' | 'basal-insulin' | 'prandial-insulin' | 'premixed-insulin'
  | 'dual-agonist' | 'statin' | 'ace-arb';

export type AlgorithmPriority = 'cvkd-risk' | 'weight-management' | 'glycemic-control' | 'lipid' | 'current-med-review';

export interface HypoProtocol {
  trigger: string;
  immediate: string[];
  followUp: string[];
}

interface DrugProfile {
  name: string;
  generic: string;
  class: DrugClass;
  doses: { label: string; dose: string; frequency: string }[];
  hba1cReduction: string;
  cvBenefit: boolean;
  renalBenefit: boolean;
  weightEffect: 'loss' | 'neutral' | 'gain';
  hypoRisk: 'low' | 'moderate' | 'high';
  minEGFR: number;
  renalDoseAdjust?: { eGFRRange: [number, number]; dose: string; frequency: string }[];
  contraindications: string[];
  sideEffects: string[];
  adaReference: string;
}

const DRUG_DB: DrugProfile[] = [
  { name: 'Metformin (Glucophage)', generic: 'Metformin', class: 'biguanide',
    doses: [{ label: 'Start', dose: '500mg', frequency: 'OD with dinner' }, { label: 'Target', dose: '1000mg', frequency: 'BD' }],
    hba1cReduction: '1.0-1.5%', cvBenefit: false, renalBenefit: false, weightEffect: 'neutral', hypoRisk: 'low', minEGFR: 30,
    renalDoseAdjust: [{ eGFRRange: [30, 45], dose: '500mg', frequency: 'BD (max 1000mg/day)' }],
    contraindications: ['eGFR <30', 'Metabolic acidosis'], sideEffects: ['GI (diarrhea, nausea)', 'B12 deficiency'],
    adaReference: 'ADA 2026 §9.2 – Metformin foundational therapy' },
  { name: 'Semaglutide (Ozempic)', generic: 'Semaglutide', class: 'glp1ra',
    doses: [{ label: 'Start', dose: '0.25mg', frequency: 'Weekly SC × 4 weeks' }, { label: 'Target', dose: '1.0mg', frequency: 'Weekly SC' }],
    hba1cReduction: '1.5-2.0%', cvBenefit: true, renalBenefit: true, weightEffect: 'loss', hypoRisk: 'low', minEGFR: 15,
    contraindications: ['MTC history', 'MEN2', 'Pancreatitis history'], sideEffects: ['Nausea, vomiting', 'Diarrhea'],
    adaReference: 'ADA 2026 §9.3 – GLP-1 RA proven CV benefit (SUSTAIN-6, SELECT)' },
  { name: 'Liraglutide (Victoza)', generic: 'Liraglutide', class: 'glp1ra',
    doses: [{ label: 'Start', dose: '0.6mg', frequency: 'Daily SC × 1 week' }, { label: 'Target', dose: '1.8mg', frequency: 'Daily SC' }],
    hba1cReduction: '1.0-1.5%', cvBenefit: true, renalBenefit: true, weightEffect: 'loss', hypoRisk: 'low', minEGFR: 15,
    contraindications: ['MTC history', 'MEN2'], sideEffects: ['Nausea', 'Diarrhea'],
    adaReference: 'ADA 2026 §9.3 – GLP-1 RA (LEADER)' },
  { name: 'Dulaglutide (Trulicity)', generic: 'Dulaglutide', class: 'glp1ra',
    doses: [{ label: 'Start', dose: '0.75mg', frequency: 'Weekly SC' }, { label: 'Target', dose: '1.5mg', frequency: 'Weekly SC' }],
    hba1cReduction: '1.2-1.6%', cvBenefit: true, renalBenefit: true, weightEffect: 'loss', hypoRisk: 'low', minEGFR: 15,
    contraindications: ['MTC history', 'MEN2'], sideEffects: ['Nausea, diarrhea', 'Abdominal pain'],
    adaReference: 'ADA 2026 §9.3 – GLP-1 RA (REWIND)' },
  { name: 'Tirzepatide (Mounjaro)', generic: 'Tirzepatide', class: 'dual-agonist',
    doses: [{ label: 'Start', dose: '2.5mg', frequency: 'Weekly SC × 4 weeks' }, { label: 'Target', dose: '5mg', frequency: 'Weekly SC' }],
    hba1cReduction: '2.0-2.6%', cvBenefit: true, renalBenefit: true, weightEffect: 'loss', hypoRisk: 'low', minEGFR: 15,
    contraindications: ['MTC history', 'MEN2', 'Pancreatitis'], sideEffects: ['Nausea, vomiting', 'Diarrhea'],
    adaReference: 'ADA 2026 §9.3 – GIP/GLP-1 dual agonist (SURPASS, SURMOUNT)' },
  { name: 'Empagliflozin (Jardiance)', generic: 'Empagliflozin', class: 'sglt2i',
    doses: [{ label: 'Start', dose: '10mg', frequency: 'OD morning' }, { label: 'Max', dose: '25mg', frequency: 'OD morning' }],
    hba1cReduction: '0.7-1.0%', cvBenefit: true, renalBenefit: true, weightEffect: 'loss', hypoRisk: 'low', minEGFR: 20,
    contraindications: ['eGFR <20', 'Recurrent UTI', 'T1DM'], sideEffects: ['Genital infections', 'UTI'],
    adaReference: 'ADA 2026 §9.4 – SGLT2i (EMPA-REG, EMPEROR)' },
  { name: 'Dapagliflozin (Farxiga)', generic: 'Dapagliflozin', class: 'sglt2i',
    doses: [{ label: 'Start', dose: '5mg', frequency: 'OD morning' }, { label: 'Max', dose: '10mg', frequency: 'OD morning' }],
    hba1cReduction: '0.7-1.0%', cvBenefit: true, renalBenefit: true, weightEffect: 'loss', hypoRisk: 'low', minEGFR: 20,
    contraindications: ['eGFR <20', 'Recurrent UTI', 'T1DM'], sideEffects: ['Genital infections', 'Polyuria'],
    adaReference: 'ADA 2026 §9.4 – SGLT2i (DECLARE, DAPA-CKD, DAPA-HF)' },
  { name: 'Sitagliptin (Januvia)', generic: 'Sitagliptin', class: 'dpp4i',
    doses: [{ label: 'Standard', dose: '100mg', frequency: 'OD' }],
    hba1cReduction: '0.5-0.8%', cvBenefit: false, renalBenefit: false, weightEffect: 'neutral', hypoRisk: 'low', minEGFR: 0,
    renalDoseAdjust: [{ eGFRRange: [30, 50], dose: '50mg', frequency: 'OD' }, { eGFRRange: [0, 30], dose: '25mg', frequency: 'OD' }],
    contraindications: ['Pancreatitis history with DPP-4i'], sideEffects: ['Nasopharyngitis', 'Headache'],
    adaReference: 'ADA 2026 §9.2 – DPP-4i renal-safe' },
  { name: 'Linagliptin (Trajenta)', generic: 'Linagliptin', class: 'dpp4i',
    doses: [{ label: 'Standard', dose: '5mg', frequency: 'OD' }],
    hba1cReduction: '0.5-0.7%', cvBenefit: false, renalBenefit: false, weightEffect: 'neutral', hypoRisk: 'low', minEGFR: 0,
    contraindications: ['Concurrent GLP-1 RA'], sideEffects: ['Nasopharyngitis', 'Cough'],
    adaReference: 'ADA 2026 §9.2 – DPP-4i, NO renal dose adjust (biliary)' },
  { name: 'Vildagliptin (Galvus)', generic: 'Vildagliptin', class: 'dpp4i',
    doses: [{ label: 'Standard', dose: '50mg', frequency: 'BD' }],
    hba1cReduction: '0.5-0.9%', cvBenefit: false, renalBenefit: false, weightEffect: 'neutral', hypoRisk: 'low', minEGFR: 0,
    renalDoseAdjust: [{ eGFRRange: [0, 50], dose: '50mg', frequency: 'OD' }],
    contraindications: ['Hepatic impairment'], sideEffects: ['Headache', 'Dizziness'],
    adaReference: 'ADA 2026 §9.2 – DPP-4i (Asia)' },
  { name: 'Glimepiride (Amaryl)', generic: 'Glimepiride', class: 'sulfonylurea',
    doses: [{ label: 'Start', dose: '1mg', frequency: 'OD breakfast' }, { label: 'Target', dose: '2mg', frequency: 'OD' }],
    hba1cReduction: '1.0-1.5%', cvBenefit: false, renalBenefit: false, weightEffect: 'gain', hypoRisk: 'high', minEGFR: 0,
    contraindications: ['Severe hepatic insufficiency'], sideEffects: ['Hypoglycemia (HIGH)', 'Weight gain'],
    adaReference: 'ADA 2026 §9.2 – SU high efficacy, hypo+wt risk' },
  { name: 'Gliclazide MR (Diamicron MR)', generic: 'Gliclazide', class: 'sulfonylurea',
    doses: [{ label: 'Start', dose: '30mg', frequency: 'OD breakfast' }, { label: 'Target', dose: '60mg', frequency: 'OD' }],
    hba1cReduction: '1.0-1.5%', cvBenefit: false, renalBenefit: false, weightEffect: 'gain', hypoRisk: 'moderate', minEGFR: 0,
    contraindications: ['Severe hepatic impairment', 'T1DM'], sideEffects: ['Hypoglycemia', 'Weight gain'],
    adaReference: 'ADA 2026 §9.2 – Preferred SU (ADVANCE)' },
  { name: 'Pioglitazone (Actos)', generic: 'Pioglitazone', class: 'tzd',
    doses: [{ label: 'Start', dose: '15mg', frequency: 'OD' }, { label: 'Target', dose: '30mg', frequency: 'OD' }],
    hba1cReduction: '1.0-1.5%', cvBenefit: true, renalBenefit: false, weightEffect: 'gain', hypoRisk: 'low', minEGFR: 0,
    contraindications: ['NYHA III-IV HF', 'Active bladder cancer'], sideEffects: ['Weight gain', 'Edema', 'HF risk'],
    adaReference: 'ADA 2026 §9.2 – TZD (PROactive)' },
  { name: 'Voglibose (Volix)', generic: 'Voglibose', class: 'agi',
    doses: [{ label: 'Standard', dose: '0.2mg', frequency: 'TDS before meals' }],
    hba1cReduction: '0.5-0.8%', cvBenefit: false, renalBenefit: false, weightEffect: 'neutral', hypoRisk: 'low', minEGFR: 0,
    contraindications: ['IBD', 'Intestinal obstruction'], sideEffects: ['Flatulence', 'Diarrhea'],
    adaReference: 'ADA 2026 §9.2 – AGI for post-prandial (Asia)' },
  { name: 'Insulin Glargine U-100 (Lantus)', generic: 'Insulin Glargine', class: 'basal-insulin',
    doses: [{ label: 'Start', dose: '10 units (or 0.1-0.2 U/kg)', frequency: 'OD bedtime' }],
    hba1cReduction: '1.5-3.5%', cvBenefit: false, renalBenefit: false, weightEffect: 'gain', hypoRisk: 'moderate', minEGFR: 0,
    contraindications: ['Hypo unawareness'], sideEffects: ['Hypoglycemia', 'Weight gain'],
    adaReference: 'ADA 2026 §9.5 – Basal insulin' },
  { name: 'Insulin Degludec (Tresiba)', generic: 'Insulin Degludec', class: 'basal-insulin',
    doses: [{ label: 'Start', dose: '10 units', frequency: 'OD any time' }],
    hba1cReduction: '1.5-3.5%', cvBenefit: false, renalBenefit: false, weightEffect: 'gain', hypoRisk: 'low', minEGFR: 0,
    contraindications: [], sideEffects: ['Hypoglycemia (lower)', 'Weight gain'],
    adaReference: 'ADA 2026 §9.5 – Ultra-long acting (DEVOTE)' },
];

function isOnDrug(p: PatientData, generic: string): boolean {
  return p.currentMeds.some(m => m.toLowerCase().includes(generic.toLowerCase()));
}
function isOnDrugClass(p: PatientData, cls: DrugClass): boolean {
  return DRUG_DB.filter(d => d.class === cls).some(d => isOnDrug(p, d.generic));
}
function hasASCVDFn(p: PatientData) { return p.hasASCVD || p.hasPostStroke || p.hasPAD; }
function hasCKDFn(p: PatientData) { return p.hasCKD || p.eGFR < 60; }
function hasHFFn(p: PatientData) { return p.hasHF || p.hfNYHA >= 2; }

function getRecommendedDose(drug: DrugProfile, p: PatientData) {
  if (drug.renalDoseAdjust) {
    for (const adj of drug.renalDoseAdjust) {
      if (p.eGFR >= adj.eGFRRange[0] && p.eGFR < adj.eGFRRange[1]) return { dose: adj.dose, frequency: adj.frequency };
    }
  }
  return { dose: drug.doses[0].dose, frequency: drug.doses[0].frequency };
}

function buildRec(drug: DrugProfile, p: PatientData, reason: string, priority: MedRecommendation['priority'], category: AlgorithmPriority): MedRecommendation {
  const recommended = getRecommendedDose(drug, p);
  const warnings: string[] = [...drug.sideEffects.slice(0, 2)];
  if (drug.renalDoseAdjust && p.eGFR < 60) {
    const adj = drug.renalDoseAdjust.find(a => p.eGFR >= a.eGFRRange[0] && p.eGFR < a.eGFRRange[1]);
    if (adj) warnings.unshift(`⚠ Renal dose: ${adj.dose} ${adj.frequency} (eGFR ${p.eGFR})`);
  }
  if (p.eGFR < drug.minEGFR) warnings.unshift(`🚫 CONTRAINDICATED: eGFR ${p.eGFR} < ${drug.minEGFR}`);
  if (p.postStrokeDysphagia) warnings.push('⚠ Post-stroke dysphagia: verify swallowing safety');
  if (drug.hypoRisk === 'high') warnings.push('⚠ HIGH hypoglycemia risk');
  if (drug.class === 'tzd' && p.hfNYHA >= 3) warnings.unshift('🚫 CONTRAINDICATED in NYHA III-IV HF');
  if (isOnDrug(p, drug.generic)) {
    const cur = p.currentMeds.find(m => m.toLowerCase().includes(drug.generic.toLowerCase()));
    warnings.unshift(`📋 Currently on: ${cur} – review dosing`);
  }
  return {
    drug: drug.name, genericName: drug.generic, drugClass: drug.class,
    dose: recommended.dose, frequency: recommended.frequency, reason, priority, category, warnings,
    contraindications: drug.contraindications, adaReference: drug.adaReference,
    hba1cReduction: drug.hba1cReduction, cvBenefit: drug.cvBenefit, renalBenefit: drug.renalBenefit, weightEffect: drug.weightEffect,
  };
}

export type AlgorithmPathway = 'ascvd-predominant' | 'hf-ckd-predominant' | 'hypo-minimization' | 'weight-management' | 'general';

export function getAlgorithmPathway(p: PatientData): AlgorithmPathway {
  const ascvd = hasASCVDFn(p);
  const ckd = hasCKDFn(p);
  const hf = hasHFFn(p);
  if (ascvd && !hf && !ckd) return 'ascvd-predominant';
  if (hf || ckd) return 'hf-ckd-predominant';
  if (p.bmi >= 25 || p.hasObesity) return 'weight-management';
  return 'hypo-minimization';
}

export function getPathwayLabel(pathway: AlgorithmPathway): string {
  const labels: Record<AlgorithmPathway, string> = {
    'ascvd-predominant': 'ASCVD Predominates',
    'hf-ckd-predominant': 'HF or CKD Predominates',
    'hypo-minimization': 'Minimize Hypoglycemia',
    'weight-management': 'Weight Management Priority',
    general: 'General Glycemic Control',
  };
  return labels[pathway];
}

export function generateMedRecommendations(p: PatientData): MedRecommendation[] {
  const recs: MedRecommendation[] = [];
  const addedClasses = new Set<DrugClass>();
  const addedGenerics = new Set<string>();
  const addRec = (rec: MedRecommendation) => {
    if (!addedGenerics.has(rec.genericName)) {
      recs.push(rec); addedGenerics.add(rec.genericName); addedClasses.add(rec.drugClass);
    }
  };
  const hba1c = p.hba1c;
  const pathway = getAlgorithmPathway(p);
  const ascvd = hasASCVDFn(p);
  const ckd = hasCKDFn(p);
  const hf = hasHFFn(p);
  const above = hba1c >= 7.0;

  // Step 1: Metformin
  if (p.eGFR >= 30 && !isOnDrug(p, 'Metformin')) {
    const m = DRUG_DB.find(d => d.generic === 'Metformin')!;
    addRec(buildRec(m, p, `First-line Metformin + lifestyle. eGFR ${p.eGFR} ≥ 30.`, 'first-line', 'glycemic-control'));
  }

  if (ascvd || ckd || hf) {
    if (pathway === 'ascvd-predominant') {
      const sema = DRUG_DB.find(d => d.generic === 'Semaglutide')!;
      addRec(buildRec(sema, p, `ASCVD predominates → GLP-1 RA with proven CV benefit (SUSTAIN-6, SELECT).`, 'first-line', 'cvkd-risk'));
      if (p.eGFR >= 20) {
        const e = DRUG_DB.find(d => d.generic === 'Empagliflozin')!;
        addRec(buildRec(e, p, `ASCVD → SGLT2i with CV benefit. eGFR ${p.eGFR} ≥ 20.`, 'first-line', 'cvkd-risk'));
      }
      if (above) {
        if (p.bmi >= 27) {
          const t = DRUG_DB.find(d => d.generic === 'Tirzepatide')!;
          addRec(buildRec(t, p, `HbA1c ${hba1c}% + BMI ${p.bmi} → Dual GIP/GLP-1.`, 'add-on', 'cvkd-risk'));
        }
      }
    } else if (pathway === 'hf-ckd-predominant') {
      if (p.eGFR >= 20) {
        const choice = hf ? DRUG_DB.find(d => d.generic === 'Empagliflozin')! : DRUG_DB.find(d => d.generic === 'Dapagliflozin')!;
        addRec(buildRec(choice, p, `HF/CKD → SGLT2i ${hf ? '(EMPEROR)' : '(DAPA-CKD)'}. eGFR ${p.eGFR}.`, 'first-line', 'cvkd-risk'));
        const alt = hf ? DRUG_DB.find(d => d.generic === 'Dapagliflozin')! : DRUG_DB.find(d => d.generic === 'Empagliflozin')!;
        addRec(buildRec(alt, p, `Alternative SGLT2i.`, 'add-on', 'cvkd-risk'));
      }
      const sema = DRUG_DB.find(d => d.generic === 'Semaglutide')!;
      addRec(buildRec(sema, p, `${p.eGFR < 20 ? 'eGFR<20 → SGLT2i contraindicated. ' : ''}GLP-1 RA with CV benefit.`, p.eGFR < 20 ? 'first-line' : 'add-on', 'cvkd-risk'));
      if (above) {
        if (!addedClasses.has('dpp4i')) {
          const dpp4 = hf ? DRUG_DB.find(d => d.generic === 'Linagliptin')! : DRUG_DB.find(d => d.generic === 'Sitagliptin')!;
          addRec(buildRec(dpp4, p, `HbA1c ${hba1c}% → ${hf ? 'DPP-4i (NOT saxagliptin) in HF.' : `${dpp4.name} for glycemic control.`}`, 'add-on', 'glycemic-control'));
        }
      }
    }
  } else if (above) {
    if (pathway === 'hypo-minimization' || p.age >= 65) {
      const lina = DRUG_DB.find(d => d.generic === 'Linagliptin')!;
      addRec(buildRec(lina, p, `Minimize hypo → DPP-4i, no renal dose adjust.`, 'add-on', 'glycemic-control'));
      const sema = DRUG_DB.find(d => d.generic === 'Semaglutide')!;
      addRec(buildRec(sema, p, `Minimize hypo → GLP-1 RA: low hypo + weight loss.`, 'add-on', 'glycemic-control'));
      if (p.eGFR >= 20) {
        const e = DRUG_DB.find(d => d.generic === 'Empagliflozin')!;
        addRec(buildRec(e, p, `Minimize hypo → SGLT2i: low hypo + CV/renal benefit.`, 'add-on', 'glycemic-control'));
      }
    } else if (pathway === 'weight-management') {
      if (p.bmi >= 27) {
        const t = DRUG_DB.find(d => d.generic === 'Tirzepatide')!;
        addRec(buildRec(t, p, `Weight management (BMI ${p.bmi}) → Dual GIP/GLP-1: highest weight loss (15-20%).`, 'first-line', 'weight-management'));
      }
      const sema = DRUG_DB.find(d => d.generic === 'Semaglutide')!;
      addRec(buildRec(sema, p, `Weight management → GLP-1 RA (5-15% loss). SELECT/STEP.`, p.bmi >= 27 ? 'add-on' : 'first-line', 'weight-management'));
      if (p.eGFR >= 20) {
        const e = DRUG_DB.find(d => d.generic === 'Empagliflozin')!;
        addRec(buildRec(e, p, `Weight management → SGLT2i (2-3 kg loss) + CV/renal benefit.`, 'add-on', 'weight-management'));
      }
    }
  }

  // Severe hyperglycemia → basal insulin
  if (hba1c >= 9.0 && !addedClasses.has('basal-insulin')) {
    const g = DRUG_DB.find(d => d.generic === 'Insulin Glargine')!;
    addRec(buildRec(g, p, `HbA1c ${hba1c}% → Basal insulin. Start 10U or 0.1-0.2 U/kg. Titrate +2U q3d to FBG 80-130.`, hba1c >= 10 ? 'first-line' : 'intensification', 'glycemic-control'));
  }

  // Current medication review
  for (const med of p.currentMeds) {
    const ml = med.toLowerCase();
    for (const drug of DRUG_DB) {
      if (ml.includes(drug.generic.toLowerCase()) && !addedGenerics.has(drug.generic)) {
        let isContra = false;
        if (drug.minEGFR > 0 && p.eGFR < drug.minEGFR) isContra = true;
        if (drug.class === 'tzd' && p.hfNYHA >= 3) isContra = true;
        if (isContra) {
          addRec(buildRec(drug, p, `Currently on ${med} → ⚠ CONTRAINDICATED. Discontinue and switch.`, 'de-escalate', 'current-med-review'));
        } else {
          const needsAdj = drug.renalDoseAdjust?.some(a => p.eGFR >= a.eGFRRange[0] && p.eGFR < a.eGFRRange[1]);
          addRec(buildRec(drug, p, `Currently on ${med}. ${needsAdj ? '⚠ DOSE ADJUSTMENT for renal function.' : 'Review: appropriate.'}`, needsAdj ? 'adjustment' : 'add-on', 'current-med-review'));
        }
        break;
      }
    }
  }

  // Lipid (Post-stroke target)
  if (p.ldl > 55) {
    const dose = p.ldl > 100 ? '20mg' : '10mg';
    recs.push({
      drug: `Rosuvastatin ${dose}`, genericName: 'Rosuvastatin', drugClass: 'statin',
      dose, frequency: 'OD bedtime',
      reason: `LDL ${p.ldl} → Target <55 mg/dL (post-stroke very high-risk).`,
      priority: 'first-line', category: 'lipid',
      warnings: ['Target LDL <55', 'Check LFT at 3 months', p.eGFR < 30 ? '⚠ Max 10mg if eGFR <30' : ''].filter(Boolean) as string[],
      contraindications: ['Active liver disease', 'Pregnancy'],
      adaReference: 'ADA 2026 §10.2 + LAI Lipid Guidelines',
      hba1cReduction: 'N/A', cvBenefit: true, renalBenefit: false, weightEffect: 'neutral',
    });
  }

  const priorityOrder: Record<string, number> = { 'cvkd-risk': 0, 'weight-management': 1, 'glycemic-control': 2, lipid: 3, 'current-med-review': 4 };
  const statusOrder: Record<string, number> = { 'first-line': 0, adjustment: 1, 'add-on': 2, intensification: 3, 'de-escalate': 4, emergency: 5 };
  recs.sort((a, b) => {
    const c = (priorityOrder[a.category] ?? 5) - (priorityOrder[b.category] ?? 5);
    if (c !== 0) return c;
    return (statusOrder[a.priority] ?? 5) - (statusOrder[b.priority] ?? 5);
  });
  return recs;
}

export function getHypoProtocol(p: PatientData): HypoProtocol {
  return {
    trigger: 'Blood glucose < 70 mg/dL',
    immediate: [
      'Moru (buttermilk) 240ml immediately – 5g fast carbs',
      '15g almonds (badam) – sustained glucose release',
      'Recheck BG in 15 minutes',
      p.postStrokeDysphagia ? '⚠ DYSPHAGIA: Use thickened moru, almond paste' : '',
    ].filter(Boolean) as string[],
    followUp: [
      'If BG still <70: repeat 15g carb rule',
      'Moru every 3 hours until BG stable >100',
      'Document episode and inform physician',
      'Review sulfonylurea/insulin doses',
    ],
  };
}

export function getLipidTargets(p: PatientData) {
  return {
    ldlTarget: 55,
    ldlCurrent: p.ldl,
    ldlGap: p.ldl - 55,
    trigTarget: 150,
    trigCurrent: p.triglycerides || 0,
    hdlTarget: p.gender === 'M' ? 40 : 50,
    hdlCurrent: p.hdl || 0,
    riskCategory: 'Very High (Post-stroke + T2DM)',
  };
}

export function getDrugClassLabel(cls: DrugClass): string {
  const labels: Record<DrugClass, string> = {
    biguanide: 'Biguanide', sglt2i: 'SGLT2 Inhibitor', glp1ra: 'GLP-1 RA', dpp4i: 'DPP-4 Inhibitor',
    sulfonylurea: 'Sulfonylurea', tzd: 'Thiazolidinedione', agi: 'α-Glucosidase Inhibitor',
    meglitinide: 'Meglitinide', 'basal-insulin': 'Basal Insulin', 'prandial-insulin': 'Prandial Insulin',
    'premixed-insulin': 'Premixed Insulin', 'dual-agonist': 'Dual GIP/GLP-1 Agonist',
    statin: 'Statin / Lipid', 'ace-arb': 'ACE/ARB',
  };
  return labels[cls] || cls;
}

export function getCategoryLabel(cat: AlgorithmPriority): string {
  const labels: Record<AlgorithmPriority, string> = {
    'cvkd-risk': '① CV & Kidney Risk',
    'weight-management': '② Weight Management',
    'glycemic-control': '③ Glycemic Control',
    lipid: '④ Lipid Management',
    'current-med-review': '⑤ Current Med Review',
  };
  return labels[cat] || cat;
}

// Prediabetes
export interface PrediabetesRecommendation {
  category: 'lifestyle' | 'cv-risk' | 'weight-loss-med' | 'dysglycemia-med' | 'surgery' | 'monitoring';
  title: string;
  detail: string;
  isActive: boolean;
  medications?: string[];
  footnote?: string;
}

export function generatePrediabetesRecommendations(p: PatientData) {
  const isPrediabetic = (p.hba1c >= 5.7 && p.hba1c <= 6.4) || (p.fbs >= 100 && p.fbs <= 125);
  const isOverweight = p.bmi >= 23;
  if (!isPrediabetic) return { isPrediabetic: false, isOverweight, recommendations: [] as PrediabetesRecommendation[], goals: [] as string[], pathway: 'not-prediabetic' as const };

  const recs: PrediabetesRecommendation[] = [
    { category: 'lifestyle', title: 'Lifestyle Intervention', detail: 'Nutrition counseling, 150 min/week activity, sleep hygiene. Target ≥7% weight loss.', isActive: true },
    { category: 'cv-risk', title: 'Cardiovascular Risk Reduction', detail: 'BP <130/80, lipid management, weight reduction.', isActive: true },
  ];
  const goals = [
    'Prevent progression to type 2 diabetes',
    'Prevent progression of NAFLD',
    'Improve CVD risk factors',
    'Promote weight loss',
    'Improve quality of life',
  ];
  if (isOverweight) {
    recs.push({
      category: 'weight-loss-med', title: 'Weight Loss Medications',
      detail: `BMI ${p.bmi} — Goal: weight loss >7-10%. GLP-1 RA approved for obesity/overweight with prediabetes.`,
      isActive: true,
      medications: ['GLP-1 RA (Semaglutide 2.4mg weekly)', 'Liraglutide 3.0mg daily', 'Phentermine/Topiramate ER', 'Naltrexone-ER/Bupropion-ER', 'Orlistat'],
      footnote: 'Indications: BMI >27 with ABCD complications including prediabetes.',
    });
    if (p.fbs > 100 || p.hba1c > 5.9) {
      recs.push({
        category: 'dysglycemia-med', title: 'Persistent Hyperglycemia — Additional Pharmacotherapy',
        detail: `FPG ${p.fbs}, HbA1c ${p.hba1c}% — consider dysglycemia agents.`, isActive: true,
        medications: ['Metformin 500-2000mg/day', 'Pioglitazone 15-30mg/day', 'Acarbose 25-100mg TDS'],
      });
    }
    if (p.bmi >= 32.5) {
      recs.push({
        category: 'surgery', title: 'Consider Bariatric Surgery',
        detail: `BMI ${p.bmi} ${p.bmi < 35 ? '(Asian threshold ≥32.5)' : '≥35'} — Consider if non-surgical insufficient.`,
        isActive: p.bmi >= 37.5,
        footnote: 'ADA/AACE: ≥40 (≥37.5 Asian) or ≥35 (≥32.5 Asian) with inadequate response.',
      });
    }
  } else {
    recs.push({
      category: 'dysglycemia-med', title: 'Treat Dysglycemia',
      detail: 'Not overweight — focus on glycemic control to prevent progression.',
      isActive: true,
      medications: ['Metformin 500-2000mg/day', 'Pioglitazone 15-30mg/day', 'Acarbose 25-100mg TDS'],
    });
  }
  recs.push({ category: 'monitoring', title: 'Ongoing Monitoring', detail: 'Recheck HbA1c & FPG q3-6mo. Annual diabetes screening. Monitor CVD risk.', isActive: true });
  return { isPrediabetic, isOverweight, recommendations: recs, goals, pathway: isOverweight ? ('overweight' as const) : ('normal-weight' as const) };
}
