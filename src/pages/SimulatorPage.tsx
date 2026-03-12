import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { calculateRisk } from "@/lib/bankData";
import { Zap, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const scenarios = [
  { id: "device", title: "Device Switch", desc: "New device with high-value transfer", amount: 45000, bankStatus: "operational" as const, icon: "📱" },
  { id: "amount", title: "Abnormal Amount", desc: "₹75,000 when average is ₹500", amount: 75000, bankStatus: "operational" as const, icon: "💰" },
  { id: "takeover", title: "Account Takeover", desc: "New device, No KYC, High Amount", amount: 50000, bankStatus: "high-latency" as const, icon: "👤" },
  { id: "vpn", title: "VPN/Proxy Abuse", desc: "Multiple tries from masked IP", amount: 15000, bankStatus: "operational" as const, icon: "🔒" },
  { id: "limit", title: "Daily Limit", desc: "User exceeds daily limit constraints", amount: 100000, bankStatus: "operational" as const, icon: "⚠️" },
  { id: "dormant", title: "Dormant Account", desc: "Inactive for >90 days, suddenly active", amount: 25000, bankStatus: "high-latency" as const, icon: "⏰" },
  { id: "replay", title: "Session Replay", desc: "Same session ID used by two users", amount: 10000, bankStatus: "down" as const, icon: "🔄" },
  { id: "failed", title: "Failed Attempts", desc: "7 failed attempts in a short timeframe", amount: 8000, bankStatus: "down" as const, icon: "❌" },
];

const SimulatorPage = () => {
  const [result, setResult] = useState<{ scenario: string; analysis: ReturnType<typeof calculateRisk> } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const runScenario = (scenario: typeof scenarios[0]) => {
    const analysis = calculateRisk(scenario.amount, scenario.bankStatus);
    if (scenario.id === "takeover" || scenario.id === "replay") {
      analysis.fraudRiskScore = Math.min(100, analysis.fraudRiskScore + 35);
      analysis.decision = analysis.fraudRiskScore > 70 ? "block" : "otp";
    }
    if (scenario.id === "device") {
      analysis.deviceRisk = 30;
      analysis.fraudRiskScore = Math.min(100, analysis.fraudRiskScore + 20);
    }
    setActiveId(scenario.id);
    setResult({ scenario: scenario.title, analysis });
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attack Simulator</h1>
            <p className="text-sm text-muted-foreground">Test fraud detection engine with predefined attack scenarios</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((s) => (
            <div key={s.id} className={`stat-card cursor-pointer transition-all hover:shadow-md ${activeId === s.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/30"}`}
              onClick={() => runScenario(s)}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Zap className="w-3.5 h-3.5" /> Run Scenario
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {result && (
          <div className="stat-card max-w-xl animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Simulation Result: {result.scenario}</h3>
            </div>

            {/* Risk meter */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Risk Score</span>
                <span className={`text-lg font-bold ${result.analysis.fraudRiskScore <= 30 ? "text-success" : result.analysis.fraudRiskScore <= 70 ? "text-warning" : "text-danger"}`}>
                  {result.analysis.fraudRiskScore}/100
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${result.analysis.fraudRiskScore <= 30 ? "bg-success" : result.analysis.fraudRiskScore <= 70 ? "bg-warning" : "bg-danger"}`}
                  style={{ width: `${result.analysis.fraudRiskScore}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Failure Probability</p>
                <p className="text-lg font-bold text-foreground">{result.analysis.failureProbability}%</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Decision</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {result.analysis.decision === "approve" ? <CheckCircle className="w-4 h-4 text-success" /> :
                   result.analysis.decision === "otp" ? <AlertTriangle className="w-4 h-4 text-warning" /> :
                   <XCircle className="w-4 h-4 text-danger" />}
                  <span className={`text-lg font-bold uppercase ${result.analysis.decision === "approve" ? "text-success" : result.analysis.decision === "otp" ? "text-warning" : "text-danger"}`}>
                    {result.analysis.decision}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">{result.analysis.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SimulatorPage;
