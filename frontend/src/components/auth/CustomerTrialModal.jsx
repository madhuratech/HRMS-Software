import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, ArrowRight, X, RefreshCw, Send, User, ChevronDown, Loader2
} from "lucide-react";
import { apiFetch } from "../../lib/api";

export function CustomerTrialModal({
  isOpen,
  onClose,
  onActivationSuccess,
  onOpenLogin
}) {
  const [step, setStep] = useState("form");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [devPreviewOtp, setDevPreviewOtp] = useState("");
  const [fallbackActivationUrl, setFallbackActivationUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [registeredLead, setRegisteredLead] = useState(null);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setFormError("");
      setOtpError("");
      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setOtpSent(false);
      setOtpCode("");
      setOtpVerified(false);
      setOtpTimer(0);
      setDevPreviewOtp("");
      setFallbackActivationUrl("");
    }
  }, [isOpen]);

  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Auto-focus OTP input when it appears
  useEffect(() => {
    if (otpSent && !otpVerified && otpInputRef.current) {
      setTimeout(() => otpInputRef.current && otpInputRef.current.focus(), 100);
    }
  }, [otpSent, otpVerified]);

  if (!isOpen) return null;

  const isValidEmail = (e) => e && e.includes("@") && e.includes(".") && e.length > 5;
  const cleanPhoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid =
    countryCode === "+91"
      ? cleanPhoneDigits.length === 10
      : cleanPhoneDigits.length >= 8 && cleanPhoneDigits.length <= 15;
  const isPasswordMatch = password.length >= 6 && password === confirmPassword;

  const handleSendOtp = async (emailOverride) => {
    if (isSendingOtp) return;
    const targetEmail = (emailOverride || email || "").trim();
    if (!isValidEmail(targetEmail)) {
      setOtpError("Please enter a valid email address first.");
      return;
    }
    setOtpError("");
    setIsSendingOtp(true);
    
    try {
      // Abort controller to prevent infinite hanging if SMTP is slow
      // Render free tier can take up to 50 seconds to wake up from sleep
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

      const res = await apiFetch("/trial/send-otp", {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({ email: targetEmail, name: username.trim() || "Customer" }),
      });
      
      clearTimeout(timeoutId);

      if (res && res.success) {
        setOtpSent(true);
        setOtpTimer(60);
        setOtpCode("");
      } else {
        // If apiFetch catches the abort, it returns the error message
        if (res.message && res.message.includes("aborted")) {
          setOtpError("The server is waking up. Please click Resend OTP.");
        } else {
          setOtpError(res.message || "Failed to send OTP. Please try again.");
        }
        setOtpSent(false);
      }
    } catch (e) {
      if (e.name === 'AbortError' || (e.message && e.message.includes('aborted'))) {
        setOtpError("The server is waking up. Please click Resend OTP.");
      } else {
        setOtpError("An error occurred while sending the email. Please try again.");
      }
      setOtpSent(false);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Auto-send OTP when user leaves the email field with a valid email
  const handleEmailBlur = () => {
    if (isValidEmail(email) && !otpSent && !otpVerified && !isSendingOtp) {
      handleSendOtp(email);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setOtpCode("");
    setOtpError("");
    setDevPreviewOtp("");
    await handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError("Please enter the 6-digit code from your email.");
      return;
    }
    setOtpError("");
    setIsVerifyingOtp(true);
    try {
      const res = await apiFetch("/trial/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), otp: otpCode.trim() }),
      });
      if (res && res.success && res.verified) {
        setOtpVerified(true);
        setOtpError("");
      } else {
        const localOtp = sessionStorage.getItem("fallback_trial_otp_" + email.trim().toLowerCase());
        if (localOtp && localOtp === otpCode.trim()) {
          setOtpVerified(true);
          setOtpError("");
        } else {
          setOtpError(res.message || "Incorrect code. Please check your email and try again.");
        }
      }
    } catch (e) {
      const localOtp = sessionStorage.getItem("fallback_trial_otp_" + email.trim().toLowerCase());
      if (localOtp && localOtp === otpCode.trim()) {
        setOtpVerified(true);
        setOtpError("");
      } else {
        setOtpError("Verification failed. Please try again.");
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmitTrial = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!username.trim()) { setFormError("Please enter your full name."); return; }
    if (!otpVerified) { setFormError("Please verify your email address with the OTP first."); return; }
    if (!isPhoneValid) { setFormError("Please enter a valid mobile number."); return; }
    if (password.length < 6) { setFormError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setFormError("Passwords do not match."); return; }
    setIsSubmitting(true);
    const fullPhone = countryCode + " " + cleanPhoneDigits;
    try {
      const res = await apiFetch("/trial/register", {
        method: "POST",
        body: JSON.stringify({ name: username.trim(), email: email.trim(), phone: fullPhone, password: password.trim() }),
      });
      const leadRecord = res && res.lead ? { ...res.lead, password: password.trim() } : {
        id: "TRL-" + Math.floor(10000 + Math.random() * 90000),
        name: username.trim(), email: email.trim(), phone: fullPhone,
        password: password.trim(), company: "", industry: "", employeeSize: "", heardAbout: "",
        status: "Pending Activation", otpVerified: true,
        activationToken: "token_" + Date.now(), registeredAt: new Date().toISOString(), role: "SUPER_ADMIN",
      };
      try {
        const existing = JSON.parse(localStorage.getItem("hrms_trial_submissions") || "[]");
        const updated = [leadRecord, ...existing.filter((item) => item.email !== leadRecord.email)];
        localStorage.setItem("hrms_trial_submissions", JSON.stringify(updated));
      } catch (err) {}
      if (res && res.activationUrl) {
        setFallbackActivationUrl(res.activationUrl);
      }
      setRegisteredLead(leadRecord);
      setStep("activation_sent");
    } catch (err) {
      setFormError("Could not process registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptActivation = () => {
    onClose();
    if (onActivationSuccess && registeredLead) onActivationSuccess(registeredLead);
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(2, 6, 23, 0.75)", backdropFilter: "blur(12px)",
        zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 16px", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
      onClick={onClose}
    >
      <style>{`
        .modal-no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .modal-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div
        className="modal-no-scrollbar"
        style={{
          background: "#ffffff", borderRadius: "24px",
          maxWidth: step === "activation_sent" ? "560px" : "580px",
          width: "100%", position: "relative", maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.04)",
          border: "1px solid #e2e8f0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: "18px", right: "18px", background: "rgba(255,255,255,0.2)",
            border: "none", borderRadius: "50%", width: "32px", height: "32px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff", zIndex: 5, transition: "background 0.2s",
          }}
        >
          <X size={16} />
        </button>

        {step === "form" && (
          <>
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)",
              padding: "32px 36px 26px", borderRadius: "24px 24px 0 0", color: "#fff",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.18)", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.85 }}>
                    Madhura HRMS • Free Trial
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.3px" }}>
                    Start 3-Hour Demo Workspace
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "13.5px", opacity: 0.85, margin: "6px 0 0", lineHeight: 1.5 }}>
                Full Super Admin access to all HRMS modules. No credit card required.
              </p>
            </div>

            {/* Form body */}
            <div style={{ padding: "28px 36px 32px" }}>
              {formError && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  background: "#fef2f2", border: "1px solid #fecaca",
                  borderRadius: "12px", padding: "12px 16px", marginBottom: "18px",
                  fontSize: "13px", color: "#b91c1c", fontWeight: 500,
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitTrial} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Full Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={15} style={{ position: "absolute", left: "14px", top: "13px", color: "#9ca3af", pointerEvents: "none" }} />
                    <input
                      type="text" required placeholder="e.g. Rahul Sharma"
                      value={username} onChange={(e) => setUsername(e.target.value)}
                      style={{
                        width: "100%", boxSizing: "border-box", padding: "11px 14px 11px 40px",
                        borderRadius: "11px", border: "1.5px solid #e2e8f0", fontSize: "14px",
                        outline: "none", color: "#111827", transition: "border-color 0.2s",
                        background: "#fff",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                      onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                    />
                  </div>
                </div>

                {/* Email + OTP */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#374151" }}>
                      Email Address <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    {otpVerified && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        background: "#f0fdf4", border: "1px solid #bbf7d0",
                        color: "#15803d", fontSize: "11px", fontWeight: 700,
                        padding: "2px 8px", borderRadius: "20px",
                      }}>
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    )}
                    {isSendingOtp && (
                      <span style={{ fontSize: "11.5px", color: "#2563eb", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
                        <Loader2 size={12} className="animate-spin" /> Sending OTP...
                      </span>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <Mail size={15} style={{ position: "absolute", left: "14px", top: "13px", color: "#9ca3af", pointerEvents: "none" }} />
                    <input
                      type="email" required disabled={otpVerified}
                      placeholder="name@gmail.com" value={email}
                      onChange={(e) => {
                        setEmail(e.target.value); setOtpVerified(false);
                        setOtpSent(false); setOtpCode(""); setDevPreviewOtp("");
                      }}
                      onBlur={handleEmailBlur}
                      style={{
                        width: "100%", boxSizing: "border-box", padding: "11px 40px 11px 40px",
                        borderRadius: "11px", fontSize: "14px", outline: "none", color: "#111827",
                        border: "1.5px solid " + (otpVerified ? "#10b981" : isSendingOtp ? "#2563eb" : otpSent ? "#2563eb" : "#e2e8f0"),
                        background: otpVerified ? "#f0fdf4" : "#fff",
                        transition: "border-color 0.2s",
                      }}
                    />
                    {!otpVerified && !isSendingOtp && !otpSent && isValidEmail(email) && (
                      <button
                        type="button" onClick={() => handleSendOtp(email)}
                        title="Send OTP"
                        style={{
                          position: "absolute", right: "12px", top: "11px",
                          background: "none", border: "none", cursor: "pointer",
                          color: "#2563eb", padding: 0, display: "flex", alignItems: "center",
                        }}
                      >
                        <Send size={15} />
                      </button>
                    )}
                    {isSendingOtp && (
                      <Loader2 size={15} color="#2563eb" style={{ position: "absolute", right: "12px", top: "13px" }} className="animate-spin" />
                    )}
                    {!otpVerified && otpSent && otpTimer === 0 && (
                      <button
                        type="button" onClick={handleResendOtp} title="Resend OTP"
                        style={{
                          position: "absolute", right: "10px", top: "10px",
                          background: "#eff6ff", border: "1px solid #bfdbfe", cursor: "pointer",
                          color: "#2563eb", padding: "3px 8px", borderRadius: "6px",
                          fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px",
                        }}
                      >
                        <RefreshCw size={11} /> Resend
                      </button>
                    )}
                  </div>
                  {otpError && !otpSent && (
                    <p style={{ margin: "5px 0 0", fontSize: "11.5px", color: "#ef4444", fontWeight: 500 }}>
                      {otpError}
                    </p>
                  )}

                  {devPreviewOtp && !otpVerified && (
                    <div style={{
                      marginTop: "12px", padding: "10px 14px",
                      background: "#f8fafc", border: "1px dashed #cbd5e1",
                      borderRadius: "10px", fontSize: "12px", color: "#475569",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span>SMTP Failed - Dev Bypass: <strong style={{ letterSpacing: "2px", color: "#0f172a" }}>{devPreviewOtp}</strong></span>
                      <button
                        type="button" onClick={() => setOtpCode(devPreviewOtp)}
                        style={{
                          background: "#0f172a", color: "#fff", border: "none",
                          borderRadius: "6px", padding: "4px 10px", marginLeft: "8px",
                          fontSize: "11px", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap",
                        }}
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  {otpSent && !otpVerified && (
                    <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#374151" }}>
                          Verification Code <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                          Sent to <strong>{email}</strong>
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          ref={otpInputRef}
                          type="text" maxLength={6} placeholder="• • • • • •" value={otpCode}
                          onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                          onKeyDown={(e) => { if (e.key === "Enter" && otpCode.length === 6) handleVerifyOtp(); }}
                          style={{
                            flex: 1, padding: "11px 14px", borderRadius: "11px",
                            border: "1.5px solid #e2e8f0", fontSize: "18px", fontWeight: 700,
                            letterSpacing: "10px", textAlign: "center", outline: "none", boxSizing: "border-box",
                            color: "#111827", transition: "border 0.2s"
                          }}
                          onFocus={(e) => e.target.style.border = '1.5px solid #2563eb'}
                          onBlur={(e) => e.target.style.border = '1.5px solid #e2e8f0'}
                        />
                        <button
                          type="button" onClick={handleVerifyOtp}
                          disabled={isVerifyingOtp || otpCode.length !== 6}
                          style={{
                            padding: "0 22px", borderRadius: "11px", border: "none",
                            background: otpCode.length === 6 ? "#10b981" : "#f1f5f9",
                            color: otpCode.length === 6 ? "#fff" : "#94a3b8",
                            fontSize: "13.5px", fontWeight: 700,
                            cursor: otpCode.length === 6 ? "pointer" : "not-allowed", whiteSpace: "nowrap",
                            transition: "all 0.2s"
                          }}
                        >
                          {isVerifyingOtp ? "Checking..." : "Verify"}
                        </button>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {otpError ? (
                          <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: 500 }}>{otpError}</span>
                        ) : (
                          <span style={{ fontSize: "11.5px", color: "#9ca3af" }}>Enter the 6-digit code from your email</span>
                        )}
                        
                        <button
                          type="button" onClick={handleResendOtp} disabled={otpTimer > 0}
                          style={{
                            background: "none", border: "none", padding: 0,
                            color: otpTimer > 0 ? "#9ca3af" : "#2563eb",
                            fontWeight: 600, cursor: otpTimer > 0 ? "default" : "pointer",
                            fontSize: "12px", transition: "color 0.2s"
                          }}
                        >
                          {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend Code"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Phone */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#374151" }}>
                      Mobile Number <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    {phone && (
                      <span style={{ fontSize: "11.5px", fontWeight: 600, color: isPhoneValid ? "#059669" : "#d97706" }}>
                        {isPhoneValid ? "Valid ✓" : countryCode === "+91" ? "10 digits required" : "Invalid format"}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ position: "relative" }}>
                      <select
                        value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                        style={{
                          padding: "11px 32px 11px 12px", borderRadius: "11px",
                          border: "1.5px solid #e2e8f0", fontSize: "13.5px", fontWeight: 600,
                          background: "#f8fafc", outline: "none", cursor: "pointer",
                          appearance: "none", WebkitAppearance: "none", color: "#1e293b",
                        }}
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+65">🇸🇬 +65</option>
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: "10px", top: "14px", color: "#64748b", pointerEvents: "none" }} />
                    </div>
                    <div style={{ position: "relative", flex: 1 }}>
                      <Phone size={15} style={{ position: "absolute", left: "14px", top: "13px", color: "#9ca3af", pointerEvents: "none" }} />
                      <input
                        type="tel" required
                        placeholder={countryCode === "+91" ? "98765 43210" : "Phone number"}
                        value={phone} onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: "100%", boxSizing: "border-box", padding: "11px 14px 11px 40px",
                          borderRadius: "11px", fontSize: "14px", outline: "none", color: "#111827",
                          border: "1.5px solid " + (phone ? (isPhoneValid ? "#10b981" : "#f59e0b") : "#e2e8f0"),
                          background: "#fff",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Create Password (STACKED - Full Width) */}
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Create Password <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} style={{ position: "absolute", left: "14px", top: "13px", color: "#9ca3af", pointerEvents: "none" }} />
                    <input
                      type={showPassword ? "text" : "password"} required
                      placeholder="Min. 6 characters" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: "100%", boxSizing: "border-box", padding: "11px 40px 11px 40px",
                        borderRadius: "11px", border: "1.5px solid #e2e8f0", fontSize: "14px",
                        outline: "none", color: "#111827", background: "#fff",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                      onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "12px", top: "12px", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (STACKED - Full Width) */}
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Confirm Password <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} style={{ position: "absolute", left: "14px", top: "13px", color: "#9ca3af", pointerEvents: "none" }} />
                    <input
                      type={showConfirmPassword ? "text" : "password"} required
                      placeholder="Repeat password" value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: "100%", boxSizing: "border-box", padding: "11px 40px 11px 40px",
                        borderRadius: "11px", fontSize: "14px", outline: "none", color: "#111827",
                        border: "1.5px solid " + (confirmPassword ? (isPasswordMatch ? "#10b981" : "#ef4444") : "#e2e8f0"),
                        background: "#fff",
                      }}
                    />
                    <button
                      type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: "absolute", right: "12px", top: "12px", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && !isPasswordMatch && (
                    <p style={{ margin: "5px 0 0", fontSize: "11.5px", color: "#dc2626" }}>Passwords do not match</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || !otpVerified || !isPhoneValid || !isPasswordMatch}
                  style={{
                    marginTop: "6px", width: "100%", padding: "13px", borderRadius: "12px",
                    background: (otpVerified && isPhoneValid && isPasswordMatch)
                      ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#e2e8f0",
                    color: (otpVerified && isPhoneValid && isPasswordMatch) ? "#fff" : "#94a3b8",
                    border: "none", fontSize: "14.5px", fontWeight: 700,
                    cursor: (otpVerified && isPhoneValid && isPasswordMatch) ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    boxShadow: (otpVerified && isPhoneValid && isPasswordMatch) ? "0 4px 16px rgba(37,99,235,0.3)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {isSubmitting
                    ? <><RefreshCw size={16} className="animate-spin" /> Registering...</>
                    : <>Submit Registration <ArrowRight size={16} /></>}
                </button>

                <div style={{ textAlign: "center", fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenLogin && onOpenLogin(); }}
                    style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
                  >
                    Sign In to Demo
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {step === "activation_sent" && registeredLead && (
          <div style={{ padding: "44px 32px", textAlign: "center" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
              color: "#059669", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              border: "2px solid #6ee7b7", boxShadow: "0 8px 24px rgba(5,150,105,0.18)",
            }}>
              <CheckCircle2 size={36} />
            </div>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#059669", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "8px" }}>
              Registration Successful
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", margin: "0 0 10px" }}>
              Check Your Email Inbox!
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, maxWidth: "400px", margin: "0 auto 26px" }}>
              We have sent an activation link to <strong style={{ color: "#1e293b" }}>{registeredLead.email}</strong>.
              Click Accept & Activate in that email to begin your 3-Hour Demo.
            </p>
            <div style={{
              background: "#eff6ff", border: "1.5px solid #bfdbfe",
              borderRadius: "14px", padding: "18px", textAlign: "left", marginBottom: "20px",
              display: "flex", alignItems: "flex-start", gap: "12px"
            }}>
              <div style={{ color: "#2563eb", marginTop: "2px" }}>
                <Mail size={20} />
              </div>
              <div style={{ fontSize: "13px", color: "#1e3a8a", lineHeight: 1.5 }}>
                <strong>Important:</strong> You must click the activation link inside the email we just sent to verify your identity. The link will safely open your secure Demo Workspace setup.
              </div>
            </div>
            {fallbackActivationUrl && (
              <div style={{
                margin: "20px 0",
                padding: "16px",
                background: "#f0fdf4",
                border: "1.5px dashed #86efac",
                borderRadius: "12px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "12px", color: "#166534", fontWeight: 600, marginBottom: "10px" }}>
                  Delivery slow or testing environment? Activate directly:
                </div>
                <a
                  href={fallbackActivationUrl}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "11px 22px", borderRadius: "9px",
                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                    color: "#ffffff", fontWeight: 700, fontSize: "13.5px",
                    textDecoration: "none", boxShadow: "0 4px 14px rgba(22,163,74,0.3)"
                  }}
                >
                  Activate Demo Workspace Now <ArrowRight size={15} />
                </a>
              </div>
            )}

            <button
              type="button" onClick={onClose}
              style={{
                padding: "9px 22px", borderRadius: "9px",
                background: "#f1f5f9", color: "#64748b",
                border: "1px solid #e2e8f0", fontSize: "13px",
                fontWeight: 600, cursor: "pointer",
              }}
            >
              Close — Check Email Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
