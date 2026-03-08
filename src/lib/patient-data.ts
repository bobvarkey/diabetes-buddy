export interface PatientData {
  name: string;
  age: number;
  gender: "M" | "F";
  heightCm: number;
  weightKg: number;
  bmi: number;
  eGFR: number;
  creatinine: number;
  hfNYHA: 0 | 1 | 2 | 3 | 4;
  postStrokeDysphagia: boolean;
  dysphagiaLevel: "none" | "mild" | "moderate" | "severe";
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
}

export const EXAMPLE_PATIENT: PatientData = {
  name: "Patient K (Kochi)",
  age: 55,
  gender: "M",
  heightCm: 168,
  weightKg: 80.7,
  bmi: 28.6,
  eGFR: 45,
  creatinine: 1.8,
  hfNYHA: 2,
  postStrokeDysphagia: true,
  dysphagiaLevel: "mild",
  ldl: 130,
  fbs: 160,
  rbs: 280,
  hba1c: 8.2,
  serialBG: [280, 245, 210, 195, 180, 165, 155],
  currentMeds: ["Voglibose 0.3mg TDS", "Sitagliptin 100mg OD"],
  hasT2DM: true,
  triglycerides: 220,
  hdl: 38,
  totalCholesterol: 210,
};

export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "text-info" };
  if (bmi < 23) return { label: "Normal", color: "text-success" };
  if (bmi < 25) return { label: "Overweight", color: "text-warning" };
  if (bmi < 30) return { label: "Obese I", color: "text-destructive" };
  return { label: "Obese II+", color: "text-destructive" };
}

export function getDefaultPatient(): PatientData {
  return { ...EXAMPLE_PATIENT };
}

export function savePatient(patient: PatientData) {
  localStorage.setItem("dmo_patient", JSON.stringify(patient));
}

export function loadPatient(): PatientData | null {
  const data = localStorage.getItem("dmo_patient");
  return data ? JSON.parse(data) : null;
}
