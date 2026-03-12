import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Filter } from "lucide-react";
import { useState } from "react";

const allLogs = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  timestamp: new Date(Date.now() - i * 60000 * Math.random() * 10).toISOString(),
  level: ["INFO", "INFO", "WARN", "INFO", "ERROR"][Math.floor(Math.random() * 5)] as string,
  engine: ["GeoEngine", "VelocityEngine", "DeviceEngine", "AmountEngine", "NetworkEngine", "BehaviorEngine"][Math.floor(Math.random() * 6)],
  message: [
    "Transaction evaluated. Risk score: 12. Decision: APPROVE",
    "Step-up authentication triggered. OTP sent.",
    "High latency detected on bank API. Response: 650ms",
    "Transaction blocked. Risk score: 82. Reason: Impossible travel",
    "New device fingerprint registered for user 4821",
    "VPN/proxy detected. Adding network risk penalty.",
    "Hash chain integrity verified. Ledger intact.",
    "Daily limit exceeded. Transaction flagged.",
  ][Math.floor(Math.random() * 8)],
  hash: "0x" + Math.random().toString(16).substring(2, 14),
}));

const SystemLogsPage = () => {
  const [filter, setFilter] = useState<string>("ALL");
  const logs = filter === "ALL" ? allLogs : allLogs.filter(l => l.level === filter);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">System Logs</h1>
              <p className="text-sm text-muted-foreground">Immutable ledger of all engine decisions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {["ALL", "INFO", "WARN", "ERROR"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="stat-card overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border">
                {["#", "Timestamp", "Level", "Engine", "Message", "Hash"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-muted-foreground font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4 text-muted-foreground">{log.id}</td>
                  <td className="py-2.5 px-4 text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-2.5 px-4">
                    <span className={`status-badge text-[10px] ${
                      log.level === "ERROR" ? "status-down" : log.level === "WARN" ? "status-latency" : "status-operational"
                    }`}>{log.level}</span>
                  </td>
                  <td className="py-2.5 px-4 text-primary font-medium">{log.engine}</td>
                  <td className="py-2.5 px-4 text-foreground max-w-xs truncate">{log.message}</td>
                  <td className="py-2.5 px-4 text-muted-foreground/60">{log.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemLogsPage;
