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
import { useI18n } from "@/i18n";
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

  const { t } = useI18n();

  return (
    <Sidebar
      className="bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]"
      collapsible="icon"
    >
      <SidebarHeader className="px-4 py-3">
        <div className="flex items-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fbd65b3cd7a86452e803a3d7dc7a3d048%2Fc70031ceb54e448ab66bd6627db55078?format=webp&width=800"
            alt="ACES"
            className="h-10 w-auto"
            loading="eager"
            decoding="async"
          />
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
                    <span>{t("dashboard")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/users")}>
                  <Link to="/users" className="flex items-center gap-2">
                    <Users />
                    <span>{t("usersAuth")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/missions")}>
                  <Link to="/missions" className="flex items-center gap-2">
                    <RouteIcon />
                    <span>{t("missions")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/employees")}>
                  <Link to="/employees" className="flex items-center gap-2">
                    <UserCog />
                    <span>{t("employees")}</span>
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
                      <Link to="/employees/drivers">{t("drivers")}</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/employees/technicians")}
                    >
                      <Link to="/employees/technicians">
                        {t("technicians")}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/sites")}>
                  <Link to="/sites" className="flex items-center gap-2">
                    <Building2 />
                    <span>{t("sites")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/generators")}>
                  <Link to="/generators" className="flex items-center gap-2">
                    <Factory />
                    <span>{t("generators")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/reports")}>
                  <Link to="/reports" className="flex items-center gap-2">
                    <FileBarChart2 />
                    <span>{t("reports")}</span>
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
                    <span>{t("notifications")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/settings")}>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings />
                    <span>{t("settings")}</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuAction
                  aria-label="Toggle Settings submenu"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenSettings((v) => !v);
                  }}
                >
                  <ChevronDown
                    className={cn(
                      "transition-transform",
                      openSettings ? "rotate-180" : "rotate-0",
                    )}
                  />
                </SidebarMenuAction>
                <SidebarMenuSub className={cn(!openSettings && "hidden")}>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/settings/general")}
                    >
                      <Link to="/settings/general">{t("settingsGeneral")}</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/settings/cities")}
                    >
                      <Link to="/settings/cities">{t("settingsCities")}</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/settings/zones")}
                    >
                      <Link to="/settings/zones">{t("settingsZones")}</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/settings/admin-log")}
                    >
                      <Link to="/settings/admin-log">
                        {t("settingsAdminLog")}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
