import { useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
import type { GfrResult } from "@/calculators/htn/GfrCalculator";
import type { DrugSelectionData, Severity } from "@/calculators/htn/DrugInteractionChecker";

interface PrintableReportProps {
  gfrResult: GfrResult | null;
  drugData: DrugSelectionData;
}

export default function PrintableReport({ gfrResult, drugData }: PrintableReportProps) {
  const hasData = gfrResult || drugData.selectedDrugNames.length > 0;

  const handlePrint = () => {
    const printContent = document.getElementById("printable-report");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hypertension Management Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 24px; color: #1a1a2e; line-height: 1.5; }
          .report-header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
          .report-header h1 { font-size: 22px; color: #1e40af; margin-bottom: 4px; }
          .report-header p { font-size: 12px; color: #64748b; }
          .section { margin-bottom: 24px; page-break-inside: avoid; }
          .section-title { font-size: 16px; font-weight: 700; color: #1e40af; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
          .gfr-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
          .gfr-value { font-size: 28px; font-weight: 800; color: #1e40af; }
          .gfr-unit { font-size: 12px; font-weight: 400; color: #64748b; }
          .gfr-stage { text-align: right; }
          .gfr-stage .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
          .stage-ok { background: #dcfce7; color: #166534; }
          .stage-warn { background: #fef9c3; color: #854d0e; }
          .stage-danger { background: #fee2e2; color: #991b1b; }
          .patient-info { display: flex; gap: 24px; margin-top: 8px; font-size: 13px; color: #475569; }
          .med-list { list-style: none; padding: 0; }
          .med-list li { padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; display: flex; align-items: center; gap: 8px; }
          .med-list li::before { content: "●"; color: #2563eb; font-size: 8px; }
          .interaction { border-radius: 6px; padding: 12px; margin-bottom: 10px; border-left: 4px solid; }
          .interaction-critical { background: #fef2f2; border-color: #ef4444; }
          .interaction-major { background: #fff7ed; border-color: #f97316; }
          .interaction-moderate { background: #fefce8; border-color: #eab308; }
          .interaction-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
          .interaction-drugs { font-weight: 600; font-size: 13px; }
          .severity-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 10px; }
          .sev-critical { background: #fee2e2; color: #991b1b; }
          .sev-major { background: #ffedd5; color: #9a3412; }
          .sev-moderate { background: #fef9c3; color: #854d0e; }
          .interaction p { font-size: 12px; color: #475569; margin-top: 4px; }
          .interaction p strong { color: #1a1a2e; }
          .disclaimer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
          .empty-note { color: #94a3b8; font-style: italic; font-size: 13px; }
          @media print { body { padding: 12px; } .section { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  if (!hasData) return null;

  const getStageBadgeClass = (gfr: number) => {
    if (gfr >= 60) return "stage-ok";
    if (gfr >= 30) return "stage-warn";
    return "stage-danger";
  };

  const sevClass: Record<Severity, string> = {
    critical: "interaction-critical",
    major: "interaction-major",
    moderate: "interaction-moderate",
  };

  const sevBadgeClass: Record<Severity, string> = {
    critical: "sev-critical",
    major: "sev-major",
    moderate: "sev-moderate",
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <Card className="border-2 border-primary/20 print:hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Generate Report</CardTitle>
          </div>
          <Button onClick={handlePrint} size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Compiles your GFR result, selected medications, and flagged interactions into a printable summary
        </p>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-1">
          {gfrResult && (
            <p>✓ GFR: <span className="font-medium text-foreground">{gfrResult.gfr} mL/min/1.73m²</span> (Stage {gfrResult.stage})</p>
          )}
          {drugData.selectedDrugNames.length > 0 && (
            <p>✓ Medications: <span className="font-medium text-foreground">{drugData.selectedDrugNames.join(", ")}</span></p>
          )}
          {drugData.interactions.length > 0 && (
            <p>⚠ Interactions: <span className="font-medium text-destructive">{drugData.interactions.length} flagged</span></p>
          )}
          {!gfrResult && drugData.selectedDrugNames.length === 0 && (
            <p className="italic">Calculate GFR or select medications to populate the report</p>
          )}
        </div>
      </CardContent>

      {/* Hidden printable content */}
      <div id="printable-report" className="hidden">
        <div className="report-header">
          <h1>Hypertension Management Report</h1>
          <p>Generated on {dateStr} at {timeStr} • Secondary Hypertension Management Tool</p>
        </div>

        {gfrResult && (
          <div className="section">
            <div className="section-title">Renal Function Assessment</div>
            <div className="gfr-box">
              <div>
                <div className="gfr-value">
                  {gfrResult.gfr} <span className="gfr-unit">mL/min/1.73m²</span>
                </div>
              </div>
              <div className="gfr-stage">
                <span className={`badge ${getStageBadgeClass(gfrResult.gfr)}`}>
                  Stage {gfrResult.stage} — {gfrResult.label}
                </span>
              </div>
            </div>
            <div className="patient-info">
              <span>Age: {gfrResult.age} years</span>
              <span>Sex: {gfrResult.sex === "male" ? "Male" : "Female"}</span>
              <span>Serum Creatinine: {gfrResult.creatinine} mg/dL</span>
              <span>Method: CKD-EPI 2021 (race-free)</span>
            </div>
          </div>
        )}

        {drugData.selectedDrugNames.length > 0 && (
          <div className="section">
            <div className="section-title">Selected Medications ({drugData.selectedDrugNames.length})</div>
            <ul className="med-list">
              {drugData.selectedDrugNames.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          </div>
        )}

        {drugData.interactions.length > 0 && (
          <div className="section">
            <div className="section-title">⚠ Drug Interactions ({drugData.interactions.length} flagged)</div>
            {drugData.interactions.map((r, i) => (
              <div key={i} className={`interaction ${sevClass[r.interaction.severity]}`}>
                <div className="interaction-header">
                  <span className="interaction-drugs">{r.drugA} + {r.drugB}</span>
                  <span className={`severity-badge ${sevBadgeClass[r.interaction.severity]}`}>
                    {r.interaction.severity}
                  </span>
                </div>
                <p>{r.interaction.description}</p>
                <p><strong>Mechanism:</strong> {r.interaction.mechanism}</p>
                <p><strong>Recommendation:</strong> {r.interaction.recommendation}</p>
              </div>
            ))}
          </div>
        )}

        {drugData.interactions.length === 0 && drugData.selectedDrugNames.length >= 2 && (
          <div className="section">
            <div className="section-title">Drug Interactions</div>
            <p className="empty-note">No significant interactions detected between selected medications.</p>
          </div>
        )}

        <div className="disclaimer">
          This report is generated for clinical reference only. Always verify with comprehensive drug interaction databases and exercise clinical judgment.
          Not a substitute for professional medical advice.
        </div>
      </div>
    </Card>
  );
}
