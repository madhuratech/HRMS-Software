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

      <div style={{
        background: "#ffffff", width: "100%", maxWidth: "420px",
        borderRadius: "22px",
        boxShadow: "0 32px 64px -12px rgba(0,0,0,0.45)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Accent top stripe */}
        <div style={{
          height: "4px",
          background: "linear-gradient(90deg, #2563eb, #3b82f6, #1d4ed8)",
        }} />

        <div style={{ padding: "32px 30px 30px" }}>
          {/* Logo + Title */}
          <div style={{ textAlign: "center", marginBottom: "26px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "54px", height: "54px", borderRadius: "16px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#fff", marginBottom: "14px",
              boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
            }}>
              <Users size={26} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "5px" }}>
              <span style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.4px" }}>
                Madhura<span style={{ color: "#2563eb" }}>HRMS</span>
              </span>
              <span style={{
                background: "#eff6ff", color: "#2563eb",
                border: "1px solid #bfdbfe", fontSize: "10.5px", fontWeight: 700,
                padding: "2px 7px", borderRadius: "100px",
              }}>
                Free Demo
              </span>
            </div>

            <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#1e293b", margin: "2px 0 5px" }}>
              Resume Your Demo Session
            </h2>
            <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              Sign in with the email and password you used during registration.
            </p>
          </div>

          {/* Active session banner */}
          {detectedSession && remainingSec > 0 && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: "10px", padding: "10px 12px", marginBottom: "18px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>
                    Active Trial: {detectedSession.company || detectedSession.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#15803d" }}>Super Admin Workspace</div>
                </div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: "4px",
                background: "#dcfce7", padding: "3px 8px", borderRadius: "6px",
                fontSize: "11.5px", fontWeight: 700, color: "#166534",
              }}>
                <Clock size={12} />
                <span>{formatRemaining(remainingSec)} left</span>
              </div>
            </div>
          )}

          {/* Error banner */}
          {errorMsg && (
            <div style={{
              background: isExpired ? "#fffbeb" : "#fef2f2",
              border: "1px solid " + (isExpired ? "#fde68a" : "#fecaca"),
              borderRadius: "10px", padding: "11px 13px", marginBottom: "18px",
              display: "flex", alignItems: "flex-start", gap: "9px",
            }}>
              <AlertCircle size={16} color={isExpired ? "#d97706" : "#ef4444"} style={{ flexShrink: 0, marginTop: "1px" }} />
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
                      border: "none", borderRadius: "6px", padding: "5px 10px",
                      fontSize: "12px", fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    Start New Free Trial
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "5px" }}>
                Email Address / Username <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: "9px",
                border: "1.5px solid #e2e8f0", borderRadius: "10px",
                padding: "9px 12px", background: "#fff",
              }}>
                <Mail size={15} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="name@gmail.com or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  style={{
                    border: "none", outline: "none", fontSize: "13.5px",
                    width: "100%", color: "#111827", background: "transparent",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "5px" }}>
                Password <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: "9px",
                border: "1.5px solid #e2e8f0", borderRadius: "10px",
                padding: "9px 12px", background: "#fff",
              }}>
                <Lock size={15} color="#9ca3af" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your trial password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{
                    border: "none", outline: "none", fontSize: "13.5px",
                    flex: 1, color: "#111827", background: "transparent",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9ca3af" }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "4px",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff", border: "none", borderRadius: "11px",
                padding: "12px 18px", fontSize: "14px", fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading
                ? "Verifying Credentials..."
                : <><span>Sign In & Open Workspace</span><ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Security badge */}
          <div style={{
            marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center",
            gap: "5px", fontSize: "11.5px", color: "#94a3b8",
          }}>
            <ShieldCheck size={13} color="#cbd5e1" />
            <span>Isolated 3-hour sandbox — Your data stays private</span>
          </div>

          {/* Footer links */}
          <div style={{
            marginTop: "18px", paddingTop: "16px", borderTop: "1px solid #f1f5f9",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: "12.5px",
          }}>
            <button
              type="button"
              onClick={() => onHomeClick && onHomeClick()}
              style={{
                background: "none", border: "none", color: "#64748b",
                fontWeight: 600, fontSize: "12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "3px",
              }}
            >
              <ChevronLeft size={13} /> Back to Home
            </button>

            <button
              type="button"
              onClick={() => onOpenTrialModal && onOpenTrialModal()}
              style={{
                background: "none", border: "none", color: "#2563eb",
                fontWeight: 700, cursor: "pointer", fontSize: "12.5px",
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
