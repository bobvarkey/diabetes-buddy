import { useNavigate } from 'react-router-dom';

interface Tool {
  id: number;
  name: string;
  category: string;
  color: string;
  route: string;
}

const TOOLS: Tool[] = [
  { id: 1, name: 'Med Optimizer', category: 'Medications', color: 'bg-neon-magenta', route: '/medications' },
  { id: 2, name: 'Insulin Titration', category: 'Dosing', color: 'bg-neon-cyan', route: '/insulin-titration' },
  { id: 3, name: 'HbA1c Tracker', category: 'Monitoring', color: 'bg-neon-pink', route: '/progress' },
  { id: 4, name: 'GLP-1 Administration', category: 'Dosing', color: 'bg-neon-lime', route: '/glp1-administration' },
  { id: 5, name: 'Plate Method', category: 'Nutrition', color: 'bg-neon-orange', route: '/plate' },
  { id: 6, name: 'Diet Plan', category: 'Diet', color: 'bg-neon-violet', route: '/diet-plan' },
  { id: 7, name: 'Hypo Risk Score', category: 'Safety', color: 'bg-neon-red', route: '/hypo-risk' },
  { id: 8, name: 'Sliding Scale Insulin', category: 'Dosing', color: 'bg-neon-yellow', route: '/sliding-scale' },
  { id: 9, name: 'Food Database', category: 'Nutrition', color: 'bg-neon-magenta', route: '/foods' },
  { id: 10, name: 'Renal Dosing', category: 'Safety', color: 'bg-neon-cyan', route: '/renal-dosing' },
  { id: 11, name: 'Prediabetes Guide', category: 'Education', color: 'bg-neon-pink', route: '/prediabetes' },
  { id: 12, name: 'CKD Guidelines', category: 'Comorbidity', color: 'bg-neon-lime', route: '/ckd-guideline' },
  { id: 13, name: 'Patient Summary', category: 'Dashboard', color: 'bg-neon-orange', route: '/summary' },
  { id: 14, name: 'Patient Input', category: 'Data Entry', color: 'bg-neon-violet', route: '/patient' },
  { id: 15, name: 'Dashboard', category: 'Dashboard', color: 'bg-neon-red', route: '/dashboard' },
  { id: 16, name: 'Daily Management', category: 'Education', color: 'bg-neon-yellow', route: '/daily-management' },
];

export default function AssessmentGrid() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Main Grid Container */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[390px] p-4">
          {/* Grid Header */}
          <div className="mb-6 mt-4">
            <h1 className="text-2xl font-bold font-heading mb-2">Clinical Tools & Features</h1>
            <p className="text-gray-400 text-sm">
              {TOOLS.length} tools available
            </p>
          </div>

          {/* Tool Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => navigate(tool.route)}
                className={`relative group overflow-hidden rounded-lg p-4 min-h-[140px] flex flex-col justify-between transition-all duration-300 ${
                  tool.color
                } hover:shadow-lg hover:shadow-fuchsia-500/50 cursor-pointer`}
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
              </button>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 border border-gray-800 rounded-lg text-center">
            <p className="text-xs text-gray-400">
              All {TOOLS.length} clinical tools and educational resources are now accessible for testing.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Evidence-based algorithms and decision support for diabetes management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
