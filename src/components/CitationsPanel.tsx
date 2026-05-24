import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, ShieldAlert } from "lucide-react";

interface Citation {
  label: string;
  title: string;
  citation: string;
  links: { label: string; url: string }[];
}

const citations: Citation[] = [
  {
    label: "Primary",
    title: "2018 ESC/ESH Guidelines for the Management of Arterial Hypertension",
    citation: "Williams B, Mancia G, Spiering W, et al. Eur Heart J. 2018;39(33):3021–3104. doi:10.1093/eurheartj/ehy339",
    links: [
      { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/30165516/" },
      { label: "Full text (Eur Heart J)", url: "https://academic.oup.com/eurheartj/article/39/33/3021/5079119" },
      { label: "PDF", url: "https://academic.oup.com/eurheartj/article-pdf/39/33/3021/28457525/ehy339.pdf" },
    ],
  },
  {
    label: "Companion",
    title: "2017 ACC/AHA High Blood Pressure Guideline",
    citation: "Whelton PK, Carey RM, Aronow WS, et al. Hypertension. 2018;71(6):1269–1324. doi:10.1161/HYP.0000000000000066",
    links: [
      { label: "Full text (AHA)", url: "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000066" },
    ],
  },
  {
    label: "India",
    title: "Indian Guidelines on Hypertension (IGH-IV) — Association of Physicians of India",
    citation: "Shah SN, Munjal YP, Kamath SA, et al. J Assoc Physicians India. 2019;67(Suppl):7–60.",
    links: [
      { label: "API journal", url: "https://www.japi.org/" },
    ],
  },
  {
    label: "GFR",
    title: "CKD-EPI 2021 Race-Free Equation",
    citation: "Inker LA, Eneanya ND, Coresh J, et al. N Engl J Med. 2021;385(19):1737–1749. doi:10.1056/NEJMoa2102953",
    links: [
      { label: "NEJM", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2102953" },
    ],
  },
];

export default function CitationsPanel() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Sources & Citations</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Primary guideline sources used to build the recommendations in this tool.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {citations.map((c) => (
            <li key={c.title} className="rounded-lg border bg-muted/20 p-3">
              <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                  {c.label}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">{c.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.citation}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {c.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {l.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-lg border-2 border-amber-500/40 bg-amber-500/5 p-3">
          <div className="flex items-center space-x-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              Copyright & Use Disclaimer
            </span>
          </div>
          <ul className="text-xs text-foreground space-y-1.5 list-disc pl-4">
            <li>
              The algorithm flowchart and comorbidity tables in this app are{" "}
              <strong>original visual interpretations</strong> built in-house. They convey the clinical
              method described in the cited guidelines, which are facts/recommendations and not
              copyrightable expression.
            </li>
            <li>
              <strong>No copyrighted figures, tables, or long passages</strong> from the
              ESC/ESH, ACC/AHA, or API guideline documents have been reproduced. Refer to the linked
              publisher sites for the official figures.
            </li>
            <li>
              Drug names, dosing, and renal-adjustment values are summarised from public prescribing
              information (Medscape India and product monographs). Always verify against the current
              local product label before prescribing.
            </li>
            <li>
              This tool is for <strong>clinician decision support and education only</strong>. It does
              not replace individualised clinical judgement or the full guideline text.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
