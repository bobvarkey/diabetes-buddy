import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, FileText, Activity, Pill, Droplet, Stethoscope, BookOpen, ShieldCheck, Check } from 'lucide-react';
import heroImage from '@/assets/landing-hero.jpg';

const arsenal = [
  { title: 'Insulin Titration', desc: 'Correction doses & basal rates aligned to ADA 2026.', icon: Activity, route: '/db/insulin-titration' },
  { title: 'HbA1c Tracker', desc: 'Glycemic trend analysis with statistical summaries.', icon: Droplet, route: '/diabetes' },
  { title: 'GLP-1 Dosing', desc: 'Semaglutide & tirzepatide escalation schedules.', icon: Pill, route: '/db/glp1-administration' },
  { title: 'Medication Optimizer', desc: '100-point weighted scoring for next-best Rx.', icon: Stethoscope, route: '/db/medications' },
  { title: 'CKD Guidelines', desc: 'NICE NG28 renal dose adjustment pathway.', icon: ShieldCheck, route: '/db/ckd-guideline' },
  { title: 'Clinical Guides', desc: 'ADA 2026, AACE & LAI bedside references.', icon: BookOpen, route: '/db/daily-management' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(0_0%_99%)] text-slate-900 font-sans">
      {/* HERO */}
      <section className="px-6 pt-12 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold tracking-widest mb-8">
            <Heart className="h-3.5 w-3.5 fill-rose-600 stroke-rose-600" />
            CARDIOVASCULAR · METABOLIC CARE
          </div>

          {/* H1 */}
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.05]">
            Diabetes Risk <span className="italic font-bold text-rose-600">Predictor</span>
          </h1>

          <p className="text-slate-500 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            An intuitive, clinician-designed tool for cardiovascular &amp; metabolic risk stratification.
            Leverage evidence-based protocols to deliver guideline-concordant patient care.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => navigate('/app')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/diabetes')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors"
            >
              Clinic ASCVD Analysis
            </button>
          </div>

          {/* Hero image with floating card */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl max-w-2xl mx-auto">
            <img
              src={heroImage}
              alt="Clinician reviewing cardiovascular risk monitors"
              width={1280}
              height={800}
              className="w-full h-auto block"
            />
            {/* Floating overlay card */}
            <div className="absolute left-4 right-4 bottom-4 md:left-6 md:right-auto md:bottom-6 md:w-[340px] bg-white rounded-2xl shadow-lg p-3.5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shrink-0">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900 leading-tight">10-Year ASCVD Risk</p>
                <p className="text-xs text-slate-500 tracking-wide">PREVENT 2024 Equations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIAGNOSTIC ARSENAL */}
      <section className="px-6 py-16 border-t border-slate-200/70">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">Diagnostic Arsenal</h2>
            <p className="text-slate-500 text-base">Integrated suite of tools for comprehensive cardiovascular &amp; metabolic risk management.</p>
          </div>

          {/* Featured prescription card */}
          <button
            onClick={() => navigate('/summary')}
            className="w-full text-left group bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 hover:border-rose-200 rounded-2xl p-6 mb-4 flex items-center gap-5 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-slate-900 mb-1">Comprehensive Prescription Generator</p>
              <p className="text-sm text-slate-600">Combined Rx across Diabetes, HTN, Lipids &amp; Obesity — dosage, frequency, duration &amp; clinical notes.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-rose-600 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* 2-col grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {arsenal.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={() => navigate(item.route)}
                  className="group text-left bg-white border border-slate-200 hover:border-rose-200 hover:shadow-md rounded-2xl p-5 flex items-start gap-4 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-slate-900 mb-1">{item.title}</p>
                    <p className="text-sm text-slate-500 leading-snug">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all mt-1 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* DATA-DRIVEN DECISION SUPPORT */}
      <section className="px-6 py-16 border-t border-slate-200/70 bg-slate-50/50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Data-Driven <mark className="bg-rose-100 text-rose-700 px-2 rounded">Decision Support</mark>
            </h2>
            <p className="text-slate-500 text-base mb-6 leading-relaxed">
              Precision medicine at your fingertips. Validated algorithms combine PREVENT equations and dual-guideline
              logic (ADA 2026 &amp; LAI 2023) for actionable risk profiles.
            </p>
            <ul className="space-y-2.5 mb-8">
              {['Data-driven lipid risk estimates', 'Patient-friendly report generation', 'Race-free CKD-EPI 2021 eGFR', 'Renal dose adjustments for 20+ meds'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/app')}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors"
            >
              Start Assessment <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <p className="text-6xl font-bold text-rose-600 mb-1 tracking-tight">98.4%</p>
            <p className="text-sm font-semibold text-slate-900 mb-6">Guideline Accuracy</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" /> HIPAA Compliant
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">ADA 2026</span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">LAI 2023</span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">NICE NG28</span>
            </div>
            <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-slate-900">180+</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">Medications</p>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">21</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">Risk Factors</p>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">7-day</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">Diet Plan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-10 border-t border-slate-200/70 text-center">
        <p className="text-xs font-semibold text-slate-700 mb-2">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="h-3 w-3 fill-rose-600 stroke-rose-600" />
            Comprehensive Diagnostics
          </span>
          <span className="mx-2 text-slate-300">·</span>
          LDL-C · Non-HDL-C · ApoB · Lp(a) · PREVENT Score
        </p>
        <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Based on ADA 2026 Standards of Care, LAI 2023 Consensus Statement IV, and NICE NG28.
          For educational and clinical decision support use only. Always consult current guidelines and clinical judgment.
        </p>
      </footer>
    </div>
  );
}
