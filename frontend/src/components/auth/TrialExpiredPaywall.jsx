import React, { useState } from 'react';
import {
  Users, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Lock,
  CreditCard, Sparkles, Building2, Check, RefreshCw, Smartphone,
  Zap, HelpCircle, Phone, Mail, Globe, Clock, AlertTriangle
} from 'lucide-react';

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: 59,
    unit: '/user/mo',
    desc: 'For small teams getting started with smart HR automation.',
    popular: false,
    features: [
      'Organization & Employee Management',
      'Attendance & GPS Check-In',
      'Leave Management & Approvals',
      'Payroll & Payslip Generation',
      'Recruitment & Projects'
    ]
  },
  {
    key: 'professional',
    name: 'Professional',
    price: 99,
    unit: '/user/mo',
    desc: 'For growing businesses requiring onboarding and rich HR analytics.',
    popular: false,
    features: [
      'Everything in Starter',
      'Structured Onboarding Workflows',
      'Reports & Workforce Analytics',
      'Biometric Machine Sync',
      'Multi-level Approval Chains'
    ]
  },
  {
    key: 'business',
    name: 'Business',
    price: 149,
    unit: '/user/mo',
    desc: 'Comprehensive suite including performance reviews and expense tracking.',
    popular: true,
    features: [
      'Everything in Professional',
      'Performance Management (OKRs)',
      'Expense Claims & Reimbursements',
      'Automated Job Board Posting',
      'Priority Tech Support'
    ]
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 199,
    unit: '/user/mo',
    desc: 'Complete intelligent HR platform with AI Assistant & dedicated advisory.',
    popular: false,
    features: [
      'Everything in Business',
      'Learning & Development (L&D)',
      'AI-Powered HR Assistant',
      'Cloud & On-Premise Deployment',
      'Dedicated Account Manager'
    ]
  }
];

