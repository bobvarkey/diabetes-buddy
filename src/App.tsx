import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TabNavigation } from "@/components/TabNavigation";
import { AppSidebar } from "@/components/AppSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Big Four NCD Pages
import Home from "@/pages/Home";
import Diabetes from "@/pages/Diabetes";
import Hypertension from "@/pages/Hypertension";
import Lipids from "@/pages/Lipids";
import Obesity from "@/pages/Obesity";
import AsthmaCopd from "@/pages/AsthmaCopd";
import RenalDisease from "@/pages/RenalDisease";

// Big Four — Diabetes sub-pages
import DiabetesAssessment from "@/pages/diabetes/DiabetesAssessment";
import DiabetesOverview from "@/pages/diabetes/DiabetesOverview";
import DiabetesTab from "@/pages/diabetes/DiabetesTab";
import DiabetesTreatment from "@/pages/diabetes/DiabetesTreatment";
import InsulinGuide from "@/pages/diabetes/InsulinGuide";
import GenerateRx from "@/pages/GenerateRx";

// Big Four — Hypertension sub-pages
import HypertensionAssessment from "@/pages/hypertension/HypertensionAssessment";
import HypertensionMedicationGuide from "@/pages/hypertension/HypertensionMedicationGuide";
import HypertensionOverview from "@/pages/hypertension/HypertensionOverview";
import HypertensionTab from "@/pages/hypertension/HypertensionTab";
import HypertensionTreatment from "@/pages/hypertension/HypertensionTreatment";

// Big Four — Lipids sub-pages
import LipidsAssessment from "@/pages/lipids/LipidsAssessment";
import LipidsOverview from "@/pages/lipids/LipidsOverview";
import LipidsTab from "@/pages/lipids/LipidsTab";
import LipidsTreatment from "@/pages/lipids/LipidsTreatment";

// Big Four — Calculators
import InsulinTitrationCalc from "@/calculators/diabetes/InsulinTitration";
import HypoRiskCalculatorCalc from "@/calculators/diabetes/HypoRisk";
import RenalDoseAdjustmentCalc from "@/calculators/diabetes/RenalDosing";
import SlidingScaleInsulinCalc from "@/calculators/diabetes/SlidingScale";
import DiabetesMedicationAlgorithmCalc from "@/calculators/diabetes/DiabetesMedicationAlgorithm";
import AscvdEmrCalc from "@/calculators/lipids/AscvdRisk";
import LipidPanelCalc from "@/calculators/lipids/LipidPanel";
import GfrCalculatorCalc from "@/calculators/htn/GfrCalculator";
import DrugInteractionCheckerCalc from "@/calculators/htn/DrugInteractions";
import AntihypertensiveTreatmentAlgorithmCalc from "@/calculators/htn/AntihypertensiveTreatmentAlgorithm";
import AntihypertensivePotencyTableCalc from "@/calculators/htn/AntihypertensivePotencyTable";
import BmiCalculatorCalc from "@/calculators/obesity/BmiCalculator";
import WaistHeightRatioCalc from "@/calculators/obesity/WaistHeightRatio";
import GLP1ObesityAlgorithmCalc from "@/calculators/obesity/GLP1ObesityAlgorithm";

// Diabetes Buddy Pages
import LandingPage from "@/pages/LandingPage";
import AssessmentGrid from "@/pages/AssessmentGrid";
import Dashboard from "@/pages/Dashboard";
import PatientInput from "@/pages/PatientInput";
import FoodDatabase from "@/pages/FoodDatabase";
import PlateMethod from "@/pages/PlateMethod";
import MedOptimizer from "@/pages/MedOptimizer";
import DietPlanPage from "@/pages/DietPlanPage";
import Progress from "@/pages/Progress";
import SummaryPage from "@/pages/SummaryPage";
import InsulinTitrationPage from "@/pages/InsulinTitration";
import SlidingScalePage from "@/pages/SlidingScaleInsulin";
import HypoRiskPage from "@/pages/HypoRiskCalculator";
import RenalDosePage from "@/pages/RenalDoseAdjustment";
import PrediabetesAlgorithm from "@/pages/PrediabetesAlgorithm";
import CKDGuideline from "@/pages/CKDGuideline";
import GLP1Administration from "@/pages/GLP1Administration";
import DailyManagementGuide from "@/pages/DailyManagementGuide";
import Type1DMManagement from "@/pages/Type1DMManagement";
import InsulinTherapy from "@/pages/InsulinTherapy";
import Type1Pitfalls from "@/pages/Type1Pitfalls";
import Type2Transition from "@/pages/Type2Transition";
import FeedbackTips from "@/pages/FeedbackTips";

// 404
import NotFound from "@/components/NotFound";

const queryClient = new QueryClient();

