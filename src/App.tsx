import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import PatientInput from "./pages/PatientInput";
import FoodDatabase from "./pages/FoodDatabase";
import PlateMethod from "./pages/PlateMethod";
import MedOptimizer from "./pages/MedOptimizer";
import DietPlanPage from "./pages/DietPlanPage";
import Progress from "./pages/Progress";
import SummaryPage from "./pages/SummaryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
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
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/patient" element={<PatientInput />} />
                  <Route path="/foods" element={<FoodDatabase />} />
                  <Route path="/plate" element={<PlateMethod />} />
                  <Route path="/medications" element={<MedOptimizer />} />
                  <Route path="/diet-plan" element={<DietPlanPage />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/summary" element={<SummaryPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
