import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BankStatus, simulateBankStatus, generateDemoTransactions, Transaction } from "@/lib/bankData";
import { TrendingUp, CheckCircle, AlertTriangle, XCircle, Activity, Clock, RefreshCw, Server, Wifi, Globe } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import dashboardBg from "@/assets/dashboard-bg.png";

const HomePage = () => {
  const [bankStatuses, setBankStatuses] = useState<BankStatus[]>(simulateBankStatus());
  const [transactions] = useState<Transaction[]>(generateDemoTransactions());
  const [liveFeed, setLiveFeed] = useState<Transaction[]>(transactions.slice(0, 8));
  const [txnCount, setTxnCount] = useState(486);

  useEffect(() => {
    const interval = setInterval(() => {
      setBankStatuses(simulateBankStatus());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveFeed((prev) => {
        const newTxn: Transaction = {
          ...transactions[Math.floor(Math.random() * transactions.length)],
          id: "TXN" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          timestamp: new Date(),
        };
        return [newTxn, ...prev.slice(0, 7)];
      });
      setTxnCount((c) => c + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [transactions]);

  const stats = useMemo(() => {
    const approved = liveFeed.filter((t) => t.status === "approved").length;
    const otp = liveFeed.filter((t) => t.status === "otp").length;
    const quarantine = liveFeed.filter((t) => t.status === "quarantine").length;
    const blocked = liveFeed.filter((t) => t.status === "blocked").length;
    const avgRisk = Math.round(liveFeed.reduce((s, t) => s + t.riskScore, 0) / (liveFeed.length || 1));
    return { approved, otp, quarantine, blocked, avgRisk, total: liveFeed.length };
  }, [liveFeed]);

  const pieData = [
    { name: "Approved", value: stats.approved, color: "hsl(152, 60%, 45%)" },
    { name: "OTP", value: stats.otp, color: "hsl(38, 92%, 55%)" },
    { name: "Quarantined", value: stats.quarantine, color: "hsl(280, 80%, 65%)" },
    { name: "Blocked", value: stats.blocked, color: "hsl(0, 72%, 55%)" },
  ];

  const riskDistribution = [
    { range: "0-20", count: Math.floor(Math.random() * 300) + 100 },
    { range: "21-40", count: Math.floor(Math.random() * 40) + 10 },
    { range: "41-60", count: Math.floor(Math.random() * 20) + 5 },
    { range: "61-80", count: Math.floor(Math.random() * 10) + 2 },
    { range: "81-100", count: Math.floor(Math.random() * 5) + 1 },
  ];

  const operationalCount = bankStatuses.filter((b) => b.status === "operational").length;
  const latencyCount = bankStatuses.filter((b) => b.status === "high-latency").length;
  const downCount = bankStatuses.filter((b) => b.status === "down").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Hero Banner with Background */}
        <div className="relative rounded-2xl overflow-hidden">
          <img src={dashboardBg} alt="" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
          <div className="absolute inset-0 flex items-center px-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">Fraud Monitoring Dashboard</h1>
              <p className="text-sm text-primary-foreground/80 mt-1">Real-time UPI transaction fraud detection & bank server health</p>
              <div className="flex items-center gap-4 mt-4">
                <span className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground/90 bg-primary-foreground/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Server className="w-3.5 h-3.5" /> {operationalCount} Banks Online
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground/90 bg-primary-foreground/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Wifi className="w-3.5 h-3.5" /> {txnCount} Transactions Today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Server Status - TOP PRIORITY */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Bank Server Status</h2>
                <p className="text-xs text-muted-foreground">Real-time payment gateway health monitoring</p>
              </div>
            </div>
            <button onClick={() => setBankStatuses(simulateBankStatus())}
              className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {bankStatuses.map((bank) => (
              <BankStatusCard key={bank.id} bank={bank} />
            ))}
          </div>
        </div>

        {/* Bank Health Summary Bar */}
        <div className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">Bank Server Health Distribution</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex h-4 rounded-full overflow-hidden bg-muted">
              {operationalCount > 0 && (
                <div className="bg-success h-full transition-all duration-500" style={{ width: `${(operationalCount / bankStatuses.length) * 100}%` }} />
              )}
              {latencyCount > 0 && (
                <div className="bg-warning h-full transition-all duration-500" style={{ width: `${(latencyCount / bankStatuses.length) * 100}%` }} />
              )}
              {downCount > 0 && (
                <div className="bg-danger h-full transition-all duration-500" style={{ width: `${(downCount / bankStatuses.length) * 100}%` }} />
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> {operationalCount} OK</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> {latencyCount} Slow</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-danger" /> {downCount} Down</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total TXNs" value={txnCount} icon={TrendingUp} />
          <StatCard label="Approved" value={stats.approved} sub={`${Math.round((stats.approved / (stats.total || 1)) * 100)}%`} icon={CheckCircle} accent="success" />
          <StatCard label="Quarantined" value={stats.quarantine} sub={`${Math.round((stats.quarantine / (stats.total || 1)) * 100)}%`} icon={AlertTriangle} accent="purple" />
          <StatCard label="Blocked" value={stats.blocked} sub={`${Math.round((stats.blocked / (stats.total || 1)) * 100)}%`} icon={XCircle} accent="danger" />
          <StatCard label="Avg Risk" value={stats.avgRisk} sub="Score (0-100)" icon={Activity} />
          <StatCard label="Avg Latency" value="0.03ms" sub="Processing time" icon={Clock} />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Feed */}
          <div className="lg:col-span-2 stat-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Live Transaction Feed</h2>
              <span className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse-live" />
                LIVE
              </span>
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {liveFeed.map((txn, i) => (
                <div key={txn.id + i} className="flex items-center justify-between py-2.5 px-4 rounded-lg hover:bg-muted/50 transition-colors animate-slide-up border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">{txn.id}</span>
                    <span className={`status-badge ${txn.status === "approved" ? "status-operational" : txn.status === "quarantine" ? "status-quarantine animate-pulse" : txn.status === "otp" ? "status-latency" : "status-down"}`}>
                      {txn.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${txn.riskScore > 50 ? "text-danger" : txn.riskScore > 20 ? "text-warning" : "text-success"}`}>
                      Risk {txn.riskScore}
                    </span>
                    <p className="text-xs text-muted-foreground">0ms</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-6">
            <div className="stat-card">
              <h3 className="text-base font-semibold text-foreground mb-4">Decision Breakdown</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map((d) => (
                  <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <h3 className="text-base font-semibold text-foreground mb-4">Risk Score Distribution</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(152, 60%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Attack Simulations */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Attack Simulations</h2>
              <p className="text-xs text-muted-foreground">Quick-launch fraud scenario testing</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "📱", title: "Device Switch", desc: "New device with high-value transfer" },
              { icon: "💰", title: "Abnormal Amount", desc: "₹75,000 when average is ₹500" },
              { icon: "👤", title: "Account Takeover", desc: "New device, No KYC, High Amount" },
              { icon: "🔒", title: "VPN/Proxy Abuse", desc: "Multiple tries from masked IP" },
              { icon: "⚠️", title: "Daily Limit", desc: "User exceeds daily limit constraints" },
              { icon: "⏰", title: "Dormant Account", desc: "Inactive for >90 days, suddenly active" },
              { icon: "🔄", title: "Session Replay", desc: "Same session ID used by two users" },
              { icon: "❌", title: "Failed Attempts", desc: "7 failed attempts in a short timeframe" },
            ].map((sim) => (
              <div key={sim.title} className="stat-card group hover:border-primary/30 transition-all">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{sim.icon}</span>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{sim.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{sim.desc}</p>
                    <button className="mt-3 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-foreground">
                      Run Scenario
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; accent?: string;
}) => (
  <div className="stat-card group hover:border-primary/20 transition-all">
    <div className="flex items-center justify-between mb-2">
      <span className="metric-label">{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        accent === "success" ? "bg-success/10" : accent === "warning" ? "bg-warning/10" : accent === "danger" ? "bg-danger/10" : accent === "purple" ? "bg-purple-500/10" : "bg-primary/10"
      }`}>
        <Icon className={`w-4 h-4 ${accent === "success" ? "text-success" : accent === "warning" ? "text-warning" : accent === "danger" ? "text-danger" : accent === "purple" ? "text-purple-500" : "text-primary"}`} />
      </div>
    </div>
    <p className="metric-value">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const BankStatusCard = ({ bank }: { bank: BankStatus }) => (
  <div className={`stat-card transition-all ${
    bank.status === "down" ? "border-danger/30 bg-danger/[0.02]" : bank.status === "high-latency" ? "border-warning/30 bg-warning/[0.02]" : "hover:border-success/30"
  }`}>
    <div className="flex items-center gap-3 mb-3">
      <img src={bank.logo} alt={bank.shortName} className="w-10 h-10 rounded-lg object-contain bg-muted p-1.5" />
      <div>
        <p className="text-sm font-semibold text-foreground">{bank.shortName}</p>
        <p className="text-xs text-muted-foreground truncate max-w-[120px]">{bank.name}</p>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Status</span>
        <span className={`status-badge ${bank.status === "operational" ? "status-operational" : bank.status === "high-latency" ? "status-latency" : "status-down"}`}>
          {bank.status === "operational" ? "Operational" : bank.status === "high-latency" ? "High Latency" : "Down"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">API Response</span>
        <span className="text-xs font-mono font-semibold text-foreground">
          {bank.responseTime !== null ? `${bank.responseTime}ms` : "No Response"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">UPI Gateway</span>
        <span className={`text-xs font-semibold capitalize ${bank.upiGateway === "active" ? "text-success" : bank.upiGateway === "degraded" ? "text-warning" : "text-danger"}`}>
          {bank.upiGateway}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground/60 mt-1">
        Updated {bank.lastUpdated.toLocaleTimeString()}
      </p>
    </div>
  </div>
);

export default HomePage;
