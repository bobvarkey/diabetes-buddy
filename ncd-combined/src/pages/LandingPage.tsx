import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Sparkles, Heart, Activity, Syringe, Dna, Scale, Wind, Droplets, Droplet } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* ─── FULL-BLEED HERO ─── */}
      <section className="relative min-h-[85vh] flex items-center">
        {/* Background image with overlays */}
        <div className="absolute inset-0">
          <img
            src="/doctor-monitors.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay — darker at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-[#0a0a0f]" />
          {/* Pink/purple ambient glow */}
          <div className="absolute top-1/3 left-1/4 w-[40vw] h-[40vw] rounded-full bg-pink-500/15 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] rounded-full bg-purple-500/15 blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-10">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold tracking-wider backdrop-blur">
              <Sparkles className="h-3 w-3" />
              CLINICAL DECISION SUPPORT
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center leading-tight mb-4">
            Prevent and treat
            <br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"> non-communicable diseases</span>
          </h1>
          {/* Subtitle */}
          <p className="text-sm text-gray-500 text-center mb-3">
            Global health · WHO data
          </p>
          <p className="text-lg md:text-xl text-gray-400 text-center max-w-2xl mx-auto mb-8 leading-relaxed">
            Evidence-based tools for diabetes, hypertension, lipids, obesity, asthma/COPD, renal and blood diseases
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Button
              onClick={() => navigate('/home')}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-6 text-base rounded-xl shadow-lg shadow-pink-500/25"
            >
              Launch App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto border border-white/20 text-white hover:bg-white/10 px-8 py-6 text-base rounded-xl backdrop-blur"
              onClick={() => navigate('/simple')}
            >
              Quick Start
            </Button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Guidelines", value: "ADA · ESC · KDIGO" },
              { label: "Conditions", value: "5+ NCDs" },
              { label: "Calculators", value: "15+" },
              { label: "Drug Database", value: "200+" },
            ].map((s) => (
              <div key={s.label} className="text-center p-2 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-sm font-semibold text-pink-300">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MODE SELECTION ─── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Choose Your <span className="text-pink-400">Mode</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Progressive complexity — start simple and go deeper as needed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Simple */}
          <Card
            className="bg-white/5 border-white/10 hover:border-green-500/40 cursor-pointer transition-all group hover:shadow-lg hover:shadow-green-500/10"
            onClick={() => navigate('/simple')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors">
                <Activity className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Simple</h3>
              <p className="text-sm text-gray-500 mb-4">
                Quick screening, basic classification, and lifestyle recommendations
              </p>
              <Button variant="ghost" className="text-green-400 group-hover:gap-2 transition-all">
                Enter <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Moderate */}
          <Card
            className="bg-white/5 border-white/10 hover:border-orange-500/40 cursor-pointer transition-all group hover:shadow-lg hover:shadow-orange-500/10"
            onClick={() => navigate('/moderate')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500/20 transition-colors">
                <Heart className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Moderate</h3>
              <p className="text-sm text-gray-500 mb-4">
                Guideline-integrated recommendations with risk stratification
              </p>
              <Button variant="ghost" className="text-orange-400 group-hover:gap-2 transition-all">
                Enter <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Complex */}
          <Card
            className="bg-white/5 border-white/10 hover:border-purple-500/40 cursor-pointer transition-all group hover:shadow-lg hover:shadow-purple-500/10"
            onClick={() => navigate('/home')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Dna className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Complex</h3>
              <p className="text-sm text-gray-500 mb-4">
                Full clinical toolkit — labs, calculators, algorithms, and guidelines
              </p>
              <Button variant="ghost" className="text-purple-400 group-hover:gap-2 transition-all">
                Enter <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── CLINICAL AREAS ─── */}
      <section className="px-6 py-16 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Clinical <span className="text-pink-400">Areas</span>
            </h2>
            <p className="text-gray-500 text-sm">Comprehensive management for major non-communicable diseases</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "Diabetes", icon: Syringe, color: "text-red-400", desc: "Insulin titration, GLP-1 dosing, HbA1c targets" },
              { name: "Hypertension", icon: Heart, color: "text-orange-400", desc: "BP classification, drug selection, emergency protocols" },
              { name: "Lipids", icon: Dna, color: "text-blue-400", desc: "ASCVD risk, LDL targets, statin intensity" },
              { name: "Obesity", icon: Scale, color: "text-violet-400", desc: "BMI calculator, weight loss algorithms, GLP-1" },
              { name: "COPD/Asthma", icon: Wind, color: "text-cyan-400", desc: "GINA/GOLD guidelines, step-up therapy" },
              { name: "Renal", icon: Droplets, color: "text-amber-400", desc: "eGFR-based dosing, CKD management" },
              { name: "Blood Diseases", icon: Droplet, color: "text-rose-400", desc: "Anemia & thrombocytopenia evaluation" },
            ].map((area) => (
              <div
                key={area.name}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors cursor-pointer group"
                onClick={() => navigate('/home')}
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                  <area.icon className={`h-5 w-5 ${area.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{area.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{area.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="px-6 py-8 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
              <Activity className="h-3 w-3 text-pink-400" />
            </div>
            <span className="text-sm font-serif font-semibold">NCD Rx</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Based on ADA 2026 · ESC/ESH 2024 · LAI 2023 · ACC/AHA · KDIGO · GINA/GOLD guidelines
          </p>
          <p className="text-xs text-gray-600">
            For educational and clinical decision support use only. Always consult current guidelines and clinical judgment.
          </p>
        </div>
      </footer>
    </div>
  );
}
