import { useState } from "react";
import GfrCalculator, { type GfrResult } from "@/calculators/htn/GfrCalculator";
import DrugInteractionChecker, { type DrugSelectionData } from "@/calculators/htn/DrugInteractionChecker";
import PrintableReport from "./PrintableReport";
import CitationsPanel from "./CitationsPanel";
import TreatmentAlgorithm from "./TreatmentAlgorithm";
import HtnAlgorithmFlowchart from "./HtnAlgorithmFlowchart";
import AntihypertensivePotencyTable from "@/calculators/htn/AntihypertensivePotencyTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Wine, 
  Pill, 
  Activity, 
  Zap, 
  Moon,
  TestTube,
  Stethoscope,
  FlaskConical,
  Droplets,
  Syringe,
  Tablets,
  Info,
  AlertTriangle
} from "lucide-react";

interface ChecklistItem {
  id: string;
  condition: string;
  tests: string[];
  icon: React.ReactNode;
  category: 'endocrine' | 'renal' | 'lifestyle' | 'vascular' | 'other';
}

const checklistItems: ChecklistItem[] = [
  {
    id: 'primary-aldosteronism',
    condition: 'Primary Aldosteronism',
    tests: ['Aldosterone/renin ratio', 'Saline suppression test', 'Adrenal CT/MRI'],
    icon: <Droplets className="h-5 w-5" />,
    category: 'endocrine'
  },
  {
    id: 'sleep-apnea',
    condition: 'Obstructive Sleep Apnea',
    tests: ['Sleep study (polysomnography)', 'Epworth sleepiness scale', 'Overnight oximetry'],
    icon: <Moon className="h-5 w-5" />,
    category: 'other'
  },
  {
    id: 'alcohol-use',
    condition: 'Alcohol Use',
    tests: ['Detailed alcohol history', 'AUDIT questionnaire', 'GGT, AST, ALT levels'],
    icon: <Wine className="h-5 w-5" />,
    category: 'lifestyle'
  },
  {
    id: 'nsaid-use',
    condition: 'NSAID Use',
    tests: ['Medication history review', 'OTC medication assessment', 'Drug interaction check'],
    icon: <Pill className="h-5 w-5" />,
    category: 'lifestyle'
  },
  {
    id: 'renovascular-disease',
    condition: 'Renovascular Disease',
    tests: ['Renal ultrasound', 'Serum creatinine', 'BUN', 'Urinalysis'],
    icon: <FlaskConical className="h-5 w-5" />,
    category: 'renal'
  },
  {
    id: 'renal-artery-stenosis',
    condition: 'Renal Artery Stenosis',
    tests: ['Renal artery Doppler', 'CT angiography', 'MR angiography', 'ACE inhibitor test'],
    icon: <Activity className="h-5 w-5" />,
    category: 'vascular'
  },
  {
    id: 'thyroid-disorders',
    condition: 'Thyroid Disorders',
    tests: ['TSH', 'Free T3', 'Free T4', 'Thyroid antibodies'],
    icon: <Zap className="h-5 w-5" />,
    category: 'endocrine'
  },
  {
    id: 'cushings',
    condition: 'Cushing\'s Syndrome',
    tests: ['24-hour urine cortisol', 'Dexamethasone suppression test', 'Late-night salivary cortisol'],
    icon: <TestTube className="h-5 w-5" />,
    category: 'endocrine'
  },
  {
    id: 'pheochromocytoma',
    condition: 'Pheochromocytoma / Paraganglioma',
    tests: [
      'Plasma free metanephrines & normetanephrines (supine ≥30 min, LC-MS/MS preferred)',
      '24-hour urinary fractionated metanephrines & catecholamines (creatinine-corrected)',
      'Avoid confounders 2 weeks before: TCAs, SNRIs, levodopa, sympathomimetics, withdrawal from clonidine/alcohol',
      'If positive: adrenal/abdominal CT or MRI; consider 123I-MIBG or 68Ga-DOTATATE PET for extra-adrenal disease',
      'Genetic testing for SDHx, RET, VHL, NF1 if young, bilateral, multifocal, or family history',
    ],
    icon: <Syringe className="h-5 w-5" />,
    category: 'endocrine'
  },
  {
    id: 'substance-abuse',
    condition: 'Substance Abuse & Polycythemia',
    tests: ['Urine toxicology screen', 'Complete blood count', 'Hematocrit', 'EPO levels'],
    icon: <Stethoscope className="h-5 w-5" />,
    category: 'other'
  }
];

const categoryColors = {
  endocrine: 'bg-primary/10 text-primary border-primary/20',
  renal: 'bg-accent/10 text-accent border-accent/20',
  lifestyle: 'bg-success/10 text-success border-success/20',
  vascular: 'bg-destructive/10 text-destructive border-destructive/20',
  other: 'bg-muted/50 text-muted-foreground border-border'
};

interface RenalDosing {
  gfrRange: string;
  recommendation: string;
}

interface MedicationDose {
  route: 'IV' | 'Oral';
  dosing: string[];
  notes?: string;
}

interface DrugInteraction {
  drug: string;
  severity: 'contraindicated' | 'major' | 'moderate';
  effect: string;
  management: string;
}

interface LactationGuidance {
  status: 'avoid' | 'caution' | 'compatible';
  summary: string;
  details: string[];
}

interface Medication {
  name: string;
  category: string;
  doses: MedicationDose[];
  renalDosing?: RenalDosing[];
  monitoring?: string[];
  redFlags?: string[];
  contraindications?: string[];
  lactation?: LactationGuidance;
  interactions?: DrugInteraction[];
}

