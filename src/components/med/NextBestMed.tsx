import { NextBestMed as NextBestMedType } from "@/lib/med-logic";
import { Sparkles, ArrowRight, AlertTriangle, CheckCircle2, Lightbulb, BarChart3, Trophy } from "lucide-react";

interface Props {
  nextBest: NextBestMedType;
}

export function NextBestMed({ nextBest }: Props) {
  const { recommendation: rec, reasoning, clinicalBasis, alternatives, score, scoreBreakdown } = nextBest;

  const scoreColor = score >= 80 ? "text-success" : score >= 60 ? "text-primary" : score >= 40 ? "text-warning" : "text-destructive";
  const scoreBg = score >= 80 ? "bg-success/10" : score >= 60 ? "bg-primary/10" : score >= 40 ? "bg-warning/10" : "bg-destructive/10";

  return (
    <div className="clinical-card border-2 border-primary/30 bg-primary/5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-heading font-bold text-primary">Next Best Medication</h3>
          <p className="text-[10px] text-muted-foreground">Scored algorithm based on patient profile, pathway &amp; evidence</p>
        </div>
        {/* Overall score badge */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${scoreBg}`}>
          <Trophy className={`w-3.5 h-3.5 ${scoreColor}`} />
          <span className={`text-sm font-bold ${scoreColor}`}>{score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
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

      {/* Score breakdown */}
      {scoreBreakdown && scoreBreakdown.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Score Breakdown
          </h4>
          <div className="space-y-1.5">
            {scoreBreakdown.map((item, i) => {
              const pct = Math.round((item.value / item.max) * 100);
              const barColor = pct >= 80 ? "bg-success" : pct >= 50 ? "bg-primary" : pct >= 30 ? "bg-warning" : "bg-destructive";
              return (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className="w-28 text-muted-foreground truncate">{item.factor}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right font-medium">{item.value}/{item.max}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

      {/* Ranked alternatives */}
      {alternatives.length > 0 && (
        <div>
          <h4 className="text-[11px] font-medium text-muted-foreground mb-1.5">Ranked Alternatives:</h4>
          <div className="space-y-1">
            {alternatives.map((alt, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] bg-muted/50 rounded-md px-2 py-1.5">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center font-medium text-muted-foreground shrink-0">
                  {i + 2}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground">{alt.drug}</span>
                  <p className="text-muted-foreground truncate">{alt.reason}</p>
                </div>
                <span className="text-muted-foreground font-medium shrink-0">{alt.score}/100</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
