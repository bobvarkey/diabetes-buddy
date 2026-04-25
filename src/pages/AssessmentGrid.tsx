import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaywallModal from '@/components/PaywallModal';

const TOOLS = [
  { id: 1, name: 'Med Optimizer', category: 'Medications', pro: false, color: 'bg-neon-magenta', route: '/medications' },
  { id: 2, name: 'Insulin Titration', category: 'Dosing', pro: true, color: 'bg-neon-cyan', route: '/insulin-titration' },
  { id: 3, name: 'HbA1c Tracker', category: 'Monitoring', pro: false, color: 'bg-neon-pink', route: '/progress' },
  { id: 4, name: 'GLP-1 Calculator', category: 'Dosing', pro: true, color: 'bg-neon-lime', route: '/' },
  { id: 5, name: 'Plate Method', category: 'Nutrition', pro: false, color: 'bg-neon-orange', route: '/plate' },
  { id: 6, name: 'Personalized Meals', category: 'Diet', pro: true, color: 'bg-neon-violet', route: '/diet-plan' },
  { id: 7, name: 'Hypo Risk Calc', category: 'Safety', pro: false, color: 'bg-neon-red', route: '/hypo-risk' },
  { id: 8, name: 'Advanced Analytics', category: 'Analytics', pro: true, color: 'bg-neon-yellow', route: '/' },
  { id: 9, name: 'Food Database', category: 'Nutrition', pro: false, color: 'bg-neon-magenta', route: '/foods' },
  { id: 10, name: 'Renal Dosing', category: 'Safety', pro: true, color: 'bg-neon-cyan', route: '/renal-dosing' },
  { id: 11, name: 'Prediabetes Guide', category: 'Education', pro: false, color: 'bg-neon-pink', route: '/prediabetes' },
  { id: 12, name: 'CKD Guidelines', category: 'Comorbidity', pro: true, color: 'bg-neon-lime', route: '/ckd-guideline' },
  { id: 13, name: 'Patient Summary', category: 'Dashboard', pro: false, color: 'bg-neon-orange', route: '/summary' },
  { id: 14, name: 'Medication Profile', category: 'Clinical', pro: true, color: 'bg-neon-violet', route: '/' },
  { id: 15, name: 'Patient Input', category: 'Data Entry', pro: false, color: 'bg-neon-red', route: '/patient' },
  { id: 16, name: 'Smart Recommendations', category: 'AI', pro: true, color: 'bg-neon-yellow', route: '/' },
];

export default function AssessmentGrid() {
  const navigate = useNavigate();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const handleTileClick = (tool: typeof TOOLS[0]) => {
    if (tool.pro) {
      setPaywallOpen(true);
    } else {
      navigate(tool.route);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Ad Banner */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-black via-fuchsia-900 to-black border-b border-fuchsia-500 px-4 py-3 text-center cursor-pointer hover:from-fuchsia-900 hover:via-fuchsia-800 hover:to-fuchsia-900 transition-all">
        <p className="text-sm font-semibold">
          <span className="mr-2">⚡</span>
          Upgrade to Pro • AI-powered medication optimization
        </p>
      </div>

      {/* Main Grid Container */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[390px] p-4">
          {/* Grid Header */}
          <div className="mb-6 mt-4">
            <h1 className="text-2xl font-bold font-heading mb-2">Diabetes Tools</h1>
            <p className="text-gray-400 text-sm">
              {TOOLS.filter(a => !a.pro).length} free • {TOOLS.filter(a => a.pro).length} pro
            </p>
          </div>

          {/* Tool Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleTileClick(tool)}
                className={`relative group overflow-hidden rounded-lg p-4 min-h-[140px] flex flex-col justify-between transition-all duration-300 ${
                  tool.color
                } ${tool.pro ? 'opacity-60 hover:opacity-70' : 'hover:shadow-lg hover:shadow-fuchsia-500/50'}`}
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-200 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-white/60 mt-1">{tool.category}</p>
                </div>

                {/* Pro Lock Overlay */}
                {tool.pro && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <div className="text-center">
                      <p className="text-2xl mb-1">🔒</p>
                      <p className="text-xs font-bold text-fuchsia-400">PRO</p>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 border border-gray-800 rounded-lg text-center">
            <p className="text-xs text-gray-400">
              Free tier includes {TOOLS.filter(a => !a.pro).length} essential tools.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Pro: All tools + AI recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
