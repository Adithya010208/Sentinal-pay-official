import DashboardLayout from "@/components/DashboardLayout";
import { AlertTriangle, ShieldAlert, Eye, Ban } from "lucide-react";

const FraudAlertsPage = () => {
  const alerts = [
    { id: 1, type: "Device Switch", desc: "New device detected for user ID 4821. High-value transfer of ₹45,000.", severity: "high", time: "2 min ago", action: "OTP Sent" },
    { id: 2, type: "VPN Detected", desc: "Transaction attempted from masked IP via VPN proxy.", severity: "medium", time: "5 min ago", action: "Flagged" },
    { id: 3, type: "Impossible Travel", desc: "Login from Chennai, then Delhi within 3 minutes.", severity: "critical", time: "8 min ago", action: "Blocked" },
    { id: 4, type: "Rapid Transactions", desc: "12 transactions in 30 seconds from single account.", severity: "critical", time: "12 min ago", action: "Blocked" },
    { id: 5, type: "Dormant Account", desc: "Account inactive for 120 days, sudden ₹25,000 transfer.", severity: "high", time: "18 min ago", action: "OTP Sent" },
    { id: 6, type: "Amount Anomaly", desc: "₹75,000 transfer when average is ₹500.", severity: "medium", time: "25 min ago", action: "Flagged" },
  ];

  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const highCount = alerts.filter(a => a.severity === "high").length;
  const mediumCount = alerts.filter(a => a.severity === "medium").length;

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-danger" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Fraud Alerts</h1>
              <p className="text-sm text-muted-foreground">Real-time fraud detection alerts</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card border-l-4 border-l-danger">
            <div className="flex items-center gap-2 mb-1">
              <Ban className="w-4 h-4 text-danger" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Critical</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{criticalCount}</p>
          </div>
          <div className="stat-card border-l-4 border-l-warning">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">High</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{highCount}</p>
          </div>
          <div className="stat-card border-l-4 border-l-primary">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Medium</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{mediumCount}</p>
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className={`stat-card flex items-start gap-4 border-l-4 transition-all hover:shadow-md ${
              a.severity === "critical" ? "border-l-danger" : a.severity === "high" ? "border-l-warning" : "border-l-primary"
            }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                a.severity === "critical" ? "bg-danger/10" : a.severity === "high" ? "bg-warning/10" : "bg-primary/10"
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  a.severity === "critical" ? "text-danger" : a.severity === "high" ? "text-warning" : "text-primary"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-foreground">{a.type}</h4>
                  <span className={`status-badge text-[10px] ${
                    a.severity === "critical" ? "status-down" : a.severity === "high" ? "status-latency" : "status-operational"
                  }`}>{a.severity.toUpperCase()}</span>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{a.action}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FraudAlertsPage;
