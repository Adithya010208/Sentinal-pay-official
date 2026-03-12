import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { generateDemoTransactions } from "@/lib/bankData";
import { ArrowLeftRight, Search } from "lucide-react";

const TransactionsPage = () => {
  const [transactions] = useState(generateDemoTransactions());
  const [search, setSearch] = useState("");

  const filtered = transactions.filter(t =>
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.recipient.toLowerCase().includes(search.toLowerCase()) ||
    t.bank.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Transaction History</h1>
              <p className="text-sm text-muted-foreground">All processed transactions with risk assessment</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..."
              className="pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none w-64" />
          </div>
        </div>

        <div className="stat-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Transaction ID", "Recipient", "Amount", "Bank", "Risk Score", "Status", "Time"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => (
                <tr key={txn.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-foreground">{txn.id}</td>
                  <td className="py-3 px-4 text-foreground font-medium">{txn.recipient}</td>
                  <td className="py-3 px-4 font-semibold text-foreground">₹{txn.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-muted-foreground">{txn.bank}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${txn.riskScore <= 30 ? "bg-success" : txn.riskScore <= 70 ? "bg-warning" : "bg-danger"}`}
                          style={{ width: `${txn.riskScore}%` }} />
                      </div>
                      <span className={`font-semibold text-xs ${txn.riskScore <= 30 ? "text-success" : txn.riskScore <= 70 ? "text-warning" : "text-danger"}`}>
                        {txn.riskScore}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`status-badge ${txn.status === "approved" ? "status-operational" : txn.status === "quarantine" ? "status-quarantine animate-pulse" : txn.status === "otp" ? "status-latency" : "status-down"}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{txn.timestamp.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransactionsPage;
