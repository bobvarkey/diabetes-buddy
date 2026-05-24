import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Pill,
  Clock,
  CalendarClock,
  Infinity as InfinityIcon,
  AlertTriangle,
  BookOpen,
  ExternalLink,
} from "lucide-react";

interface Step {
  id: string;
  title: string;
  window: string;
  detail: string;
  icon: React.ReactNode;
  accent: string;
}

const steps: Step[] = [
  {
    id: "load",
    title: "Load / Switch antiplatelet",
    window: "Day 0",
    detail:
      "Stop clopidogrel (treatment failure). Load Ticagrelor 180 mg orally, then 90 mg twice daily. Continue Aspirin 75–100 mg once daily.",
    icon: <Pill className="h-5 w-5" />,
    accent: "bg-destructive/10 text-destructive border-destructive/20",
  },
  {
    id: "dapt",
    title: "Short-course DAPT",
    window: "Day 0 → Day 21–30",
    detail:
      "Aspirin + Ticagrelor 90 mg BID for 21–30 days to cover the highest-risk early recurrence window. Counsel on bleeding and dyspnoea.",
    icon: <Clock className="h-5 w-5" />,
    accent: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "mono-extension",
    title: "Ticagrelor monotherapy extension",
    window: "Day 21–30 → Day 90",
    detail:
      "Drop aspirin at day 21 or 30. Continue Ticagrelor 90 mg BID alone up to Day 90 to cover the subacute recurrence window while reducing bleeding risk.",
    icon: <CalendarClock className="h-5 w-5" />,
    accent: "bg-accent/10 text-accent border-accent/20",
  },
  {
    id: "maintenance",
    title: "Indefinite secondary prevention",
    window: "Day 90 onward",
    detail:
      "Switch to long-term single antiplatelet therapy — typically Aspirin 75–100 mg once daily (clopidogrel avoided given prior failure). Address atherosclerotic risk factors, statin, BP, glycaemia, and lifestyle.",
    icon: <InfinityIcon className="h-5 w-5" />,
    accent: "bg-success/10 text-success border-success/20",
  },
];

interface Reference {
  label: string;
  citation: string;
  url: string;
}

const references: Reference[] = [
  {
    label: "AHA/ASA 2021",
    citation:
      "Kleindorfer DO, Towfighi A, Chaturvedi S, et al. 2021 Guideline for the Prevention of Stroke in Patients With Stroke and Transient Ischemic Attack. Stroke. 2021;52(7):e364–e467.",
    url: "https://www.ahajournals.org/doi/10.1161/STR.0000000000000375",
  },
  {
    label: "THALES trial",
    citation:
      "Johnston SC, Amarenco P, Denison H, et al. Ticagrelor and Aspirin or Aspirin Alone in Acute Ischemic Stroke or TIA. N Engl J Med. 2020;383(3):207–217.",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1916870",
  },
  {
    label: "CHANCE / POINT",
    citation:
      "Wang Y, Wang Y, Zhao X, et al. Clopidogrel with Aspirin in Acute Minor Stroke or TIA (CHANCE). N Engl J Med. 2013;369:11–19. Johnston SC, et al. Clopidogrel and Aspirin in Acute Ischemic Stroke and High-Risk TIA (POINT). N Engl J Med. 2018;379:215–225.",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1800410",
  },
  {
    label: "ESO 2021",
    citation:
      "Dawson J, Merwick Á, Webb A, et al. European Stroke Organisation expedited recommendation for the use of short-term dual antiplatelet therapy early after minor stroke and high-risk TIA. Eur Stroke J. 2021;6(2):CLXXXVII–CXCI.",
    url: "https://journals.sagepub.com/doi/10.1177/23969873211000877",
  },
];

export default function RecurrentStrokeProtocol() {
  return (
    <div className="space-y-6">
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-destructive" />
            <CardTitle className="text-xl md:text-2xl">
              Recurrent Ischemic Stroke on Aspirin + Clopidogrel
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Field summary: switch-and-de-escalate antiplatelet strategy for a patient breaking through
            background aspirin + clopidogrel.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-amber-500/40 bg-amber-500/5 p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-xs text-foreground leading-relaxed">
                <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  Before starting Ticagrelor
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Confirm ischemic (non-haemorrhagic) recurrence on imaging.</li>
                  <li>
                    Avoid in active bleeding, prior intracranial haemorrhage, severe hepatic
                    impairment, or strong CYP3A4 inhibitor/inducer therapy.</li>
                  <li>
                    Counsel on dyspnoea, bradyarrhythmia, and bleeding risk; review concomitant
                    anticoagulant or NSAID use.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li
                key={s.id}
                className={`rounded-lg border p-4 ${s.accent} bg-card`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background font-semibold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5">
                        {s.icon}
                        <span className="font-semibold text-foreground">{s.title}</span>
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                        {s.window}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">References</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {references.map((r) => (
              <li key={r.url} className="rounded-lg border bg-muted/20 p-3">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide mb-1">
                  {r.label}
                </Badge>
                <p className="text-xs text-foreground leading-relaxed">{r.citation}</p>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  Open source
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
            Field-summary guidance for clinician decision support. Final antiplatelet choice and
            duration must be individualised to bleeding risk, stroke mechanism, and local protocol.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
