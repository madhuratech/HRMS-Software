import React, { useState } from 'react';
import { User, Lock, TrendingUp, Mail, MapPin, Briefcase, Phone, ShieldCheck, CheckCircle, X, Loader2 } from 'lucide-react';







export function Register({ onRegister, onLoginClick }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'SALES_MANAGER',
    branch: 'New York Branch'
  });

  const [verifications, setVerifications] = useState({
    email: { sent: false, verified: false, otp: '', loading: false },
    phone: { sent: false, verified: false, otp: '', loading: false }
  });

  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaSolved, setCaptchaSolved] = useState(false);

  const handleVerifyRequest = (type) => {
    if (type === 'email') {
      if (!formData.email) return;
      setShowCaptcha(true);
    } else {
      if (!formData.phone) return;
      setVerifications((prev) => ({
        ...prev,
        phone: { ...prev.phone, loading: true }
      }));
      // Simulate sending OTP
      setTimeout(() => {
        setVerifications((prev) => ({
          ...prev,
          phone: { ...prev.phone, loading: false, sent: true }
        }));
      }, 1500);
    }
  };

  const handleCaptchaSuccess = () => {
    setCaptchaSolved(true);
    setShowCaptcha(false);
    setVerifications((prev) => ({
      ...prev,
      email: { ...prev.email, loading: true }
    }));
    // Simulate sending OTP
    setTimeout(() => {
      setVerifications((prev) => ({
        ...prev,
        email: { ...prev.email, loading: false, sent: true }
      }));
    }, 1500);
  };

  const handleVerifyOTP = (type) => {
    setVerifications((prev) => ({
      ...prev,
      [type]: { ...prev[type], loading: true }
    }));

    // Simulate verifying OTP
    setTimeout(() => {
      setVerifications((prev) => ({
        ...prev,
        [type]: { ...prev[type], loading: false, verified: true }
      }));
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!verifications.email.verified || !verifications.phone.verified) return;
    onRegister(formData.role, formData.name);
  };

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
            <p className="text-slate-500">Enter your details to register.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="John Doe"
                  required />
                
              </div>
            </div>

            {/* Email Verification */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex justify-between">
                Email Address
                {verifications.email.verified && <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle size={12} /> Verified</span>}
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={verifications.email.verified || verifications.email.sent}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:bg-slate-100"
                    placeholder="name@company.com"
                    required />
                  
                </div>
                {!verifications.email.verified &&
                <button
                  type="button"
                  onClick={() => handleVerifyRequest('email')}
                  disabled={!formData.email || verifications.email.loading || verifications.email.sent}
                  className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 min-w-[100px]">
                  
                    {verifications.email.loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : verifications.email.sent ? 'Sent' : 'Verify'}
                  </button>
                }
              </div>
              {verifications.email.sent && !verifications.email.verified &&
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                  <input
                  type="text"
                  placeholder="Enter Email OTP"
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={verifications.email.otp}
                  onChange={(e) => setVerifications((prev) => ({ ...prev, email: { ...prev.email, otp: e.target.value } }))} />
                
                  <button
                  type="button"
                  onClick={() => handleVerifyOTP('email')}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                  
                    Confirm
                  </button>
                </div>
              }
            </div>

            {/* Mobile Verification */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex justify-between">
                Mobile Number
                {verifications.phone.verified && <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle size={12} /> Verified</span>}
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={verifications.phone.verified || verifications.phone.sent}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:bg-slate-100"
                    placeholder="+1 (555) 000-0000"
                    required />
                  
                </div>
                {!verifications.phone.verified &&
                <button
                  type="button"
                  onClick={() => handleVerifyRequest('phone')}
                  disabled={!formData.phone || verifications.phone.loading || verifications.phone.sent}
                  className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 min-w-[100px]">
                  
                    {verifications.phone.loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : verifications.phone.sent ? 'Sent' : 'Verify'}
                  </button>
                }
              </div>
              {verifications.phone.sent && !verifications.phone.verified &&
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                  <input
                  type="text"
                  placeholder="Enter Mobile OTP"
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={verifications.phone.otp}
                  onChange={(e) => setVerifications((prev) => ({ ...prev, phone: { ...prev.phone, otp: e.target.value } }))} />
                
                  <button
                  type="button"
                  onClick={() => handleVerifyOTP('phone')}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                  
                    Confirm
                  </button>
                </div>
              }
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none transition-all">
                    
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                    <option value="SALES_MANAGER">Sales Manager</option>
                    <option value="SERVICE_STAFF">Service Staff</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Branch</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none transition-all">
                    
                    <option value="New York">New York</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="Chicago">Chicago</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Create a password"
                  required />
                
              </div>
            </div>

            <button
              type="submit"
              disabled={!verifications.email.verified || !verifications.phone.verified}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4">
              
              <ShieldCheck size={18} /> Complete Registration
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <button
                onClick={onLoginClick}
                className="text-blue-600 font-bold hover:underline">
                
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Captcha Modal */}
        {showCaptcha &&
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Security Check</h3>
                <button onClick={() => setShowCaptcha(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-4 mb-6">
                <input
                type="checkbox"
                id="captcha-check"
                className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                onChange={(e) => {
                  if (e.target.checked) {
                    setTimeout(handleCaptchaSuccess, 500);
                  }
                }} />
              
                <label htmlFor="captcha-check" className="text-sm text-slate-700 font-medium cursor-pointer select-none">
                  I am not a robot
                </label>
                <div className="ml-auto">
                  <ShieldCheck size={24} className="text-slate-300" />
                </div>
              </div>
              <p className="text-xs text-center text-slate-400">
                Please verify you are human to proceed with email verification.
              </p>
            </div>
          </div>
        }
      </div>
    </div>);

}