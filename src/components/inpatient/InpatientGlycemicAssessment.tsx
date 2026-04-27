import { InpatientGlycemicOutput, SlidingScaleEntry } from "@/lib/inpatient-glycemic";
import { AlertTriangle, AlertCircle, CheckCircle2, TrendingUp, Droplet, Clock, Activity } from "lucide-react";
import { useState } from "react";

interface Props {
  assessment: InpatientGlycemicOutput;
  slidingScale?: SlidingScaleEntry[];
}

export function InpatientGlycemicAssessment({ assessment, slidingScale }: Props) {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-950/50 border-red-700/60";
      case "high":
        return "bg-orange-950/50 border-orange-700/60";
      case "warning":
        return "bg-yellow-950/50 border-yellow-700/50";
      default:
        return "bg-blue-950/50 border-blue-700/50";
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-200";
      case "high":
        return "bg-orange-500/20 text-orange-200";
      case "warning":
        return "bg-yellow-500/20 text-yellow-200";
      default:
        return "bg-blue-500/20 text-blue-200";
    }
  };

  const getRegimensColor = (regimen: string) => {
    switch (regimen) {
      case "iv_insulin_protocol":
        return "text-red-300 bg-red-950/30";
      case "basal_bolus_correction":
        return "text-green-300 bg-green-950/30";
      case "basal_plus_correction":
        return "text-blue-300 bg-blue-950/30";
      case "correction_only_exception":
        return "text-yellow-300 bg-yellow-950/30";
      default:
        return "text-gray-300 bg-gray-950/30";
    }
  };

  return (
    <div className="space-y-4 animate-slide-in">
      {/* Status Header */}
      <div className="clinical-card border-2 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Droplet className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-heading font-bold text-primary">Inpatient Glycemic Management</h3>
          <div className="ml-auto">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${assessment.status === "ok" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
              {assessment.status === "ok" ? "Complete Assessment" : "Incomplete Data"}
            </span>
          </div>
        </div>

        {/* Derived Features Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] mb-3">
          <div className={`p-2 rounded border ${assessment.derived_features.persistent_hyperglycemia ? "bg-orange-950/30 border-orange-700/40" : "bg-muted/30 border-border"}`}>
            <span className="font-semibold">Persistent Hyperglycemia</span>
            <p>{assessment.derived_features.persistent_hyperglycemia ? "✓ Yes" : "✗ No"}</p>
          </div>
          <div className={`p-2 rounded border ${assessment.derived_features.severe_hyperglycemia ? "bg-red-950/30 border-red-700/40" : "bg-muted/30 border-border"}`}>
            <span className="font-semibold">Severe Hyperglycemia</span>
            <p>{assessment.derived_features.severe_hyperglycemia ? "✓ Yes" : "✗ No"}</p>
          </div>
          <div className={`p-2 rounded border ${assessment.derived_features.hypoglycemia ? "bg-red-950/30 border-red-700/40" : "bg-muted/30 border-border"}`}>
            <span className="font-semibold">Hypoglycemia</span>
            <p>{assessment.derived_features.hypoglycemia ? "✓ Yes" : "✗ No"}</p>
          </div>
          <div className={`p-2 rounded border ${assessment.derived_features.type1_without_basal ? "bg-red-950/30 border-red-700/40" : "bg-muted/30 border-border"}`}>
            <span className="font-semibold">Type 1 No Basal</span>
            <p>{assessment.derived_features.type1_without_basal ? "⚠️ CRITICAL" : "✓ Safe"}</p>
          </div>
        </div>

        {/* Recommended Regimen */}
        <div className="border-t border-muted-foreground/20 pt-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Recommended Regimen</h4>
          <div className={`p-3 rounded-lg text-sm font-semibold ${getRegimensColor(assessment.recommended_regimen)}`}>
            {assessment.recommended_regimen === "iv_insulin_protocol" && "🏥 IV Insulin Protocol (ICU/Hemodynamically Unstable)"}
            {assessment.recommended_regimen === "basal_bolus_correction" && "💉 Basal-Bolus-Correction (Eating Regular)"}
            {assessment.recommended_regimen === "basal_plus_correction" && "💉 Basal-Plus-Correction (NPO/Poor Intake)"}
            {assessment.recommended_regimen === "correction_only_exception" && "⚠️ Correction-Only Exception (Monitor Daily)"}
            {assessment.recommended_regimen === "endocrinology_review" && "👨‍⚕️ Endocrinology Review Recommended"}
            {assessment.recommended_regimen === "unable_to_determine" && "❓ Unable to Determine (Insufficient Data)"}
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {assessment.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">Clinical Alerts ({assessment.alerts.length})</h3>
          {assessment.alerts.map((alert, i) => (
            <div key={i} className={`border rounded-lg p-3 mb-2 ${getSeverityColor(alert.severity)}`}>
              <button
                onClick={() => setExpandedAlert(expandedAlert === alert.code ? null : alert.code)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-2">
                  {alert.severity === "critical" && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                  {alert.severity === "high" && <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />}
                  {alert.severity === "warning" && <TrendingUp className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />}
                  {alert.severity === "info" && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{alert.code}</span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase ${getSeverityBadgeColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              </button>
              {expandedAlert === alert.code && (
                <div className="mt-2 pt-2 border-t border-current/20 pl-6 text-[10px]">
                  <p className="font-semibold mb-1">Recommended Action:</p>
                  <p className="leading-relaxed">{alert.recommended_action}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recommended Actions */}
      {assessment.recommended_actions.length > 0 && (
        <div className="clinical-card border-l-4 border-l-primary bg-primary/5 p-3">
          <h4 className="text-xs font-medium text-primary mb-2">Recommended Actions</h4>
          <ul className="space-y-1.5">
            {assessment.recommended_actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-[10px]">
                <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                <span className="leading-relaxed pt-0.5">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sliding Scale Table */}
      {slidingScale && slidingScale.length > 0 && (
        <div className="clinical-card border-l-4 border-l-info bg-info/5 p-3">
          <h4 className="text-xs font-medium text-info mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Insulin Sliding Scale
          </h4>
          <div className="overflow-x-auto">
            <table className="text-[9px] w-full">
              <thead>
                <tr className="border-b border-info/30">
                  <th className="text-left py-1 px-2 font-semibold">Glucose Range</th>
                  <th className="text-left py-1 px-2 font-semibold">Bolus Units</th>
                  <th className="text-left py-1 px-2 font-semibold">Duration</th>
                  <th className="text-left py-1 px-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {slidingScale.map((entry, i) => (
                  <tr key={i} className="border-b border-info/20 hover:bg-info/10">
                    <td className="py-1.5 px-2">{entry.glucose_range.min}–{entry.glucose_range.max}</td>
                    <td className="py-1.5 px-2 font-semibold">{entry.units_bolus} U</td>
                    <td className="py-1.5 px-2">{entry.duration_hours}h</td>
                    <td className="py-1.5 px-2 text-info/70">{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monitoring Plan */}
      {assessment.monitoring_plan.length > 0 && (
        <div className="clinical-card border-l-4 border-l-success bg-success/5 p-3">
          <h4 className="text-xs font-medium text-success mb-2 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Monitoring Plan
          </h4>
          <ul className="space-y-1">
            {assessment.monitoring_plan.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[10px]">
                <span className="text-success shrink-0 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reassessment Triggers */}
      {assessment.reassessment_triggers.length > 0 && (
        <div className="clinical-card border-l-4 border-l-warning bg-warning/5 p-3">
          <h4 className="text-xs font-medium text-warning mb-2">Reassessment Triggers</h4>
          <ul className="space-y-1">
            {assessment.reassessment_triggers.map((trigger, i) => (
              <li key={i} className="flex items-start gap-2 text-[10px]">
                <span className="text-warning shrink-0 mt-0.5">→</span>
                <span>{trigger}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Audit Trail */}
      <div className="text-[8px] text-muted-foreground/60 border-t border-muted-foreground/20 pt-2">
        <p className="font-semibold mb-1">Audit Trail:</p>
        <p>Rules fired: {assessment.audit.rules_fired.join(", ") || "None"}</p>
        <p>Confidence: <span className={assessment.audit.confidence === "high" ? "text-success" : assessment.audit.confidence === "moderate" ? "text-warning" : "text-destructive"}>{assessment.audit.confidence}</span></p>
      </div>
    </div>
  );
}
