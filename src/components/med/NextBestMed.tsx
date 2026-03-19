import { NextBestMed as NextBestMedType } from "@/lib/med-logic";
import { Sparkles, ArrowRight, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";

interface Props {
  nextBest: NextBestMedType;
}

export function NextBestMed({ nextBest }: Props) {
  const { recommendation: rec, reasoning, clinicalBasis, alternatives } = nextBest;

  return (
    <div className="clinical-card border-2 border-primary/30 bg-primary/5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-heading font-bold text-primary">Next Best Medication</h3>
          <p className="text-[10px] text-muted-foreground">AI-powered recommendation based on patient profile</p>
        </div>
      </div>

      {/* The recommendation */}
      <div className="bg-background rounded-lg border p-3 mb-3">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">{rec.drug}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">{rec.reason}</p>
            <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{rec.dose} {rec.frequency}</span>
              <span className="bg-muted px-2 py-0.5 rounded-full">HbA1c ↓ {rec.hba1cReduction}</span>
              {rec.cvBenefit && <span className="bg-success/10 text-success px-2 py-0.5 rounded-full">✓ CV Benefit</span>}
              {rec.weightEffect === "loss" && <span className="bg-success/10 text-success px-2 py-0.5 rounded-full">↓ Weight Loss</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Clinical reasoning */}
      <div className="mb-3">
        <h4 className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1">
          <Lightbulb className="w-3 h-3" /> Clinical Reasoning
        </h4>
        <div className="space-y-1">
          {reasoning.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence basis */}
      <div className="bg-accent/50 rounded-lg p-2.5 mb-3">
        <p className="text-[11px] text-accent-foreground italic">{clinicalBasis}</p>
      </div>

      {/* Warnings */}
      {rec.warnings.length > 0 && (
        <div className="mb-3 space-y-1">
          {rec.warnings.slice(0, 3).map((w, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px]">
              <AlertTriangle className="w-3 h-3 text-warning mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div>
          <h4 className="text-[11px] font-medium text-muted-foreground mb-1">Alternatives if not suitable:</h4>
          <div className="flex flex-wrap gap-1.5">
            {alternatives.map((alt, i) => (
              <span key={i} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full" title={alt.reason}>
                {alt.drug}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
