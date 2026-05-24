import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Pill, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Badge */}
      <header className="pt-5 pb-3 px-4">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold tracking-wider">
            DIABETES CARE
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pb-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-3 text-center">
            Diabetes Risk <span className="italic text-pink-500">Predictor</span>
          </h1>
          
          <p className="text-gray-400 text-sm mb-6 text-center leading-relaxed">
            An intuitive, clinician-designed tool for diabetes care. Leverage evidence-based protocols to deliver guideline-concordant patient care.
          </p>

          {/* Horizontal Buttons */}
          <div className="flex gap-3 mb-6">
            <Button 
              onClick={() => navigate('/app')}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-5"
            >
              Get Started
            </Button>
            <Button 
              variant="outline"
              className="flex-1 border border-white/30 text-white hover:bg-white/10 py-5"
              onClick={() => navigate('/diabetes')}
            >
              Clinic Tool
            </Button>
          </div>

          {/* Hero Image - Doctor with Monitors */}
          <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-gradient-to-br from-pink-600/40 via-purple-500/30 to-rose-500/40 flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl mb-2">👨‍⚕️</div>
              <p className="text-sm text-gray-300 font-medium">Clinical Decision Support</p>
            </div>
            <div className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full bg-pink-500/30 blur-2xl" />
            <div className="absolute bottom-1/3 right-1/4 w-20 h-20 rounded-full bg-purple-500/30 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Trust Bars */}
      <section className="py-6 border-y border-white/10">
        <div className="max-w-md mx-auto px-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-400">180+</p>
              <p className="text-xs text-gray-500">Medications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">98.4%</p>
              <p className="text-xs text-gray-500">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">ADA 2024</p>
              <p className="text-xs text-gray-500">guidelines</p>
            </div>
          </div>
        </div>
      </section>

      {/* ★ COMPREHENSIVE PRESCRIPTION GENERATOR - TOP FEATURE ★ */}
      <section className="py-6 px-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold mb-4 ml-1">Comprehensive Prescription Generator</h2>
          
          {/* Featured Card - Top of list */}
          <Card 
            className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/40 cursor-pointer hover:from-pink-500/30 hover:to-purple-500/30 transition-all"
            onClick={() => navigate('/summary')}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">Integrated Prescriptions</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Generate comprehensive prescriptions for all four NCDs — Diabetes, Hypertension, Lipids, and Obesity. 
                    Combined or condition-specific Rx with dosage, frequency, duration, and clinical notes.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Diabetes</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded">HTN</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Lipids</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Obesity</span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-pink-400 mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Diagnostic Arsenal */}
      <section className="py-6 px-4 border-t border-white/10">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold mb-4 ml-1">Diagnostic Arsenal</h2>
          
          <div className="grid gap-2.5">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/diabetes')}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Insulin Titration</p>
                  <p className="text-xs text-gray-500">Correction doses & basal rates</p>
                </div>
                <span className="text-gray-500">→</span>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/diabetes')}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">HbA1c Tracker</p>
                  <p className="text-xs text-gray-500">Glycemic trends</p>
                </div>
                <span className="text-gray-500">→</span>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/diabetes')}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">GLP-1 Dosing</p>
                  <p className="text-xs text-gray-500">Semaglutide, tirzepatide</p>
                </div>
                <span className="text-gray-500">→</span>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/db/medications')}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Medication Optimizer</p>
                  <p className="text-xs text-gray-500">Drug selection</p>
                </div>
                <span className="text-gray-500">→</span>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/db/ckd-guideline')}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">CKD Guidelines</p>
                  <p className="text-xs text-gray-500">Renal dose adjustment</p>
                </div>
                <span className="text-gray-500">→</span>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/db/daily-management')}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Clinical Guides</p>
                  <p className="text-xs text-gray-500">References</p>
                </div>
                <span className="text-gray-500">→</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Driven / CTA */}
      <section className="py-6 px-4 border-t border-white/10">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-lg font-bold mb-3">Data-Driven Decision Support</h2>
          <p className="text-gray-400 text-sm mb-5">
            Precision medicine at your fingertips.
          </p>
          
          <div className="grid grid-cols-2 gap-2 text-sm text-left mb-6">
            <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2">
              <span className="text-pink-400">✓</span> LDL-C Targets
            </div>
            <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2">
              <span className="text-pink-400">✓</span> Non-HDL-C
            </div>
            <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2">
              <span className="text-pink-400">✓</span> ApoB
            </div>
            <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2">
              <span className="text-pink-400">✓</span> eGFR
            </div>
          </div>

          <Button 
            onClick={() => navigate('/app')}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-5"
          >
            Start Assessment
          </Button>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="py-5 px-4 text-center border-t border-white/10">
        <p className="text-xs text-gray-600 mb-2">Based on ADA Standards of Care 2024 & AACE Guidelines</p>
        <p className="text-xs text-gray-600">
          For educational and clinical decision support use only. Always consult current guidelines and clinical judgment.
        </p>
      </footer>
    </div>
  );
}