import React, { useState } from 'react';
import './LandingPage.css';
import {
  Users, CheckCircle2, XCircle, Minus, MapPin, Mail, Phone, Globe,
  Shield, Zap, Layers, Server, Bot, RefreshCw, Headphones, ArrowRight,
  TrendingUp, Check, ChevronRight, HelpCircle, Sparkles, Building2,
  FileSpreadsheet, Rocket, Database, GraduationCap, Wrench, LifeBuoy,
  Search, SlidersHorizontal
} from 'lucide-react';

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    badge: 'Essential',
    desc: 'For small teams getting started with smart HR automation.',
    monthly: 59,
    yearly: 47,
    unit: '/user/month',
    cta: 'Get Started',
    popular: false,
    highlight: 'Core HR & Timesheets',
    features: [
      'Organization Management',
      'Employee Management',
      'Attendance & GPS Check-In',
      'Leave Management & Approvals',
      'Payroll & Payslip Generation',
      'Recruitment & Job Pipeline',
      'Document Management Vault',
      'Projects & Timesheets',
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    badge: 'Fast Scaling',
    desc: 'For growing businesses requiring onboarding and rich HR analytics.',
    monthly: 99,
    yearly: 79,
    unit: '/user/month',
    cta: 'Start Free Trial',
    popular: false,
    highlight: 'Everything in Starter + Onboarding & Analytics',
    features: [
      'Everything in Starter',
      'Structured Onboarding Workflows',
      'Reports & Workforce Analytics',
      'Biometric Machine Sync',
      'Multi-level Approval Chains',
      'Employee Self-Service (ESS)',
      'Custom Role Permissions',
      'Standard Support & SLA',
    ],
  },
  {
    key: 'business',
    name: 'Business',
    badge: 'Most Popular',
    desc: 'Comprehensive suite including performance reviews and expense tracking.',
    monthly: 149,
    yearly: 119,
    unit: '/user/month',
    cta: 'Get Started',
    popular: true,
    highlight: 'Everything in Pro + Performance & Expenses',
    features: [
      'Everything in Professional',
      'Performance Management (KPIs & OKRs)',
      'Expense Claims & Reimbursements',
      'Automated Job Board Posting',
      'Shift Rostering & Rotations',
      'Advance Payroll & Tax Deductions',
      'Client & Project Billing Link',
      'Priority Tech Support',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    badge: 'All-Inclusive',
    desc: 'Complete intelligent HR platform with AI Assistant & dedicated advisory.',
    monthly: 199,
    yearly: 159,
    unit: '/user/month',
    cta: 'Contact Sales',
    popular: false,
    highlight: 'Complete 18 Modules + AI + Custom Deploy',
    features: [
      'Everything in Business',
      'Learning & Development (L&D)',
      'Advanced Enterprise Features',
      'AI-Powered HR Assistant',
      'Cloud & On-Premise Deployment',
      'Custom ERP & 3rd-Party Integrations',
      'Dedicated Account Manager',
      'Enterprise SLA & Custom Training',
    ],
  },
];

// Exact comparison table data from Page 12 of HRMS.pdf
const COMPARISON_FEATURES = [
  { name: 'Organization Management', starter: true, professional: true, business: true, enterprise: true, category: 'Core HR' },
  { name: 'Employee Management', starter: true, professional: true, business: true, enterprise: true, category: 'Core HR' },
  { name: 'Attendance', starter: true, professional: true, business: true, enterprise: true, category: 'Core HR' },
  { name: 'Leave Management', starter: true, professional: true, business: true, enterprise: true, category: 'Core HR' },
  { name: 'Payroll', starter: true, professional: true, business: true, enterprise: true, category: 'Core HR' },
  { name: 'Recruitment', starter: true, professional: true, business: true, enterprise: true, category: 'Talent & Admin' },
  { name: 'Documents', starter: true, professional: true, business: true, enterprise: true, category: 'Work & Business' },
  { name: 'Projects & Timesheets', starter: true, professional: true, business: true, enterprise: true, category: 'Work & Business' },
  { name: 'Onboarding', starter: false, professional: true, business: true, enterprise: true, category: 'Talent & Admin' },
  { name: 'Reports & Analytics', starter: false, professional: true, business: true, enterprise: true, category: 'Core HR' },
  { name: 'Performance Management', starter: false, professional: false, business: true, enterprise: true, category: 'Core HR' },
  { name: 'Expenses', starter: false, professional: false, business: true, enterprise: true, category: 'Work & Business' },
  { name: 'Learning & Development', starter: false, professional: false, business: false, enterprise: true, category: 'Enterprise' },
  { name: 'Advanced Enterprise Features', starter: false, professional: false, business: false, enterprise: true, category: 'Enterprise' },
];

