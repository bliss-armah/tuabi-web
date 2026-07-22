import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { store } from "./shared/store";
import { useAuth } from "./shared/hooks/useAuth";
import Login from "./auth/Login";
import AcceptInvite from "./auth/AcceptInvite";
import OTPVerification from "./auth/OTPVerification";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import Dashboard from "./dashboard/Dashboard";
import Debtors from "./debtors/Debtors";
import DebtorDetail from "./debtors/DebtorDetail";
import Plans from "./subscription/Plans";
import Profile from "./profile/Profile";
import AccountSettings from "./profile/AccountSettings";
import ChangePassword from "./profile/ChangePassword";
import PrivacySecurity from "./profile/PrivacySecurity";
import HelpSupport from "./profile/HelpSupport";
import Notifications from "./notifications/Notifications";
import AdminDashboard from "./superadmin/AdminDashboard";
import AuditLog from "./superadmin/AuditLog";
import Team from "./workspace/Team";
import WorkspaceSettings from "./workspace/WorkspaceSettings";
import History from "./history/History";
import HistoryDetail from "./history/HistoryDetail";
import type { UserRole } from "./shared/types/auth";

import Layout from "./shared/components/Layout";
import { ThemeProvider } from "./shared/components/theme-provider";
import { TooltipProvider } from "./shared/components/ui/tooltip";
import { Toaster } from "./shared/components/ui/sonner";
import { toast } from "sonner";
import "./index.css";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Read the current role from the persisted session (no side effects).
const getStoredRole = (): UserRole | undefined => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").role as UserRole;
  } catch {
    return undefined;
  }
};

const isWorkspaceBillingExempt = (): boolean => {
  try {
    return !!JSON.parse(localStorage.getItem("user") || "{}").workspace
      ?.billingExempt;
  } catch {
    return false;
  }
};

const BillingRoute = ({ children }: { children: React.ReactNode }) => {
  if (isWorkspaceBillingExempt()) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Role gate — redirects to the caller's home if their role isn't allowed.
const RoleGuard = ({
  allowedRoles,
  children,
}: {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}) => {
  const role = getStoredRole();
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={role === "SUPER_ADMIN" ? "/admin" : "/"} replace />;
  }
  return <>{children}</>;
};

// Protected Layout - wraps protected routes with the shell + optional role gate
const ProtectedLayout = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) => {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={allowedRoles}>
        <Layout>{children}</Layout>
      </RoleGuard>
    </ProtectedRoute>
  );
};

// Home ("/") lands super admins on their console, everyone else on the dashboard.
const HomeRoute = () => {
  if (getStoredRole() === "SUPER_ADMIN")
    return <Navigate to="/admin" replace />;
  return <Dashboard />;
};

