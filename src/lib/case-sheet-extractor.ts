import { PatientData } from "./patient-data";

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

const EXTRACTION_SYSTEM_PROMPT = `You are a medical data extractor for a diabetes management app.
Extract ALL patient data from the provided case sheet text or image.
Return ONLY a valid JSON object — no markdown, no explanation, no backticks.
Use null for any field not found.

Field definitions with types and units:
- name: string (patient name)
- age: number (years)
- gender: "M" or "F"
- heightCm: number (height in cm)
- weightKg: number (weight in kg)
- creatinine: number (mg/dL)
- fbs: number (fasting blood sugar in mg/dL)
- rbs: number (random blood sugar in mg/dL)
- hba1c: number (% e.g. 7.2)
- ldl: number (mg/dL)
- hdl: number (mg/dL)
- triglycerides: number (mg/dL)
- totalCholesterol: number (mg/dL)
- diabetesType: "type1" or "type2"
- hasT2DM: boolean
- hasASCVD: boolean
- hasCKD: boolean
- hasHF: boolean
- hasPAD: boolean
- hasRetinopathy: boolean
- hasNeuropathy: boolean
- hasNAFLD: boolean
- hasOSA: boolean
- hasHypertension: boolean
- hfNYHA: number (0-4, only if hasHF=true)
- postStrokeDysphagia: boolean
- dysphagiaLevel: "none" or "mild" or "moderate" or "severe"
- currentMeds: string[] (array of medication strings with dose/frequency)

Common abbreviations to recognize:
- BSL/BG/BS = blood sugar
- BP = blood pressure (→ hasHypertension)
- DM/T1DM/T2DM = diabetes mellitus
- CKD = chronic kidney disease
- HbA1c/HBA1C = glycated hemoglobin
- eGFR = estimated glomerular filtration rate
- FBS/FBG = fasting blood glucose
- RBS/PPBS = random/post-prandial blood sugar
- HTN = hypertension
- CAD/MI = cardiovascular disease (→ hasASCVD)
- COPD/Asthma/OSA = relevant conditions
- Retinopathy/Neuropathy = complications

Return ONLY the JSON object, nothing else.`;

export async function extractFromText(text: string): Promise<Partial<PatientData>> {
  if (!text.trim()) {
    throw new Error("Please enter some text to extract");
  }

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === "your_api_key_here") {
    throw new Error("API key not configured. Add VITE_ANTHROPIC_API_KEY to .env.local");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || "{}";

  const jsonStr = content.replace(/```json\n?|\n?```/g, "").trim();
  const extracted = JSON.parse(jsonStr) as Partial<PatientData>;

  return extracted;
}

export async function extractFromImage(
  base64: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
): Promise<Partial<PatientData>> {
  if (!base64) {
    throw new Error("No image data provided");
  }

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === "your_api_key_here") {
    throw new Error("API key not configured. Add VITE_ANTHROPIC_API_KEY to .env.local");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64,
              },
            },
            {
              type: "text",
              text: "Extract all patient data from this case sheet image. Return only a valid JSON object.",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || "{}";

  const jsonStr = content.replace(/```json\n?|\n?```/g, "").trim();
  const extracted = JSON.parse(jsonStr) as Partial<PatientData>;

  return extracted;
}
