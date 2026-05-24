import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Syringe, Dna, Activity, Wind, Menu, X, Zap, Brain } from "lucide-react";
import { useState } from "react";
import { Search, Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Combined navigation: Easy & Complex modes appear alongside Home
const mainNavItems = [
  { path: "/home", label: "🏠 Home", icon: "🏠", color: "primary", description: "Dashboard" },
  { path: "/easy", label: "🔰 Easy", icon: "🔰", color: "green-500", description: "Quick calculators" },
  { path: "/complex", label: "🧠 Complex", icon: "🧠", color: "purple-500", description: "Full details" },
];

// Clinical area tabs (accessible from Complex mode)
const clinicalTabs = [
  { path: "/home", label: "🏠 Dashboard", icon: "🏠", color: "primary" },
  { path: "/diabetes", label: "💉 Diabetes", icon: "💉", color: "red-500" },
  { path: "/hypertension", label: "❤️ HTN", icon: "❤️", color: "orange-500" },
  { path: "/lipids", label: "💧 Lipids", icon: "💧", color: "blue-500" },
  { path: "/respiratory", label: "🫁 COPD/Asthma", icon: "🫁", color: "cyan-500" },
  { path: "/renal-dosing", label: "🫘 Renal", icon: "🫘", color: "amber-500" },
];

export function TabNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const currentPath = location.pathname;
  const activeSection = currentPath.split("/")[1] || "home";

  // Determine which mainnav is active
  const getMainNavClass = (path: string) => {
    if (path === "/home" && (currentPath === "/home" || currentPath.startsWith("/diabetes") || currentPath.startsWith("/hypertension") || currentPath.startsWith("/lipids") || currentPath.startsWith("/respiratory") || currentPath.startsWith("/renal"))) return true;
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      
      {/* Search Button - navigates to sections */}
      <button 
        onClick={() => navigate("/lipids")}
        className="fixed top-3 right-3 z-50 p-2 rounded-lg bg-card border border-border lg:hidden hover:bg-slate-100"
        title="Jump to section"
      >
        <Search className="h-5 w-5 text-blue-600" />
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-56 bg-card border-r border-border z-40",
        "transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Close button mobile */}
        <button onClick={() => setSidebarOpen(false)} className="absolute top-3 right-3 p-1 lg:hidden">
          <X className="h-4 w-4" />
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-white/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <span className="font-serif font-semibold">NCD Rx</span>
          </Link>
        </div>

        {/* Main Navigation (Easy, Home, Complex as top-level tabs) */}
        <nav className="p-2 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground px-2 py-2">MODES</div>
          {mainNavItems.map((item) => {
            const isActive = item.path === "/home" 
              ? (currentPath === "/home" || currentPath.match(/^\/(diabetes|hypertension|lipids|respiratory|renal)/))
              : currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-1",
                  isActive 
                    ? `bg-${item.color}/10 text-${item.color} border-l-2 border-${item.color}` 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Clinical Tabs (shown when in Complex mode → any /diabetes, /hypertension etc) */}
        {(currentPath === "/home" || currentPath.match(/^\/(diabetes|hypertension|lipids|respiratory|renal)/)) && (
          <nav className="p-2 space-y-1 border-t border-border">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-2">AREAS</div>
            {clinicalTabs.map((item) => {
              const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive 
                      ? `bg-${item.color}/10 text-${item.color} border-l-2 border-${item.color}` 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </aside>

      {/* Sidebar spacer */}
      <div className="hidden lg:block w-56 shrink-0" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile top bar */}
      <div className="lg:hidden h-14 flex items-center pl-14 border-b border-border bg-background/95">
        <span className="text-sm font-medium">
          {mainNavItems.find(n => getMainNavClass(n.path))?.label || 
           clinicalTabs.find(n => currentPath.startsWith(n.path))?.label || "NCD Rx"}
        </span>
      </div>
    </>
  );
}

export default TabNavigation;