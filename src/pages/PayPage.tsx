import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { BankStatus, simulateBankStatus, calculateRisk, RiskAnalysis, generateTxnId, BANKS } from "@/lib/bankData";
import { Send, AlertTriangle, Shield, CheckCircle, XCircle, Lock, Delete, QrCode, Scan, Camera, Upload, ArrowLeft, RefreshCw, FileText, Check } from "lucide-react";
import { toast } from "sonner";
import upiLogo from "@/assets/upi-logo.png";
import paymentSuccessImg from "@/assets/payment-success.png";

type PayStep = "form" | "risk" | "upi-pin" | "biometric" | "processing" | "result" | "scratch" | "qr-scanner" | "qr-analysis";

interface QRPreset {
  id: string;
  name: string;
  upiId: string;
  amount: string;
  trustStatus: "trusted" | "suspicious" | "blocked" | "unverified";
  trustScore: number;
  message: string;
  merchantVerified: boolean;
  logs: string[];
}

const QR_PRESETS: QRPreset[] = [
  {
    id: "trusted",
    name: "Vellamal Education Trust",
    upiId: "vellamal@sbi",
    amount: "5000",
    trustStatus: "trusted",
    trustScore: 98,
    message: "Verified Trusted Merchant. Match found in official Central Education Trust Registry. PSP gateway digital signature verified.",
    merchantVerified: true,
    logs: [
      "[INFO] Decoding scanned QR payload...",
      "[SUCCESS] UPI URL syntax validated successfully.",
      "[INFO] Querying National Zero-Trust Merchant Index...",
      "[SUCCESS] Merchant verified: VELLAMAL EDUCATION TRUST",
      "[INFO] Checking PSP host signature reputation...",
      "[SUCCESS] Domain sbi.com verified. Certificate valid.",
      "[SUCCESS] Zero-Trust evaluation complete. Score: 98%. Safe source."
    ]
  },
  {
    id: "suspicious",
    name: "Vellamal Trust",
    upiId: "vella-finance@okicici",
    amount: "5000",
    trustStatus: "suspicious",
    trustScore: 42,
    message: "Spoofing Alert. The merchant name claims to be 'Vellamal Trust', but the payment destination is 'vella-finance@okicici'. This naming mismatch is a common phishing indicator.",
    merchantVerified: false,
    logs: [
      "[INFO] Decoding scanned QR payload...",
      "[SUCCESS] UPI URL syntax validated.",
      "[INFO] Querying National Zero-Trust Merchant Index...",
      "[WARN] Unregistered merchant. No certified trust record found.",
      "[ALERT] Flagged: QR name 'Vellamal Trust' mismatch with UPI ID PSP registration.",
      "[INFO] Assessing domain reputation for okicici...",
      "[WARN] Threat score: 42%. Spoofing pattern detected."
    ]
  },
  {
    id: "blocked",
    name: "SecurePay Rewards Office",
    upiId: "securepay-rewards-claim@central-psp",
    amount: "12500",
    trustStatus: "blocked",
    trustScore: 12,
    message: "Security Threat. This UPI ID is blacklisted on the global SecurePay Threat Registry for active phishing and fraud campaigns. Proceeding is disallowed.",
    merchantVerified: false,
    logs: [
      "[INFO] Decoding scanned QR payload...",
      "[SUCCESS] UPI URL syntax validated.",
      "[INFO] Querying National Zero-Trust Merchant Index...",
      "[CRITICAL] MATCH FOUND: Address is in the Global Threat Blocklist (ID: BL-4821)",
      "[ALERT] Severity level: Critical. Associated with phishing lottery scams.",
      "[CRITICAL] Zero-Trust evaluation complete. Score: 12%. Blocked."
    ]
  },
  {
    id: "unverified",
    name: "Adithya Kumar",
    upiId: "adithya.kumar@paytm",
    amount: "",
    trustStatus: "unverified",
    trustScore: 75,
    message: "Standard Peer-to-Peer account. No merchant registration details found. No suspicious history has been reported on this address.",
    merchantVerified: false,
    logs: [
      "[INFO] Decoding scanned QR payload...",
      "[SUCCESS] UPI URL syntax validated.",
      "[INFO] Querying National Zero-Trust Merchant Index...",
      "[INFO] P2P Node detected. Standard peer account.",
      "[INFO] Checking threat registry status...",
      "[SUCCESS] Clean record. No reports found.",
      "[SUCCESS] Verification complete. Score: 75%. P2P receiver."
    ]
  }
];

const PayPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<PayStep>("form");
  const [formType, setFormType] = useState<"manual" | "qr">("manual");
  const [recipient, setRecipient] = useState("");
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("sbi");
  const [bankStatuses, setBankStatuses] = useState<BankStatus[]>(simulateBankStatus());
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [upiPin, setUpiPin] = useState("");
  const [txnResult, setTxnResult] = useState<"success" | "failed">("success");
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [sessionRisk, setSessionRisk] = useState(12);
  const [scratchPrize] = useState(() => {
    const prizes = ["₹10 Cashback", "₹25 Cashback", "₹50 Cashback", "Better Luck Next Time", "₹5 Cashback", "₹100 Cashback"];
    return prizes[Math.floor(Math.random() * prizes.length)];
  });

  // Zero-Trust QR states
  const [selectedQr, setSelectedQr] = useState<QRPreset | null>(null);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qrBadgeInfo, setQrBadgeInfo] = useState<{ status: string; score: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setBankStatuses(simulateBankStatus()), 5000);
    return () => clearInterval(interval);
  }, []);

  // Zero-Trust QR Logs Printing animation
  useEffect(() => {
    if (isAnalyzing && selectedQr) {
      if (logIndex < selectedQr.logs.length) {
        const timeout = setTimeout(() => {
          setAnalysisLogs((prev) => [...prev, selectedQr.logs[logIndex]]);
          setLogIndex((idx) => idx + 1);
        }, 400);
        return () => clearTimeout(timeout);
      } else {
        setIsAnalyzing(false);
        if (selectedQr.trustStatus === "trusted") {
          toast.success("QR Trust Verified: Vellamal Education Trust");
        } else if (selectedQr.trustStatus === "suspicious") {
          toast.warning("Merchant Identity Mismatch Detected!");
        } else if (selectedQr.trustStatus === "blocked") {
          toast.error("Threat Detected: UPI address blacklisted!");
        }
      }
    }
  }, [isAnalyzing, selectedQr, logIndex]);

  const currentBank = bankStatuses.find((b) => b.id === selectedBank);
  const bankWarning = currentBank && currentBank.status === "down";

  const startQRAnalysis = (preset: QRPreset) => {
    setSelectedQr(preset);
    setAnalysisLogs([]);
    setLogIndex(0);
    setIsAnalyzing(true);
    setStep("qr-analysis");
  };

  const handleAnalyze = () => {
    if (!recipient || !upiId || !amount) return;
    const bank = bankStatuses.find((b) => b.id === selectedBank);
    const risk = calculateRisk(Number(amount), bank?.status || "operational");
    
    // Inject QR Specific analysis risk scores into general risk engine
    if (upiId === "vella-finance@okicici") {
      risk.fraudRiskScore = Math.max(risk.fraudRiskScore, 65);
      risk.decision = "quarantine";
      risk.recommendation = "Behavioral alert: High probability of impersonation spoofing. QR metadata mismatch. Proceeding requires biometric lock release.";
    } else if (upiId === "securepay-rewards-claim@central-psp") {
      risk.fraudRiskScore = 95;
      risk.decision = "block";
      risk.recommendation = "Zero-Trust Security Block: The destination UPI address is flagged on the global fraud registry. Transaction terminated.";
    }

    setRiskAnalysis(risk);
    setStep("risk");
  };

  const handleProceed = () => {
    if (riskAnalysis?.decision === "block") return;
    if (riskAnalysis?.decision === "quarantine") {
      setStep("biometric");
      return;
    }
    setStep("upi-pin");
  };

  const simulateHijack = () => {
    let risk = 12;
    const interval = setInterval(() => {
      risk += Math.floor(Math.random() * 15) + 5;
      if (risk >= 95) {
        risk = 98;
        clearInterval(interval);
      }
      setSessionRisk(risk);
    }, 300);
  };

  const handlePinKey = (digit: string) => {
    if (upiPin.length >= 6) return;
    const newPin = upiPin + digit;
    setUpiPin(newPin);
    if (newPin.length === 6) {
      setTimeout(() => {
        setStep("processing");
        setTimeout(() => {
          const success = Math.random() > (riskAnalysis?.failureProbability || 0) / 100;
          setTxnResult(success ? "success" : "failed");
          setStep("result");
          if (success) playSuccessSound();
        }, 2000);
      }, 500);
    }
  };

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.value = 0.15;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15 * (i + 1) + 0.3);
        osc.start(ctx.currentTime + 0.15 * i);
        osc.stop(ctx.currentTime + 0.15 * (i + 1) + 0.3);
      });
    } catch (_) {}
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto animate-fade-in">
        {/* Style block for QR camera laser scan animation */}
        <style>{`
          @keyframes scan-move {
            0% { top: 10%; }
            50% { top: 90%; }
            100% { top: 10%; }
          }
          .animate-scan {
            animation: scan-move 3s ease-in-out infinite;
          }
        `}</style>

        {/* Session Micro-Lock Gauge */}
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border box-shadow-sm mb-6">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${sessionRisk > 80 ? 'bg-danger/10' : 'bg-primary/10'}`}>
                <Shield className={`w-5 h-5 ${sessionRisk > 80 ? 'text-danger animate-pulse' : 'text-primary'}`} />
             </div>
             <div>
               <p className="text-xs font-semibold text-foreground tracking-wide uppercase">Live Session Security</p>
               <div className="flex items-center gap-2 mt-1.5">
                 <div className="w-24 sm:w-32 h-2 bg-background rounded-full overflow-hidden border border-border/50">
                   <div className={`h-full transition-all duration-300 ${sessionRisk > 80 ? 'bg-danger' : sessionRisk > 40 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${sessionRisk}%` }} />
                 </div>
                 <span className={`text-xs font-mono font-bold ${sessionRisk > 80 ? 'text-danger' : 'text-muted-foreground'}`}>{sessionRisk}% Risk</span>
               </div>
             </div>
          </div>
          <button onClick={simulateHijack} disabled={sessionRisk > 80} className="text-xs font-medium bg-background border border-border px-3 py-2 rounded-lg hover:bg-muted focus:ring-2 focus:ring-ring transition-all text-muted-foreground disabled:opacity-50 flex items-center gap-1.5">
            <span>🤖</span> Bot Hijack
          </button>
        </div>

        {step === "form" && (
          <div className="stat-card space-y-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Send Money</h2>
              </div>
              <span className="text-xs text-muted-foreground font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Zero-Trust Active
              </span>
            </div>

            {/* Toggle form entry mode */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setFormType("manual")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  formType === "manual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Manual Transfer
              </button>
              <button
                onClick={() => {
                  setFormType("qr");
                  setStep("qr-scanner");
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  formType === "qr" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode className="w-4 h-4" /> Scan / Upload QR
              </button>
            </div>

            {formType === "qr" && qrBadgeInfo && (
              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                qrBadgeInfo.status === "trusted" ? "bg-success/5 border-success/20 text-success" :
                qrBadgeInfo.status === "unverified" ? "bg-muted border-border text-muted-foreground" :
                "bg-warning/5 border-warning/20 text-warning"
              }`}>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>QR Verifier: <strong className="capitalize">{qrBadgeInfo.status}</strong> Partner (Score: {qrBadgeInfo.score}%)</span>
                </div>
                <button
                  onClick={() => {
                    setStep("qr-scanner");
                  }}
                  className="font-bold underline hover:opacity-85"
                >
                  Rescan
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Recipient Name</label>
                <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Rahul"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">UPI ID</label>
                <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="e.g. rahul@upi"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Amount (₹)</label>
                <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 5000" type="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Select Bank</label>
                <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none">
                  {BANKS.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {bankWarning && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-danger/10 border border-danger/20">
                  <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-danger">Payment Risk Alert</p>
                    <p className="text-xs text-danger/80 mt-1">
                      {currentBank?.name} server is currently unavailable. Try again later or choose another bank.
                    </p>
                  </div>
                </div>
              )}

              <button onClick={handleAnalyze} disabled={!recipient || !upiId || !amount || sessionRisk > 80}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${sessionRisk > 80 ? "bg-danger text-danger-foreground opacity-90 cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"}`}>
                {sessionRisk > 80 ? <><Lock className="w-4 h-4"/> Session Locked - High Risk</> : "Analyze & Pay"}
              </button>
            </div>
          </div>
        )}

        {/* QR Code Scanner Step */}
        {step === "qr-scanner" && (
          <div className="stat-card space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setStep("form")} className="hover:bg-muted p-1.5 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h2 className="text-xl font-bold text-foreground">Zero-Trust QR Scanner</h2>
            </div>

            {/* Pulsing simulated camera scanner */}
            <div className="relative w-64 h-64 mx-auto border border-border bg-black/5 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br" />

              {/* Glowing animated scanner laser line */}
              <div className="absolute left-0 right-0 h-0.5 bg-primary/80 shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-scan" />
              
              {/* Overlay camera Grid lines */}
              <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              <div className="text-center p-4 relative z-10 space-y-2 select-none">
                <Camera className="w-10 h-10 text-primary/40 mx-auto animate-pulse" />
                <span className="text-xs text-muted-foreground font-mono block">Align QR inside frame</span>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Simulation Targets (Click to scan)</p>
              <div className="grid grid-cols-2 gap-2.5">
                {QR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => startQRAnalysis(preset)}
                    className="flex flex-col items-start p-3 bg-muted/40 border border-border hover:border-primary/40 hover:bg-muted/70 rounded-xl text-left transition-all"
                  >
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      {preset.trustStatus === "trusted" ? "✅" : preset.trustStatus === "suspicious" ? "⚠️" : preset.trustStatus === "blocked" ? "🚫" : "👤"}
                      {preset.name.split(" ")[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate w-full font-mono mt-0.5">{preset.upiId}</span>
                    <div className="flex items-center justify-between w-full mt-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        preset.trustStatus === "trusted" ? "bg-success/15 text-success" :
                        preset.trustStatus === "suspicious" ? "bg-warning/15 text-warning" :
                        preset.trustStatus === "blocked" ? "bg-danger/15 text-danger" : "bg-zinc-200 text-zinc-700"
                      }`}>
                        {preset.trustStatus.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-foreground/80">{preset.trustScore}% Score</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Zone */}
            <div className="relative border border-dashed border-border hover:border-primary/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-muted/10 hover:bg-muted/20">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const randomPreset = QR_PRESETS[Math.floor(Math.random() * QR_PRESETS.length)];
                    toast.info(`Scanning image: ${e.target.files[0].name}`);
                    startQRAnalysis({
                      ...randomPreset,
                      name: "Scanned File QR",
                    });
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">Upload QR Code Image</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Simulate scanning by importing QR files</p>
            </div>

            <button onClick={() => setStep("form")}
              className="w-full py-2.5 border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              Cancel & Manual Entry
            </button>
          </div>
        )}

        {/* QR Code Analysis Step */}
        {step === "qr-analysis" && selectedQr && (
          <div className="stat-card space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 relative">
                {isAnalyzing ? (
                  <span className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
                <QrCode className="w-5 h-5 absolute" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Zero-Trust QR Evaluation</h3>
                <p className="text-xs text-muted-foreground">Evaluating integrity and registration metrics</p>
              </div>
            </div>

            {/* Analysis Logs Console */}
            <div className="bg-zinc-950 text-emerald-400 p-4 rounded-xl font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto border border-zinc-800 shadow-inner">
              {analysisLogs.map((log, index) => (
                <div key={index} className="animate-fade-in tracking-wide leading-relaxed">
                  {log.startsWith("[CRITICAL]") ? (
                    <span className="text-red-500 font-bold">{log}</span>
                  ) : log.startsWith("[WARN]") || log.startsWith("[ALERT]") ? (
                    <span className="text-amber-500 font-semibold">{log}</span>
                  ) : log.startsWith("[SUCCESS]") ? (
                    <span className="text-emerald-400 font-semibold">{log}</span>
                  ) : (
                    <span className="text-zinc-400">{log}</span>
                  )}
                </div>
              ))}
              {isAnalyzing && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block" />
                  <span className="text-[10px] text-zinc-500 italic">processing...</span>
                </div>
              )}
            </div>

            {/* Evaluation Results (only show after logs finish printing) */}
            {!isAnalyzing && (
              <div className="animate-fade-in space-y-4 pt-2">
                {/* Shield score indicator */}
                <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border/80">
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-border" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className={`transition-all duration-1000 ${
                        selectedQr.trustStatus === "trusted" ? "text-success" :
                        selectedQr.trustStatus === "suspicious" ? "text-warning" :
                        selectedQr.trustStatus === "blocked" ? "text-danger" : "text-slate-400"
                      }`} strokeWidth="3" strokeDasharray={`${selectedQr.trustScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span className="absolute text-sm font-bold font-mono text-foreground">{selectedQr.trustScore}%</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      {selectedQr.trustStatus === "trusted" && <><span className="text-success">✔</span> Verified Trusted Partner</>}
                      {selectedQr.trustStatus === "suspicious" && <><span className="text-warning">⚠</span> Security Warning</>}
                      {selectedQr.trustStatus === "blocked" && <><span className="text-danger">🚫</span> High Risk Blocked</>}
                      {selectedQr.trustStatus === "unverified" && <><span className="text-muted-foreground">ℹ</span> Unverified P2P Receiver</>}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{selectedQr.message}</p>
                  </div>
                </div>

                {/* Receiver Info */}
                <div className="bg-muted/40 rounded-xl p-3.5 space-y-2 border border-border/50 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Merchant Target:</span> <span className="font-semibold text-foreground">{selectedQr.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Payment Handle:</span> <span className="font-mono font-semibold text-foreground">{selectedQr.upiId}</span></div>
                  {selectedQr.amount && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Requested Amount:</span> <span className="font-semibold text-foreground">₹{Number(selectedQr.amount).toLocaleString()}</span></div>
                  )}
                </div>

                {/* Decisions and Actions */}
                <div className="flex gap-3 pt-2">
                  {selectedQr.trustStatus === "blocked" ? (
                    <>
                      <button onClick={() => {
                        setStep("form");
                        setFormType("manual");
                      }} className="flex-1 py-2.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-all">
                        Back to Safety
                      </button>
                      <button onClick={() => {
                        toast.success("Fraudulent QR details reported to Central Cyber Cell Registry.");
                      }} className="flex-1 py-2.5 bg-danger text-danger-foreground text-xs font-semibold rounded-lg hover:bg-danger/90 transition-all">
                        Report Fraud Address
                      </button>
                    </>
                  ) : selectedQr.trustStatus === "suspicious" ? (
                    <>
                      <button onClick={() => {
                        setStep("form");
                        setFormType("manual");
                      }} className="flex-1 py-2.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-all">
                        Cancel Payment
                      </button>
                      <button onClick={() => {
                        // Bypass directly to biometric release
                        setRecipient(selectedQr.name);
                        setUpiId(selectedQr.upiId);
                        setAmount(selectedQr.amount);
                        setQrBadgeInfo({ status: "suspicious", score: selectedQr.trustScore });
                        const bank = bankStatuses.find((b) => b.id === selectedBank);
                        setRiskAnalysis({
                          fraudRiskScore: 68,
                          failureProbability: 10,
                          networkStrength: "strong",
                          bankServerStatus: bank?.status || "operational",
                          geoRisk: 10,
                          velocityRisk: 5,
                          deviceRisk: 5,
                          amountRisk: 10,
                          networkRisk: 5,
                          behaviorRisk: 30,
                          decision: "quarantine",
                          recommendation: "Spoofing warning bypass: requires user biometric authentication confirmation."
                        });
                        setStep("biometric");
                      }} className="flex-1 py-2.5 bg-warning text-warning-foreground text-xs font-bold rounded-lg hover:bg-warning/90 transition-all flex items-center justify-center gap-1.5 animate-pulse">
                        <Lock className="w-3.5 h-3.5" /> Force Biometric Release
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setStep("qr-scanner")}
                        className="flex-1 py-2.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-all">
                        Rescan
                      </button>
                      <button onClick={() => {
                        setRecipient(selectedQr.name);
                        setUpiId(selectedQr.upiId);
                        if (selectedQr.amount) {
                          setAmount(selectedQr.amount);
                        }
                        setQrBadgeInfo({ status: selectedQr.trustStatus, score: selectedQr.trustScore });
                        setFormType("qr");
                        setStep("form");
                      }} className="flex-1 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all">
                        Autofill & Proceed
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === "risk" && riskAnalysis && (
          <div className="space-y-4">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Transaction Risk Analysis</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <RiskItem label="Fraud Risk Score" value={`${riskAnalysis.fraudRiskScore}`}
                  color={riskAnalysis.fraudRiskScore <= 30 ? "text-success" : riskAnalysis.fraudRiskScore <= 70 ? "text-warning" : "text-danger"} />
                <RiskItem label="Failure Probability" value={`${riskAnalysis.failureProbability}%`} color="text-warning" />
                <RiskItem label="Network" value={riskAnalysis.networkStrength} color={riskAnalysis.networkStrength === "strong" ? "text-success" : "text-warning"} />
                <RiskItem label="Bank Server" value={riskAnalysis.bankServerStatus}
                  color={riskAnalysis.bankServerStatus === "operational" ? "text-success" : riskAnalysis.bankServerStatus === "high-latency" ? "text-warning" : "text-danger"} />
              </div>

              {/* Engine breakdown */}
              <div className="bg-muted rounded-lg p-3 space-y-2 mb-4">
                <p className="text-xs font-semibold text-foreground">Risk Engine Breakdown</p>
                {[
                  { label: "Geo Risk", value: riskAnalysis.geoRisk },
                  { label: "Velocity", value: riskAnalysis.velocityRisk },
                  { label: "Device", value: riskAnalysis.deviceRisk },
                  { label: "Amount", value: riskAnalysis.amountRisk },
                  { label: "Network", value: riskAnalysis.networkRisk },
                  { label: "Behavioral", value: riskAnalysis.behaviorRisk },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">{r.label}</span>
                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${r.value}%` }} />
                    </div>
                    <span className="text-xs font-mono text-foreground w-6 text-right">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className={`p-3 rounded-lg text-sm border ${
                riskAnalysis.decision === "approve" ? "bg-success/5 border-success/20 text-success" :
                riskAnalysis.decision === "quarantine" ? "bg-purple-500/5 border-purple-500/20 text-purple-600" :
                riskAnalysis.decision === "otp" ? "bg-warning/5 border-warning/20 text-warning" : "bg-danger/5 border-danger/20 text-danger"
              }`}>
                <p className="font-semibold flex items-center gap-2">
                  {riskAnalysis.decision === "approve" ? "✅ Approved" : riskAnalysis.decision === "quarantine" ? <><Lock className="w-4 h-4"/> Quarantined</> : riskAnalysis.decision === "otp" ? "🔐 OTP Required" : "🚫 Blocked"}
                </p>
                <p className="text-xs mt-1.5 opacity-90">{riskAnalysis.recommendation}</p>
              </div>
            </div>

            <div className="stat-card">
              <p className="text-sm text-foreground text-center mb-4">
                Send <span className="font-bold">₹{Number(amount).toLocaleString()}</span> to <span className="font-bold">{recipient}</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => { setStep("form"); setRiskAnalysis(null); }}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button onClick={handleProceed} disabled={riskAnalysis.decision === "block"}
                  className={`flex-1 py-2.5 rounded-lg text-primary-foreground text-sm font-semibold transition-all ${riskAnalysis.decision === "quarantine" ? "bg-purple-600 hover:bg-purple-700 animate-pulse" : "bg-primary hover:bg-primary/90"} disabled:opacity-40`}>
                  {riskAnalysis.decision === "quarantine" ? "Verify Biometrics to Release" : riskAnalysis.decision === "otp" ? "Verify with OTP & Pay" : "Proceed with Payment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "upi-pin" && (
          <div className="stat-card text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">UPI</p>
            <h3 className="text-lg font-bold text-foreground mb-1">Enter UPI PIN</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Paying ₹{Number(amount).toLocaleString()} to {recipient}
            </p>

            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  i < upiPin.length ? "bg-primary border-primary" : "border-border"
                }`} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto">
              {["1","2","3","4","5","6","7","8","9","","0","del"].map((key, i) => {
                if (key === "") return <div key={i} />;
                if (key === "del") return (
                  <button key={i} onClick={() => setUpiPin((p) => p.slice(0, -1))}
                    className="keypad-btn"><Delete className="w-5 h-5" /></button>
                );
                return (
                  <button key={i} onClick={() => handlePinKey(key)} className="keypad-btn">{key}</button>
                );
              })}
            </div>
          </div>
        )}

        {step === "biometric" && (
          <div className="stat-card text-center py-12 animate-fade-in relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full" />
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full" />
             <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-purple-500/10 flex items-center justify-center relative">
               <span className="absolute inset-0 rounded-full border border-purple-500/30 animate-ping shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
               <Lock className="w-10 h-10 text-purple-500 relative z-10" />
             </div>
             <h3 className="text-xl font-bold text-foreground">Transaction Quarantined</h3>
             <p className="text-sm text-muted-foreground mt-3 max-w-[280px] mx-auto leading-relaxed">
               We've frozen this transaction in the quarantine zone due to anomalous behavioral patterns. Please approve the push notification sent to your registered zero-trust authenticator.
             </p>
             <button onClick={() => {
                setStep("processing");
                setTimeout(() => {
                  const success = Math.random() > (riskAnalysis?.failureProbability || 0) / 100;
                  setTxnResult(success ? "success" : "failed");
                  setStep("result");
                  if (success) playSuccessSound();
                }, 2000);
             }}
               className="mt-8 px-6 py-3 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.23)] hover:-translate-y-0.5 relative z-10">
               Simulate Biometric Approval
             </button>
          </div>
        )}

        {step === "processing" && (
          <div className="stat-card text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-lg font-semibold text-foreground">Processing Payment...</p>
            <p className="text-sm text-muted-foreground mt-1">Verifying with bank server</p>
          </div>
        )}

        {step === "result" && (
          <div className="stat-card text-center py-10 animate-slide-up">
            {txnResult === "success" ? (
              <>
                <img src={paymentSuccessImg} alt="Payment Successful" className="w-32 h-32 mx-auto mb-4 object-contain" />
                <h3 className="text-xl font-bold text-foreground">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ₹{Number(amount).toLocaleString()} sent to {recipient}
                </p>
                <p className="font-mono text-xs text-muted-foreground mt-2">{generateTxnId()}</p>
                <button onClick={() => setStep("scratch")}
                  className="mt-6 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-all">
                  🎉 Scratch & Win!
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-danger" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Payment Failed</h3>
                <p className="text-sm text-muted-foreground mt-1">Transaction could not be processed. Try again.</p>
              </>
            )}
            <button onClick={() => navigate("/home")}
              className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
              Back to Dashboard
            </button>
          </div>
        )}

        {step === "scratch" && (
          <div className="stat-card text-center py-10 animate-slide-up">
            <h3 className="text-xl font-bold text-foreground mb-2">🎁 Scratch & Win</h3>
            <p className="text-sm text-muted-foreground mb-6">You earned a scratch card! Tap to reveal your reward.</p>
            <div
              onClick={() => setScratchRevealed(true)}
              className={`w-64 h-40 mx-auto rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-500 select-none ${
                scratchRevealed
                  ? "bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/40"
                  : "bg-gradient-to-br from-muted-foreground/60 to-muted-foreground/40 hover:from-muted-foreground/50 hover:to-muted-foreground/30"
              }`}
            >
              {scratchRevealed ? (
                <div className="animate-fade-in">
                  <p className="text-3xl font-bold text-accent">🎉</p>
                  <p className="text-lg font-bold text-foreground mt-2">{scratchPrize}</p>
                  <p className="text-xs text-muted-foreground mt-1">Credited to your wallet</p>
                </div>
              ) : (
                <div>
                  <p className="text-4xl mb-2">🎟️</p>
                  <p className="text-sm font-semibold text-primary-foreground/90">Tap to Scratch</p>
                </div>
              )}
            </div>
            <button onClick={() => navigate("/home")}
              className="mt-6 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const RiskItem = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="bg-muted rounded-lg p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`text-lg font-bold capitalize ${color}`}>{value}</p>
  </div>
);

export default PayPage;
