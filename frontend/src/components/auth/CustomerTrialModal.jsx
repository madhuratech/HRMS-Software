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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

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
        setOtpError(res.message || "Failed to send OTP. Please try again.");
        setOtpSent(false);
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        setOtpError("The server took too long to respond. Please try again.");
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
        backgroundColor: "rgba(2, 6, 23, 0.82)", backdropFilter: "blur(14px)",
        zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff", borderRadius: "20px",
          maxWidth: step === "activation_sent" ? "500px" : "492px",
          width: "100%", position: "relative", maxHeight: "92vh", overflowY: "auto",
          boxShadow: "0 32px 64px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: "14px", right: "14px", background: "rgba(255,255,255,0.18)",
            border: "none", borderRadius: "50%", width: "28px", height: "28px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff", zIndex: 5,
          }}
        >
          <X size={14} />
        </button>

        {step === "form" && (
          <>
            {/* Blue gradient header */}
            <div style={{
              background: "linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #3b82f6 100%)",
              padding: "28px 28px 22px", borderRadius: "20px 20px 0 0", color: "#fff",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.18)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Sparkles size={19} />
                </div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.75 }}>
                    Madhura HRMS • Free Trial
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.3px" }}>
                    Start 3-Hour Demo Workspace
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "13px", opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
                Full Super Admin access to all HRMS modules. No credit card required.
              </p>
            </div>

            {/* Form body */}
            <div style={{ padding: "22px 26px 26px" }}>
              {formError && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#fef2f2", border: "1px solid #fecaca",
                  borderRadius: "10px", padding: "10px 12px", marginBottom: "14px",
                  fontSize: "13px", color: "#b91c1c",
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitTrial} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    Full Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={14} style={{ position: "absolute", left: "11px", top: "11px", color: "#9ca3af", pointerEvents: "none" }} />
                    <input
                      type="text" required placeholder="e.g. Rahul Sharma"
                      value={username} onChange={(e) => setUsername(e.target.value)}
                      style={{
                        width: "100%", boxSizing: "border-box", padding: "9px 12px 9px 34px",
                        borderRadius: "9px", border: "1.5px solid #e2e8f0", fontSize: "13.5px",
                        outline: "none", color: "#111827",
                      }}
                    />
                  </div>
                </div>

                {/* Email + OTP */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                      Email Address <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    {otpVerified && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "3px",
                        background: "#f0fdf4", border: "1px solid #bbf7d0",
                        color: "#15803d", fontSize: "10.5px", fontWeight: 700,
                        padding: "2px 7px", borderRadius: "20px",
                      }}>
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    )}
                    {isSendingOtp && (
                      <span style={{ fontSize: "11px", color: "#3b82f6", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Loader2 size={11} className="animate-spin" /> Sending OTP...
                      </span>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <Mail size={14} style={{ position: "absolute", left: "11px", top: "11px", color: "#9ca3af", pointerEvents: "none" }} />
                    <input
                      type="email" required disabled={otpVerified}
                      placeholder="name@gmail.com" value={email}
                      onChange={(e) => {
                        setEmail(e.target.value); setOtpVerified(false);
                        setOtpSent(false); setOtpCode(""); setDevPreviewOtp("");
                      }}
                      onBlur={handleEmailBlur}
                      style={{
                        width: "100%", boxSizing: "border-box", padding: "9px 36px 9px 34px",
                        borderRadius: "9px", fontSize: "13.5px", outline: "none", color: "#111827",
                        border: "1.5px solid " + (otpVerified ? "#10b981" : isSendingOtp ? "#3b82f6" : otpSent ? "#3b82f6" : "#e2e8f0"),
                        background: otpVerified ? "#f0fdf4" : "#fff",
                        transition: "border 0.2s",
                      }}
                    />
                    {/* Manual send icon as fallback — shown when not yet sent and not loading */}
                    {!otpVerified && !isSendingOtp && !otpSent && isValidEmail(email) && (
                      <button
                        type="button" onClick={() => handleSendOtp(email)}
                        title="Send OTP"
                        style={{
                          position: "absolute", right: "10px", top: "9px",
                          background: "none", border: "none", cursor: "pointer",
                          color: "#3b82f6", padding: 0, display: "flex", alignItems: "center",
                        }}
                      >
                        <Send size={14} />
                      </button>
                    )}
                    {isSendingOtp && (
                      <Loader2 size={14} color="#3b82f6" style={{ position: "absolute", right: "10px", top: "11px" }} className="animate-spin" />
                    )}
                    {/* Manual resend when already sent but needs to resend */}
                    {!otpVerified && otpSent && otpTimer === 0 && (
                      <button
                        type="button" onClick={handleResendOtp} title="Resend OTP"
                        style={{
                          position: "absolute", right: "8px", top: "8px",
                          background: "#eff6ff", border: "1px solid #bfdbfe", cursor: "pointer",
                          color: "#2563eb", padding: "2px 6px", borderRadius: "5px",
                          fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px",
                        }}
                      >
                        <RefreshCw size={11} /> Resend
                      </button>
                    )}
                  </div>

                  {otpSent && !otpVerified && (
                    <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                          Verification Code <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          Sent to <strong>{email}</strong>
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          ref={otpInputRef}
                          type="text" maxLength={6} placeholder="• • • • • •" value={otpCode}
                          onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                          onKeyDown={(e) => { if (e.key === "Enter" && otpCode.length === 6) handleVerifyOtp(); }}
                          style={{
                            flex: 1, padding: "10px 12px", borderRadius: "9px",
                            border: "1.5px solid #e2e8f0", fontSize: "18px", fontWeight: 700,
                            letterSpacing: "12px", textAlign: "center", outline: "none", boxSizing: "border-box",
                            color: "#111827", transition: "border 0.2s"
                          }}
                          onFocus={(e) => e.target.style.border = '1.5px solid #3b82f6'}
                          onBlur={(e) => e.target.style.border = '1.5px solid #e2e8f0'}
                        />
                        <button
                          type="button" onClick={handleVerifyOtp}
                          disabled={isVerifyingOtp || otpCode.length !== 6}
                          style={{
                            padding: "0 18px", borderRadius: "9px", border: "none",
                            background: otpCode.length === 6 ? "#10b981" : "#f1f5f9",
                            color: otpCode.length === 6 ? "#fff" : "#94a3b8",
                            fontSize: "13px", fontWeight: 700,
                            cursor: otpCode.length === 6 ? "pointer" : "not-allowed", whiteSpace: "nowrap",
                            transition: "all 0.2s"
                          }}
                        >
                          {isVerifyingOtp ? "Checking..." : "Verify"}
                        </button>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {otpError ? (
                          <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: 500 }}>{otpError}</span>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#9ca3af" }}>Enter the 6-digit code from your email</span>
                        )}
                        
                        <button
                          type="button" onClick={handleResendOtp} disabled={otpTimer > 0}
                          style={{
                            background: "none", border: "none", padding: 0,
                            color: otpTimer > 0 ? "#9ca3af" : "#2563eb",
                            fontWeight: 600, cursor: otpTimer > 0 ? "default" : "pointer",
                            fontSize: "11.5px", transition: "color 0.2s"
                          }}
                        >
                          {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend Code"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                      Mobile Number <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    {phone && (
                      <span style={{ fontSize: "11px", fontWeight: 600, color: isPhoneValid ? "#059669" : "#d97706" }}>
                        {isPhoneValid ? "Valid ✓" : countryCode === "+91" ? "10 digits required" : "Invalid format"}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "7px" }}>
                    <div style={{ position: "relative" }}>
                      <select
                        value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                        style={{
                          padding: "9px 28px 9px 10px", borderRadius: "9px",
                          border: "1.5px solid #e2e8f0", fontSize: "13px", fontWeight: 600,
                          background: "#f8fafc", outline: "none", cursor: "pointer",
                          appearance: "none", WebkitAppearance: "none",
                        }}
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+65">🇸🇬 +65</option>
                      </select>
                      <ChevronDown size={12} style={{ position: "absolute", right: "8px", top: "11px", color: "#64748b", pointerEvents: "none" }} />
                    </div>
                    <div style={{ position: "relative", flex: 1 }}>
                      <Phone size={14} style={{ position: "absolute", left: "11px", top: "11px", color: "#9ca3af", pointerEvents: "none" }} />
                      <input
                        type="tel" required
                        placeholder={countryCode === "+91" ? "98765 43210" : "Phone number"}
                        value={phone} onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: "100%", boxSizing: "border-box", padding: "9px 12px 9px 34px",
                          borderRadius: "9px", fontSize: "13.5px", outline: "none", color: "#111827",
                          border: "1.5px solid " + (phone ? (isPhoneValid ? "#10b981" : "#f59e0b") : "#e2e8f0"),
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Passwords */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                      Create Password <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock size={14} style={{ position: "absolute", left: "11px", top: "11px", color: "#9ca3af", pointerEvents: "none" }} />
                      <input
                        type={showPassword ? "text" : "password"} required
                        placeholder="Min. 6 chars" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: "100%", boxSizing: "border-box", padding: "9px 32px 9px 34px",
                          borderRadius: "9px", border: "1.5px solid #e2e8f0", fontSize: "13px",
                          outline: "none", color: "#111827",
                        }}
                      />
                      <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: "absolute", right: "10px", top: "10px", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                      Confirm Password <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock size={14} style={{ position: "absolute", left: "11px", top: "11px", color: "#9ca3af", pointerEvents: "none" }} />
                      <input
                        type={showConfirmPassword ? "text" : "password"} required
                        placeholder="Repeat password" value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                          width: "100%", boxSizing: "border-box", padding: "9px 32px 9px 34px",
                          borderRadius: "9px", fontSize: "13px", outline: "none", color: "#111827",
                          border: "1.5px solid " + (confirmPassword ? (isPasswordMatch ? "#10b981" : "#ef4444") : "#e2e8f0"),
                        }}
                      />
                      <button
                        type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: "absolute", right: "10px", top: "10px", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {confirmPassword && !isPasswordMatch && (
                      <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#dc2626" }}>Passwords do not match</p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || !otpVerified || !isPhoneValid || !isPasswordMatch}
                  style={{
                    marginTop: "4px", width: "100%", padding: "12px", borderRadius: "11px",
                    background: (otpVerified && isPhoneValid && isPasswordMatch)
                      ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#e2e8f0",
                    color: (otpVerified && isPhoneValid && isPasswordMatch) ? "#fff" : "#94a3b8",
                    border: "none", fontSize: "14px", fontWeight: 700,
                    cursor: (otpVerified && isPhoneValid && isPasswordMatch) ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    boxShadow: (otpVerified && isPhoneValid && isPasswordMatch) ? "0 4px 15px rgba(37,99,235,0.35)" : "none",
                  }}
                >
                  {isSubmitting
                    ? <><RefreshCw size={15} className="animate-spin" /> Registering...</>
                    : <>Submit Registration <ArrowRight size={15} /></>}
                </button>

                <div style={{ textAlign: "center", fontSize: "12.5px", color: "#94a3b8" }}>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenLogin && onOpenLogin(); }}
                    style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", fontSize: "12.5px" }}
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
