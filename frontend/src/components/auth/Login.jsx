import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Briefcase, TrendingUp, Wrench } from 'lucide-react';







export function Login({ onLogin, onRegisterClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login - in a real app, this would validate credentials
    let name = "John Doe";
    if (selectedRole === 'SUPER_ADMIN') name = "Admin User";
    if (selectedRole === 'SALES_MANAGER') name = "Sarah Sales";
    if (selectedRole === 'SERVICE_STAFF') name = "Mike Mechanic";

    onLogin(selectedRole, name);
  };

  // Quick preset helper
  const setPreset = (role, emailVal) => {
    setSelectedRole(role);
    setEmail(emailVal);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Brand & Info */}
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/90 to-indigo-900/90"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600">
                <TrendingUp size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">HAWKEYE NEST</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4">Enterprise Management Solution</h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Unified platform for HR, Sales, and Service management across all your branches.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <ShieldCheck className="mb-2 text-blue-200" />
              <h3 className="font-bold">Role Based</h3>
              <p className="text-xs text-blue-100">Secure access control</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <Wrench className="mb-2 text-blue-200" />
              <h3 className="font-bold">Service Ops</h3>
              <p className="text-xs text-blue-100">Job card tracking</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-12 bg-white flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome back</h2>
            <p className="text-slate-500">Please choose your role and sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreset('SUPER_ADMIN', 'admin@hawkeye.com')}
                  className={`p-3 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${selectedRole === 'SUPER_ADMIN' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  
                  <ShieldCheck size={16} /> Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('SALES_MANAGER', 'sales@hawkeye.com')}
                  className={`p-3 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${selectedRole === 'SALES_MANAGER' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  
                  <TrendingUp size={16} /> Sales Mgr
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('SERVICE_STAFF', 'tech@hawkeye.com')}
                  className={`p-3 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${selectedRole === 'SERVICE_STAFF' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  
                  <Wrench size={16} /> Service Staff
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('BRANCH_MANAGER', 'branch@hawkeye.com')}
                  className={`p-3 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${selectedRole === 'BRANCH_MANAGER' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  
                  <Briefcase size={16} /> Branch Mgr
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="name@company.com"
                    required />
                  
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="••••••••"
                    required />
                  
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
              
              Sign In to Dashboard <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <button
                onClick={onRegisterClick}
                className="text-blue-600 font-bold hover:underline">
                
                Create Account
              </button>
            </p>
          </div>
          
          <p className="mt-8 text-center text-xs text-slate-400">
            © 2026 HAWKEYE NEST. All rights reserved.
          </p>
        </div>
      </div>
    </div>);

}