export function TrialExpiredPaywall({ onRenewTrial, onSubscribeSuccess, onReturnHome, trialUser }) {
  const [selectedPlan, setSelectedPlan] = useState('business');
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const isYearly = billingCycle === 'yearly';
  const activePlanObj = PLANS.find((p) => p.key === selectedPlan) || PLANS[2];
  const monthlyPrice = activePlanObj.price;
  const effectivePrice = isYearly ? Math.round(monthlyPrice * 0.8) : monthlyPrice;

  const handlePay = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentComplete(true);
      setTimeout(() => {
        onSubscribeSuccess && onSubscribeSuccess(selectedPlan);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="pb-paywall-page">
      {/* Background Ambient */}
      <div className="pb-paywall-bg"></div>

      <div className="pb-paywall-container">
        {/* Top Header */}
        <div className="pb-paywall-header">
          <div className="pb-paywall-alert-badge">
            <AlertTriangle size={15} className="text-amber-500" />
            <span>3-Day Free Trial Session Concluded</span>
          </div>
          <h1 className="pb-paywall-title">
            Unlock Full Access to Madhura HRMS
          </h1>
          <p className="pb-paywall-sub">
            Your 3-day trial for <strong>{trialUser?.company || 'Your Company'}</strong> has ended. Choose a plan to keep your employee records, payroll workflows, and all 18 modules active.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pb-pricing-toggle-wrap" style={{ marginTop: '24px' }}>
            <div className="pb-pricing-toggle">
              <button className={!isYearly ? 'active' : ''} onClick={() => setBillingCycle('monthly')}>
                Monthly Billing
              </button>
              <button className={isYearly ? 'active' : ''} onClick={() => setBillingCycle('yearly')}>
                Yearly Billing <span className="pb-save-pill">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Plans Selection Grid */}
        <div className="pb-paywall-plans-grid">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.key;
            const price = isYearly ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <div
                key={plan.key}
                className={`pb-paywall-plan-card ${isSelected ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                onClick={() => setSelectedPlan(plan.key)}
              >
                {plan.popular && <div className="pb-paywall-plan-tag">Recommended</div>}
                <div className="pb-paywall-plan-header">
                  <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.desc}</p>
                </div>

                <div className="pb-paywall-price-row">
                  <span className="text-3xl font-extrabold text-slate-900">₹{price}</span>
                  <span className="text-xs text-slate-500 font-semibold">{plan.unit}</span>
                </div>
                <div className="text-[11px] text-slate-400 mb-4">
                  {isYearly ? 'Billed annually' : 'Billed monthly'}
                </div>

                <ul className="pb-paywall-feature-list">
                  {plan.features.map((f, i) => (
                    <li key={i}>
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`pb-paywall-select-btn ${isSelected ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.key);
                    setShowCheckout(true);
                  }}
                >
                  {isSelected ? 'Pay & Subscribe' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Checkout Drawer / Modal */}
        {showCheckout && (
          <div className="pb-modal-overlay" onClick={() => setShowCheckout(false)}>
            <div className="pb-checkout-modal" onClick={(e) => e.stopPropagation()}>
              {!paymentComplete ? (
                <div>
                  <div className="pb-checkout-header">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Secure Checkout
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">
                        Subscribe to {activePlanObj.name} Plan
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-blue-600">₹{effectivePrice}</div>
                      <div className="text-xs text-slate-500">{activePlanObj.unit} ({isYearly ? 'Annual' : 'Monthly'})</div>
                    </div>
                  </div>

                  <form onSubmit={handlePay} className="p-6 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-2 block">Choose Payment Method:</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          className={`pb-pay-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('upi')}
                        >
                          <Smartphone size={16} /> UPI / QR
                        </button>
                        <button
                          type="button"
                          className={`pb-pay-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('card')}
                        >
                          <CreditCard size={16} /> Cards
                        </button>
                        <button
                          type="button"
                          className={`pb-pay-tab ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('netbanking')}
                        >
                          <Building2 size={16} /> Net Banking
                        </button>
                      </div>
                    </div>

                    {paymentMethod === 'upi' && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <div className="w-32 h-32 bg-white border border-slate-300 rounded-lg mx-auto flex items-center justify-center p-2 shadow-xs">
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=biz@madhuratech&pn=MadhuraTechnologies&am=59"
                            alt="Scan UPI QR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Scan with Google Pay, PhonePe, Paytm, or BHIM
                        </p>
                        <div className="text-xs font-bold text-slate-700 mt-1">UPI ID: biz@madhuratech</div>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-600">Card Number</label>
                          <input
                            type="text"
                            placeholder="4532 •••• •••• 8921"
                            className="pb-trial-input"
                            defaultValue="4532 8920 1829 4892"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-semibold text-slate-600">Expiry (MM/YY)</label>
                            <input type="text" placeholder="12/28" className="pb-trial-input" defaultValue="09/28" required />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600">CVV</label>
                            <input type="password" placeholder="•••" className="pb-trial-input" defaultValue="342" required />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'netbanking' && (
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Select Bank</label>
                        <select className="pb-trial-select">
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>State Bank of India (SBI)</option>
                          <option>Axis Bank</option>
                        </select>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="pb-btn-primary"
                        style={{ width: '100%', padding: '14px', fontSize: '15px' }}
                      >
                        {isProcessing ? 'Processing Secure Payment...' : `Complete Payment of ₹${effectivePrice}`}
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span>256-bit SSL Encrypted • Instant Activation</span>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Payment Successful!</h3>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto">
                    Your subscription to <strong>{activePlanObj.name} Plan</strong> is now active. Launching your Super Admin workspace...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alternative Actions */}
        <div className="pb-paywall-bottom-actions">
          <button
            type="button"
            className="pb-paywall-bottom-btn"
            onClick={onRenewTrial}
          >
            <RefreshCw size={15} className="text-blue-400" />
            <span>Start Another 3-Day Demo Session</span>
          </button>
          <button
            type="button"
            className="pb-paywall-bottom-btn"
            onClick={onReturnHome}
          >
            <span>← Return to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
