import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Syringe, Dna, Activity, Wind, Kidney } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const tabs: TabItem[] = [
  {
    path: "/home",
    label: "Home",
    icon: <Home className="h-4 w-4" />,
    color: "text-primary",
  },
  {
    path: "/diabetes",
    label: "Diabetes",
    icon: <Syringe className="h-4 w-4" />,
    color: "text-red-500",
  },
  {
    path: "/hypertension",
    label: "Hypertension",
    icon: <Heart className="h-4 w-4" />,
    color: "text-orange-500",
  },
  {
    path: "/lipids",
    label: "Lipids",
    icon: <Dna className="h-4 w-4" />,
    color: "text-blue-500",
  },
  {
    path: "/respiratory",
    label: "COPD/Asthma",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="8"/></svg>,
    color: "text-cyan-500",
  },
  {
    path: "/renal-dosing",
    label: "Renal",
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="3"/></svg>,
    color: "text-amber-500",
  },
];

export function TabNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 mr-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-white/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <span className="font-serif font-semibold text-lg tracking-tight">
              NCD <span className="text-muted-foreground font-light">Rx</span>
            </span>
            <span className="ml-1 text-[10px] font-bold text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded">COMPLEX</span>
          </Link>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = currentPath === tab.path ||
                (tab.path !== "/home" && currentPath.startsWith(tab.path));

              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn("transition-colors", isActive ? tab.color : "")}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      className={cn(
                        "absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                        tab.path === "/home" && "bg-primary",
                        tab.path === "/diabetes" && "bg-red-500",
                        tab.path === "/hypertension" && "bg-orange-500",
                        tab.path === "/lipids" && "bg-blue-500",
                        tab.path === "/respiratory" && "bg-cyan-500",
                        tab.path === "/renal-dosing" && "bg-amber-500"
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            <Link to="/" className="text-[10px] text-muted-foreground/60 hover:text-foreground transition-colors border border-border/40 rounded px-2 py-1">
              ← Mode Selector
            </Link>
            <span className="text-xs text-muted-foreground/60 hidden sm:block">
              Evidence-based · Guideline-driven
            </span>
          </div>
        </div>
      </div>
    </nav>
      <BottomNav />
      <div className="h-14" />
    </>
  );
}

export function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 py-2.5 px-4 flex items-center justify-center gap-2 z-50">
      <Link to="/" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">🏠 Homepage</Link>
      <span className="text-[10px] text-muted-foreground/40">|</span>
      <Link to="/simple" className="px-3 py-1.5 text-xs font-semibold rounded-lg text-muted-foreground hover:bg-muted transition-colors">🟢 Simple</Link>
      <Link to="/moderate" className="px-3 py-1.5 text-xs font-semibold rounded-lg text-muted-foreground hover:bg-muted transition-colors">🟠 Moderate</Link>
      <Link to="/home" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500/15 text-purple-600 border border-purple-500/30 hover:bg-purple-500/25 transition-colors">🔴 Complex</Link>
    </div>
  );
}

export default TabNavigation;
