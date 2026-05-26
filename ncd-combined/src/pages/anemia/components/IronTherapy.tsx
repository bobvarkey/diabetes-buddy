import { useState } from 'react';
import { Syringe, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';

const ivComparison = [
  { feature: 'Max Dose Per Sitting',  is: '200–300 mg',              fcm: 'Up to 1000 mg (single dose)' },
  { feature: 'Sessions Required',     is: '3–5+ visits',             fcm: '1–2 sessions' },
  { feature: 'Infusion Time',         is: '15–30 min (small dose)',  fcm: '~15 min for 1000 mg' },
  { feature: 'Hgb Rise',             is: 'Steady, slower increase', fcm: 'More rapid, greater boost' },
  { feature: 'Test Dose Required',    is: 'Yes (higher allergy risk)', fcm: 'No' },
  { feature: 'Common Side Effects',   is: 'Hypotension, injection site reactions', fcm: 'Headache, nausea, transient hypophosphatemia' },
];

const ironCutoffs = [
  {
    condition: 'General Population',
    subtext: 'No inflammation',
    ferritin: '< 15–30 µg/L',
    tsat: '< 20%',
    goal: 'Standard threshold for absolute iron deficiency anemia.',
    severity: 'low',
  },
  {
    condition: 'Restless Legs Syndrome',
    subtext: 'RLS',
    ferritin: '< 75–100 µg/L',
    tsat: '< 45%',
    goal: 'Target ferritin > 100 µg/L to alleviate neurological symptoms.',
    severity: 'medium',
  },
  {
    condition: 'Chronic Heart Failure',
    subtext: 'HF — treat even without anemia',
    ferritin: '< 100 µg/L (or 100–299 µg/L if TSAT low)',
    tsat: '< 20%',
    goal: 'IV iron recommended regardless of anemia status.',
    severity: 'high',
  },
  {
    condition: 'CKD (Non-Dialysis)',
    subtext: 'Chronic Kidney Disease',
    ferritin: '< 100–500 µg/L',
    tsat: '< 30%',
    goal: 'Higher cutoffs used — inflammation impairs normal iron usage.',
    severity: 'high',
  },
  {
    condition: 'CKD on Hemodialysis',
    subtext: 'Dialysis-dependent',
    ferritin: '< 200 µg/L',
    tsat: '< 30%',
    goal: 'Aggressively maintained to support red blood cell production.',
    severity: 'high',
  },
];

const severityColor = {
  low:    'bg-sky-900/20 border-sky-800/50 text-sky-400',
  medium: 'bg-amber-900/20 border-amber-800/50 text-amber-400',
  high:   'bg-rose-900/20 border-rose-800/50 text-rose-400',
};

export default function IronTherapy() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Syringe className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-semibold text-white">IV Iron Replacement Therapy</h2>
          <span className="text-xs bg-rose-900/30 text-rose-400 border border-rose-800 px-2 py-0.5 rounded-full font-medium">
            IS vs FCM
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-7">
          {/* Intro */}
          <p className="text-sm text-gray-400 leading-relaxed">
            Both <strong className="text-gray-200">Iron Sucrose (IS)</strong> and{' '}
            <strong className="text-gray-200">Ferric Carboxymaltose (FCM)</strong> are IV iron therapies used when oral iron
            is poorly tolerated or ineffective. FCM is generally preferred — it allows high-dose administration in a single
            sitting, reducing hospital visits and accelerating recovery.
          </p>

          {/* Head-to-head comparison */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Head-to-Head Comparison
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800 border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Feature</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-amber-400 uppercase tracking-wide">Iron Sucrose (IS)</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-sky-400 uppercase tracking-wide">Ferric Carboxymaltose (FCM)</th>
                  </tr>
                </thead>
                <tbody>
                  {ivComparison.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-gray-800 ${i % 2 === 0 ? '' : 'bg-gray-800/30'}`}>
                      <td className="py-3 px-4 text-xs font-medium text-gray-300">{row.feature}</td>
                      <td className="py-3 px-4 text-xs text-amber-300/80">{row.is}</td>
                      <td className="py-3 px-4 text-xs text-sky-300/80">{row.fcm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-amber-800/40 bg-amber-900/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-amber-400">Iron Sucrose</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Long-standing standard of care. Excellent safety profile with highly controlled, incremental iron
                administration. Preferred for patients needing smaller total doses or high-precision dosing.
              </p>
            </div>
            <div className="rounded-xl border border-sky-800/40 bg-sky-900/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-sky-400">Ferric Carboxymaltose</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Preferred for severe anemia, pregnancy (2nd/3rd trimester), IBD, and heart failure. The carbohydrate
                shell permits rapid high-dose infusion without tissue irritation or severe allergic reactions.
              </p>
            </div>
          </div>

          {/* Iron markers section */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-gray-200">Iron Status Markers & Cutoffs by Condition</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Clinicians rely on two primary markers: <strong className="text-gray-300">Serum Ferritin</strong> (total stored
              iron) and <strong className="text-gray-300">Transferrin Saturation / TSAT</strong> (iron readily available for
              tissue delivery).
            </p>

            <div className="space-y-3">
              {ironCutoffs.map(row => (
                <div
                  key={row.condition}
                  className="rounded-xl border border-gray-800 bg-gray-800/40 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-white">{row.condition}</span>
                        <span className="text-xs text-gray-500">{row.subtext}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{row.goal}</p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <div className={`rounded-lg px-3 py-2 border text-center min-w-[100px] ${severityColor[row.severity as keyof typeof severityColor]}`}>
                        <div className="text-xs font-semibold mb-0.5">Ferritin</div>
                        <div className="text-xs font-mono leading-tight">{row.ferritin}</div>
                      </div>
                      <div className={`rounded-lg px-3 py-2 border text-center min-w-[72px] ${severityColor[row.severity as keyof typeof severityColor]}`}>
                        <div className="text-xs font-semibold mb-0.5">TSAT</div>
                        <div className="text-xs font-mono">{row.tsat}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500">
            References: Camaschella C. NEJM 2015; Cappellini MD et al. Am J Hematol 2020; Ponikowski P et al. ESC HF Guidelines 2021;
            KDIGO CKD Guidelines 2012/2024; Trenkwalder C et al. Lancet Neurol 2018.
          </p>

          {/* Investigating IDA Cause */}
          <div className="rounded-xl border border-amber-800/40 bg-amber-900/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-amber-400">Investigating Cause of Iron Deficiency</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              For unexplained iron deficiency anemia, investigate the underlying cause:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-gray-400">
              <li>• <strong className="text-gray-300">Stool occult blood</strong> x3 — for gastrointestinal bleeding</li>
              <li>• <strong className="text-gray-300">Colonoscopy</strong> — if &gt;50 years or alarm symptoms</li>
              <li>• <strong className="text-gray-300">Stool ova & parasite examination</strong> — hookworm, whipworm (especially in tropical regions, eosinophilia)</li>
              <li>• <strong className="text-gray-300">H. pylori</strong> testing — can cause iron malabsorption</li>
              <li>• <strong className="text-gray-300">Celiac serology</strong> — anti-tTG for celiac disease</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
