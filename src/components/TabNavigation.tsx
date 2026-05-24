import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Syringe, Dna, Activity, Wind, Kidney, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/home", label: "🏠 Homepage", icon: "🏠", color: "primary" },
  { path: "/diabetes", label: "Diabetes", icon: "💉", color: "red-500" },
  { path: "/hypertension", label: "Hypertension", icon: "❤️", color: "orange-500" },
  { path: "/lipids", label: "Lipids", icon: "💧", color: "blue-500" },
  { path: "/respiratory", label: "COPD/Asthma", icon: "🫁", color: "cyan-500" },
  { path: "/renal-dosing", label: "Renal", icon: "🫘", color: "amber-500" },
];

const modeLinks = [
  { path: "/", label: "← Mode Selector", icon: "⬅️" },
  { path: "/simple", label: "🟢 Simple", icon: "🟢" },
  { path: "/moderate", label: "🟠 Moderate", icon: "🟠" },
  { path: "/home", label: "🔴 Complex", icon: "🔴" },
];

export function TabNavigation() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPath = location.pathname;

  // Determine active main section
  const activeSection = currentPath.split("/")[1] || "home";

  return (
    <>
      {/* Mobile hamburger */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border lg:hidden"
      >
        <Menu className="h-5 w-5" />
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

        {/* Main Navigation */}
        <nav className="p-2 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground px-2 py-2">CLINICAL AREAS</div>
          {navItems.map((item) => {
            const isActive = currentPath === item.path || 
              (item.path !== "/home" && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive 
                    ? `bg-${item.color}/10 text-${item.color} border-l-2 border-${item.color}` 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mode Switcher at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-border">
          <div className="text-xs font-semibold text-muted-foreground px-2 py-2">MODE SWITCHER</div>
          <nav className="space-y-1">
            {modeLinks.map((item) => {
              const isActive = currentPath === item.path || 
                (item.path === "/home" && currentPath === "/home") ||
                (item.path === "/" && currentPath === "/");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Sidebar spacer - push content right */}
      <div className="hidden lg:block w-56 shrink-0" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile top bar with hamburger */}
      <div className="lg:hidden h-14 flex items-center pl-14 border-b border-border bg-background/95">
        <span className="text-sm font-medium">
          {navItems.find(n => currentPath === n.path || currentPath.startsWith(n.path + "/"))?.label || "NCD Rx"}
        </span>
      </div>
    </>
  );
}

export default TabNavigation;
