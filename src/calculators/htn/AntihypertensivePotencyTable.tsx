import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge } from "lucide-react";

type Potency = "Very high" | "High" | "Moderate" | "Moderate to low" | "Low to moderate" | "Low";

interface Row {
  potency: Potency;
  drugClass: string;
  examples: string;
  startingDose: string;
  bestUse: string;
}

const rows: Row[] = [
  {
    potency: "Very high",
    drugClass: "Direct vasodilators",
    examples: "Hydralazine, minoxidil",
    startingDose: "Hydralazine 25 mg BID; minoxidil 2.5 mg daily",
    bestUse: "Resistant hypertension or special situations, usually combined with other agents due to adverse-effect burden.",
  },
  {
    potency: "High",
    drugClass: "Mineralocorticoid receptor antagonists",
    examples: "Spironolactone, eplerenone",
    startingDose: "Spironolactone 25 mg daily; eplerenone 50 mg daily",
    bestUse: "Resistant hypertension, primary aldosteronism, heart failure.",
  },
  {
    potency: "High",
    drugClass: "Thiazide / thiazide-like diuretics",
    examples: "Chlorthalidone, indapamide, hydrochlorothiazide",
    startingDose: "Chlorthalidone 12.5 mg daily; indapamide 1.25 mg daily; HCTZ 12.5–25 mg daily",
    bestUse: "First-line for uncomplicated HTN; thiazide-like agents often favored over HCTZ.",
  },
  {
    potency: "High",
    drugClass: "Dihydropyridine CCBs",
    examples: "Amlodipine, felodipine, nifedipine ER",
    startingDose: "Amlodipine 2.5–5 mg daily; felodipine 2.5–5 mg daily; nifedipine ER 30 mg daily",
    bestUse: "First-line, especially older adults, isolated systolic HTN, and combination regimens.",
  },
  {
    potency: "Moderate",
    drugClass: "ACE inhibitors",
    examples: "Lisinopril, enalapril, ramipril",
    startingDose: "Lisinopril 10 mg daily; enalapril 5 mg daily; ramipril 2.5 mg daily",
    bestUse: "CKD, diabetes with albuminuria, coronary disease, proteinuric states.",
  },
  {
    potency: "Moderate",
    drugClass: "ARBs",
    examples: "Losartan, valsartan, telmisartan",
    startingDose: "Losartan 25–50 mg daily; valsartan 80 mg daily; telmisartan 20 mg daily",
    bestUse: "Similar to ACEi when cough or ACE intolerance is an issue.",
  },
  {
    potency: "Moderate",
    drugClass: "Loop diuretics",
    examples: "Furosemide, torsemide, bumetanide",
    startingDose: "Furosemide 20–40 mg daily; torsemide 5–10 mg daily; bumetanide 0.5–1 mg daily",
    bestUse: "More useful for CKD, edema, heart failure, or volume overload than routine HTN.",
  },
  {
    potency: "Moderate to low",
    drugClass: "Central alpha-2 agonists",
    examples: "Clonidine, methyldopa, guanfacine",
    startingDose: "Clonidine 0.1 mg BID; methyldopa 250 mg BID; guanfacine 0.5–1 mg daily",
    bestUse: "Refractory HTN; methyldopa in pregnancy. Limited by sedation and rebound.",
  },
  {
    potency: "Low to moderate",
    drugClass: "Beta-blockers",
    examples: "Metoprolol, bisoprolol, atenolol, carvedilol, labetalol",
    startingDose: "Metoprolol 50 mg daily/BID; bisoprolol 2.5 mg daily; atenolol 25 mg daily",
    bestUse: "CAD, arrhythmia, post-MI, heart failure, or pregnancy (labetalol) — not uncomplicated HTN alone.",
  },
  {
    potency: "Low",
    drugClass: "Alpha-1 blockers",
    examples: "Doxazosin, terazosin, prazosin",
    startingDose: "Doxazosin 1 mg daily; terazosin 1 mg daily; prazosin 1–2 mg BID",
    bestUse: "Add-on therapy, especially with concomitant BPH.",
  },
];

const potencyBadge: Record<Potency, string> = {
  "Very high": "bg-destructive/15 text-destructive border-destructive/30",
  "High": "bg-primary/15 text-primary border-primary/30",
  "Moderate": "bg-accent/15 text-accent-foreground border-accent/30",
  "Moderate to low": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  "Low to moderate": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  "Low": "bg-muted text-muted-foreground border-border",
};

export default function AntihypertensivePotencyTable() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Gauge className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Antihypertensives by Relative Potency</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Practical clinical ranking of BP-lowering strength with representative drugs and typical
          oral starting doses. Potency is approximate — first-line choice still depends on
          comorbidities and outcome data, not BP-lowering magnitude alone.
        </p>
      </CardHeader>
      <CardContent>
        {/* Desktop / tablet table */}
        <div className="hidden md:block overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="p-3 font-semibold text-foreground">Relative potency</th>
                <th className="p-3 font-semibold text-foreground">Drug class</th>
                <th className="p-3 font-semibold text-foreground">Examples</th>
                <th className="p-3 font-semibold text-foreground">Typical starting dose</th>
                <th className="p-3 font-semibold text-foreground">Best use cases</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={`${r.drugClass}-${i}`}
                  className="border-t hover:bg-muted/20 transition-colors align-top"
                >
                  <td className="p-3">
                    <Badge variant="outline" className={`${potencyBadge[r.potency]} whitespace-nowrap`}>
                      {r.potency}
                    </Badge>
                  </td>
                  <td className="p-3 font-medium text-foreground">{r.drugClass}</td>
                  <td className="p-3 text-foreground">{r.examples}</td>
                  <td className="p-3 text-foreground">{r.startingDose}</td>
                  <td className="p-3 text-muted-foreground">{r.bestUse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {rows.map((r, i) => (
            <div
              key={`${r.drugClass}-m-${i}`}
              className="rounded-lg border p-3 bg-muted/10 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{r.drugClass}</span>
                <Badge variant="outline" className={potencyBadge[r.potency]}>
                  {r.potency}
                </Badge>
              </div>
              <p className="text-xs text-foreground"><span className="font-medium">Examples:</span> {r.examples}</p>
              <p className="text-xs text-foreground"><span className="font-medium">Start:</span> {r.startingDose}</p>
              <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Best use:</span> {r.bestUse}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1 text-[11px] text-muted-foreground italic">
          <p>• Relative potency reflects usual outpatient BP-lowering effect, not outcome superiority or mg-to-mg equivalence across classes.</p>
          <p>• High-potency agents like minoxidil and clonidine are typically reserved due to tolerability and adverse-effect profiles.</p>
        </div>
      </CardContent>
    </Card>
  );
}
