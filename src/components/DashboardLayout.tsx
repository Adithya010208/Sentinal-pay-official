import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, AlertTriangle, BarChart3, Zap, FileText, LogOut, Send, Mail, Instagram } from "lucide-react";
import securepayLogo from "@/assets/securepay-logo.png";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { path: "/home", label: "Dashboard", icon: LayoutDashboard },
  { path: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { path: "/fraud-alerts", label: "Fraud Alerts", icon: AlertTriangle },
  { path: "/risk-analytics", label: "Risk Analytics", icon: BarChart3 },
  { path: "/simulator", label: "Simulator", icon: Zap },
  { path: "/system-logs", label: "System Logs", icon: FileText },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="nav-bar sticky top-0 z-50 border-b border-nav-foreground/10">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/home")}>
              <img src={securepayLogo} alt="SecurePay" className="h-7 object-contain" />
              <span className="text-xs text-nav-foreground/50 ml-1">v1.0</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <button key={item.path} onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "text-nav-foreground/70 hover:text-nav-foreground hover:bg-nav-foreground/5"
                    }`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/pay")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
              <Send className="w-4 h-4" />
              Send Money
            </button>
            <button onClick={() => { logout(); navigate("/"); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-nav-foreground/60 hover:text-nav-foreground hover:bg-nav-foreground/5 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="p-6 max-w-[1440px] mx-auto">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src={securepayLogo} alt="SecurePay" className="h-6 object-contain" />
              <span className="text-xs text-muted-foreground">v1.0</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="mailto:securepay@gmail.com" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" /> securepay@gmail.com
              </a>
              <a href="#" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
              <a href="#" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </a>
              <a href="#" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </a>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SecurePay. All rights reserved. Predictive Payment Security Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
