import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Shield, Delete } from "lucide-react";
import securepayLogo from "@/assets/securepay-logo.png";
import bankingBg from "@/assets/banking-bg.png";

const LoginPage = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleKey = useCallback((digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      setTimeout(() => {
        if (login(newPin)) {
          navigate("/home");
        } else {
          setError(true);
          setShake(true);
          setTimeout(() => { setShake(false); setPin(""); }, 600);
        }
      }, 300);
    }
  }, [pin, login, navigate]);

  const handleDelete = useCallback(() => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  }, []);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={bankingBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/80" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm mx-4 animate-slide-up">
        <div className="glass-card rounded-2xl p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center items-center gap-2 mb-2">
             <div className="bg-primary/20 p-2 rounded-xl">
               <Shield className="w-8 h-8 text-primary" />
             </div>
             <img src={securepayLogo} alt="SecurePay" className="h-[3.25rem] object-contain object-left scale-110 ml-1 translate-y-[2px]" />
          </div>
          <p className="text-primary-foreground/70 text-sm mb-8 mt-4 font-medium tracking-wide">Secure Banking</p>

          {/* PIN Dots */}
          <div className={`flex justify-center gap-4 mb-2 ${shake ? "animate-shake" : ""}`}
               style={shake ? { animation: "shake 0.4s ease-in-out" } : {}}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                i < pin.length
                  ? "bg-accent border-accent scale-110"
                  : "border-primary-foreground/40"
              }`} />
            ))}
          </div>
          {error && <p className="text-danger text-xs mb-4">Invalid PIN. Try 1234.</p>}
          {!error && <p className="text-primary-foreground/50 text-xs mb-4">Enter 4-digit PIN</p>}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
            {keys.map((key, i) => {
              if (key === "") return <div key={i} />;
              if (key === "del") {
                return (
                  <button key={i} onClick={handleDelete}
                    className="w-16 h-14 rounded-xl flex items-center justify-center text-primary-foreground/70 hover:bg-primary-foreground/10 active:scale-95 transition-all mx-auto">
                    <Delete className="w-5 h-5" />
                  </button>
                );
              }
              return (
                <button key={i} onClick={() => handleKey(key)}
                  className="w-16 h-14 rounded-xl text-xl font-semibold flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/15 active:scale-95 transition-all mx-auto select-none">
                  {key}
                </button>
              );
            })}
          </div>

          <p className="text-primary-foreground/40 text-xs mt-8">Secure access required</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
