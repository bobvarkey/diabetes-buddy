import {
  LayoutDashboard, User, UtensilsCrossed, Pizza, Pill, CalendarDays, TrendingDown, FileText, Syringe, ShieldAlert, FlaskConical, HeartPulse, Bean, Droplet, BookOpen, TableProperties, Activity, BookMarked, TriangleAlert, ArrowLeftRight, MessageSquare,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Patient", url: "/patient", icon: User },
  { title: "Summary", url: "/summary", icon: FileText },
  { title: "Foods", url: "/foods", icon: UtensilsCrossed },
  { title: "Plate Method", url: "/plate", icon: Pizza },
  { title: "Medications", url: "/medications", icon: Pill },
  { title: "Insulin Titration", url: "/insulin-titration", icon: Syringe },
  { title: "Sliding Scale Insulin", url: "/sliding-scale", icon: TableProperties },
  { title: "GLP-1 Administration", url: "/glp1-administration", icon: Droplet },
  { title: "Prediabetes", url: "/prediabetes", icon: HeartPulse },
  { title: "Hypo Risk Score", url: "/hypo-risk", icon: ShieldAlert },
  { title: "Renal Dosing", url: "/renal-dosing", icon: FlaskConical },
  { title: "CKD Guideline", url: "/ckd-guideline", icon: Bean },
  { title: "Diet Plan", url: "/diet-plan", icon: CalendarDays },
  { title: "Progress", url: "/progress", icon: TrendingDown },
  { title: "Daily Management", url: "/daily-management", icon: BookOpen },
  { title: "Type 1 DM", url: "/type1-management", icon: Activity },
  { title: "Insulin Therapy", url: "/insulin-therapy", icon: BookMarked },
  { title: "T1D Pitfalls", url: "/type1-pitfalls", icon: TriangleAlert },
  { title: "T2D Transition", url: "/type2-transition", icon: ArrowLeftRight },
  { title: "Feedback & Tips", url: "/feedback", icon: MessageSquare },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">
            {!collapsed && (
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sidebar-primary flex items-center justify-center text-[10px] text-sidebar-primary-foreground font-bold">DM</span>
                Diabetes Med Optimizer
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
