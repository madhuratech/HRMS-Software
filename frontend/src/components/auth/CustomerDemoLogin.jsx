import React, { useState, useEffect } from "react";
import {
  Users, Mail, Lock, ArrowRight, Clock, AlertCircle,
  Eye, EyeOff, ChevronLeft, ShieldCheck
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import {
  getDemoTimeRemainingSeconds,
  initializeDummyDatabase,
} from "../../lib/demoDummyStore";

export function CustomerDemoLogin({
  onLoginSuccess,
  onOpenTrialModal,
  onHomeClick,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [detectedSession, setDetectedSession] = useState(null);
  const [remainingSec, setRemainingSec] = useState(0);

  useEffect(() => {
    try {
      const storedTrial = localStorage.getItem("hrms_trial_session");
      if (storedTrial) {
        const parsed = JSON.parse(storedTrial);
        const sec = getDemoTimeRemainingSeconds();
        if (sec > 0) {
          setDetectedSession(parsed);
          setRemainingSec(sec);
          if (parsed.email) setEmail(parsed.email);
        }
      }
    } catch (e) {}
  }, []);

  const formatRemaining = (sec) => {
    if (sec <= 0) return "00:00";
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return hours > 0 ? hours + "h " + mins + "m" : mins + "m";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both your email/username and password.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setIsExpired(false);
    const cleanInput = email.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      let lead = null;
      let sessionMeta = null;

      try {
        const res = await apiFetch("/trial/login", {
          method: "POST",
          body: JSON.stringify({ email: cleanInput, password: cleanPass }),
        });
        if (res && res.success && res.lead) {
          lead = res.lead;
          sessionMeta = res.session;
        } else if (res && res.expired) {
          setIsExpired(true);
          setErrorMsg("Your 3-Hour Free Trial Demo session has expired.");
          setLoading(false);
          return;
        }
      } catch (err) {}

      if (!lead) {
        const storedList = JSON.parse(localStorage.getItem("hrms_trial_submissions") || "[]");
        const matched = storedList.find(
          (item) =>
            ((item.email && item.email.toLowerCase() === cleanInput) ||
              (item.name && item.name.toLowerCase() === cleanInput)) &&
            item.password === cleanPass
        );
        if (matched) lead = matched;
      }

      if (!lead) {
        const activeSession = JSON.parse(localStorage.getItem("hrms_trial_session") || "null");
        if (
          activeSession &&
          ((activeSession.email && activeSession.email.toLowerCase() === cleanInput) ||
            (activeSession.name && activeSession.name.toLowerCase() === cleanInput)) &&
          (!activeSession.password || activeSession.password === cleanPass)
        ) {
          lead = activeSession;
        }
      }

      if (!lead) {
        setErrorMsg("Invalid credentials. Please check your registered email and password.");
        setLoading(false);
        return;
      }

      const now = Date.now();
      const expiresAt =
        (sessionMeta && sessionMeta.expiresAt) ||
        lead.demoExpiresAt ||
        (lead.demoStartedAt ? lead.demoStartedAt + 3 * 3600 * 1000 : now + 3 * 3600 * 1000);
      const isTimeOut = now >= expiresAt;

      if (isTimeOut) {
        setIsExpired(true);
        setErrorMsg("Your 3-Hour Free Demo session has expired.");
        setLoading(false);
        return;
      }

      const companyName = lead.company || "Customer Organization";
      const customerName = lead.name || "Customer Admin";
      initializeDummyDatabase(companyName, customerName, false);

      const trialPayload = {
        id: 1, userId: 1,
        emp_id: "SUPER ADMIN", employeeCode: "SUPER ADMIN",
        designation: "Managing Director & Super Admin",
        isActive: true, isDemo: true, is3HourDemo: true,
        startedAt: lead.demoStartedAt || now, expiresAt: expiresAt,
        company: companyName, name: customerName, email: lead.email,
        phone: lead.phone || "", industry: lead.industry || "IT & Software",
        employeeSize: lead.employeeSize || "21-100", role: "SUPER_ADMIN",
      };

      const demoMeta = {
        isActive: true,
        is3HourDemo: true,
        customerName,
        company: companyName,
        email: lead.email,
        phone: lead.phone || "",
        industry: lead.industry || "IT & Software",
        employeeSize: lead.employeeSize || "21-100",
        startedAt: lead.demoStartedAt || now,
        expiresAt: expiresAt,
        durationMinutes: 180
      };
      localStorage.setItem("hrms_3hr_demo_meta", JSON.stringify(demoMeta));
      localStorage.setItem("hrms_trial_session", JSON.stringify(trialPayload));
      localStorage.setItem("hrms_is_demo_sandbox", "true");

      if (typeof window !== "undefined") {
        window.history.pushState({}, "", "/dashboard");
      }

      if (onLoginSuccess) onLoginSuccess("SUPER_ADMIN", customerName, trialPayload);
    } catch (err) {
      setErrorMsg("An error occurred during sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        .demo-no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .demo-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {/* Decorative background dots */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: (80 + i * 60) + "px", height: (80 + i * 60) + "px",
            borderRadius: "50%",
            border: "1px solid rgba(59,130,246,0.08)",
            top: (10 + i * 15) + "%", left: (5 + i * 16) + "%",
          }} />
        ))}
      </div>

      <div
        className="demo-no-scrollbar"
        style={{
          background: "#ffffff", width: "100%", maxWidth: "520px",
          borderRadius: "24px",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.45)",
          border: "1px solid #e2e8f0",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Accent top stripe */}
        <div style={{
          height: "4px",
          background: "linear-gradient(90deg, #2563eb, #3b82f6, #1d4ed8)",
        }} />

        <div style={{ padding: "36px 38px 34px" }}>
          {/* Logo + Title */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "56px", height: "56px", borderRadius: "16px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#fff", marginBottom: "14px",
              boxShadow: "0 8px 20px rgba(37,99,235,0.3)",
            }}>
              <Users size={28} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.4px" }}>
                Madhura<span style={{ color: "#2563eb" }}>HRMS</span>
              </span>
              <span style={{
                background: "#eff6ff", color: "#2563eb",
                border: "1px solid #bfdbfe", fontSize: "11px", fontWeight: 700,
                padding: "2px 8px", borderRadius: "100px",
              }}>
                Free Demo
              </span>
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1e293b", margin: "4px 0 6px" }}>
              Resume Your Demo Session
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              Sign in with the email and password you used during registration.
            </p>
          </div>

          {/* Active session banner */}
          {detectedSession && remainingSec > 0 && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: "12px", padding: "12px 14px", marginBottom: "20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#166534" }}>
                    Active Trial: {detectedSession.company || detectedSession.name}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#15803d" }}>Super Admin Workspace</div>
                </div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: "5px",
                background: "#dcfce7", padding: "4px 10px", borderRadius: "8px",
                fontSize: "12px", fontWeight: 700, color: "#166534",
              }}>
                <Clock size={13} />
                <span>{formatRemaining(remainingSec)} left</span>
              </div>
            </div>
          )}

          {/* Error banner */}
          {errorMsg && (
            <div style={{
              background: isExpired ? "#fffbeb" : "#fef2f2",
              border: "1px solid " + (isExpired ? "#fde68a" : "#fecaca"),
              borderRadius: "12px", padding: "12px 15px", marginBottom: "20px",
              display: "flex", alignItems: "flex-start", gap: "10px",
            }}>
              <AlertCircle size={17} color={isExpired ? "#d97706" : "#ef4444"} style={{ flexShrink: 0, marginTop: "1px" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: isExpired ? "#92400e" : "#991b1b" }}>
                  {errorMsg}
                </div>
                {isExpired && (
                  <button
                    type="button"
                    onClick={() => onOpenTrialModal && onOpenTrialModal()}
                    style={{
                      marginTop: "8px", background: "#2563eb", color: "#fff",
                      border: "none", borderRadius: "8px", padding: "6px 12px",
                      fontSize: "12px", fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    Start New Free Trial
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Login Form - Minimalist Full-Width Stacked Inputs */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Email Address / Username <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "14px", top: "13px", color: "#9ca3af", pointerEvents: "none" }} />
                <input
                  type="text"
                  placeholder="name@gmail.com or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "11px 14px 11px 40px",
                    borderRadius: "11px", border: "1.5px solid #e2e8f0", fontSize: "14px",
                    outline: "none", color: "#111827", background: "#fff",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Password <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "14px", top: "13px", color: "#9ca3af", pointerEvents: "none" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your trial password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "11px 40px 11px 40px",
                    borderRadius: "11px", border: "1.5px solid #e2e8f0", fontSize: "14px",
                    outline: "none", color: "#111827", background: "#fff",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "12px", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9ca3af" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "6px",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff", border: "none", borderRadius: "12px",
                padding: "13px 20px", fontSize: "14.5px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
                opacity: loading ? 0.8 : 1,
                transition: "all 0.2s",
              }}
            >
              {loading
                ? "Verifying Credentials..."
                : <><span>Sign In & Open Workspace</span><ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Security badge */}
          <div style={{
            marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "center",
            gap: "6px", fontSize: "12px", color: "#94a3b8",
          }}>
            <ShieldCheck size={14} color="#cbd5e1" />
            <span>Isolated 3-hour sandbox — Your data stays private</span>
          </div>

          {/* Minimalist Footer links */}
          <div style={{
            marginTop: "20px", paddingTop: "18px", borderTop: "1px solid #f1f5f9",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: "13px",
          }}>
            <button
              type="button"
              onClick={() => onHomeClick && onHomeClick()}
              style={{
                background: "none", border: "none", color: "#64748b",
                fontWeight: 600, fontSize: "12.5px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "4px",
              }}
            >
              <ChevronLeft size={14} /> Back to Home
            </button>

            <button
              type="button"
              onClick={() => onOpenTrialModal && onOpenTrialModal()}
              style={{
                background: "none", border: "none", color: "#2563eb",
                fontWeight: 700, cursor: "pointer", fontSize: "13px",
              }}
            >
              Start New Free Trial →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
