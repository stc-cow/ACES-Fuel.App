import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Gauge,
  Users,
  Route as RouteIcon,
  UserCog,
  Building2,
  Factory,
  FileBarChart2,
  Bell,
  Settings,
  ChevronDown,
} from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

function AppSidebar() {
  const [pathname, setPathname] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "/",
  );

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const isActive = (p: string) => pathname === p;
  const [openUsers, setOpenUsers] = useState(pathname.startsWith("/users"));
  const [openEmployees, setOpenEmployees] = useState(
    pathname.startsWith("/employees"),
  );
  const [openSettings, setOpenSettings] = useState(
    pathname.startsWith("/settings"),
  );
  useEffect(() => {
    if (pathname.startsWith("/users")) setOpenUsers(true);
    if (pathname.startsWith("/employees")) setOpenEmployees(true);
    if (pathname.startsWith("/settings")) setOpenSettings(true);
  }, [pathname]);

  return (
    <Sidebar
      className="bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]"
      collapsible="icon"
    >
      <SidebarHeader className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1.5 rounded-full bg-primary" />
          <span className="text-lg font-extrabold tracking-wide">
            ACES Fuel
          </span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")}>
                  <Link to="/" className="flex items-center gap-2">
                    <Gauge />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/users")}>
                  <Link to="/users" className="flex items-center gap-2">
                    <Users />
                    <span>Users & Auth</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuAction
                  aria-label="Toggle Users submenu"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenUsers((v) => !v);
                  }}
                >
                  <ChevronDown
                    className={cn(
                      "transition-transform",
                      openUsers ? "rotate-180" : "rotate-0",
                    )}
                  />
                </SidebarMenuAction>
                <SidebarMenuSub className={cn(!openUsers && "hidden")}>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/users/admins")}
                    >
                      <Link to="/users/admins">Admin Users</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/users/authorizations")}
                    >
                      <Link to="/users/authorizations">Authorizations</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/missions")}>
                  <Link to="/missions" className="flex items-center gap-2">
                    <RouteIcon />
                    <span>Missions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/employees")}>
                  <Link to="/employees" className="flex items-center gap-2">
                    <UserCog />
                    <span>Employees</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuAction
                  aria-label="Toggle Employees submenu"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenEmployees((v) => !v);
                  }}
                >
                  <ChevronDown
                    className={cn(
                      "transition-transform",
                      openEmployees ? "rotate-180" : "rotate-0",
                    )}
                  />
                </SidebarMenuAction>
                <SidebarMenuSub className={cn(!openEmployees && "hidden")}>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/employees/drivers")}
                    >
                      <Link to="/employees/drivers">Drivers</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/employees/technicians")}
                    >
                      <Link to="/employees/technicians">Technicians</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/sites")}>
                  <Link to="/sites" className="flex items-center gap-2">
                    <Building2 />
                    <span>Sites</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/generators")}>
                  <Link to="/generators" className="flex items-center gap-2">
                    <Factory />
                    <span>Generators</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/reports")}>
                  <Link to="/reports" className="flex items-center gap-2">
                    <FileBarChart2 />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/notifications")}
                >
                  <Link to="/notifications" className="flex items-center gap-2">
                    <Bell />
                    <span>Notifications</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/settings")}>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