const IMPLEMENTATION_STEPS = [
  {
    num: '01',
    title: 'Discover Your HR Needs',
    desc: 'Analyze HR processes, workforce requirements, and implementation goals to design an optimized workflow.'
  },
  {
    num: '02',
    title: 'HRMS Configuration & Customization',
    desc: 'Configure modules, policies, workflows, payroll structures, attendance rules, and granular user roles.'
  },
  {
    num: '03',
    title: 'Employee Data Migration & Integration',
    desc: 'Migrate employee data and integrate with biometric devices, ERP, and third-party business systems.'
  },
  {
    num: '04',
    title: 'Training & Go Live',
    desc: 'Train users, validate workflows, and successfully deploy the HRMS organization-wide with confidence.'
  },
  {
    num: '05',
    title: 'Ongoing Support & Optimization',
    desc: 'Continuous support, updates, monitoring, and proactive optimization for long-term business growth.'
  }
];

const PROFESSIONAL_SERVICES = [
  {
    icon: Rocket,
    title: 'HRMS Implementation',
    desc: 'Configure and deploy the HRMS to align with your organizational structure, HR policies, and business processes.'
  },
  {
    icon: Database,
    title: 'Employee Data Migration',
    desc: 'Securely migrate employee records, payroll data, attendance history, and other HR information with accuracy and minimal downtime.'
  },
  {
    icon: GraduationCap,
    title: 'User Training & Adoption',
    desc: 'Provide hands-on training for HR teams, managers, and employees to ensure smooth adoption and confident system usage.'
  },
  {
    icon: Wrench,
    title: 'Custom Configuration & Integration',
    desc: 'Customize workflows, approval processes, reports, and integrate with biometric devices, ERP systems, and third-party applications.'
  },
  {
    icon: LifeBuoy,
    title: 'Ongoing Support & Optimization',
    desc: 'Receive continuous technical support, system updates, performance monitoring, and expert guidance to maximize long-term value.'
  }
];

const WHY_CHOOSE_ITEMS = [
  { icon: Users, title: 'Complete Employee Lifecycle', desc: 'From recruitment and onboarding to payroll, performance, and offboarding.' },
  { icon: Zap, title: 'Quick & Easy Implementation', desc: 'Fast turnaround with structured data import and ready templates.' },
  { icon: Shield, title: 'Enterprise-Grade Security', desc: '256-bit encryption, role-based access control, and complete audit logs.' },
  { icon: Layers, title: 'Scalable HRMS Platform', desc: 'Engineered to support 10 to 10,000+ employees seamlessly.' },
  { icon: Server, title: 'Cloud & On-Premise Deployment', desc: 'Deploy on our secure cloud or host locally within your enterprise infrastructure.' },
  { icon: Bot, title: 'AI-Powered HR Insights', desc: 'Intelligent workforce analytics and real-time AI assistant for instant support.' },
  { icon: RefreshCw, title: 'Seamless Third-Party Integrations', desc: 'Native connectors for biometric machines, ERPs, accounting, and APIs.' },
  { icon: Headphones, title: 'Dedicated Support & Training', desc: 'Direct access to certified HRMS technical specialists and adoption trainers.' }
];

