import {
  LayoutDashboard, User, UtensilsCrossed, Circle, Pill, CalendarDays, TrendingUp, FileText, Syringe, ShieldAlert, FlaskConical,
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
  { title: "Plate Method", url: "/plate", icon: Circle },
  { title: "Medications", url: "/medications", icon: Pill },
  { title: "Insulin Titration", url: "/insulin-titration", icon: Syringe },
  { title: "Hypo Risk Score", url: "/hypo-risk", icon: ShieldAlert },
  { title: "Renal Dosing", url: "/renal-dosing", icon: Kidney },
  { title: "Diet Plan", url: "/diet-plan", icon: CalendarDays },
  { title: "Progress", url: "/progress", icon: TrendingUp },
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
