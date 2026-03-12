import DashboardLayout from "@/components/DashboardLayout";
import { generateDemoTransactions } from "@/lib/bankData";
import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";
import { BarChart3, TrendingUp, ShieldCheck } from "lucide-react";

const RiskAnalyticsPage = () => {
  const [transactions] = useState(generateDemoTransactions());

  const riskDist = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    transactions.forEach((t) => {
      if (t.riskScore <= 20) buckets[0]++;
      else if (t.riskScore <= 40) buckets[1]++;
      else if (t.riskScore <= 60) buckets[2]++;
      else if (t.riskScore <= 80) buckets[3]++;
      else buckets[4]++;
    });
    return ["0-20", "21-40", "41-60", "61-80", "81-100"].map((r, i) => ({ range: r, count: buckets[i] }));
  }, [transactions]);

  const statusData = useMemo(() => {
    const s = { approved: 0, otp: 0, blocked: 0, pending: 0 };
    transactions.forEach((t) => s[t.status]++);
    return [
      { name: "Success", value: s.approved, color: "hsl(152, 60%, 45%)" },
      { name: "OTP", value: s.otp, color: "hsl(38, 92%, 55%)" },
      { name: "Blocked", value: s.blocked, color: "hsl(0, 72%, 55%)" },
    ];
  }, [transactions]);

  const failureReasons = [
    { reason: "Bank Server Down", count: 5 },
    { reason: "High Latency", count: 3 },
    { reason: "Fraud Detected", count: 2 },
    { reason: "Daily Limit", count: 1 },
    { reason: "Network Error", count: 4 },
  ];

  const totalApproved = statusData.find(s => s.name === "Success")?.value || 0;
  const totalBlocked = statusData.find(s => s.name === "Blocked")?.value || 0;

  const predictiveData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      historical: i <= 16 ? Math.floor(Math.random() * 20) + 5 : null,
      predicted: i >= 16 ? Math.floor(Math.random() * 50) + 30 + (i * 2) : null,
    }));
  }, []);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Risk Analytics</h1>
            <p className="text-sm text-muted-foreground">Transaction behavior analysis and risk insights</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Analyzed</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approved</span>
            </div>
            <p className="text-2xl font-bold text-success">{totalApproved}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-danger" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Blocked</span>
            </div>
            <p className="text-2xl font-bold text-danger">{totalBlocked}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="stat-card">
            <h3 className="text-base font-semibold text-foreground mb-4">Fraud Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={riskDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(215, 80%, 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="stat-card">
            <h3 className="text-base font-semibold text-foreground mb-4">Success vs Failure</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((d) => (
                <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}
                </span>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h3 className="text-base font-semibold text-foreground mb-4">Failure Reasons</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={failureReasons} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="reason" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(0, 72%, 55%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="stat-card md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Behavioral Threat Horizon (Predictive AI)</h3>
              <span className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-500/10 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse-live" />
                Active Prediction
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Real-time projection of emerging fraud vectors before they reach critical impact.</p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={predictiveData}>
                <defs>
                  <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(215, 80%, 48%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(215, 80%, 48%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="historical" stroke="hsl(215, 80%, 48%)" fillOpacity={1} fill="url(#colorHistorical)" name="Observed Threat Level" connectNulls />
                <Area type="monotone" dataKey="predicted" stroke="#a855f7" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicted)" name="Predicted Trajectory" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RiskAnalyticsPage;
