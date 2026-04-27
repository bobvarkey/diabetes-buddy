import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 max-w-[390px] mx-auto">
        {/* Ambient Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-fuchsia-600 rounded-full blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-40 right-10 w-72 h-72 bg-cyan-400 rounded-full blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>

        {/* Heart Icon with Glow */}
        <div className="relative mb-8 z-10">
          <div className="glow-fuchsia">
            <div className="text-8xl animate-pulse">❤️</div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold text-center mb-6 font-heading z-10">
          Manage Diabetes. <span className="text-primary neon-text">Smarter</span>.
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-center mb-8 max-w-xs z-10">
          Evidence-based tools for medication optimization, diet planning, and comprehensive diabetes management
        </p>

        {/* Rating */}
        <div className="flex flex-col items-center gap-2 mb-12 z-10">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="fill-warning text-warning" />
            ))}
          </div>
          <span className="text-sm text-gray-400">2,847 healthcare providers</span>
        </div>

        {/* CTA Button */}
        <div className="w-full max-w-xs z-10 mb-12">
          <Button
            onClick={() => navigate('/app')}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:from-fuchsia-700 hover:to-cyan-600 text-white font-semibold py-6 text-lg"
          >
            Get Started Free
          </Button>
        </div>

        {/* Bounce Indicator */}
        <div className="absolute bottom-8 z-10 animate-bounce-slow">
          <div className="text-3xl">⬇️</div>
        </div>
      </section>

      {/* Feature Pills Section */}
      <section className="py-16 px-6 max-w-[390px] mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '💊', label: 'Med Optimizer', color: 'bg-yellow-500/10 border-yellow-500/30' },
            { icon: '📊', label: 'HbA1c Tracking', color: 'bg-cyan-500/10 border-cyan-500/30' },
            { icon: '🍽️', label: 'Meal Planner', color: 'bg-fuchsia-500/10 border-fuchsia-500/30' },
            { icon: '🏥', label: 'Clinical Guides', color: 'bg-lime-500/10 border-lime-500/30' },
          ].map((pill, idx) => (
            <div key={idx} className={`${pill.color} border rounded-lg p-4 text-center`}>
              <div className="text-3xl mb-2">{pill.icon}</div>
              <p className="text-sm font-medium">{pill.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-6 border-t border-gray-800 max-w-[390px] mx-auto">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">180+</p>
            <p className="text-xs text-gray-400">Medications</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-cyan-400">16</p>
            <p className="text-xs text-gray-400">Tools</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">50K+</p>
            <p className="text-xs text-gray-400">Users</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-lime-400">Free</p>
            <p className="text-xs text-gray-400">Core</p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 px-6 max-w-[390px] mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center font-heading">Clinical Tools</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '💉', name: 'Insulin Titration' },
            { icon: '🧬', name: 'GLP-1 Dosing' },
            { icon: '🩺', name: 'HbA1c Tracker' },
            { icon: '⚠️', name: 'Hypo Risk' },
            { icon: '🍽️', name: 'Plate Method' },
            { icon: '🏥', name: 'CKD Guidelines' },
          ].map((tool, idx) => (
            <div key={idx} className="border border-gray-800 rounded-lg p-4 text-center hover:border-fuchsia-500 transition-colors cursor-pointer">
              <p className="text-3xl mb-2">{tool.icon}</p>
              <p className="text-sm font-medium">{tool.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-6 border-t border-gray-800 bg-gradient-to-r from-fuchsia-600 to-cyan-500 max-w-[390px] mx-auto">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4 text-white">Ready to optimize care?</h3>
          <Button
            onClick={() => navigate('/app')}
            className="bg-black hover:bg-gray-900 text-white font-semibold py-3 px-8"
          >
            Access Dashboard
          </Button>
        </div>
      </section>
    </div>
  );
}
