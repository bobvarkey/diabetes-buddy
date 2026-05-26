import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Beaker, Sparkles } from "lucide-react";
import { assessAnemia, AnemiaInput, severityLabel, causeLabel } from "@/lib/anemia-logic";

export default function Anemia() {
  const [input, setInput] = useState<AnemiaInput>({
    age: 55,
    sex: "F",
    hb: 9.2,
    mcv: 72,
    ferritin: 12,
    tsat: 10,
    b12: 350,
    folate: 8,
    crp: 3,
    eGFR: 75,
    pregnant: false,
    onDialysis: false,
  });

  const update = <K extends keyof AnemiaInput>(k: K, v: AnemiaInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const assessment = useMemo(() => assessAnemia(input), [input]);

  const numField = (label: string, key: keyof AnemiaInput, step = "1") => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        step={step}
        value={(input[key] as number | undefined) ?? ""}
        onChange={(e) =>
          update(
            key,
            (e.target.value === "" ? undefined : Number(e.target.value)) as never
          )
        }
      />
    </div>
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Beaker className="h-7 w-7 text-rose-500" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Anemia — Workup & Prescription</h1>
          <p className="text-sm text-muted-foreground">
            WHO + KDIGO 2012 logic. Classifies severity & morphology, suggests workup and Rx.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patient inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {numField("Age", "age")}
          <div className="space-y-1">
            <Label className="text-xs">Sex</Label>
            <Select value={input.sex} onValueChange={(v) => update("sex", v as "M" | "F")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {numField("Hb (g/dL)", "hb", "0.1")}
          {numField("MCV (fL)", "mcv")}
          {numField("Ferritin (ng/mL)", "ferritin")}
          {numField("TSAT (%)", "tsat")}
          {numField("Vit B12 (pg/mL)", "b12")}
          {numField("Folate (ng/mL)", "folate", "0.1")}
          {numField("Retic (%)", "retic", "0.1")}
          {numField("CRP (mg/L)", "crp", "0.1")}
          {numField("eGFR (mL/min)", "eGFR")}
          <div className="col-span-2 md:col-span-4 flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={!!input.pregnant}
                onCheckedChange={(c) => update("pregnant", Boolean(c))}
              />
              Pregnant
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={!!input.onDialysis}
                onCheckedChange={(c) => update("onDialysis", Boolean(c))}
              />
              On dialysis
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Assessment
            <Badge variant="secondary">{severityLabel(assessment.severity)}</Badge>
            {assessment.morphology !== "unknown" && (
              <Badge variant="outline">{assessment.morphology}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <strong>Hb target:</strong> {assessment.hbTarget}
          </div>

          {assessment.likelyCauses.length > 0 && (
            <div className="text-sm">
              <strong>Likely cause(s):</strong>{" "}
              {assessment.likelyCauses.map(causeLabel).join(" · ")}
            </div>
          )}

          {assessment.workup.length > 0 && (
            <div>
              <div className="font-semibold mb-1">Workup</div>
              <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                {assessment.workup.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          {assessment.prescriptions.length > 0 && (
            <div>
              <div className="font-semibold mb-2">Prescription</div>
              <div className="space-y-3">
                {assessment.prescriptions.map((rx, i) => (
                  <div key={i} className="rounded-md border bg-card p-3 space-y-1">
                    <div className="font-medium text-foreground">{i + 1}. {rx.drug}</div>
                    <div className="text-sm"><strong>Dose:</strong> {rx.dose} — {rx.frequency}</div>
                    <div className="text-sm"><strong>Duration:</strong> {rx.duration}</div>
                    {rx.notes && (
                      <div className="text-xs text-muted-foreground italic">{rx.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {assessment.warnings.length > 0 && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm space-y-1">
              {assessment.warnings.map((w, i) => (
                <div key={i} className="text-destructive">⚠ {w}</div>
              ))}
            </div>
          )}

          <Separator />
          <div className="text-xs text-muted-foreground">
            {assessment.guidelineRefs.join(" · ")}
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={() => {
        const txt = [
          `ANEMIA ASSESSMENT`,
          `Severity: ${severityLabel(assessment.severity)} | Morphology: ${assessment.morphology}`,
          `Hb target: ${assessment.hbTarget}`,
          `Causes: ${assessment.likelyCauses.map(causeLabel).join(", ")}`,
          ``,
          `Workup:`,
          ...assessment.workup.map(w => ` - ${w}`),
          ``,
          `Prescription:`,
          ...assessment.prescriptions.map((rx, i) =>
            `${i + 1}. ${rx.drug} — ${rx.dose} ${rx.frequency} × ${rx.duration}${rx.notes ? ` (${rx.notes})` : ""}`
          ),
          ``,
          `Warnings: ${assessment.warnings.join("; ") || "None"}`,
          `Guidelines: ${assessment.guidelineRefs.join("; ")}`,
        ].join("\n");
        navigator.clipboard.writeText(txt);
      }}>
        Copy assessment
      </Button>
    </div>
  );
}
