import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Material Symbol Icon component
function Icon({ name, filled = false }: { name: string; filled?: boolean }) {
  return (
    <span 
      className="material-symbols-outlined" 
      style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
    >
      {name}
    </span>
  );
}

// Floating gradient orbs
function MeshGradientBg({ children }: { children: React.ReactNode }) {
  return (
    <div className="mesh-gradient-bg">
      {children}
      <style>{`
        .mesh-gradient-bg {
          background-color: #fbf8ff;
          background-image: 
            radial-gradient(at 0% 0%, hsla(336, 100%, 96%, 1) 0, transparent 50%), 
            radial-gradient(at 100% 100%, hsla(253, 64%, 94%, 1) 0, transparent 50%);
        }
      `}</style>
    </div>
  );
}

// Glass Card wrapper
function GlassCard({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`glass-card ${hover ? 'group hover:shadow-xl transition-all' : ''} ${className}`}>
      {children}
    </div>
  );
}

// Navigation
function Navbar() {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white/80 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 border-b border-glass-stroke shadow-sm h-20">
      <nav className="flex justify-between items-center w-full px-12 h-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#b80049] to-[#5f3add] flex items-center justify-center shadow-lg shadow-[#b80049]/20">
            <Icon name="favorite" />
          </div>
          <span className="text-xl font-bold text-[#191a2a]" style={{ fontFamily: 'Space Grotesk' }}>NCD Toolkit</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#5b3f43]">
          <a className="text-[#b80049] border-b-2 border-[#b80049] relative" href="#features">Features</a>
          <a className="hover:text-[#b80049] transition-colors" href="#methodology">Methodology</a>
          <a className="hover:text-[#b80049] transition-colors" href="#pricing">Pricing</a>
        </div>

        <button 
          onClick={() => navigate("/simple")}
          className="bg-[#b80049] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-[#b80049]/20 primary-btn-hover transition-all active:scale-95"
        >
          Get Started
        </button>
      </nav>
    </header>
  );
}