const DiabetesBuddyLayout = () => (
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
          <Route path="/db/insulin-titration" element={<InsulinTitrationPage />} />
          <Route path="/db/sliding-scale" element={<SlidingScalePage />} />
          <Route path="/db/glp1-administration" element={<GLP1Administration />} />
          <Route path="/db/hypo-risk" element={<HypoRiskPage />} />
          <Route path="/db/renal-dosing" element={<RenalDosePage />} />
          <Route path="/db/prediabetes" element={<PrediabetesAlgorithm />} />
          <Route path="/db/ckd-guideline" element={<CKDGuideline />} />
          <Route path="/db/daily-management" element={<DailyManagementGuide />} />
          <Route path="/db/type1-management" element={<Type1DMManagement />} />
          <Route path="/db/insulin-therapy" element={<InsulinTherapy />} />
          <Route path="/db/type1-pitfalls" element={<Type1Pitfalls />} />
          <Route path="/db/type2-transition" element={<Type2Transition />} />
          <Route path="/db/feedback" element={<FeedbackTips />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Full-screen routes — no sidebar, no tab nav */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/app" element={<AssessmentGrid />} />

          {/* Diabetes Buddy routes with sidebar */}
          <Route path="/db/*" element={<SidebarProvider><DiabetesBuddyLayout /></SidebarProvider>} />

          {/* Big Four NCD routes with tab navigation */}
          <Route
            path="/*"
            element={
              <>
                <TabNavigation />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/generate-rx" element={<ErrorBoundary><GenerateRx /></ErrorBoundary>} />
                  {/* Tab Pages */}
                  <Route path="/diabetes" element={<ErrorBoundary><Diabetes /></ErrorBoundary>} />
                  <Route path="/hypertension" element={<ErrorBoundary><Hypertension /></ErrorBoundary>} />
                  <Route path="/lipids" element={<ErrorBoundary><Lipids /></ErrorBoundary>} />
                  <Route path="/obesity" element={<ErrorBoundary><Obesity /></ErrorBoundary>} />
                  <Route path="/asthma-copd" element={<ErrorBoundary><AsthmaCopd /></ErrorBoundary>} />
                  <Route path="/renal" element={<ErrorBoundary><RenalDisease /></ErrorBoundary>} />
                  {/* Diabetes Sub-pages */}
                  <Route path="/diabetes/assessment" element={<ErrorBoundary><DiabetesAssessment /></ErrorBoundary>} />
                  <Route path="/diabetes/overview" element={<ErrorBoundary><DiabetesOverview /></ErrorBoundary>} />
                  <Route path="/diabetes/tab" element={<ErrorBoundary><DiabetesTab /></ErrorBoundary>} />
                  <Route path="/diabetes/treatment" element={<ErrorBoundary><DiabetesTreatment /></ErrorBoundary>} />
                  <Route path="/diabetes/insulin-guide" element={<ErrorBoundary><InsulinGuide /></ErrorBoundary>} />
                  {/* Hypertension Sub-pages */}
                  <Route path="/hypertension/assessment" element={<ErrorBoundary><HypertensionAssessment /></ErrorBoundary>} />
                  <Route path="/hypertension/medication-guide" element={<ErrorBoundary><HypertensionMedicationGuide /></ErrorBoundary>} />
                  <Route path="/hypertension/overview" element={<ErrorBoundary><HypertensionOverview /></ErrorBoundary>} />
                  <Route path="/hypertension/tab" element={<ErrorBoundary><HypertensionTab /></ErrorBoundary>} />
                  <Route path="/hypertension/treatment" element={<ErrorBoundary><HypertensionTreatment /></ErrorBoundary>} />
                  {/* Lipids Sub-pages */}
                  <Route path="/lipids/assessment" element={<ErrorBoundary><LipidsAssessment /></ErrorBoundary>} />
                  <Route path="/lipids/overview" element={<ErrorBoundary><LipidsOverview /></ErrorBoundary>} />
                  <Route path="/lipids/tab" element={<ErrorBoundary><LipidsTab /></ErrorBoundary>} />
                  <Route path="/lipids/treatment" element={<ErrorBoundary><LipidsTreatment /></ErrorBoundary>} />
                  {/* Diabetes Calculators */}
                  <Route path="/insulin-titration" element={<ErrorBoundary><InsulinTitrationCalc /></ErrorBoundary>} />
                  <Route path="/sliding-scale" element={<ErrorBoundary><SlidingScaleInsulinCalc /></ErrorBoundary>} />
                  <Route path="/hypo-risk" element={<ErrorBoundary><HypoRiskCalculatorCalc /></ErrorBoundary>} />
                  <Route path="/renal-dosing" element={<ErrorBoundary><RenalDoseAdjustmentCalc /></ErrorBoundary>} />
                  <Route path="/diabetes/medication-algorithm" element={<ErrorBoundary><DiabetesMedicationAlgorithmCalc /></ErrorBoundary>} />
                  {/* Lipid Calculators */}
                  <Route path="/lipid-panel" element={<ErrorBoundary><LipidPanelCalc /></ErrorBoundary>} />
                  <Route path="/ascvd-risk" element={<ErrorBoundary><AscvdEmrCalc /></ErrorBoundary>} />
                  {/* Hypertension Calculators */}
                  <Route path="/gfr-calculator" element={<ErrorBoundary><GfrCalculatorCalc /></ErrorBoundary>} />
                  <Route path="/drug-interactions" element={<ErrorBoundary><DrugInteractionCheckerCalc /></ErrorBoundary>} />
                  <Route path="/htn/treatment-algorithm" element={<ErrorBoundary><AntihypertensiveTreatmentAlgorithmCalc /></ErrorBoundary>} />
                  <Route path="/htn/potency-table" element={<ErrorBoundary><AntihypertensivePotencyTableCalc /></ErrorBoundary>} />
                  {/* Obesity Calculators */}
                  <Route path="/obesity/bmi-calculator" element={<ErrorBoundary><BmiCalculatorCalc /></ErrorBoundary>} />
                  <Route path="/obesity/waist-height-ratio" element={<ErrorBoundary><WaistHeightRatioCalc /></ErrorBoundary>} />
                  <Route path="/obesity/glp1-algorithm" element={<ErrorBoundary><GLP1ObesityAlgorithmCalc /></ErrorBoundary>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
