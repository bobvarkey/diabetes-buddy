import React, { useState } from "react";
import { Syringe, BookOpen, Stethoscope, Pill, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import DiabetesOverview from "./DiabetesOverview";
import DiabetesAssessment from "./DiabetesAssessment";
import DiabetesTreatment from "./DiabetesTreatment";

interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Section = ({ id, title, icon, description, isOpen, onToggle, children }: SectionProps) => (
  <Card className={cn(
    "border-border/60 transition-all duration-300",
    isOpen && "border-red-500/30 shadow-md"
  )}>
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                isOpen ? "bg-red-500/20" : "bg-muted"
              )}>
                {React.cloneElement(icon as React.ReactElement, {
                  className: cn("h-5 w-5", isOpen ? "text-red-500" : "text-muted-foreground")
                })}
              </div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </CardHeader>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  </Card>
);

export default function DiabetesTab() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["overview", "assessment", "treatment"]));

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sections = [
    {
      id: "overview",
      title: "Overview & Education",
      icon: <BookOpen />,
      description: "Pathophysiology, diagnostic criteria, and risk stratification",
      component: <DiabetesOverview />,
    },
    {
      id: "assessment",
      title: "Assessment Tools",
      icon: <Stethoscope />,
      description: "HbA1c interpretation, insulin calculators, and risk assessment",
      component: <DiabetesAssessment />,
    },
    {
      id: "treatment",
      title: "Treatment & Algorithms",
      icon: <Pill />,
      description: "Medication algorithms, GLP-1 guide, and management protocols",
      component: <DiabetesTreatment />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Grain Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Syringe className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-semibold tracking-tight">
              Diabetes Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Comprehensive tools for diagnosis, assessment, and treatment
            </p>
          </div>
        </div>
      </section>

      {/* Expand/Collapse All */}
      <section className="max-w-6xl mx-auto px-6 pb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenSections(new Set(["overview", "assessment", "treatment"]))}
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenSections(new Set())}
          >
            Collapse All
          </Button>
        </div>
      </section>

      {/* Sections */}
      <section className="max-w-6xl mx-auto px-6 pb-16 space-y-4">
        {sections.map((section) => (
          <Section
            key={section.id}
            id={section.id}
            title={section.title}
            icon={section.icon}
            description={section.description}
            isOpen={openSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
          >
            {section.component}
          </Section>
        ))}
      </section>
    </div>
  );
}