// Hero Section
function Hero() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-12 py-24 flex flex-col md:flex-row items-center gap-8 relative">
      {/* Left Content */}
      <div className={`w-full md:w-1/2 space-y-8 z-10 transition-all duration-700 ${loaded ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff1f5] text-[#b80049] font-semibold text-sm border border-[#b80049]/10">
          <Icon name="favorite" filled />
          CARDIOVASCULAR RISK
        </div>
        
        <h1 className="text-5xl font-bold leading-tight text-[#191a2a]" style={{ fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}>
          NCD Clinical
          <br />
          <span className="text-[#b80049] italic">Decision Support</span>
        </h1>
        
        <p className="text-lg text-[#4b5563] max-w-lg leading-relaxed">
          An intuitive, clinician-designed toolkit for diabetes, hypertension, dyslipidemia, and obesity management. Leverage evidence-based protocols to deliver guideline-concordant patient care.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            onClick={() => navigate("/simple")}
            className="bg-[#b80049] text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold text-sm shadow-lg shadow-[#b80049]/20 primary-btn-hover group"
          >
            Get Started
            <Icon name="arrow_forward" />
          </button>
          <button 
            onClick={() => navigate("/home")}
            className="bg-white text-[#191a2a] border-2 border-[#e2e0f7] px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold text-sm hover:border-[#b80049] hover:bg-[#fff1f5] transition-colors"
          >
            Full Suite
            <Icon name="analytics" />
          </button>
        </div>
      </div>

      {/* Right - Dashboard Preview */}
      <div className={`w-full md:w-1/2 relative transition-all duration-700 delay-300 ${loaded ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-[#eeecff] to-[#f5f2ff] p-8 aspect-[4/3] flex flex-col items-center justify-center">
            {/* Fake Dashboard UI */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {/* Card 1 */}
              <div className="bg-white/60 backdrop-blur p-4 rounded-xl border border-white/40">
                <Icon name="favorite" className="text-[#b80049] mb-2" />
                <div className="text-xs text-[#5b3f43]">Diabetes</div>
                <div className="text-lg font-bold text-[#191a2a]">HbA1c: 7.2%</div>
              </div>
              {/* Card 2 */}
              <div className="bg-white/60 backdrop-blur p-4 rounded-xl border border-white/40">
                <Icon name="monitoring" className="text-[#5f3add] mb-2" />
                <div className="text-xs text-[#5b3f43]">Hypertension</div>
                <div className="text-lg font-bold text-[#191a2a]">Stage 1</div>
              </div>
              {/* Card 3 */}
              <div className="bg-white/60 backdrop-blur p-4 rounded-xl border border-white/40">
                <Icon name="science" className="text-[#00694d] mb-2" />
                <div className="text-xs text-[#5b3f43]">Lipids</div>
                <div className="text-lg font-bold text-[#191a2a]">LDL: 98</div>
              </div>
              {/* Card 4 */}
              <div className="bg-white/60 backdrop-blur p-4 rounded-xl border border-white/40">
                <Icon name="scale" className="text-[#4b5563] mb-2" />
                <div className="text-xs text-[#5b3f43]">Obesity</div>
                <div className="text-lg font-bold text-[#191a2a]">BMI: 27.4</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Micro-Metric */}
        <div className="absolute -bottom-6 -left-6 glass-card p-5 flex items-center gap-4 animate-bounce-subtle">
          <div className="w-12 h-12 rounded-full bg-[#fff1f5] flex items-center justify-center text-[#b80049]">
            <Icon name="monitoring" />
          </div>
          <div>
            <div className="text-xs text-[#4b5563]">Active Mode</div>
            <div className="text-lg font-bold text-[#b80049]">Simple</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features / Bento Grid Section
function Features() {
  const features = [
    { icon: "favorite", title: "Diabetes Management", items: ["FBG tracking", "HbA1c calculation", "Insulin titration"] },
    { icon: "monitoring", title: "Blood Pressure", items: ["JNC staging", "ESC/ESH 2024", "Drug combinations"] },
    { icon: "science", title: "Lipid Profiles", items: ["ASCVD risk score", "LAI 2023 classification", "Statin mapping"] },
    { icon: "scale", title: "Obesity Metrics", items: ["BMI categories", "Waist risk", "GLP-1 eligibility"] },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-12 py-20">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-[#fff1f5] text-[#b80049] border border-[#b80049]/10">
          Features
        </span>
        <h2 className="text-3xl font-bold text-[#191a2a] mt-6" style={{ fontFamily: 'Space Grotesk' }}>
          Precision Risk Assessment
        </h2>
        <p className="text-[#4b5563] max-w-2xl mx-auto mt-4">
          Real-time data visualization based on the latest ADA, ESC/ESH, and ACC/AHA guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Glass Card - spans 2 */}
        <GlassCard className="p-8 md:col-span-2">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-[#e2e0f7]" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="10"></circle>
                <circle className="text-[#b80049]" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="110" strokeWidth="10" style={{ transition: 'stroke-dashoffset 1s ease-out' }}></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#b80049]" style={{ fontFamily: 'Space Grotesk' }}>7.5%</span>
                <span className="text-xs text-[#4b5563]">ASCVD Risk</span>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-bold text-[#191a2a]" style={{ fontFamily: 'Space Grotesk' }}>Interactive Risk Calculator</h3>
              <p className="text-[#4b5563]">Based on LDL-C, age, BP, and systemic factors. Real-time 10-year risk estimation.</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-[#b80049]/10 text-[#b80049] rounded-full text-xs font-semibold">Statins Indicated</span>
                <span className="px-3 py-1 bg-[#5f3add]/10 text-[#5f3add] rounded-full text-xs font-semibold">Lifestyle Rx</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Small Glass Card */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <Icon name="science" className="text-[#b80049] text-2xl mb-3" />
            <h3 className="text-lg font-bold text-[#191a2a]" style={{ fontFamily: 'Space Grotesk' }}>Lab Markers</h3>
            <ul className="space-y-3 mt-4">
              <li className="flex justify-between border-b border-[#e2e0f7]/30 pb-2">
                <span>LDL-C</span>
                <span className="font-semibold text-[#b80049]">98 mg/dL</span>
              </li>
              <li className="flex justify-between border-b border-[#e2e0f7]/30 pb-2">
                <span>HDL-C</span>
                <span className="font-semibold text-[#5f3add]">52 mg/dL</span>
              </li>
              <li className="flex justify-between">
                <span>TG</span>
                <span className="font-semibold">142 mg/dL</span>
              </li>
            </ul>
          </div>
        </GlassCard>

        {/* Recommendations Card */}
        <GlassCard className="p-6 bg-[#191a2a] text-white md:col-span-1">
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>Recommendations</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Icon name="check_circle" className="text-[#06d6a0]" />
              <p className="text-sm text-[#e2e0f7]">Initiate moderate-intensity statin therapy.</p>
            </div>
            <div className="flex gap-3">
              <Icon name="check_circle" className="text-[#06d6a0]" />
              <p className="text-sm text-[#e2e0f7]"> Mediterranean diet referral.</p>
            </div>
            <div className="flex gap-3">
              <Icon name="check_circle" className="text-[#06d6a0]" />
              <p className="text-sm text-[#e2e0f7]">Re-evaluate in 6 months.</p>
            </div>
          </div>
        </GlassCard>

        {/* Action Card */}
        <GlassCard className="p-6 md:col-span-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#191a2a] mb-2" style={{ fontFamily: 'Space Grotesk' }}>Clinic Dashboard</h3>
            <p className="text-sm text-[#4b5563] mb-4">Manage patient cohorts and export clinical documentation instantly.</p>
            <button className="bg-[#b80049] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#b80049]/20 primary-btn-hover">
              Open Analytics
            </button>
          </div>
          <div className="hidden lg:block opacity-20">
            <Icon name="database" className="text-[#b80049] text-[120px] rotate-12" />
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

// Methodology Section
function Methodology() {
  const methods = [
    { icon: "menu_book", title: "ADA/ESC Guidelines", desc: "Strict adherence to 2024 diabetes and cardiology guidelines." },
    { icon: "analytics", title: "Validated Algorithms", desc: "Pooled Cohort Equations and PREVENT for risk estimation." },
    { icon: "security", title: "Clinical Precision", desc: "HIPAA-compliant architecture for maximum security." },
    { icon: "refresh", title: "Real-time Updates", desc: "Logic engine updated within 24h of new consensus statements." },
  ];

  return (
    <section id="methodology" className="bg-[#f5f2ff] py-20">
      <div className="max-w-6xl mx-auto px-12">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3">
            <h2 className="text-3xl font-bold text-[#191a2a]" style={{ fontFamily: 'Space Grotesk' }}>
              Clinical Methodology
            </h2>
            <p className="text-[#4b5563] mt-4 mb-6 leading-relaxed">
              Our platform leverages a proprietary aggregation of verified clinical trials and academic frameworks, ensuring every prediction is backed by peer-reviewed science.
            </p>
            <a className="text-[#b80049] font-semibold flex items-center gap-2 group" href="#">
              Read Documentation 
              <Icon name="open_in_new" />
            </a>
          </div>
          
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {methods.map((m, i) => (
              <div key={i} className="p-6 rounded-2xl border border-glass-stroke bg-white/40">
                <div className="w-12 h-12 rounded-full bg-[#e6deff] flex items-center justify-center text-[#5f3add] mb-4">
                  <Icon name={m.icon} />
                </div>
                <h4 className="font-bold text-[#191a2a]" style={{ fontFamily: 'Space Grotesk' }}>{m.title}</h4>
                <p className="text-xs text-[#4b5563] mt-2">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Pricing / CTA Section
function Pricing() {
  const navigate = useNavigate();
  const tiers = [
    { name: "Simple", price: "Free", desc: "Essential calculators", features: ["All 4 NCD calculators", "Basic classification", "Mobile-responsive"] },
    { name: "Moderate", price: "$9/mo", desc: "Advanced features", highlight: true, features: ["ASCVD risk score", "Drug interactions", "Insulin titration", "GLP-1 eligibility"] },
    { name: "Complex", price: "$29/mo", desc: "Full clinical suite", features: ["Prescription generator", "OCR upload", "LAI classification", "PREVENT risk", "Priority support"] },
  ];

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-12 py-20">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-[#fff1f5] text-[#b80049] border border-[#b80049]/10">
          Pricing
        </span>
        <h2 className="text-3xl font-bold text-[#191a2a] mt-6" style={{ fontFamily: 'Space Grotesk' }}>
          Choose Your Tier
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier, i) => (
          <div 
            key={i}
            className={`relative p-8 rounded-3xl transition-all hover:shadow-xl ${tier.highlight ? 'bg-gradient-to-b from-[#fff1f5] to-white border-2 border-[#b80049]/30 shadow-xl' : 'bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg'}`}
          >
            {tier.highlight && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#b80049] to-[#5f3add] text-white">
                Popular
              </span>
            )}
            
            <h3 className="text-xl font-bold text-[#191a2a]" style={{ fontFamily: 'Space Grotesk' }}>{tier.name}</h3>
            <div className="mt-2 text-[#5b3f43] text-sm">{tier.desc}</div>
            
            <div className="my-6">
              <span className="text-4xl font-bold text-[#191a2a]">{tier.price}</span>
            </div>
            
            <ul className="space-y-3 mb-6">
              {tier.features.map((f, j) => (
                <li key={j} className="flex items-center gap-3 text-sm text-[#191a2a]">
                  <Icon name="check_circle" className="text-[#06d6a0]" />
                  {f}
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => navigate(i === 0 ? "/simple" : i === 1 ? "/moderate" : "/home")}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${tier.highlight ? 'bg-[#b80049] text-white hover:shadow-lg hover:shadow-[#b80049]/30' : 'bg-white text-[#191a2a] border border-[#e2e0f7] hover:border-[#b80049]'}`}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-[#f5f2ff] py-12 px-12 border-t border-[#e2e0f7]/30">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#b80049] to-[#5f3add] flex items-center justify-center">
              <Icon name="favorite" className="text-white text-sm" />
            </div>
            <span className="font-bold text-[#191a2a]" style={{ fontFamily: 'Space Grotesk' }}>NCD Toolkit</span>
          </div>
          <p className="text-sm text-[#5b3f43] max-w-sm">© 2026 NCD Toolkit. Clinician-designed for precision.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 md:justify-end text-sm">
          <div className="flex flex-col gap-2">
            <a className="text-[#5b3f43] hover:text-[#b80049] transition-colors" href="#">Privacy Policy</a>
            <a className="text-[#5b3f43] hover:text-[#b80049] transition-colors" href="#">Terms of Service</a>
          </div>
          <div className="flex flex-col gap-2">
            <a className="text-[#5b3f43] hover:text-[#b80049] transition-colors" href="#">Contact Support</a>
            <a className="text-[#5b3f43] hover:text-[#b80049] transition-colors" href="#">Documentation</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main export
export default function ModeSelector() {
  return (
    <div className="text-[#191a2a] font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
      <MeshGradientBg>
        <Navbar />
        <main className="pt-20">
          <Hero />
          <Features />
          <Methodology />
          <Pricing />
        </main>
        <Footer />
      </MeshGradientBg>

      {/* Global Styles */}
      <style>{`
        /* Font imports moved to index.css */
        
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0px 20px 40px rgba(10, 11, 26, 0.05);
          border-radius: 24px;
        }
        
        .border-glass-stroke {
          border-color: rgba(255, 255, 255, 0.4);
        }
        
        .primary-btn-hover:hover {
          transform: scale(1.02);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }

        ::selection {
          background: #b80049;
          color: white;
        }
      `}</style>
    </div>
  );
}