export function PricingPage({
  onOpenLogin,
  onOpenTrial,
  onOpenCustomerLogin,
  onBackToHome
}) {
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const isYearly = billing === 'yearly';

  const formatPrice = (plan) => {
    const amount = isYearly ? plan.yearly : plan.monthly;
    return `₹${amount}`;
  };

  // Filter comparison features
  const filteredFeatures = COMPARISON_FEATURES.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="pb-landing">
      {/* Fixed Sticky Header (Clean Single Line Navbar) */}
      <header className="pb-header" style={{ top: 0 }}>
        <div className="pb-header-inner">
          <div className="pb-logo" onClick={() => onBackToHome && onBackToHome()} style={{ cursor: 'pointer' }}>
            <Users className="pb-logo-icon" size={22} />
            Madhura<span>HRMS</span>
          </div>

          <nav className="pb-nav">
            <a onClick={() => {
              window.history.pushState({}, '', '/');
              onBackToHome && onBackToHome();
            }} style={{ cursor: 'pointer' }}>Home</a>
            <a onClick={() => {
              window.history.pushState({}, '', '/#features');
              onBackToHome && onBackToHome();
            }} style={{ cursor: 'pointer' }}>Features</a>
            <a className="current">Pricing</a>
            <a onClick={() => {
              window.history.pushState({}, '', '/#contact');
              onBackToHome && onBackToHome();
            }} style={{ cursor: 'pointer' }}>Contact</a>
          </nav>

          <div className="pb-actions">
            <button
              className="pb-btn-primary"
              onClick={() => onOpenTrial ? onOpenTrial() : (onOpenLogin && onOpenLogin())}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              <Sparkles size={14} />
              <span>Free Trial (3-Hour Workspace)</span>
            </button>
            <button
              className="pb-btn-ghost"
              onClick={() => onOpenCustomerLogin ? onOpenCustomerLogin() : (onOpenLogin && onOpenLogin())}
              style={{
                border: '1.5px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              Customer Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Pricing Hero Banner matching PDF Page 11 */}
      <section className="pb-pricing-hero">
        <div className="pb-pdf-banner-tag">
          <Sparkles size={14} className="text-[#f59e0b]" />
          Plans start from ₹59 /user/month
        </div>
        <h1 className="pb-section-title" style={{ fontSize: '42px', marginTop: '12px' }}>
          Intelligent HR Plans for Every Organization
        </h1>
        <p className="pb-section-sub" style={{ maxWidth: '720px', margin: '0 auto' }}>
          Everything you need to manage customers, sales, and operations. Transparent pricing with complete access to our modern HR ecosystem.
        </p>

        {/* Pricing Toggle */}
        <div className="pb-pricing-toggle-wrap" style={{ marginTop: '28px' }}>
          <div className="pb-pricing-toggle">
            <button className={!isYearly ? 'active' : ''} onClick={() => setBilling('monthly')}>
              Monthly Billing
            </button>
            <button className={isYearly ? 'active' : ''} onClick={() => setBilling('yearly')}>
              Yearly Billing <span className="pb-save-pill">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Tier Pricing Cards */}
      <div className="pb-pricing-cards-4col">
        {PLANS.map((plan) => (
          <div key={plan.key} className={`pb-price-card-v2${plan.popular ? ' popular' : ''}`}>
            {plan.popular && <div className="pb-price-badge-v2">Most Popular</div>}
            <div className="pb-price-header-v2">
              <span className="pb-price-tier-tag">{plan.badge}</span>
              <h3 className="pb-price-plan-name">{plan.name}</h3>
              <p className="pb-price-plan-desc">{plan.desc}</p>
            </div>

            <div className="pb-price-amount-row-v2">
              <span className="pb-price-amount-large">{formatPrice(plan)}</span>
              <span className="pb-price-unit-sub">{plan.unit}</span>
            </div>
            <div className="pb-price-billed-text">
              {isYearly ? 'Billed annually (Save 20%)' : 'Billed monthly'}
            </div>

            <button
              className={`pb-price-cta-v2 ${plan.popular ? 'primary' : 'secondary'}`}
              onClick={() => {
                if (plan.key === 'enterprise') {
                  // Enterprise → contact sales (scroll or open contact)
                  window.open('mailto:sales@madhuratech.com?subject=Enterprise HRMS Enquiry', '_blank');
                } else {
                  // All other plans → open free trial registration
                  onOpenTrial ? onOpenTrial() : (onOpenLogin && onOpenLogin());
                }
              }}
            >
              {plan.cta} <ArrowRight size={15} />
            </button>

            <div className="pb-price-feature-highlight">
              <strong>{plan.highlight}</strong>
            </div>

            <ul className="pb-price-feature-list">
              {plan.features.map((f, i) => (
                <li key={i}>
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* EXACT COMPARISON CHART SECTION FROM PAGE 12 OF HRMS.PDF */}
      <section className="pb-comparison-chart-section" id="comparison">
        <div className="pb-section-head">
          <div className="pb-section-eyebrow">FEATURE COMPARISON</div>
          <h2 className="pb-section-title" style={{ fontSize: '32px' }}>COMPARISON CHART</h2>
          <p className="pb-section-sub">
            Detailed breakdown of module availability across all four Madhura HRMS tiers.
          </p>

          {/* Search and Category Filter for Features */}
          <div className="pb-comp-filter-bar">
            <div className="pb-comp-search-wrap">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search features (e.g. Payroll, Onboarding, Expenses)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="pb-comp-cat-buttons">
              <button
                className={`pb-comp-cat-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Features
              </button>
              <button
                className={`pb-comp-cat-btn ${activeCategory === 'Core HR' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Core HR')}
              >
                Core HR
              </button>
              <button
                className={`pb-comp-cat-btn ${activeCategory === 'Work & Business' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Work & Business')}
              >
                Work & Business
              </button>
              <button
                className={`pb-comp-cat-btn ${activeCategory === 'Talent & Admin' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Talent & Admin')}
              >
                Talent & Admin
              </button>
            </div>
          </div>
        </div>

        <div className="pb-comparison-table-wrapper">
          <table className="pb-pdf-comp-table">
            <thead>
              <tr>
                <th className="th-features">HRMS FEATURES</th>
                <th className="th-plan">STARTER</th>
                <th className="th-plan">PROFESSIONAL</th>
                <th className="th-plan popular-th">BUSINESS</th>
                <th className="th-plan">ENTERPRISE</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'even-row' : ''}>
                  <td className="td-feature-name">
                    <span className="feature-text">{item.name.toUpperCase()}</span>
                    <span className="feature-category-badge">{item.category}</span>
                  </td>
                  <td className="td-check-val">
                    {item.starter ? (
                      <div className="pdf-check-icon check-yes">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="pdf-check-icon check-no">
                        <XCircle size={18} strokeWidth={2.5} />
                      </div>
                    )}
                  </td>
                  <td className="td-check-val">
                    {item.professional ? (
                      <div className="pdf-check-icon check-yes">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="pdf-check-icon check-no">
                        <XCircle size={18} strokeWidth={2.5} />
                      </div>
                    )}
                  </td>
                  <td className="td-check-val popular-col">
                    {item.business ? (
                      <div className="pdf-check-icon check-yes">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="pdf-check-icon check-no">
                        <XCircle size={18} strokeWidth={2.5} />
                      </div>
                    )}
                  </td>
                  <td className="td-check-val">
                    {item.enterprise ? (
                      <div className="pdf-check-icon check-yes">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="pdf-check-icon check-no">
                        <XCircle size={18} strokeWidth={2.5} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* IMPLEMENTATION JOURNEY (Page 13) */}
      <section className="pb-impl-journey-section">
        <div className="pb-section-head">
          <div className="pb-section-eyebrow">END-TO-END DEPLOYMENT</div>
          <h2 className="pb-section-title" style={{ fontSize: '32px' }}>Implementation Journey</h2>
          <p className="pb-section-sub">
            Our structured 5-stage deployment methodology ensures seamless migration with zero operational disruption.
          </p>
        </div>

        <div className="pb-impl-timeline-grid">
          {IMPLEMENTATION_STEPS.map((step) => (
            <div key={step.num} className="pb-impl-step-card">
              <div className="pb-impl-step-badge">{step.num}</div>
              <h4 className="pb-impl-step-title">{step.title}</h4>
              <p className="pb-impl-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROFESSIONAL SERVICES (Page 14) */}
      <section className="pb-prof-services-section" id="services">
        <div className="pb-section-head">
          <div className="pb-section-eyebrow">PROFESSIONAL SERVICES</div>
          <h2 className="pb-section-title" style={{ fontSize: '32px' }}>
            Expert Services for a Successful HRMS Journey
          </h2>
          <p className="pb-section-sub">
            Dedicated engineering, onboarding, and advisory services to power enterprise transformation.
          </p>
        </div>

        <div className="pb-services-grid">
          {PROFESSIONAL_SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div key={idx} className="pb-service-card">
                <div className="pb-service-icon-wrap">
                  <Icon size={24} />
                </div>
                <h3 className="pb-service-title">{srv.title}</h3>
                <p className="pb-service-desc">{srv.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHY CHOOSE US (Page 15) */}
      <section className="pb-why-choose-section">
        <div className="pb-section-head">
          <div className="pb-section-eyebrow">WHY CHOOSE US</div>
          <h2 className="pb-section-title" style={{ fontSize: '32px', color: '#ffffff' }}>
            Why Businesses Choose Madhura Technologies
          </h2>
          <p className="pb-section-sub" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Empowering modern enterprises with scalable, secure, and intelligent workforce infrastructure.
          </p>
        </div>

        <div className="pb-why-grid-8">
          {WHY_CHOOSE_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="pb-why-card-item">
                <div className="pb-why-icon-bubble">
                  <Icon size={24} className="text-[#3b82f6]" />
                </div>
                <h4 className="pb-why-card-title">{item.title}</h4>
                <p className="pb-why-card-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="pb-pricing-cta-banner">
        <h2>Ready to transform your HR operations?</h2>
        <p>Join growing organizations that trust Madhura HRMS for complete workforce automation.</p>
        <div className="pb-cta-btn-group">
          <button className="pb-btn-primary" style={{ padding: '14px 32px' }} onClick={() => onOpenLogin && onOpenLogin()}>
            Book a Live Demo
          </button>
          <button className="pb-btn-ghost" style={{ padding: '14px 28px', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => onBackToHome && onBackToHome()}>
            Explore All 18 Modules
          </button>
        </div>
      </section>

      {/* Official Footer matching PDF Page 19 */}
      <footer className="pb-footer-official">
        <div className="pb-footer-inner">
          <div className="pb-footer-brand-col">
            <div className="pb-logo" style={{ color: '#ffffff' }}>
              <Users className="pb-logo-icon" size={22} />
              Madhura<span>HRMS</span>
            </div>
            <p className="pb-footer-tagline">
              Madhura Technologies Pvt. Ltd. — Empowering Organizations with Intelligent Workforce Management.
            </p>
          </div>

          <div className="pb-footer-contact-row">
            <a href="mailto:biz@madhuratech.com" className="pb-contact-chip">
              <Mail size={16} /> biz@madhuratech.com
            </a>
            <a href="tel:+919003663660" className="pb-contact-chip">
              <Phone size={16} /> (+91) 90036 63660
            </a>
            <a href="https://www.madhuratech.com" target="_blank" rel="noreferrer" className="pb-contact-chip">
              <Globe size={16} /> www.madhuratech.com
            </a>
          </div>
        </div>
        <div className="pb-footer-bottom">
          &copy; {new Date().getFullYear()} Madhura Technologies Pvt. Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}