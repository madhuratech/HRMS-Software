import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, CheckCircle, Loader2, TrendingUp, Briefcase, KeyRound } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export function Register({ onRegister, onLoginClick }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee'); // 'Admin' | 'Employee'
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Session & Verification States
  const [sessionId, setSessionId] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle 60s resend cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Reset verification state if user edits Full Name or Email Address
  const handleNameChange = (e) => {
    setName(e.target.value);
    resetVerificationState();
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    resetVerificationState();
  };

  const resetVerificationState = () => {
    setEmailVerified(false);
    setVerifiedEmail('');
    setSessionId('');
    setOtpSent(false);
    setOtpCode('');
  };

  const handleVerifyEmailRequest = async () => {
    if (!name || !email) {
      setErrorMsg("Please enter Full Name and Company Email before verifying.");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await apiFetch('/auth/verify-email-request', {
        method: 'POST',
        body: JSON.stringify({ name, email, role })
      });

      if (data && data.success) {
        setOtpSent(true);
        setSessionId(data.sessionId || '');
        setCooldown(60);
        setSuccessMsg(data.message || `Verification code sent to ${email}`);
      } else {
        setErrorMsg((data && data.message) || "Failed to send verification code.");
      }
    } catch (err) {
      console.error("Verification request error:", err);
      setErrorMsg(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }
    if (!sessionId) {
      setErrorMsg("No verification session found. Please click Verify Email again.");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code: otpCode, sessionId })
      });

      if (data && data.success && data.verified) {
        setEmailVerified(true);
        setVerifiedEmail(email);
        setOtpSent(false);
        setSuccessMsg(data.message || "Email Verified Successfully ✓");
      } else {
        setEmailVerified(false);
        setErrorMsg((data && data.message) || "Invalid verification code. Please check your email and try again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setEmailVerified(false);
      setErrorMsg(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    if (!emailVerified || email.trim().toLowerCase() !== verifiedEmail.trim().toLowerCase() || !sessionId) {
      setErrorMsg("Please verify your email before creating your account.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, role, password, confirmPassword, sessionId })
      });

      if (data && data.success) {
        setSuccessMsg(data.message || "Account Created Successfully ✓ Redirecting to login...");
        setTimeout(() => {
          onLoginClick();
        }, 1500);
      } else {
        setErrorMsg((data && data.message) || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Account registration error:", err);
      setErrorMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isVerifiedForCurrentEmail = emailVerified && email.trim().toLowerCase() === verifiedEmail.trim().toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Brand & Info */}
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80')] bg-cover bg-center opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/90 to-indigo-900/90"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600">
                <TrendingUp size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">HAWKEYE NEST</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4">Join the Platform</h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Create your account to start managing your team, tracking sales, and streamlining operations.
            </p>
          </div>

          <div className="relative z-10 mt-8">
             <div className="p-4 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
                <p className="font-bold text-lg mb-1">"A game changer for our branch."</p>
                <p className="text-sm text-blue-200">- Sarah J., Branch Manager</p>
             </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="md:w-1/2 p-12 bg-white flex flex-col justify-center relative">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Account</h2>
            <p className="text-slate-500">Enter your company credentials to register.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmitRegister} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  disabled={isVerifiedForCurrentEmail}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:opacity-70"
                  placeholder="Enter your full name"
                  required />
              </div>
            </div>

            {/* Company Email Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex justify-between">
                Company Email
                {isVerifiedForCurrentEmail && (
                  <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                    <CheckCircle size={13} /> Verified
                  </span>
                )}
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isVerifiedForCurrentEmail}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:opacity-70"
                    placeholder="name@company.com"
                    required />
                </div>
                {!isVerifiedForCurrentEmail && !otpSent && (
                  <button
                    type="button"
                    onClick={handleVerifyEmailRequest}
                    disabled={loading || !name || !email}
                    className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 min-w-[100px] transition-all"
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Verify Email'}
                  </button>
                )}
              </div>
            </div>

            {/* OTP Code Entry UI */}
            {otpSent && !isVerifiedForCurrentEmail && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <KeyRound size={15} className="text-blue-600" />
                  <span>Enter 6-Digit OTP sent to {email}</span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="------"
                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading || otpCode.length < 6}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Verify OTP'}
                  </button>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                  <span>Didn't receive the code?</span>
                  {cooldown > 0 ? (
                    <span className="text-slate-400 font-medium text-[11px]">
                      Resend available in {cooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyEmailRequest}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Role Selection Option - Admin / Employee */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isVerifiedForCurrentEmail}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none transition-all disabled:opacity-70"
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!isVerifiedForCurrentEmail}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:opacity-50"
                  placeholder="Create password"
                  required />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!isVerifiedForCurrentEmail}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:opacity-50"
                  placeholder="Confirm password"
                  required />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isVerifiedForCurrentEmail}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4 text-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <button
                onClick={onLoginClick}
                className="text-blue-600 font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}