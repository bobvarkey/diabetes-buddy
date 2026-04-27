import { useMemo, useState, useEffect } from "react";
import { loadPatient } from "@/lib/patient-data";
import {
  evaluateSSI,
  SSIInput,
  CareSetting,
  NutritionStatus,
  DiabetesType,
} from "@/lib/sliding-scale-logic";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity, Syringe, Info, ShieldAlert, CheckCircle2 } from "lucide-react";

const sevColor: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-warning/10 text-warning-foreground border-warning/30",
  info: "bg-info/10 text-info border-info/20",
};

const regimenLabel: Record<string, string> = {
  basal_bolus_correction: "Basal-Bolus + Correction",
  basal_plus_correction: "Basal + Correction (no scheduled prandial)",
  correction_only_exception: "Correction-only (exception)",
  iv_insulin_protocol: "IV Insulin Infusion Protocol",
  endocrinology_review: "Endocrinology Review",
};

export default function SlidingScaleInsulin() {
  const patient = loadPatient();

  const [input, setInput] = useState<SSIInput>({
    age_years: patient?.age ?? 60,
    weight_kg: patient?.weightKg ?? 75,
    diabetes_type: "type2",
    a1c_percent: patient?.hba1c,
    pregnant: false,
    care_setting: "ward",
    nutrition_status: "eating_regular",
    npo: false,
    egfr: patient?.eGFR ?? 75,
    dialysis: false,
    liver_failure: false,
    hemodynamic_instability: false,
    on_glucocorticoid: false,
    steroid_dose_pred_eq_mg: 0,
    procedure_planned_within_24h: false,
    basal_ordered: false,
    prandial_ordered: false,
    correction_ordered: true,
    sliding_scale_only: true,
    iv_insulin: false,
    total_daily_dose_units: 0,
    min_glucose: 95,
    max_glucose: 240,
    mean_glucose: 175,
    events_ge_180: 4,
    events_ge_250: 1,
    events_le_80: 0,
    events_le_70: 0,
  });

  const result = useMemo(() => evaluateSSI(input), [input]);

  const update = <K extends keyof SSIInput>(k: K, v: SSIInput[K]) =>
    setInput((s) => ({ ...s, [k]: v }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Syringe className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-heading font-bold">Sliding Scale Insulin — Decision Logic</h1>
          <p className="text-sm text-muted-foreground">
            Inpatient Glycemic Management CDS · ADA hospital glucose targets 140–180 mg/dL
          </p>
        </div>
      </div>

      <Card className="p-5 space-y-4">
        <h2 className="font-heading font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Patient & Encounter
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label>Age (yrs)</Label>
            <Input type="number" value={input.age_years} onChange={(e) => update("age_years", +e.target.value)} />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={input.weight_kg} onChange={(e) => update("weight_kg", +e.target.value)} />
          </div>
          <div>
            <Label>eGFR</Label>
            <Input type="number" value={input.egfr} onChange={(e) => update("egfr", +e.target.value)} />
          </div>
          <div>
            <Label>A1c %</Label>
            <Input type="number" step="0.1" value={input.a1c_percent ?? ""} onChange={(e) => update("a1c_percent", +e.target.value)} />
          </div>
          <div>
            <Label>Diabetes Type</Label>
            <Select value={input.diabetes_type} onValueChange={(v) => update("diabetes_type", v as DiabetesType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="type1">Type 1</SelectItem>
                <SelectItem value="type2">Type 2</SelectItem>
                <SelectItem value="stress_hyperglycemia">Stress hyperglycemia</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Care setting</Label>
            <Select value={input.care_setting} onValueChange={(v) => update("care_setting", v as CareSetting)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ward">Ward</SelectItem>
                <SelectItem value="stepdown">Stepdown</SelectItem>
                <SelectItem value="icu">ICU</SelectItem>
                <SelectItem value="ed">ED</SelectItem>
                <SelectItem value="perioperative">Perioperative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nutrition</Label>
            <Select value={input.nutrition_status} onValueChange={(v) => update("nutrition_status", v as NutritionStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="eating_regular">Eating regular</SelectItem>
                <SelectItem value="eating_poorly">Eating poorly</SelectItem>
                <SelectItem value="clear_liquids">Clear liquids</SelectItem>
                <SelectItem value="enteral_feeds">Enteral feeds</SelectItem>
                <SelectItem value="parenteral_nutrition">TPN</SelectItem>
                <SelectItem value="npo">NPO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Home TDD (units, optional)</Label>
            <Input type="number" value={input.total_daily_dose_units || ""} onChange={(e) => update("total_daily_dose_units", +e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {[
            ["npo", "NPO"],
            ["dialysis", "Dialysis"],
            ["liver_failure", "Liver failure"],
            ["hemodynamic_instability", "Hemodynamic instability"],
            ["on_glucocorticoid", "On glucocorticoid"],
            ["pregnant", "Pregnant"],
            ["procedure_planned_within_24h", "Procedure <24h"],
            ["sliding_scale_only", "Currently SSI-only"],
            ["basal_ordered", "Basal ordered"],
            ["prandial_ordered", "Prandial ordered"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
              <span>{label}</span>
              <Switch
                checked={!!(input as any)[key]}
                onCheckedChange={(v) => update(key as keyof SSIInput, v as any)}
              />
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="font-heading font-semibold">Glucose summary — last 24 h</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div>
            <Label>Min</Label>
            <Input type="number" value={input.min_glucose} onChange={(e) => update("min_glucose", +e.target.value)} />
          </div>
          <div>
            <Label>Max</Label>
            <Input type="number" value={input.max_glucose} onChange={(e) => update("max_glucose", +e.target.value)} />
          </div>
          <div>
            <Label>Mean</Label>
            <Input type="number" value={input.mean_glucose ?? 0} onChange={(e) => update("mean_glucose", +e.target.value)} />
          </div>
          <div>
            <Label>≥180</Label>
            <Input type="number" value={input.events_ge_180} onChange={(e) => update("events_ge_180", +e.target.value)} />
          </div>
          <div>
            <Label>≥250</Label>
            <Input type="number" value={input.events_ge_250} onChange={(e) => update("events_ge_250", +e.target.value)} />
          </div>
          <div>
            <Label>≤70</Label>
            <Input type="number" value={input.events_le_70} onChange={(e) => update("events_le_70", +e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Recommendation */}
      <Card className="p-5 space-y-4 border-primary/30 bg-primary/5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase text-muted-foreground">Recommended regimen</div>
            <div className="text-xl font-heading font-bold text-primary">
              {regimenLabel[result.recommended_regimen]}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">TDD ≈ {result.tdd_estimate_units} U</Badge>
            <Badge variant="secondary">Scale: {result.recommended_scale.toUpperCase()}</Badge>
            {result.basal_units ? <Badge>Basal {result.basal_units} U</Badge> : null}
            {result.prandial_units_per_meal ? <Badge>Prandial {result.prandial_units_per_meal} U/meal</Badge> : null}
          </div>
        </div>
        <ul className="text-sm space-y-1">
          {result.rationale.map((r, i) => (
            <li key={i} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />{r}</li>
          ))}
        </ul>
      </Card>

      {/* Alerts */}
      {result.alerts.length > 0 && (
        <Card className="p-5 space-y-3">
          <h2 className="font-heading font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" /> Decision Alerts
          </h2>
          <div className="space-y-2">
            {result.alerts.map((a, i) => (
              <div key={i} className={`rounded-md border p-3 ${sevColor[a.severity]}`}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{a.code}</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">{a.severity}</Badge>
                </div>
                <div className="text-sm mt-1">{a.message}</div>
                <div className="text-xs mt-1 opacity-80"><strong>Action:</strong> {a.recommended_action}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sliding Scale Table */}
      <Card className="p-5 space-y-3">
        <h2 className="font-heading font-semibold flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" /> Subcutaneous Correction Scale (units rapid-acting)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="text-left p-2 border">BG (mg/dL)</th>
                <th className="p-2 border">Low (sensitive)</th>
                <th className="p-2 border">Medium (usual)</th>
                <th className="p-2 border">High (resistant)</th>
              </tr>
            </thead>
            <tbody>
              {result.scale_table.map((r) => {
                const cols: Array<keyof typeof r> = ["low", "medium", "high"];
                return (
                  <tr key={r.range}>
                    <td className="p-2 border font-medium">{r.range}</td>
                    {cols.map((c) => (
                      <td
                        key={c}
                        className={`p-2 border text-center ${
                          c === result.recommended_scale ? "bg-primary/10 font-bold text-primary" : ""
                        }`}
                      >
                        {r[c]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Highlighted column = scale recommended for this patient. Give before meals & at bedtime (reduce bedtime by ~50%).
          Always pair with scheduled basal insulin in T1DM and most T2DM patients — SSI-alone is discouraged by ADA.
        </p>
      </Card>
    </div>
  );
}
