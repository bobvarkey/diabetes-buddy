import { storage } from './storage';

export interface PatientData {
  name: string;
  age: number;
  gender: 'M' | 'F';
  heightCm: number;
  weightKg: number;
  bmi: number;
  eGFR: number;
  creatinine: number;
  hfNYHA: 0 | 1 | 2 | 3 | 4;
  postStrokeDysphagia: boolean;
  dysphagiaLevel: 'none' | 'mild' | 'moderate' | 'severe';
  ldl: number;
  fbs: number;
  rbs: number;
  hba1c: number;
  serialBG: number[];
  currentMeds: string[];
  hasT2DM: boolean;
  triglycerides?: number;
  hdl?: number;
  totalCholesterol?: number;
  hasASCVD: boolean;
  hasPostStroke: boolean;
  hasCKD: boolean;
  hasHF: boolean;
  hasHypertension: boolean;
  hasRetinopathy: boolean;
  hasNeuropathy: boolean;
  hasPAD: boolean;
  hasObesity: boolean;
  hasNAFLD: boolean;
  hasOSA: boolean;
}

export const EXAMPLE_PATIENT: PatientData = {
  name: 'Patient K (Kochi)',
  age: 55,
  gender: 'M',
  heightCm: 168,
  weightKg: 80.7,
  bmi: 28.6,
  eGFR: 45,
  creatinine: 1.8,
  hfNYHA: 2,
  postStrokeDysphagia: true,
  dysphagiaLevel: 'mild',
  ldl: 130,
  fbs: 160,
  rbs: 280,
  hba1c: 8.2,
  serialBG: [280, 245, 210, 195, 180, 165, 155],
  currentMeds: ['Voglibose 0.3mg TDS', 'Sitagliptin 100mg OD'],
  hasT2DM: true,
  triglycerides: 220,
  hdl: 38,
  totalCholesterol: 210,
  hasASCVD: true,
  hasPostStroke: true,
  hasCKD: true,
  hasHF: true,
  hasHypertension: true,
  hasRetinopathy: false,
  hasNeuropathy: false,
  hasPAD: false,
  hasObesity: true,
  hasNAFLD: false,
  hasOSA: false,
};

export const BLANK_PATIENT: PatientData = {
  name: '', age: 0, gender: 'M', heightCm: 0, weightKg: 0, bmi: 0,
  eGFR: 0, creatinine: 0, hfNYHA: 0, postStrokeDysphagia: false,
  dysphagiaLevel: 'none', ldl: 0, fbs: 0, rbs: 0, hba1c: 0,
  serialBG: [], currentMeds: [], hasT2DM: true,
  hasASCVD: false, hasPostStroke: false, hasCKD: false, hasHF: false,
  hasHypertension: false, hasRetinopathy: false, hasNeuropathy: false,
  hasPAD: false, hasObesity: false, hasNAFLD: false, hasOSA: false,
};

export function calculateBMI(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

// CKD-EPI 2021 race-free
export function calculateEGFR(creatinine: number, age: number, gender: 'M' | 'F'): number {
  if (!creatinine || creatinine <= 0 || !age || age <= 0) return 0;
  const isFemale = gender === 'F';
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const multiplier = isFemale ? 1.012 : 1.0;
  const scrOverKappa = creatinine / kappa;
  const minTerm = Math.min(scrOverKappa, 1);
  const maxTerm = Math.max(scrOverKappa, 1);
  const eGFR =
    142 *
    Math.pow(minTerm, alpha) *
    Math.pow(maxTerm, -1.2) *
    Math.pow(0.9938, age) *
    multiplier;
  return Math.round(eGFR);
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (!bmi || bmi === 0) return { label: '—', color: '#94a3b8' };
  if (bmi < 18.5) return { label: 'Underweight', color: '#a78bfa' };
  if (bmi < 23) return { label: 'Normal', color: '#34d399' };
  if (bmi < 25) return { label: 'Overweight', color: '#fbbf24' };
  if (bmi < 30) return { label: 'Obese I', color: '#f87171' };
  return { label: 'Obese II+', color: '#f87171' };
}

export function getCKDStage(eGFR: number): string {
  if (eGFR >= 90) return 'Normal (G1)';
  if (eGFR >= 60) return 'Mild (G2)';
  if (eGFR >= 45) return 'Moderate 3a';
  if (eGFR >= 30) return 'Moderate 3b';
  if (eGFR >= 15) return 'Severe (G4)';
  return 'Kidney Failure (G5)';
}

const KEY = 'dmo_patient';

export async function savePatient(patient: PatientData): Promise<void> {
  await storage.setItem(KEY, JSON.stringify(patient));
}

export async function loadPatient(): Promise<PatientData | null> {
  const data = await storage.getItem(KEY);
  if (!data) return null;
  try {
    const saved = JSON.parse(data);
    return { ...EXAMPLE_PATIENT, ...saved };
  } catch {
    return null;
  }
}

export async function clearPatient(): Promise<void> {
  await storage.removeItem(KEY);
}
