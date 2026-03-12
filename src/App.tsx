import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import PayPage from "./pages/PayPage";
import TransactionsPage from "./pages/TransactionsPage";
import RiskAnalyticsPage from "./pages/RiskAnalyticsPage";
import FraudAlertsPage from "./pages/FraudAlertsPage";
import SimulatorPage from "./pages/SimulatorPage";
import SystemLogsPage from "./pages/SystemLogsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
    <Route path="/pay" element={<ProtectedRoute><PayPage /></ProtectedRoute>} />
    <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
    <Route path="/risk-analytics" element={<ProtectedRoute><RiskAnalyticsPage /></ProtectedRoute>} />
    <Route path="/fraud-alerts" element={<ProtectedRoute><FraudAlertsPage /></ProtectedRoute>} />
    <Route path="/simulator" element={<ProtectedRoute><SimulatorPage /></ProtectedRoute>} />
    <Route path="/system-logs" element={<ProtectedRoute><SystemLogsPage /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
