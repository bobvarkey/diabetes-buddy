import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TabNavigation } from "@/components/TabNavigation";
import { AppSidebar } from "@/components/AppSidebar";

// Mode Pages
import ModeSelector from "@/pages/ModeSelector";
import SimpleMode, { ModeNav as ModeNavSimple } from "@/pages/SimpleMode";
import ModerateMode, { ModeNav as ModeNavModerate } from "@/pages/ModerateMode";

// Big Four NCD Pages
import Home from "@/pages/Home";
import Diabetes from "@/pages/Diabetes";
import Hypertension from "@/pages/Hypertension";
import Lipids from "@/pages/Lipids";

// Anemia Page
import Anemia from "@/pages/Anemia";

// Big Four — Diabetes sub-pages
import DiabetesAssessment from "@/pages/diabetes/DiabetesAssessment";
import DiabetesOverview from "@/pages/diabetes/DiabetesOverview";
import DiabetesTab from "@/pages/diabetes/DiabetesTab";
import DiabetesTreatment from "@/pages/diabetes/DiabetesTreatment";
import InsulinGuide from "@/pages/diabetes/InsulinGuide";

// Big Four — Hypertension sub-pages
import HypertensionAssessment from "@/pages/hypertension/HypertensionAssessment";
import HypertensionMedicationGuide from "@/pages/hypertension/HypertensionMedicationGuide";
import HypertensionOverview from "@/pages/hypertension/HypertensionOverview";
import HypertensionTab from "@/pages/hypertension/HypertensionTab";
import HypertensionTreatment from "@/pages/hypertension/HypertensionTreatment";
import HypertensionClinicalCards from "@/pages/hypertension/HypertensionClinicalCards";

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
import RespiratoryPage from "@/pages/Respiratory";
import RespiratorySimple from "@/pages/RespiratorySimple";
import RespiratoryModerate from "@/pages/RespiratoryModerate";
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
          {/* Mode Selector — landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/index" element={<LandingPage />} />
          <Route path="/simple" element={<SimpleMode />} />
          <Route path="/moderate" element={<ModerateMode />} />
          <Route path="/hard" element={<Navigate to="/home" replace />} />

          {/* Full-screen routes — no sidebar */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/app" element={<AssessmentGrid />} />

          {/* Diabetes Buddy routes with sidebar */}
          <Route path="/db/*" element={<SidebarProvider><DiabetesBuddyLayout /></SidebarProvider>} />

          {/* Hard Mode (full app) — all under /home or direct paths */}
          <Route path="/home" element={<><TabNavigation /><Home /></>} />
          <Route path="/diabetes" element={<><TabNavigation /><Diabetes /></>} />
          <Route path="/hypertension" element={<><TabNavigation /><Hypertension /></>} />
          <Route path="/lipids" element={<><TabNavigation /><Lipids /></>} />
          <Route path="/anemia" element={<><TabNavigation /><Anemia /></>} />
          <Route path="/diabetes/assessment" element={<><TabNavigation /><DiabetesAssessment /></>} />
          <Route path="/diabetes/overview" element={<><TabNavigation /><DiabetesOverview /></>} />
          <Route path="/diabetes/tab" element={<><TabNavigation /><DiabetesTab /></>} />
          <Route path="/diabetes/treatment" element={<><TabNavigation /><DiabetesTreatment /></>} />
          <Route path="/diabetes/insulin-guide" element={<><TabNavigation /><InsulinGuide /></>} />
          <Route path="/hypertension/assessment" element={<><TabNavigation /><HypertensionAssessment /></>} />
          <Route path="/hypertension/medication-guide" element={<><TabNavigation /><HypertensionMedicationGuide /></>} />
          <Route path="/hypertension/overview" element={<><TabNavigation /><HypertensionOverview /></>} />
          <Route path="/hypertension/tab" element={<><TabNavigation /><HypertensionTab /></>} />
          <Route path="/hypertension/treatment" element={<><TabNavigation /><HypertensionTreatment /></>} />
          <Route path="/hypertension/clinical-cards" element={<><TabNavigation /><HypertensionClinicalCards /></>} />
          <Route path="/lipids/assessment" element={<><TabNavigation /><LipidsAssessment /></>} />
          <Route path="/lipids/overview" element={<><TabNavigation /><LipidsOverview /></>} />
          <Route path="/lipids/tab" element={<><TabNavigation /><LipidsTab /></>} />
          <Route path="/lipids/treatment" element={<><TabNavigation /><LipidsTreatment /></>} />
          <Route path="/insulin-titration" element={<><TabNavigation /><InsulinTitrationCalc /></>} />
          <Route path="/sliding-scale" element={<><TabNavigation /><SlidingScaleInsulinCalc /></>} />
          <Route path="/hypo-risk" element={<><TabNavigation /><HypoRiskCalculatorCalc /></>} />
          <Route path="/renal-dosing" element={<><TabNavigation /><RenalDoseAdjustmentCalc /></>} />
          <Route path="/respiratory/simple" element={<><ModeNavSimple /><RespiratorySimple /></>} />
          <Route path="/respiratory/moderate" element={<><ModeNavModerate /><RespiratoryModerate /></>} />
          <Route path="/respiratory" element={<><TabNavigation /><RespiratoryPage /></>} />
          <Route path="/diabetes/medication-algorithm" element={<><TabNavigation /><DiabetesMedicationAlgorithmCalc /></>} />
          <Route path="/lipid-panel" element={<><TabNavigation /><LipidPanelCalc /></>} />
          <Route path="/ascvd-risk" element={<><TabNavigation /><AscvdEmrCalc /></>} />
          <Route path="/gfr-calculator" element={<><TabNavigation /><GfrCalculatorCalc /></>} />
          <Route path="/drug-interactions" element={<><TabNavigation /><DrugInteractionCheckerCalc /></>} />
          <Route path="/htn/treatment-algorithm" element={<><TabNavigation /><AntihypertensiveTreatmentAlgorithmCalc /></>} />
          <Route path="/htn/potency-table" element={<><TabNavigation /><AntihypertensivePotencyTableCalc /></>} />
          <Route path="/obesity/bmi-calculator" element={<><TabNavigation /><BmiCalculatorCalc /></>} />
          <Route path="/obesity/waist-height-ratio" element={<><TabNavigation /><WaistHeightRatioCalc /></>} />
          <Route path="/obesity/glp1-algorithm" element={<><TabNavigation /><GLP1ObesityAlgorithmCalc /></>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