const medications: Medication[] = [
  // ARB - Angiotensin Receptor Blockers
  {
    name: 'Losartan (Cozaar)',
    category: 'A - ARB',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 50 mg once daily',
          'Maintenance: 25-100 mg/day',
          'With diuretics/volume depletion: Start with 25 mg'
        ]
      }
    ],
    renalDosing: [
      { gfrRange: '> 30 mL/min', recommendation: 'No dose adjustment required' },
      { gfrRange: '< 30 mL/min', recommendation: 'No dose adjustment required but use with caution; monitor potassium and renal function closely' }
    ]
  },
  {
    name: 'Telmisartan',
    category: 'A - ARB',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 20-40 mg once daily',
          'Usual: 40 mg once daily',
          'Maximum: 80 mg/day'
        ]
      }
    ],
    renalDosing: [
      { gfrRange: 'All GFR levels', recommendation: 'No dose adjustment required (hepatically metabolized); monitor renal function and potassium' }
    ]
  },
  {
    name: 'Olmesartan (Olmesar)',
    category: 'A - ARB',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 20 mg once daily',
          'Maintenance: 20-40 mg once daily',
          'Maximum: 40 mg/day'
        ],
        notes: 'Rare sprue-like enteropathy reported with chronic use.'
      }
    ],
    renalDosing: [
      { gfrRange: '> 20 mL/min', recommendation: 'No initial adjustment; max 20 mg if severe impairment' },
      { gfrRange: '< 20 mL/min', recommendation: 'Use with caution; limited data' }
    ]
  },
  {
    name: 'Valsartan (Diovan)',
    category: 'A - ARB',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 80-160 mg once daily',
          'Maintenance: 80-320 mg once daily',
          'Maximum: 320 mg/day'
        ]
      }
    ],
    renalDosing: [
      { gfrRange: '> 30 mL/min', recommendation: 'Standard dosing' },
      { gfrRange: '< 30 mL/min', recommendation: 'Use with caution; monitor K+ and creatinine' }
    ]
  },
  // ACE Inhibitors
  {
    name: 'Enalapril (Vasotec)',
    category: 'A - ACE Inhibitor',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 2.5-5 mg once daily',
          'Maintenance: 10-40 mg/day in 1-2 divided doses'
        ]
      },
      {
        route: 'IV',
        dosing: [
          '1.25 mg over 5 minutes every 6 hours',
          'May increase up to 5 mg/dose every 6 hours'
        ]
      }
    ],
    renalDosing: [
      { gfrRange: '> 30 mL/min', recommendation: 'No dose adjustment required' },
      { gfrRange: '10-30 mL/min', recommendation: 'Initial dose: 2.5 mg/day; titrate cautiously' },
      { gfrRange: '< 10 mL/min', recommendation: 'Initial dose: 2.5 mg on dialysis days; adjust per response' }
    ]
  },
  {
    name: 'Ramipril',
    category: 'A - ACE Inhibitor',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 2.5 mg once daily',
          'Maintenance: 2.5-20 mg/day in 1-2 divided doses',
          'Maximum: 20 mg/day'
        ]
      }
    ],
    renalDosing: [
      { gfrRange: '> 40 mL/min', recommendation: 'No dose adjustment required' },
      { gfrRange: '< 40 mL/min', recommendation: 'Initial dose: 1.25 mg/day; maximum 5 mg/day' }
    ]
  },
  {
    name: 'Lisinopril (Listril)',
    category: 'A - ACE Inhibitor',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 5-10 mg once daily',
          'Maintenance: 10-40 mg once daily',
          'Maximum: 80 mg/day'
        ]
      }
    ],
    renalDosing: [
      { gfrRange: '> 30 mL/min', recommendation: 'Standard dosing' },
      { gfrRange: '10-30 mL/min', recommendation: 'Initial: 2.5-5 mg once daily' },
      { gfrRange: '< 10 mL/min', recommendation: 'Initial: 2.5 mg once daily; dialyzable' }
    ]
  },
  {
    name: 'Perindopril (Coversyl)',
    category: 'A - ACE Inhibitor',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 4 mg once daily (2 mg in elderly)',
          'Maintenance: 4-8 mg once daily',
          'Maximum: 16 mg/day'
        ],
        notes: 'EUROPA, ASCOT, ADVANCE trial evidence; long half-life allows once-daily dosing.'
      }
    ],
    renalDosing: [
      { gfrRange: '> 60 mL/min', recommendation: 'Standard dosing' },
      { gfrRange: '30-60 mL/min', recommendation: '2 mg once daily' },
      { gfrRange: '< 30 mL/min', recommendation: 'Not recommended; dialyzable' }
    ]
  },
  // Beta-Blockers
  {
    name: 'Atenolol (Tenormin)',
    category: 'B - Beta-blockers',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 25-50 mg once daily',
          'Maintenance: 50-100 mg once daily',
          'Maximum: 100 mg/day (some may require 200 mg)'
        ]
      }
    ],
    renalDosing: [
      { gfrRange: '15-35 mL/min', recommendation: 'Maximum: 50 mg/day' },
      { gfrRange: '< 15 mL/min', recommendation: 'Maximum: 25 mg/day; give after dialysis on dialysis days' }
    ]
  },
  {
    name: 'Metoprolol',
    category: 'B - Beta-blockers',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Immediate release: 100 mg/day in 1-2 divided doses',
          'Extended release: 25-100 mg once daily',
          'Maximum: 400 mg/day'
        ]
      },
      {
        route: 'IV',
        dosing: [
          '5 mg every 2 minutes for 3 doses',
          'Then oral therapy after 15 minutes'
        ]
      }
    ]
  },
  {
    name: 'Labetalol',
    category: 'B - Beta-blockers',
    doses: [
      {
        route: 'IV',
        dosing: [
          '20 mg initially',
          'Then 40-80 mg every 10 min',
          'Maximum: 220 mg'
        ]
      },
      {
        route: 'Oral',
        dosing: [
          'Initial: 100 mg twice daily',
          'Maintenance: 200-400 mg twice daily',
          'Can be added to diuretic regimen'
        ]
      }
    ]
  },
  {
    name: 'Carvedilol',
    category: 'B - Beta-blockers',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 6.25 mg twice daily',
          'Titrate: Increase every 7-14 days',
          'Maximum: 25 mg twice daily (50 mg/day)'
        ]
      }
    ]
  },
  {
    name: 'Bisoprolol (Concor)',
    category: 'B - Beta-blockers (β1-selective)',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 2.5-5 mg once daily',
          'Maintenance: 5-10 mg once daily',
          'Maximum: 20 mg/day'
        ],
        notes: 'Highly β1-selective; first-line BB in HFrEF and CAD.'
      }
    ],
    renalDosing: [
      { gfrRange: '> 40 mL/min', recommendation: 'No dose adjustment' },
      { gfrRange: '< 40 mL/min', recommendation: 'Maximum 10 mg/day; titrate cautiously' }
    ]
  },
  {
    name: 'Nebivolol (Nebicard)',
    category: 'B - Beta-blockers (vasodilatory)',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 5 mg once daily',
          'Maintenance: 5-10 mg once daily',
          'Maximum: 40 mg/day'
        ],
        notes: 'β1-selective with NO-mediated vasodilation; favorable metabolic profile, useful in elderly (SENIORS trial).'
      }
    ],
    renalDosing: [
      { gfrRange: '> 30 mL/min', recommendation: 'Standard dosing' },
      { gfrRange: '< 30 mL/min', recommendation: 'Start 2.5 mg/day; titrate cautiously' }
    ]
  },
  // Calcium Channel Blockers
  {
    name: 'Amlodipine (Norvasc)',
    category: 'C - CCB',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 5 mg once daily',
          'Titrate: Increase by 2.5 mg every 7-14 days',
          'Maintenance: 5-10 mg/day',
          'Maximum: 10 mg/day'
        ]
      }
    ]
  },
  {
    name: 'Nifedipine Extended Release',
    category: 'C - CCB',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 30 mg once daily',
          'Maintenance: 30-60 mg once daily',
          'Maximum: 90 mg/day'
        ]
      }
    ]
  },
  {
    name: 'Cilnidipine (Cilacar)',
    category: 'C - CCB (L+N type)',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 5 mg once daily',
          'Maintenance: 10-20 mg once daily',
          'Maximum: 20 mg/day'
        ],
        notes: 'Dual L- and N-type Ca channel blockade — less reflex tachycardia and less pedal edema vs amlodipine; renoprotective in proteinuria.'
      }
    ]
  },
  {
    name: 'Diltiazem (Dilzem)',
    category: 'C - Non-DHP CCB',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 120-180 mg once daily (SR/CD)',
          'Maintenance: 180-360 mg/day',
          'Maximum: 480 mg/day'
        ],
        notes: 'Useful when rate control needed (AF, angina). Avoid in HFrEF and 2°/3° AV block. Caution with beta-blockers.'
      }
    ]
  },
  // Diuretics
  {
    name: 'Hydrochlorothiazide',
    category: 'D - Thiazide Diuretics',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 12.5-25 mg once daily',
          'Maintenance: 12.5-50 mg once daily',
          'Maximum: 50 mg/day'
        ]
      }
    ],
    renalDosing: [
      { gfrRange: '> 30 mL/min', recommendation: 'Effective; standard dosing' },
      { gfrRange: '< 30 mL/min', recommendation: 'Generally ineffective as monotherapy; may use in combination with loop diuretics for synergy' }
    ]
  },
  {
    name: 'Chlorthalidone',
    category: 'D - Thiazide-like Diuretics',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 12.5-25 mg once daily',
          'Maximum: 50 mg/day',
          'Longer duration of action than HCTZ'
        ]
      }
    ],
    renalDosing: [
      { gfrRange: '> 30 mL/min', recommendation: 'Effective; standard dosing' },
      { gfrRange: '< 30 mL/min', recommendation: 'Reduced efficacy; consider loop diuretics instead' }
    ]
  },
  {
    name: 'Indapamide (Natrilix)',
    category: 'D - Thiazide-like Diuretics',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 1.25-2.5 mg once daily (morning)',
          'SR formulation: 1.5 mg once daily',
          'Maximum: 5 mg/day'
        ],
        notes: 'Preferred thiazide-like agent in elderly (HYVET trial). Less metabolic disturbance than HCTZ.'
      }
    ],
    renalDosing: [
      { gfrRange: '> 30 mL/min', recommendation: 'Standard dosing; remains effective' },
      { gfrRange: '< 30 mL/min', recommendation: 'Avoid; ineffective and risk of electrolyte disturbance' }
    ]
  },
  {
    name: 'Furosemide (Lasix)',
    category: 'D - Loop Diuretics',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 20-40 mg once or twice daily',
          'Titrate: Increase by 20-40 mg every 6-8 hours',
          'Maximum: 600 mg/day'
        ],
        notes: 'Preferred over thiazides in renal failure: Loop diuretics maintain effectiveness even when GFR is significantly reduced, whereas thiazide diuretics lose efficacy in advanced kidney disease'
      },
      {
        route: 'IV',
        dosing: [
          '20-40 mg initially',
          'May increase by 20 mg every 2 hours',
          'Maximum single dose: 200 mg'
        ]
      }
    ],
    renalDosing: [
      { gfrRange: '> 30 mL/min', recommendation: 'Standard dosing; remains effective' },
      { gfrRange: '10-30 mL/min', recommendation: 'Higher doses often required (80-200 mg); remains effective unlike thiazides' },
      { gfrRange: '< 10 mL/min', recommendation: 'May need doses up to 400-600 mg/day; IV route preferred for acute situations' }
    ]
  },
  {
    name: 'Torsemide (Dytor)',
    category: 'D - Loop Diuretics',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 5-10 mg once daily',
          'Maintenance: 10-20 mg once daily',
          'Maximum: 200 mg/day'
        ],
        notes: 'Better oral bioavailability (~80-100%) and longer half-life than furosemide; useful in CHF and CKD.'
      }
    ],
    renalDosing: [
      { gfrRange: '> 30 mL/min', recommendation: 'Standard dosing; remains effective' },
      { gfrRange: '< 30 mL/min', recommendation: 'Higher doses often required; monitor electrolytes and volume' }
    ]
  },
  // Aldosterone Antagonists
  {
    name: 'Spironolactone (Aldactone)',
    category: 'E - Aldosterone Antagonist',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Hypertension: 25-100 mg/day in 1-2 divided doses',
          'Heart failure: Start 25 mg once daily',
          'May increase to 50 mg/day if tolerated'
        ],
        notes: 'Monitor potassium levels; risk of hyperkalemia'
      }
    ],
    renalDosing: [
      { gfrRange: '> 50 mL/min', recommendation: 'Standard dosing; monitor potassium' },
      { gfrRange: '30-50 mL/min', recommendation: 'Start low (12.5-25 mg/day); frequent potassium monitoring essential' },
      { gfrRange: '< 30 mL/min', recommendation: 'Generally contraindicated due to high hyperkalemia risk' }
    ]
  },
  {
    name: 'Eplerenone (Inspra)',
    category: 'E - Aldosterone Antagonist',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 25-50 mg once daily',
          'Maximum: 50 mg twice daily (100 mg/day)',
          'More selective than spironolactone'
        ],
        notes: 'Monitor potassium and renal function'
      }
    ],
    renalDosing: [
      { gfrRange: '> 50 mL/min', recommendation: 'Standard dosing; monitor potassium' },
      { gfrRange: '30-50 mL/min', recommendation: 'Use with caution; start 25 mg every other day; frequent monitoring' },
      { gfrRange: '< 30 mL/min', recommendation: 'Contraindicated' }
    ]
  },
  // Peripheral Alpha Blocker
  {
    name: 'Prazosin (Minipress)',
    category: 'P - Peripheral Alpha Blocker',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 0.5-1 mg 2-3 times daily',
          'Maintenance: 3-15 mg/day in divided doses',
          'Maximum: 20 mg/day'
        ],
        notes: 'First-dose phenomenon - risk of syncope, take at bedtime initially'
      }
    ]
  },
  {
    name: 'Doxazosin (Cardura)',
    category: 'P - Peripheral Alpha Blocker',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 1 mg once daily at bedtime',
          'Titrate: Double dose every 1-2 weeks',
          'Maintenance: 1-16 mg/day',
          'Maximum: 16 mg/day'
        ],
        notes: 'Useful in HTN with BPH. ALLHAT — higher CV events vs chlorthalidone, so generally add-on, not first-line.'
      }
    ]
  },
  {
    name: 'Terazosin (Hytrin)',
    category: 'P - Peripheral Alpha Blocker',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 1 mg at bedtime',
          'Maintenance: 1-5 mg/day',
          'Maximum: 20 mg/day'
        ],
        notes: 'First-dose syncope; titrate cautiously, especially in elderly.'
      }
    ]
  },
  {
    name: 'Clonidine (Arkamin)',
    category: 'C - Central Alpha Agonist',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 0.1 mg twice daily (morning and bedtime)',
          'Titration: Increase by 0.1 mg/day at weekly intervals',
          'Maintenance: 0.2-0.6 mg/day in divided doses',
          'Maximum: 2.4 mg/day'
        ],
        notes: 'Do not stop abruptly - risk of rebound hypertension'
      }
    ],
    renalDosing: [
      { gfrRange: '> 10 mL/min', recommendation: 'No significant adjustment; use with caution' },
      { gfrRange: '< 10 mL/min', recommendation: 'Start with lowest dose; 50-75% of normal dose; drug is partially dialyzable' }
    ]
  },
  {
    name: 'Moxonidine',
    category: 'C - Central Alpha Agonist',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 200 mcg once daily (morning)',
          'After 3 weeks: May increase to 400 mcg/day (single or divided dose)',
          'Maximum: 600 mcg/day in divided doses (after another 3 weeks)',
          'Maximum single dose: 400 mcg'
        ],
        notes: 'Preferred over clonidine - more selective I1 receptor agonist with less sedation, less dry mouth, fewer CNS effects. Primarily targets imidazoline I1 receptors vs clonidine\'s broader alpha-2 adrenergic action. Mainly eliminated by kidneys - adjust dose in renal impairment.'
      }
    ],
    renalDosing: [
      { gfrRange: '> 60 mL/min', recommendation: 'Standard dosing' },
      { gfrRange: '30-60 mL/min', recommendation: 'Max single dose: 200 mcg; max daily dose: 400 mcg' },
      { gfrRange: '< 30 mL/min', recommendation: 'Not recommended' }
    ]
  },
  {
    name: 'Methyldopa (Aldomet)',
    category: 'C - Central Alpha Agonist',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 250 mg 2-3 times daily for first 2 days',
          'Adjust every 2+ days based on response',
          'Maximum: 3,000 mg/day',
          'Can be taken with or without food'
        ],
        notes: 'May cause Lupus (DLE); safe in pregnancy'
      }
    ],
    renalDosing: [
      { gfrRange: '> 50 mL/min', recommendation: 'Normal dosing interval (every 8 hours)' },
      { gfrRange: '10-50 mL/min', recommendation: 'Extend dosing interval to every 8-12 hours' },
      { gfrRange: '< 10 mL/min', recommendation: 'Extend dosing interval to every 12-24 hours' }
    ]
  },
  // Newer / Specialty Agents
  {
    name: 'Sacubitril/Valsartan (Vymada)',
    category: 'N - ARNI (Newer)',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 49/51 mg twice daily (24/26 mg BD if low eGFR, elderly, or low BP)',
          'Double after 2-4 weeks as tolerated',
          'Target: 97/103 mg twice daily',
          'Washout ≥36 hr from any ACE inhibitor before starting'
        ],
        notes: 'Approved for HFrEF; off-label use in resistant HTN. Do NOT combine with ACEi (angioedema risk). Avoid in pregnancy and history of angioedema.'
      }
    ],
    renalDosing: [
      { gfrRange: '> 30 mL/min', recommendation: 'Standard initiation' },
      { gfrRange: '< 30 mL/min', recommendation: 'Start 24/26 mg BD; titrate cautiously; monitor K+ and creatinine' }
    ]
  },
  {
    name: 'Finerenone (Kerendia)',
    category: 'E - Non-steroidal MRA (Newer)',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 10 mg once daily (if eGFR 25-60) or 20 mg once daily (if eGFR ≥ 60)',
          'Target: 20 mg once daily after 4 weeks if K+ ≤ 4.8 and eGFR stable'
        ],
        notes: 'Indicated for CKD with type 2 diabetes; lower hyperkalemia risk than spironolactone. Avoid strong CYP3A4 inhibitors.'
      }
    ],
    renalDosing: [
      { gfrRange: '≥ 60 mL/min', recommendation: 'Start 20 mg once daily' },
      { gfrRange: '25-60 mL/min', recommendation: 'Start 10 mg once daily; titrate to 20 mg if K+ ≤ 4.8' },
      { gfrRange: '< 25 mL/min', recommendation: 'Do not initiate' }
    ]
  },
  {
    name: 'Aliskiren (Rasilez)',
    category: 'N - Direct Renin Inhibitor (Newer)',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 150 mg once daily',
          'Maintenance: 150-300 mg once daily',
          'Maximum: 300 mg/day'
        ],
        notes: 'Do NOT combine with ACEi or ARB in diabetes or CKD (ALTITUDE trial — increased AE). Contraindicated in pregnancy.'
      }
    ],
    renalDosing: [
      { gfrRange: '> 30 mL/min', recommendation: 'No initial adjustment; monitor K+ and creatinine' },
      { gfrRange: '< 30 mL/min', recommendation: 'Use with caution; limited data' }
    ]
  },
  // Direct Vasodilator
  {
    name: 'Minoxidil (Loniten)',
    category: 'V - Direct Vasodilator',
    doses: [
      {
        route: 'Oral',
        dosing: [
          'Initial: 5 mg once daily',
          'Titration: Increase to 10 mg, then 20 mg, then up to 40 mg/day in 1-2 divided doses at intervals of at least 3 days',
          'Maintenance: 10-40 mg/day in 1-2 divided doses',
          'Maximum: 100 mg/day'
        ],
        notes: 'Reserved for severe/resistant hypertension. MUST co-administer with a beta-blocker (to prevent reflex tachycardia) AND a loop diuretic (to prevent fluid retention). Common AE: hypertrichosis, pericardial effusion, marked sodium/water retention.'
      }
    ],
    renalDosing: [
      { gfrRange: '> 50 mL/min', recommendation: 'Standard dosing' },
      { gfrRange: '10-50 mL/min', recommendation: 'Use with caution; smaller doses may be required' },
      { gfrRange: '< 10 mL/min', recommendation: 'Reduce dose; drug is dialyzable - administer after dialysis' }
    ],
    monitoring: [
      'Baseline & serial BP (supine and standing) — onset of action within 30 min, peak 2-3 hr',
      'Heart rate at every visit — watch for reflex tachycardia (ensure beta-blocker on board)',
      'Daily weights and assessment for edema/fluid retention (ensure loop diuretic on board)',
      'Baseline ECG, then repeat at 1-3 months and if symptoms — flat/inverted T waves common',
      'Baseline echocardiogram, then every 6-12 months — screen for pericardial effusion',
      'Serum electrolytes, BUN/creatinine at baseline and periodically',
      'Symptom check: dyspnea, orthopnea, chest pain, new murmur, hirsutism'
    ],
    redFlags: [
      'New or worsening dyspnea, orthopnea, raised JVP, muffled heart sounds, or pleuritic chest pain → suspect pericardial effusion / tamponade — urgent echo, consider stopping drug',
      'Rapid weight gain (>2 kg in 1-3 days) or refractory edema → escalate loop diuretic, reassess',
      'Resting tachycardia, palpitations, angina, or new ischemic ECG changes → reflex sympathetic activation; ensure adequate beta-blockade',
      'Severe hypotension or syncope, especially with concurrent guanethidine — contraindicated combination',
      'Pregnancy (Category C/X) — discontinue; teratogenic potential',
      'Pericarditis, hypersensitivity, or Stevens-Johnson-like rash → discontinue immediately'
    ],
    contraindications: [
      'Pregnancy (US FDA Category C) — teratogenic potential; fetal harm reported',
      'Known hypersensitivity to minoxidil or any component of the formulation',
      'Pheochromocytoma (may stimulate catecholamine release from the tumour)',
      'Acute myocardial infarction or recent MI / unstable angina',
      'Dissecting aortic aneurysm',
      'Pericardial disease — pre-existing pericardial effusion, pericarditis, or cardiac tamponade',
      'Severe pulmonary hypertension secondary to mitral stenosis',
      'Concurrent use with guanethidine (risk of profound orthostatic hypotension)'
    ],
    lactation: {
      status: 'caution',
      summary: 'Avoid if possible; use with caution if no safer alternative exists.',
      details: [
        'Minoxidil is excreted into human breast milk — documented in lactating women on oral therapy.',
        'No adequate infant safety data; theoretical risk of hypotension, tachycardia, and fluid retention in the breastfed infant.',
        'Preferred action: AVOID during breastfeeding; switch to a lactation-compatible antihypertensive (e.g. labetalol, nifedipine, enalapril, methyldopa).',
        'If minoxidil is unavoidable for maternal benefit (severe / refractory HTN): use the LOWEST effective dose, monitor the infant for hypotension, tachycardia, lethargy, and poor feeding, and consider temporarily discontinuing breastfeeding.',
        'Topical 2–5% minoxidil for hair loss is generally considered low-risk during lactation due to minimal systemic absorption — but avoid application to the chest/breast area.'
      ]
    },
    interactions: [
      {
        drug: 'Guanethidine',
        severity: 'contraindicated',
        effect: 'Profound orthostatic hypotension and syncope due to additive sympatholytic effect',
        management: 'Do NOT co-prescribe. Discontinue guanethidine well before initiating minoxidil; if already on minoxidil, do not add guanethidine.'
      },
      {
        drug: 'Other antihypertensives (any class)',
        severity: 'major',
        effect: 'Additive hypotension, especially during initiation and titration',
        management: 'Initiate minoxidil at the lowest dose, titrate slowly, and monitor supine and standing BP at each visit.'
      },
      {
        drug: 'Loop diuretics (furosemide, torsemide)',
        severity: 'major',
        effect: 'Required co-therapy — minoxidil causes marked Na/water retention; without a loop diuretic, severe edema and weight gain occur',
        management: 'Co-prescribe a loop diuretic (e.g. furosemide 40–80 mg/day). Thiazides are usually inadequate.'
      },
      {
        drug: 'Beta-blockers (or non-DHP CCB / centrally-acting agent)',
        severity: 'major',
        effect: 'Required co-therapy — minoxidil causes reflex sympathetic activation, tachycardia, and increased myocardial O2 demand',
        management: 'Co-prescribe a β-blocker (e.g. metoprolol, bisoprolol). If β-blocker is contraindicated, use diltiazem/verapamil or clonidine/methyldopa as an alternative rate-controlling agent.'
      },
      {
        drug: 'NSAIDs',
        severity: 'moderate',
        effect: 'Reduced antihypertensive efficacy; worsened sodium and water retention',
        management: 'Avoid chronic NSAID use; if essential, intensify diuretic therapy and monitor BP, weight, and renal function.'
      },
      {
        drug: 'Estrogens / corticosteroids',
        severity: 'moderate',
        effect: 'Additive sodium and fluid retention; may blunt BP control',
        management: 'Monitor weight and edema; up-titrate loop diuretic if needed.'
      },
      {
        drug: 'PDE5 inhibitors (sildenafil, tadalafil) and nitrates',
        severity: 'major',
        effect: 'Additive vasodilation → severe hypotension',
        management: 'Counsel patients; avoid co-administration of nitrates with PDE5 inhibitors and use vasodilators cautiously.'
      }
    ]
  }
];

