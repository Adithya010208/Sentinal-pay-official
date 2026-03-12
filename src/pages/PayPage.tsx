import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { BankStatus, simulateBankStatus, calculateRisk, RiskAnalysis, generateTxnId, BANKS } from "@/lib/bankData";
import { Send, AlertTriangle, Shield, CheckCircle, XCircle, Lock, Delete } from "lucide-react";
import upiLogo from "@/assets/upi-logo.png";
import paymentSuccessImg from "@/assets/payment-success.png";

type PayStep = "form" | "risk" | "upi-pin" | "biometric" | "processing" | "result" | "scratch";

const PayPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<PayStep>("form");
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setBankStatuses(simulateBankStatus()), 5000);
    return () => clearInterval(interval);
  }, []);

  const currentBank = bankStatuses.find((b) => b.id === selectedBank);
  const bankWarning = currentBank && currentBank.status === "down";

  const handleAnalyze = () => {
    if (!recipient || !upiId || !amount) return;
    const bank = bankStatuses.find((b) => b.id === selectedBank);
    const risk = calculateRisk(Number(amount), bank?.status || "operational");
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
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Send Money</h2>
            </div>

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
