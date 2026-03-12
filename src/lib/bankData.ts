import sbiLogo from "@/assets/sbi-logo.png";
import iobLogo from "@/assets/iob-logo.png";
import hdfcLogo from "@/assets/hdfc-logo.png";
import iciciLogo from "@/assets/icici-logo.png";
import axisLogo from "@/assets/axis-logo.png";

export interface BankStatus {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  status: "operational" | "high-latency" | "down";
  responseTime: number | null;
  upiGateway: "active" | "degraded" | "offline";
  lastUpdated: Date;
}

export const BANKS: Omit<BankStatus, "status" | "responseTime" | "upiGateway" | "lastUpdated">[] = [
  { id: "sbi", name: "State Bank of India", shortName: "SBI", logo: sbiLogo },
  { id: "iob", name: "Indian Overseas Bank", shortName: "IOB", logo: iobLogo },
  { id: "hdfc", name: "HDFC Bank", shortName: "HDFC", logo: hdfcLogo },
  { id: "icici", name: "ICICI Bank", shortName: "ICICI", logo: iciciLogo },
  { id: "axis", name: "Axis Bank", shortName: "Axis", logo: axisLogo },
];

export function simulateBankStatus(): BankStatus[] {
  return BANKS.map((bank) => {
    const rand = Math.random();
    let responseTime: number | null;
    let status: BankStatus["status"];
    let upiGateway: BankStatus["upiGateway"];

    if (rand < 0.6) {
      responseTime = Math.floor(Math.random() * 180) + 20;
      status = "operational";
      upiGateway = "active";
    } else if (rand < 0.85) {
      responseTime = Math.floor(Math.random() * 500) + 200;
      status = "high-latency";
      upiGateway = "degraded";
    } else {
      responseTime = null;
      status = "down";
      upiGateway = "offline";
    }

    return { ...bank, status, responseTime, upiGateway, lastUpdated: new Date() };
  });
}

export interface Transaction {
  id: string;
  recipient: string;
  upiId: string;
  amount: number;
  riskScore: number;
  failureProbability: number;
  status: "approved" | "otp" | "blocked" | "pending" | "quarantine";
  timestamp: Date;
  bank: string;
}

export function generateTxnId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TXN";
  for (let i = 0; i < 8; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export interface RiskAnalysis {
  fraudRiskScore: number;
  failureProbability: number;
  networkStrength: "strong" | "moderate" | "slow";
  bankServerStatus: "operational" | "high-latency" | "down";
  geoRisk: number;
  velocityRisk: number;
  deviceRisk: number;
  amountRisk: number;
  networkRisk: number;
  behaviorRisk: number;
  decision: "approve" | "otp" | "block" | "quarantine";
  recommendation: string;
}

export function calculateRisk(amount: number, bankStatus: BankStatus["status"]): RiskAnalysis {
  const geoRisk = Math.random() < 0.2 ? Math.floor(Math.random() * 25) + 10 : Math.floor(Math.random() * 8);
  const velocityRisk = Math.random() < 0.15 ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 5);
  const deviceRisk = Math.random() < 0.1 ? Math.floor(Math.random() * 25) + 10 : Math.floor(Math.random() * 5);
  const amountRisk = amount > 10000 ? 25 + Math.floor(Math.random() * 10) : amount > 5000 ? 10 + Math.floor(Math.random() * 10) : Math.floor(Math.random() * 8);
  const networkRisk = bankStatus === "down" ? 25 : bankStatus === "high-latency" ? 15 : Math.floor(Math.random() * 5);
  const behaviorRisk = Math.random() < 0.1 ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 5);

  const fraudRiskScore = Math.min(100, geoRisk + velocityRisk + deviceRisk + amountRisk + networkRisk + behaviorRisk);

  let failureProbability = 0;
  if (bankStatus === "down") failureProbability += 40;
  else if (bankStatus === "high-latency") failureProbability += 20;
  failureProbability += Math.floor(Math.random() * 20);
  failureProbability = Math.min(95, failureProbability);

  const networkStrength: RiskAnalysis["networkStrength"] = bankStatus === "down" ? "slow" : bankStatus === "high-latency" ? "moderate" : "strong";

  let decision: RiskAnalysis["decision"];
  let recommendation: string;
  if (fraudRiskScore <= 30) {
    decision = "approve";
    recommendation = "Transaction appears safe. Proceed with payment.";
  } else if (fraudRiskScore <= 60) {
    decision = "otp";
    recommendation = "Moderate risk detected. OTP verification required for step-up authentication.";
  } else if (fraudRiskScore <= 85) {
    decision = "quarantine";
    recommendation = "Anomalous behavior detected. Transaction quarantined. Require biometric push verification.";
  } else {
    decision = "block";
    recommendation = "High risk detected. Transaction blocked for security. Contact support if legitimate.";
  }

  return {
    fraudRiskScore, failureProbability, networkStrength,
    bankServerStatus: bankStatus,
    geoRisk, velocityRisk, deviceRisk, amountRisk, networkRisk, behaviorRisk,
    decision, recommendation,
  };
}

export function generateDemoTransactions(): Transaction[] {
  const names = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Karthik", "Deepa"];
  const banks = ["SBI", "HDFC", "ICICI", "Axis", "IOB"];
  const statuses: Transaction["status"][] = ["approved", "approved", "approved", "otp", "quarantine", "approved", "blocked"];

  return Array.from({ length: 15 }, (_, i) => {
    const name = names[Math.floor(Math.random() * names.length)];
    return {
      id: generateTxnId(),
      recipient: name,
      upiId: `${name.toLowerCase()}@upi`,
      amount: Math.floor(Math.random() * 15000) + 100,
      riskScore: Math.floor(Math.random() * 60),
      failureProbability: Math.floor(Math.random() * 50),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: new Date(Date.now() - i * 3600000 * Math.random() * 5),
      bank: banks[Math.floor(Math.random() * banks.length)],
    };
  });
}
