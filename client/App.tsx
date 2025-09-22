import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Placeholder from "./pages/Placeholder";
import Login from "./pages/Login";
import AdminUsersPage from "./pages/users/Admins";
import AuthorizationsPage from "./pages/users/Authorizations";
import MissionsPage from "./pages/missions/Missions";
import DriversPage from "./pages/employees/Drivers";
import TechniciansPage from "./pages/employees/Technicians";
import SitesPage from "./pages/sites/Sites";
import GeneratorsPage from "./pages/generators/Generators";
import ReportsPage from "./pages/reports/Reports";
import NotificationsPage from "./pages/notifications/Notifications";
import GeneralSettingsPage from "./pages/settings/General";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const isAuth = typeof window !== "undefined" && localStorage.getItem("auth.loggedIn") === "true";
  return isAuth ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/users" element={<Placeholder />} />
          <Route path="/users/admins" element={<AdminUsersPage />} />
          <Route
            path="/users/authorizations"
            element={<AuthorizationsPage />}
          />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/employees" element={<Placeholder />} />
          <Route path="/employees/drivers" element={<DriversPage />} />
          <Route path="/employees/technicians" element={<TechniciansPage />} />
          <Route path="/sites" element={<SitesPage />} />
          <Route path="/generators" element={<GeneratorsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<GeneralSettingsPage />} />
          <Route path="/settings/general" element={<GeneralSettingsPage />} />
          <Route path="/settings/cities" element={<Placeholder />} />
          <Route path="/settings/zones" element={<Placeholder />} />
          <Route path="/settings/admin-log" element={<Placeholder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Ensure we only create a single root; reuse across HMR reloads to avoid multiple createRoot warnings
const container = document.getElementById("root");
if (container) {
  // store root on window to persist across HMR reloads
  const anyWin = window as any;
  let root = anyWin.__REACT_APP_ROOT__;
  if (!root) {
    root = createRoot(container);
    anyWin.__REACT_APP_ROOT__ = root;
  }
  root.render(<App />);
}