// Enhanced Notification Event Handler Component
const NotificationEventHandler = () => {
  useEffect(() => {
    const handleRefreshReminders = () => {
      window.dispatchEvent(new CustomEvent("reminders:refresh"));
    };

    const handleRefreshSubscription = () => {
      window.dispatchEvent(new CustomEvent("subscription:refresh"));
    };

    const handleRefreshPayments = () => {
      window.dispatchEvent(new CustomEvent("debtors:refresh"));
    };

    const handleRefreshDebtors = () => {
      window.dispatchEvent(new CustomEvent("debtors:refresh"));
    };

    // Handle SSE notifications with toast notifications
    const handleSSENotification = (event: any) => {
      const { type, data } = event.detail;

      // Show toast notification based on type
      const toastMessage =
        data.message || data.title || "New notification received";

      switch (type) {
        case "reminder":
          toast.info(`⏰ ${toastMessage}`, { duration: 5000 });
          break;
        case "payment":
          toast.success(`💰 ${toastMessage}`, { duration: 5000 });
          break;
        case "subscription":
          toast.info(`📊 ${toastMessage}`, { duration: 7000 });
          break;
        case "debtor":
          toast.info(`👤 ${toastMessage}`, { duration: 5000 });
          break;
        case "system":
          toast.warning(`⚠️ ${toastMessage}`, { duration: 10000 });
          break;
        default:
          toast.info(`🔔 ${toastMessage}`, { duration: 5000 });
      }
    };

    // Handle general notification events (from both FCM and SSE)
    const handleNotificationReceived = (event: any) => {
      const { type, source, data, timestamp } = event.detail;

      // For new notifications, dispatch notificationCreated event to update count
      if (source !== 'read' && source !== 'deleted') {
        window.dispatchEvent(
          new CustomEvent("notificationCreated", {
            detail: {
              id: data.id || data.reminderId || `${type}-${Date.now()}`,
              type,
              data,
              timestamp
            }
          })
        );
      }
    };

    // Add event listeners
    window.addEventListener("refreshReminders", handleRefreshReminders);
    window.addEventListener("refreshSubscription", handleRefreshSubscription);
    window.addEventListener("refreshPayments", handleRefreshPayments);
    window.addEventListener("refreshDebtors", handleRefreshDebtors);
    window.addEventListener("sseNotification", handleSSENotification);
    window.addEventListener("notificationReceived", handleNotificationReceived);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("refreshReminders", handleRefreshReminders);
      window.removeEventListener(
        "refreshSubscription",
        handleRefreshSubscription
      );
      window.removeEventListener("refreshPayments", handleRefreshPayments);
      window.removeEventListener("refreshDebtors", handleRefreshDebtors);
      window.removeEventListener("sseNotification", handleSSENotification);
      window.removeEventListener("notificationReceived", handleNotificationReceived);
    };
  }, []);

  return null; // This component doesn't render anything
};

function App() {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <TooltipProvider delayDuration={200}>
          <NotificationEventHandler />
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Navigate to="/login" replace />} />
                <Route path="/accept-invite" element={<AcceptInvite />} />
                <Route path="/otp-verification" element={<OTPVerification />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route
                  path="/"
                  element={
                    <ProtectedLayout>
                      <HomeRoute />
                    </ProtectedLayout>
                  }
                />

                {/* Super-admin platform console */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedLayout allowedRoles={["SUPER_ADMIN"]}>
                      <AdminDashboard />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/admin/audit"
                  element={
                    <ProtectedLayout allowedRoles={["SUPER_ADMIN"]}>
                      <AuditLog />
                    </ProtectedLayout>
                  }
                />

                {/* Workspace members (owner + keeper) */}
                <Route
                  path="/debtors"
                  element={
                    <ProtectedLayout allowedRoles={["USER", "ADMIN"]}>
                      <Debtors />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/debtors/:id"
                  element={
                    <ProtectedLayout allowedRoles={["USER", "ADMIN"]}>
                      <DebtorDetail />
                    </ProtectedLayout>
                  }
                />

                {/* Transaction history (workspace members) */}
                <Route
                  path="/history"
                  element={
                    <ProtectedLayout allowedRoles={["USER", "ADMIN"]}>
                      <History />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/history/:id"
                  element={
                    <ProtectedLayout allowedRoles={["USER", "ADMIN"]}>
                      <HistoryDetail />
                    </ProtectedLayout>
                  }
                />

                <Route
                  path="/notifications"
                  element={
                    <ProtectedLayout>
                      <Notifications />
                    </ProtectedLayout>
                  }
                />

                {/* Owner-only: billing, team, workspace settings */}
                <Route
                  path="/plans"
                  element={
                    <ProtectedLayout allowedRoles={["ADMIN"]}>
                      <BillingRoute>
                        <Plans />
                      </BillingRoute>
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/team"
                  element={
                    <ProtectedLayout allowedRoles={["ADMIN"]}>
                      <Team />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/workspace-settings"
                  element={
                    <ProtectedLayout allowedRoles={["ADMIN"]}>
                      <WorkspaceSettings />
                    </ProtectedLayout>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedLayout>
                      <Profile />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/profile/account-settings"
                  element={
                    <ProtectedLayout>
                      <AccountSettings />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/profile/change-password"
                  element={
                    <ProtectedLayout>
                      <ChangePassword />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/profile/privacy-security"
                  element={
                    <ProtectedLayout>
                      <PrivacySecurity />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/profile/help-support"
                  element={
                    <ProtectedLayout>
                      <HelpSupport />
                    </ProtectedLayout>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