export default function SecondaryHypertensionChecklist() {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [gfrResult, setGfrResult] = useState<GfrResult | null>(null);
  const [drugData, setDrugData] = useState<DrugSelectionData>({ selectedDrugNames: [], interactions: [] });

  const handleItemToggle = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
  };

  const progress = (completedItems.size / checklistItems.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Secondary Hypertension Management
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Complete guide for evaluation and treatment of hypertension
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="evaluation" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="evaluation" className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span>Evaluation</span>
            </TabsTrigger>
            <TabsTrigger value="treatment" className="flex items-center space-x-2">
              <Tablets className="h-4 w-4" />
              <span>Treatment</span>
            </TabsTrigger>
          </TabsList>

          {/* Evaluation Tab */}
          <TabsContent value="evaluation" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Secondary Hypertension Workup
              </h2>
              <p className="text-muted-foreground">
                Comprehensive checklist for evaluating secondary causes
              </p>
              
              {/* Progress */}
              <div className="bg-card rounded-xl p-6 shadow-sm border max-w-md mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {completedItems.size} of {checklistItems.length} completed
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {progress.toFixed(0)}% complete
                </p>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="grid gap-4 md:gap-6">
              {checklistItems.map((item) => {
                const isCompleted = completedItems.has(item.id);
                return (
                  <Card 
                    key={item.id} 
                    className={`transition-all duration-300 hover:shadow-lg border-2 ${
                      isCompleted 
                        ? 'border-success bg-success/5 shadow-md' 
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={item.id}
                            checked={isCompleted}
                            onCheckedChange={() => handleItemToggle(item.id)}
                            className="h-5 w-5"
                          />
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${categoryColors[item.category]}`}>
                              {item.icon}
                            </div>
                            <CardTitle className={`text-lg md:text-xl ${
                              isCompleted ? 'line-through text-muted-foreground' : ''
                            }`}>
                              {item.condition}
                            </CardTitle>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`capitalize ${categoryColors[item.category]} border`}
                        >
                          {item.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground mb-3">
                          Required Tests & Evaluations:
                        </p>
                        <ul className="grid gap-2 md:grid-cols-2">
                          {item.tests.map((test, index) => (
                            <li 
                              key={index}
                              className={`flex items-center space-x-2 text-sm p-2 rounded-md transition-colors ${
                                isCompleted 
                                  ? 'bg-success/10 text-success' 
                                  : 'bg-muted/30 text-foreground'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                isCompleted ? 'bg-success' : 'bg-primary'
                              }`} />
                              <span className={isCompleted ? 'line-through' : ''}>
                                {test}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Summary */}
            {completedItems.size === checklistItems.length && (
              <Card className="bg-gradient-to-r from-success/10 to-accent/10 border-success">
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Heart className="h-6 w-6 text-success" />
                    <h3 className="text-xl font-semibold text-success">
                      Workup Complete!
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    All secondary hypertension causes have been evaluated. Review findings and correlate with clinical presentation.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Treatment Tab */}
          <TabsContent value="treatment" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Hypertension Treatment
              </h2>
              <p className="text-muted-foreground">
                ABCDE-PC: Comprehensive medication guide with dosing information
              </p>
            </div>

            {/* Visual Algorithm Flowchart */}
            <HtnAlgorithmFlowchart />

            {/* Treatment Algorithm */}
            <TreatmentAlgorithm />

            {/* Antihypertensives by relative potency */}
            <AntihypertensivePotencyTable />

            {/* GFR Calculator */}
            <GfrCalculator onResultChange={setGfrResult} />

            {/* Drug Interaction Checker */}
            <DrugInteractionChecker onSelectionChange={setDrugData} />

            {/* Printable Report */}
            <PrintableReport gfrResult={gfrResult} drugData={drugData} />

            {/* Sources & Citations */}
            <CitationsPanel />

            {/* Moxonidine vs Clonidine Comparison */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Moxonidine vs Clonidine: Clinical Comparison</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left p-3 font-semibold text-foreground bg-muted/50">Feature</th>
                        <th className="text-left p-3 font-semibold text-primary bg-primary/10">Moxonidine (Preferred)</th>
                        <th className="text-left p-3 font-semibold text-foreground bg-muted/30">Clonidine</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-muted-foreground">Mechanism</td>
                        <td className="p-3 text-sm">
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <span>Selective imidazoline I1 receptor agonist in rostral ventrolateral medulla</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                            <span>Non-selective: Both imidazoline receptors AND alpha-2 adrenergic receptors</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-border bg-muted/20">
                        <td className="p-3 font-medium text-muted-foreground">Side Effects</td>
                        <td className="p-3 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-success">✓</span>
                              <span>Less sedation</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-success">✓</span>
                              <span>Less dry mouth</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-success">✓</span>
                              <span>Fewer CNS effects</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-destructive">⚠</span>
                              <span>More sedation</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-destructive">⚠</span>
                              <span>More dry mouth</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-destructive">⚠</span>
                              <span>More CNS effects</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-destructive">⚠</span>
                              <span>Rebound hypertension risk</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-muted-foreground">Indications</td>
                        <td className="p-3 text-sm">
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <span>Primarily hypertension management</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-start space-x-2">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                              <span>Hypertension</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                              <span>ADHD management</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                              <span>Opioid withdrawal</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                              <span>Certain pain conditions</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-muted/20">
                        <td className="p-3 font-medium text-muted-foreground">Clinical Preference</td>
                        <td className="p-3 text-sm">
                          <Badge className="bg-success/20 text-success border-success">
                            Preferred for hypertension
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">
                          <Badge variant="secondary" className="text-muted-foreground">
                            Use with caution
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Diuretic Comparison Table */}
            <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-muted/10">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Diuretic Comparison: Loop vs Thiazide vs Potassium-Sparing</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left p-3 font-semibold text-foreground bg-muted/50">Feature</th>
                        <th className="text-left p-3 font-semibold text-primary bg-primary/10">Loop Diuretics</th>
                        <th className="text-left p-3 font-semibold text-foreground bg-muted/30">Thiazide / Thiazide-like</th>
                        <th className="text-left p-3 font-semibold text-accent-foreground bg-accent/10">Potassium-Sparing</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-muted-foreground">Examples</td>
                        <td className="p-3">Furosemide, Torsemide, Bumetanide</td>
                        <td className="p-3">Hydrochlorothiazide, Chlorthalidone, Indapamide</td>
                        <td className="p-3">Spironolactone, Eplerenone, Amiloride</td>
                      </tr>
                      <tr className="border-b border-border bg-muted/20">
                        <td className="p-3 font-medium text-muted-foreground">Site of Action</td>
                        <td className="p-3">Thick ascending limb of Loop of Henle (Na⁺/K⁺/2Cl⁻ cotransporter)</td>
                        <td className="p-3">Distal convoluted tubule (Na⁺/Cl⁻ cotransporter)</td>
                        <td className="p-3">Collecting duct — Aldosterone receptor (spironolactone/eplerenone) or ENaC channel (amiloride)</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-muted-foreground">Potency</td>
                        <td className="p-3">
                          <Badge className="bg-destructive/20 text-destructive border-destructive/30">High (15-25% Na⁺ reabsorption)</Badge>
                        </td>
                        <td className="p-3">
                          <Badge className="bg-primary/20 text-primary border-primary/30">Moderate (5-8% Na⁺)</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary">Mild (1-3% Na⁺)</Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-border bg-muted/20">
                        <td className="p-3 font-medium text-muted-foreground">Indications</td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Heart failure (acute & chronic)</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Pulmonary edema</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Renal failure (GFR &lt; 30)</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Nephrotic syndrome</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Acute hypercalcemia</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Resistant hypertension</span></div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>First-line hypertension</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Calcium nephrolithiasis</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Osteoporosis (Ca²⁺ retention)</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Nephrogenic diabetes insipidus</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Isolated systolic HTN in elderly</span></div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Primary aldosteronism (Conn's)</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Heart failure (mortality benefit)</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Resistant hypertension (add-on)</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Hepatic ascites</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-success mt-0.5">✓</span><span>Hypokalemia prevention</span></div>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-muted-foreground">Contraindications</td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>Hypovolemia / dehydration</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>Severe hyponatremia / hypokalemia</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>Hepatic encephalopathy (relative)</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>Sulfa allergy (furosemide — low cross-reactivity)</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>Anuria (no response expected)</span></div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>GFR &lt; 30 mL/min (ineffective alone)</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>Severe hyponatremia</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>Symptomatic hyperuricemia / gout</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>Hypercalcemia</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>Sulfa allergy (HCTZ)</span></div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>GFR &lt; 30 mL/min (hyperkalemia risk)</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>Serum K⁺ &gt; 5.0 mEq/L</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>Concurrent ACEi/ARB + K⁺ supplements (caution)</span></div>
                            <div className="flex items-start space-x-1.5"><span className="text-destructive mt-0.5">✗</span><span>Addison's disease</span></div>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-border bg-muted/20">
                        <td className="p-3 font-medium text-muted-foreground">Key Electrolyte Effects</td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5"><span className="text-destructive">↓</span><span>K⁺, Na⁺, Mg²⁺, Ca²⁺</span></div>
                            <div className="flex items-center space-x-1.5"><span className="text-primary">↑</span><span>Uric acid, glucose (mild)</span></div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5"><span className="text-destructive">↓</span><span>K⁺, Na⁺, Mg²⁺</span></div>
                            <div className="flex items-center space-x-1.5"><span className="text-primary">↑</span><span>Ca²⁺, uric acid, glucose, LDL</span></div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5"><span className="text-primary">↑</span><span>K⁺ (hyperkalemia risk)</span></div>
                            <div className="flex items-center space-x-1.5"><span className="text-destructive">↓</span><span>Na⁺ (mild)</span></div>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 font-medium text-muted-foreground">Renal Function</td>
                        <td className="p-3">
                          <Badge className="bg-success/20 text-success border-success/30">Effective even at GFR &lt; 15</Badge>
                        </td>
                        <td className="p-3">
                          <Badge className="bg-destructive/20 text-destructive border-destructive/30">Ineffective at GFR &lt; 30</Badge>
                        </td>
                        <td className="p-3">
                          <Badge className="bg-destructive/20 text-destructive border-destructive/30">Avoid at GFR &lt; 30 (↑K⁺ risk)</Badge>
                        </td>
                      </tr>
                      <tr className="bg-muted/20">
                        <td className="p-3 font-medium text-muted-foreground">Clinical Pearl</td>
                        <td className="p-3 text-xs italic text-muted-foreground">Preferred in acute decompensated HF and renal impairment. Can combine with thiazides for diuretic resistance ("sequential nephron blockade").</td>
                        <td className="p-3 text-xs italic text-muted-foreground">Chlorthalidone preferred over HCTZ — longer half-life, stronger BP reduction. Best first-line for uncomplicated HTN with normal renal function.</td>
                        <td className="p-3 text-xs italic text-muted-foreground">Spironolactone has mortality benefit in HFrEF (RALES trial). Eplerenone preferred when anti-androgenic side effects (gynecomastia) are a concern.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:gap-5">
              {medications.map((medication, index) => (
                <Card key={index} className="border-2 hover:border-primary/30 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                          <Pill className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg md:text-xl">
                            {medication.name}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {medication.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {medication.doses.map((dose, doseIndex) => (
                        <div key={doseIndex} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {dose.route === 'IV' ? (
                              <Syringe className="h-4 w-4 text-destructive" />
                            ) : (
                              <Tablets className="h-4 w-4 text-primary" />
                            )}
                            <span className={`text-sm font-semibold ${
                              dose.route === 'IV' ? 'text-destructive' : 'text-primary'
                            }`}>
                              {dose.route} Administration
                            </span>
                          </div>
                          <ul className="ml-6 space-y-1.5">
                            {dose.dosing.map((dosingInfo, dosingIndex) => (
                              <li 
                                key={dosingIndex}
                                className="flex items-start space-x-2 text-sm"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                <span className="text-foreground">{dosingInfo}</span>
                              </li>
                            ))}
                          </ul>
                          {dose.notes && (
                            <div className="ml-6 mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                              <p className="text-xs text-destructive font-medium">
                                ⚠️ Note: {dose.notes}
                              </p>
                            </div>
                      )}
                      {medication.monitoring && medication.monitoring.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-center space-x-2 mb-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Required Monitoring</span>
                          </div>
                          <ul className="space-y-1.5">
                            {medication.monitoring.map((m, mIndex) => (
                              <li key={mIndex} className="flex items-start space-x-2 text-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                <span className="text-foreground">{m}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {medication.redFlags && medication.redFlags.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-sm font-semibold text-destructive">Red-Flag Side Effects — Stop / Escalate</span>
                          </div>
                          <ul className="space-y-1.5">
                            {medication.redFlags.map((rf, rfIndex) => (
                              <li key={rfIndex} className="flex items-start space-x-2 text-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                                <span className="text-foreground">{rf}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {medication.contraindications && medication.contraindications.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-destructive/5 border-2 border-destructive/40">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-sm font-semibold text-destructive">Contraindications — Do NOT Use</span>
                          </div>
                          <ul className="space-y-1.5">
                            {medication.contraindications.map((ci, ciIndex) => (
                              <li key={ciIndex} className="flex items-start space-x-2 text-xs">
                                <span className="text-destructive font-bold mt-0.5 flex-shrink-0">✕</span>
                                <span className="text-foreground">{ci}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {medication.lactation && (
                        <div className={`mt-4 p-3 rounded-lg border-2 ${
                          medication.lactation.status === 'avoid'
                            ? 'border-destructive/40 bg-destructive/5'
                            : medication.lactation.status === 'caution'
                            ? 'border-amber-500/40 bg-amber-500/5'
                            : 'border-success/40 bg-success/5'
                        }`}>
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className={`h-4 w-4 ${
                                medication.lactation.status === 'avoid' ? 'text-destructive'
                                : medication.lactation.status === 'caution' ? 'text-amber-600 dark:text-amber-400'
                                : 'text-success'
                              }`} />
                              <span className="text-sm font-semibold text-foreground">
                                Breastfeeding / Lactation
                              </span>
                            </div>
                            <Badge variant="outline" className={`text-[10px] uppercase tracking-wide ${
                              medication.lactation.status === 'avoid'
                                ? 'border-destructive/40 text-destructive'
                                : medication.lactation.status === 'caution'
                                ? 'border-amber-500/40 text-amber-700 dark:text-amber-400'
                                : 'border-success/40 text-success'
                            }`}>
                              {medication.lactation.status === 'avoid' ? 'Avoid'
                                : medication.lactation.status === 'caution' ? 'Use with caution'
                                : 'Compatible'}
                            </Badge>
                          </div>
                          <p className="text-xs font-medium text-foreground mb-2">
                            {medication.lactation.summary}
                          </p>
                          <ul className="space-y-1.5">
                            {medication.lactation.details.map((d, di) => (
                              <li key={di} className="flex items-start space-x-2 text-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
                                <span className="text-foreground">{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {medication.interactions && medication.interactions.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-foreground" />
                            <span className="text-sm font-semibold text-foreground">Drug Interactions</span>
                          </div>
                          <ul className="space-y-2">
                            {medication.interactions.map((it, idx) => {
                              const sevClass = it.severity === 'contraindicated'
                                ? 'border-destructive/50 text-destructive bg-destructive/10'
                                : it.severity === 'major'
                                ? 'border-amber-500/50 text-amber-700 dark:text-amber-400 bg-amber-500/10'
                                : 'border-primary/40 text-primary bg-primary/10';
                              return (
                                <li key={idx} className="rounded-md border bg-background/60 p-2">
                                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                                    <span className="text-xs font-semibold text-foreground">{it.drug}</span>
                                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wide ${sevClass}`}>
                                      {it.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-foreground"><strong>Effect:</strong> {it.effect}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5"><strong>Manage:</strong> {it.management}</p>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                        </div>
                      ))}
                      {medication.renalDosing && medication.renalDosing.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-accent-foreground" />
                            <span className="text-sm font-semibold text-accent-foreground">GFR-Based Renal Dosing</span>
                          </div>
                          <div className="space-y-1.5">
                            {medication.renalDosing.map((rd, rdIndex) => (
                              <div key={rdIndex} className="flex items-start space-x-2 text-xs">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono whitespace-nowrap flex-shrink-0 mt-0.5">
                                  {rd.gfrRange}
                                </Badge>
                                <span className="text-foreground">{rd.recommendation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}