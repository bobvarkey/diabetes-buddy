import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import LandingPage from "./pages/LandingPage";
import AssessmentGrid from "./pages/AssessmentGrid";
import Dashboard from "./pages/Dashboard";
import PatientInput from "./pages/PatientInput";
import FoodDatabase from "./pages/FoodDatabase";
import PlateMethod from "./pages/PlateMethod";
import MedOptimizer from "./pages/MedOptimizer";
import DietPlanPage from "./pages/DietPlanPage";
import Progress from "./pages/Progress";
import SummaryPage from "./pages/SummaryPage";
import InsulinTitration from "./pages/InsulinTitration";
import HypoRiskCalculator from "./pages/HypoRiskCalculator";
import RenalDoseAdjustment from "./pages/RenalDoseAdjustment";
import PrediabetesAlgorithm from "./pages/PrediabetesAlgorithm";
import CKDGuideline from "./pages/CKDGuideline";
import GLP1Administration from "./pages/GLP1Administration";
import SlidingScaleInsulin from "./pages/SlidingScaleInsulin";
import DailyManagementGuide from "./pages/DailyManagementGuide";
import Type1DMManagement from "./pages/Type1DMManagement";
import InsulinTherapy from "./pages/InsulinTherapy";
import Type1Pitfalls from "./pages/Type1Pitfalls";
import Type2Transition from "./pages/Type2Transition";
import FeedbackTips from "./pages/FeedbackTips";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <Routes>
            {/* Landing & Assessment - Full screen, no sidebar */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<AssessmentGrid />} />

            {/* Legacy app with sidebar */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-12 flex items-center border-b bg-card px-2">
                      <SidebarTrigger className="ml-1" />
                      <span className="ml-3 text-sm font-heading font-semibold text-muted-foreground">
                        Diabetes Med Optimizer
                      </span>
                    </header>
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/patient" element={<PatientInput />} />
                        <Route path="/foods" element={<FoodDatabase />} />
                        <Route path="/plate" element={<PlateMethod />} />
                        <Route path="/medications" element={<MedOptimizer />} />
                        <Route path="/diet-plan" element={<DietPlanPage />} />
                        <Route path="/progress" element={<Progress />} />
                        <Route path="/summary" element={<SummaryPage />} />
                        <Route path="/insulin-titration" element={<InsulinTitration />} />
                        <Route path="/sliding-scale" element={<SlidingScaleInsulin />} />
                        <Route path="/glp1-administration" element={<GLP1Administration />} />
                        <Route path="/hypo-risk" element={<HypoRiskCalculator />} />
                        <Route path="/renal-dosing" element={<RenalDoseAdjustment />} />
                        <Route path="/prediabetes" element={<PrediabetesAlgorithm />} />
                        <Route path="/ckd-guideline" element={<CKDGuideline />} />
                        <Route path="/daily-management" element={<DailyManagementGuide />} />
                        <Route path="/type1-management" element={<Type1DMManagement />} />
                        <Route path="/insulin-therapy" element={<InsulinTherapy />} />
                        <Route path="/type1-pitfalls" element={<Type1Pitfalls />} />
                        <Route path="/type2-transition" element={<Type2Transition />} />
                        <Route path="/feedback" element={<FeedbackTips />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              }
            />
          </Routes>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
