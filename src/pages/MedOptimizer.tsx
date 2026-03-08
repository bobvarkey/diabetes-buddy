import { useState, useEffect, useMemo } from "react";
import { PatientData, EXAMPLE_PATIENT, loadPatient } from "@/lib/patient-data";
import { generateMedRecommendations, getHypoProtocol, getLipidTargets, MedRecommendation } from "@/lib/med-logic";
import { Pill, AlertTriangle, Heart, Shield } from "lucide-react";

const MedOptimizer = () => {
  const [patient, setPatient] = useState<PatientData>(EXAMPLE_PATIENT);

  useEffect(() => {
    const saved = loadPatient();
    if (saved) setPatient(saved);
  }, []);

  const meds = useMemo(() => generateMedRecommendations(patient), [patient]);
  const hypo = getHypoProtocol(patient);
  const lipids = getLipidTargets(patient);

  const priorityColor = (p: string) => {
    if (p === "first-line") return "bg-primary/10 text-primary border-primary/20";
    if (p === "adjustment") return "bg-warning/10 text-warning border-warning/20";
    if (p === "add-on") return "bg-info/10 text-info border-info/20";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-5 animate-slide-in">
      <div>
        <h1 className="text-xl font-heading font-bold">Medication Optimizer</h1>
        <p className="text-sm text-muted-foreground">ADA 2026 + LAI lipid guidelines</p>
      </div>

      {/* Patient summary */}
      <div className="clinical-card p-4" style={{ background: "var(--gradient-hero)" }}>
        <div className="text-primary-foreground">
          <p className="text-sm font-medium">{patient.name} · {patient.age}y {patient.gender}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-xs opacity-90">
            <span>BMI {patient.bmi}</span>
            <span>eGFR {patient.eGFR}</span>
            <span>HF NYHA {patient.hfNYHA}</span>
            <span>HbA1c {patient.hba1c}%</span>
            <span>RBS {patient.rbs}</span>
            <span>LDL {patient.ldl}</span>
          </div>
        </div>
      </div>

      {/* Medication cards */}
      <div className="space-y-3">
        {meds.map((med, i) => (
          <div key={i} className={`clinical-card border-l-4 ${
            med.priority === "first-line" ? "border-l-primary" :
            med.priority === "adjustment" ? "border-l-warning" :
            med.priority === "add-on" ? "border-l-info" : "border-l-muted"
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-sm">{med.drug}</h3>
              </div>
              <span className={`stat-badge text-[10px] py-0.5 px-2 border ${priorityColor(med.priority)}`}>
                {med.priority}
              </span>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 mb-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Dose:</span> <strong>{med.dose}</strong></div>
                <div><span className="text-muted-foreground text-xs">Freq:</span> <strong>{med.frequency}</strong></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{med.reason}</p>
            {med.warnings.length > 0 && (
              <div className="space-y-1">
                {med.warnings.map((w, wi) => (
                  <div key={wi} className="flex items-start gap-1.5 text-xs">
                    <AlertTriangle className="w-3 h-3 text-warning mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-2 italic">{med.adaReference}</p>
          </div>
        ))}
      </div>

      {/* Lipid targets */}
      <div className="clinical-card">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-destructive" />
          <h3 className="section-title">LAI Lipid Targets (Post-Stroke)</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Risk: {lipids.riskCategory}</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>LDL-C</span>
              <span className={lipids.ldlCurrent > lipids.ldlTarget ? "text-destructive" : "text-success"}>
                {lipids.ldlCurrent} → Target &lt;{lipids.ldlTarget} mg/dL
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-destructive rounded-full transition-all"
                style={{ width: `${Math.min((lipids.ldlCurrent / 200) * 100, 100)}%` }}
              />
            </div>
            {lipids.ldlGap > 0 && <p className="text-xs text-destructive mt-1">Gap: {lipids.ldlGap} mg/dL to target</p>}
          </div>
        </div>
      </div>

      {/* Hypo protocol */}
      {hypo && (
        <div className="clinical-card border-destructive/20">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-destructive" />
            <h3 className="section-title">Hypoglycemia Protocol</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Trigger: {hypo.trigger}</p>
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-destructive">Immediate Actions</h4>
            {hypo.immediate.map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="bg-destructive/10 text-destructive rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
            <h4 className="text-xs font-medium text-warning mt-3">Follow-up</h4>
            {hypo.followUp.map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="bg-warning/10 text-warning rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedOptimizer;
