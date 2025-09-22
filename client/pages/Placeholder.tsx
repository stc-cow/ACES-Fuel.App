import Header from "@/components/layout/Header";
import { AppShell } from "@/components/layout/AppSidebar";
import PlaceholderPage from "@/components/layout/PlaceholderPage";
import { useLocation } from "react-router-dom";

const TITLES: Record<string, string> = {
  "/users": "Users & authorization",
  "/missions": "Missions",
  "/employees": "Employees",
  "/sites": "Sites",
  "/generators": "Generators",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export default function Placeholder() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || pathname.replace("/", "");
  return (
    <AppShell>
      <Header />
      <div className="px-4 pb-10 pt-6">
        <PlaceholderPage title={title} />
      </div>
    </AppShell>
  );
}
