import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Syringe, Dna, Activity, Scale, Wind, Droplets, Sparkles, Layers, Beaker } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMode } from "@/hooks/use-mode";

interface TabItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  dotClass: string;
}

const tabs: TabItem[] = [
  { path: "/", label: "Home", icon: <Home className="h-4 w-4" />, color: "text-primary", dotClass: "bg-primary" },
  { path: "/diabetes", label: "Diabetes", icon: <Syringe className="h-4 w-4" />, color: "text-red-500", dotClass: "bg-red-500" },
  { path: "/hypertension", label: "Hypertension", icon: <Heart className="h-4 w-4" />, color: "text-orange-500", dotClass: "bg-orange-500" },
  { path: "/lipids", label: "Lipids", icon: <Dna className="h-4 w-4" />, color: "text-blue-500", dotClass: "bg-blue-500" },
  { path: "/obesity", label: "Obesity", icon: <Scale className="h-4 w-4" />, color: "text-violet-500", dotClass: "bg-violet-500" },
  { path: "/asthma-copd", label: "Asthma/COPD", icon: <Wind className="h-4 w-4" />, color: "text-cyan-500", dotClass: "bg-cyan-500" },
  { path: "/renal", label: "Renal", icon: <Droplets className="h-4 w-4" />, color: "text-emerald-500", dotClass: "bg-emerald-500" },
  { path: "/anemia", label: "Anemia", icon: <Beaker className="h-4 w-4" />, color: "text-rose-500", dotClass: "bg-rose-500" },
];

export function TabNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [mode, setMode] = useMode();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-14 items-center gap-2">
          <Link to="/" className="flex items-center gap-2 mr-4 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-white/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <span className="font-serif font-semibold text-lg tracking-tight hidden sm:inline">
              NCD <span className="text-muted-foreground font-light">Rx</span>
            </span>
          </Link>

          <div className="flex items-center gap-0.5 overflow-x-auto flex-1 no-scrollbar">
            {tabs.map((tab) => {
              const isActive = currentPath === tab.path || (tab.path !== "/" && currentPath.startsWith(tab.path));
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                    "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn("transition-colors", isActive ? tab.color : "")}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {isActive && <span className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full", tab.dotClass)} />}
                </Link>
              );
            })}
          </div>

          {/* Easy / Complex mode toggle */}
          <div className="flex items-center gap-1 ml-2 shrink-0 rounded-md border border-border/60 p-0.5 bg-muted/30">
            <button
              onClick={() => setMode("easy")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors",
                mode === "easy" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              title="Easy mode: basic calculators only"
            >
              <Sparkles className="h-3 w-3" />
              Easy
            </button>
            <button
              onClick={() => setMode("complex")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors",
                mode === "complex" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              title="Complex mode: full clinical detail"
            >
              <Layers className="h-3 w-3" />
              Complex
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default TabNavigation;
