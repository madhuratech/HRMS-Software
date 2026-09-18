import React, { useState } from 'react';
import './LandingPage.css';
import {
  Users, MapPin, CheckCircle2, XCircle, Bell, CreditCard, Briefcase,
  DollarSign, Calendar, Mail, Phone, Globe, ArrowRight, Shield, Zap,
  Layers, Server, Bot, RefreshCw, Headphones, Check, Sparkles, Building2,
  FileSpreadsheet, Rocket, Database, GraduationCap, Wrench, LifeBuoy,
  LayoutDashboard, UserCheck, Clock, FileText, BarChart3, Target,
  FolderGit2, Receipt, UserSquare2, FileBadge, HelpCircle, UserPlus,
  Sliders, ShieldCheck, Share2, Award, ChevronRight, Laptop, Smartphone,
  X, Search, ChevronDown, CheckCircle, Calculator, Send, MessageSquare
} from 'lucide-react';

// All 18 Modules categorized exactly as in Pages 8, 9, and 10 of HRMS.pdf with deep metadata
const ALL_MODULES = [
  // Category 1: Core HR Management (1-6)
  {
    id: 1,
    num: '01',
    category: 'Core HR',
    categoryNum: 'Category 01',
    name: 'Dashboard',
    icon: LayoutDashboard,
    desc: 'Quick overview of attendance, leave, shifts, holidays, workforce information and key HR activities.',
    color: '#2563eb',
    tag: 'Command Center',
    details: [
      'Real-time workforce presence & department distribution',
      'Daily punch status, late arrivals, and absentee metrics',
      'Upcoming holidays, approved leaves, and birthday reminders',
      'Quick action shortcuts for approvals and urgent tasks'
    ],
    audience: 'Admins, HR Managers, Department Heads'
  },
  {
    id: 2,
    num: '02',
    category: 'Core HR',
    categoryNum: 'Category 01',
    name: 'Employee Management',
    icon: Users,
    desc: 'Manage employee profiles, employment details, departments, designations, shifts and workforce records.',
    color: '#059669',
    tag: 'Profiles & Records',
    details: [
      'Comprehensive 360-degree employee directory',
      'Bank, statutory (PF/ESI/PAN), and emergency contacts',
      'Employment history, past promotions, and internal transfers',
      'Custom fields for organization-specific data requirements'
    ],
    audience: 'HR Operations, Admin, Compliance Teams'
  },
  {
    id: 3,
    num: '03',
    category: 'Core HR',
    categoryNum: 'Category 01',
    name: 'Attendance Management',
    icon: Clock,
    desc: 'Track check-ins, check-outs, working hours, attendance history, location-based attendance and geo-fencing.',
    color: '#d97706',
    tag: 'GPS & Geofencing',
    details: [
      'Radius-restricted GPS geofenced mobile check-in',
      'Biometric hardware synchronization and cloud logging',
      'Overtime calculation and late arrival regularization workflows',
      'Rotational shift scheduling with automated notifications'
    ],
    audience: 'All Employees, Shift Supervisors, HR'
  },
  {
    id: 4,
    num: '04',
    category: 'Core HR',
    categoryNum: 'Category 01',
    name: 'Leave Management',
    icon: Calendar,
    desc: 'Manage leave types, applications, approvals, balances, holidays and employee leave history.',
    color: '#7c3aed',
    tag: 'Approvals & Balances',
    details: [
      'Custom leave policies (Casual, Sick, Earned, Maternity, Comp-off)',
      'Multi-level hierarchical approval chains',
      'Accrual rules, carry-forward limits, and encashment',
      'Synchronized company-wide holiday calendar'
    ],
    audience: 'Employees, Reporting Managers, HR Admins'
  },
  {
    id: 5,
    num: '05',
    category: 'Core HR',
    categoryNum: 'Category 01',
    name: 'Payroll',
    icon: CreditCard,
    desc: 'Manage payroll processing, employee payroll information, payslips and payroll access controls.',
    color: '#db2777',
    tag: 'Auto Deductions & Payslips',
    details: [
      'Automated gross-to-net calculation with 1-click batch runs',
      'Built-in statutory compliance: PF, ESI, Professional Tax, TDS',
      'Digital encrypted payslips with email and mobile delivery',
      'Salary structure builder with flexible allowances & deductions'
    ],
    audience: 'Payroll Specialists, Finance, Management'
  },
  {
    id: 6,
    num: '06',
    category: 'Core HR',
    categoryNum: 'Category 01',
    name: 'Performance',
    icon: Target,
    desc: 'Manage employee evaluations, performance records and ongoing performance-related activities.',
    color: '#0891b2',
    tag: 'KPIs & Reviews',
    details: [
      'Goal & OKR tracking with periodic progress checkpoints',
      'Self, peer, and manager 360-degree appraisal cycles',
      'Custom evaluation rubrics and rating matrices',
      'Promotion recommendations linked directly to talent history'
    ],
    audience: 'Team Leads, HR Business Partners, Employees'
  },

  // Category 2: Work & Business Management (7-12)
  {
    id: 7,
    num: '07',
    category: 'Work & Business',
    categoryNum: 'Category 02',
    name: 'Projects & Tasks',
    icon: FolderGit2,
    desc: 'Create projects, assign managers and team members, manage tasks and track project progress.',
    color: '#2563eb',
    tag: 'Timesheets & Tracking',
    details: [
      'Project milestones, task boards, and deliverable deadlines',
      'Employee daily timesheet logging and approval',
      'Billable vs non-billable hour allocation',
      'Capacity planning and team workload heatmaps'
    ],
    audience: 'Project Managers, Technical Leads, Team Members'
  },
  {
    id: 8,
    num: '08',
    category: 'Work & Business',
    categoryNum: 'Category 02',
    name: 'Expenses',
    icon: Receipt,
    desc: 'Submit, review and approve employee expenses while maintaining centralized expense records.',
    color: '#059669',
    tag: 'Claims & Advances',
    details: [
      'Digital receipt upload with mobile optical capture',
      'Policy validation for travel, meal, and lodging limits',
      'Advance requests, settlement, and reimbursement workflow',
      'Seamless fold-in into monthly payroll runs'
    ],
    audience: 'Field Staff, Accounts, Finance Approvers'
  },
  {
    id: 9,
    num: '09',
    category: 'Work & Business',
    categoryNum: 'Category 02',
    name: 'Client Management',
    icon: UserSquare2,
    desc: 'Manage client information and connect clients directly with their associated projects.',
    color: '#d97706',
    tag: 'CRM & Billing Links',
    details: [
      'Client accounts, key contacts, and contract terms',
      'Direct linkage to delivered projects and assigned staff',
      'Activity timeline and communication history',
      'Billing export ready for accounting systems'
    ],
    audience: 'Account Managers, Client Partners, Leadership'
  },
  {
    id: 10,
    num: '10',
    category: 'Work & Business',
    categoryNum: 'Category 02',
    name: 'Documents',
    icon: FileBadge,
    desc: 'Centralize employee documents, HR records and reusable organizational document templates.',
    color: '#7c3aed',
    tag: '256-bit Encrypted Vault',
    details: [
      '256-bit encrypted storage for contracts, IDs, and certificates',
      'Standard HR template library (Experience, Relieving, NDA)',
      'Digital signature requests and acknowledgment tracking',
      'Expiry alert reminders for visas, passports, and certifications'
    ],
    audience: 'HR Ops, Legal, All Employees'
  },
  {
    id: 11,
    num: '11',
    category: 'Work & Business',
    categoryNum: 'Category 02',
    name: 'Help Desk',
    icon: HelpCircle,
    desc: 'Manage employee support requests, issues and internal service-related workflows.',
    color: '#db2777',
    tag: 'Ticketing & Service',
    details: [
      'Multi-department ticket routing (IT, HR, Admin, Finance)',
      'SLA tracking with automated escalations for delayed tickets',
      'Internal knowledge base and self-service FAQ articles',
      'Employee satisfaction rating on closed resolutions'
    ],
    audience: 'Support Agents, IT Admins, All Employees'
  },
  {
    id: 12,
    num: '12',
    category: 'Work & Business',
    categoryNum: 'Category 02',
    name: 'AI Assistant',
    icon: Bot,
    desc: 'Get instant answers to HR-related questions, policies, leave balances, attendance, documents and common employee requests through an AI-powered assistant.',
    color: '#0891b2',
    tag: 'Intelligent Copilot',
    details: [
      'Natural language queries on company policies & handbook',
      'Instant leave balance check and automated draft application',
      'Smart payslip explanation and tax query assistant',
      '24/7 autonomous employee query resolution'
    ],
    audience: 'Every Employee, HR Teams'
  },

  // Category 3: Talent & Administration (13-18)
  {
    id: 13,
    num: '13',
    category: 'Talent & Admin',
    categoryNum: 'Category 03',
    name: 'Recruitment',
    icon: UserPlus,
    desc: 'Manage job openings, candidates, resumes, evaluations, offers and recruitment status.',
    color: '#2563eb',
    tag: 'ATS & Pipelines',
    details: [
      'Visual recruitment kanban board across hiring stages',
      'Resume parsing and structured candidate scorecards',
      'Integrated interview scheduling with panel feedback',
      'Digital offer letter generation and candidate tracking'
    ],
    audience: 'Talent Acquisition, Hiring Managers, Interviewers'
  },
  {
    id: 14,
    num: '14',
    category: 'Talent & Admin',
    categoryNum: 'Category 03',
    name: 'Onboarding',
    icon: UserCheck,
    desc: 'Move selected candidates through structured onboarding and employee profile creation workflows.',
    color: '#059669',
    tag: 'Digital Checklists',
    details: [
      'Pre-boarding candidate portal for document collection',
      'Automated IT asset allocation & welcome kit provisioning',
      'Orientation schedules, mentor assignment, and buddy system',
      'Probation milestone reviews and confirmation tracking'
    ],
    audience: 'New Joiners, HR Onboarding Leads, IT Teams'
  },
  {
    id: 15,
    num: '15',
    category: 'Talent & Admin',
    categoryNum: 'Category 03',
    name: 'Notifications',
    icon: Bell,
    desc: 'Centralize HR alerts including leave requests, approvals, profile changes, permissions and system activities.',
    color: '#d97706',
    tag: 'Real-Time Alerts',
    details: [
      'Multi-channel alerts: In-app notifications, email, and push',
      'Actionable notification cards (1-click Approve/Reject)',
      'Broadcast announcements for company milestones & policies',
      'Audit log events for sensitive account actions'
    ],
    audience: 'All Platform Users'
  },
  {
    id: 16,
    num: '16',
    category: 'Talent & Admin',
    categoryNum: 'Category 03',
    name: 'Role & Permission',
    icon: ShieldCheck,
    desc: 'Control module and action access through View, Create, Update and Delete permissions.',
    color: '#7c3aed',
    tag: 'Granular RBAC',
    details: [
      'Custom role definition (Super Admin, Branch Manager, HR, Lead)',
      'Module-level and action-level CRUD permission matrix',
      'Field-level privacy controls (Hide salaries from supervisors)',
      'IP-restricted and location-based administration rules'
    ],
    audience: 'System Administrators, Security Officers'
  },
  {
    id: 17,
    num: '17',
    category: 'Talent & Admin',
    categoryNum: 'Category 03',
    name: 'Administration',
    icon: Sliders,
    desc: 'Manage platform-level HR operations, configurations and organizational controls from a centralized environment.',
    color: '#db2777',
    tag: 'System Settings',
    details: [
      'Multi-branch and multi-entity organization hierarchy setup',
      'Fiscal year, tax slab, and currency configurations',
      'API keys, webhook endpoints, and data backup controls',
      'Comprehensive system audit trail and compliance reporting'
    ],
    audience: 'Super Admins, Directors, Enterprise IT'
  },
  {
    id: 18,
    num: '18',
    category: 'Talent & Admin',
    categoryNum: 'Category 03',
    name: 'Automated Job Posting',
    icon: Share2,
    desc: 'Create job requirements once in the HRMS and publish vacancies directly across connected job platforms, while managing applications centrally.',
    color: '#0891b2',
    tag: 'Multi-Board Distribution',
    details: [
      'Single-click distribution to external career portals & LinkedIn',
      'Branded white-label company career portal builder',
      'Centralized inbound application funnel',
      'Source-of-hire ROI tracking and recruiting analytics'
    ],
    audience: 'Recruiting Leads, Marketing, Talent Teams'
  }
];

// Implementation Journey (Page 13)
const IMPLEMENTATION_STEPS = [
  {
    num: '01',
    title: 'Discover Your HR Needs',
    subtitle: 'Process & Requirements Audit',
    desc: 'Analyze HR processes, workforce requirements, existing tools, and organizational implementation goals.',
    timeline: 'Week 1',
    deliverables: ['HR workflow audit', 'Policy mapping document', 'User role blueprint']
  },
  {
    num: '02',
    title: 'HRMS Configuration & Customization',
    subtitle: 'System Architecture Setup',
    desc: 'Configure modules, policies, custom workflows, payroll structures, attendance geofences, and granular user roles.',
    timeline: 'Week 2',
    deliverables: ['Custom leave & shift rules', 'Statutory payroll setup', 'Approval hierarchies']
  },
  {
    num: '03',
    title: 'Employee Data Migration & Integration',
    subtitle: 'Secure Data Ingestion',
    desc: 'Migrate employee historical records and integrate with biometric hardware devices, ERP, and third-party systems.',
    timeline: 'Week 3',
    deliverables: ['Spreadsheet data ingestion', 'Biometric sync testing', 'Security validation']
  },
  {
    num: '04',
    title: 'Training & Go Live',
    subtitle: 'Organization-Wide Rollout',
    desc: 'Train administrators, managers, and employees; validate workflows; and successfully deploy the HRMS organization-wide.',
    timeline: 'Week 4',
    deliverables: ['Role-based video training', 'ESS mobile onboarding', 'Live system launch']
  },
  {
    num: '05',
    title: 'Ongoing Support & Optimization',
    subtitle: 'Continuous Excellence',
    desc: 'Continuous technical support, periodic updates, performance monitoring, and proactive optimization for long-term business growth.',
    timeline: 'Ongoing',
    deliverables: ['Quarterly compliance updates', 'Dedicated support SLA', 'Feature roadmap access']
  }
];

// Why Choose Us (Page 15)
const WHY_CHOOSE_ITEMS = [
  { icon: Users, title: 'Complete Employee Lifecycle', desc: 'From recruitment and onboarding to payroll, performance, and offboarding in one ecosystem.' },
  { icon: Zap, title: 'Quick & Easy Implementation', desc: 'Fast turnaround with structured data import, templates, and guided migration support.' },
  { icon: Shield, title: 'Enterprise-Grade Security', desc: '256-bit encryption, granular role-based access control, and complete audit trails.' },
  { icon: Layers, title: 'Scalable HRMS Platform', desc: 'Engineered to support agile teams of 10 up to enterprise organizations with 10,000+ employees.' },
  { icon: Server, title: 'Cloud & On-Premise Deployment', desc: 'Deploy on our managed cloud or self-host within your secure private enterprise network.' },
  { icon: Bot, title: 'AI-Powered HR Insights', desc: 'Intelligent workforce analytics and real-time AI assistant for instant employee support.' },
  { icon: RefreshCw, title: 'Seamless Third-Party Integrations', desc: 'Native connectors for biometric machines, ERPs, accounting suites, and REST APIs.' },
  { icon: Headphones, title: 'Dedicated Support & Training', desc: 'Direct access to certified HRMS technical engineers, adoption coaches, and account managers.' }
];

// Transformation Before vs After (Page 17)
const BEFORE_AFTER_ITEMS = [
  {
    beforeTitle: 'Manual Employee Records',
    beforeDesc: 'Scattered paper files, unorganized spreadsheets, and disjointed employee folders.',
    afterTitle: 'Centralized Employee Management',
    afterDesc: 'Single unified source of truth with 360-degree digital profiles and 256-bit vault.'
  },
  {
    beforeTitle: 'Time-Consuming HR Processes',
    beforeDesc: 'Days spent calculating leave balances, manual attendance logs, and manual salary slips.',
    afterTitle: 'Automated HR Workflows',
    afterDesc: '1-click payroll calculation, instant selfie/GPS attendance, and automated approval chains.'
  },
  {
    beforeTitle: 'Limited Workforce Visibility',
    beforeDesc: 'Delayed monthly reports with no visibility into daily attendance or task progress.',
    afterTitle: 'Real-Time HR Analytics',
    afterDesc: 'Live dashboards with workforce presence, department metrics, and intelligent alerts.'
  },
  {
    beforeTitle: 'Compliance & Payroll Risks',
    beforeDesc: 'Manual calculation errors, risk of statutory penalties in PF/ESI, and security leaks.',
    afterTitle: 'Integrated HR Ecosystem',
    afterDesc: 'Auto-computed statutory deductions, full audit trails, and strict role-based access.'
  }
];

export function LandingPage({
  onOpenSignIn,
  onOpenTrial,
  onOpenContact,
  onOpenLogin,
  onOpenRegister,
  onOpenPricing,
  onOpenDemoPersona,
  isLoggedIn = false,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'core' | 'work' | 'talent'
  const [selectedModule, setSelectedModule] = useState(null); // For detailed inner module modal
  const [activePreviewTab, setActivePreviewTab] = useState('attendance'); // 'attendance' | 'payroll' | 'ai' | 'recruitment'
  const [headcount, setHeadcount] = useState(50); // ROI calculator state
  const [activeJourneyStep, setActiveJourneyStep] = useState(0); // Stepper state

  // Interactive AI Assistant chat state for demo preview
  const [aiChatMessages, setAiChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Madhura AI Assistant. How can I help you with company policies, leave, or payroll today?' },
    { sender: 'user', text: 'How many casual leaves do I have remaining for this quarter?' },
    { sender: 'ai', text: 'You currently have 4.5 Casual Leaves and 8 Sick Leaves available. Would you like me to draft a leave application for you?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setAiChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setTimeout(() => {
      setAiChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: `Regarding "${userMsg}": Under Madhura HRMS policies, all records are validated in real time. Your manager will be automatically notified upon submission.` }
      ]);
    }, 600);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter modules based on tab
  const filteredModules = ALL_MODULES.filter((m) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'core') return m.category === 'Core HR';
    if (activeTab === 'work') return m.category === 'Work & Business';
    if (activeTab === 'talent') return m.category === 'Talent & Admin';
    return true;
  });

  // ROI Calculator computed variables
  const hoursSavedPerMonth = Math.round(headcount * 1.8);
  const estimatedCostSaving = (hoursSavedPerMonth * 450).toLocaleString('en-IN');
  const recommendedTier = headcount <= 20 ? 'Starter (₹59)' : headcount <= 100 ? 'Professional (₹99)' : headcount <= 300 ? 'Business (₹149)' : 'Enterprise (₹199)';

  return (
    <div className="pb-landing">
      {/* Top Banner */}
      <div className="pb-announcement">
        <span className="pb-announcement-badge">MADHURA HRMS</span>
        Empowering Organizations with Intelligent Workforce Management — Plans starting at ₹59/user/month.
        <a href="#pricing" onClick={(e) => { e.preventDefault(); onOpenPricing && onOpenPricing(); }}>
          View Pricing & Plans →
        </a>
      </div>

      {/* Header (Clean Single Line Minimalist Navbar) */}
      <header className="pb-header">
        <div className="pb-header-inner">
          <div className="pb-logo" onClick={() => {
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} style={{ cursor: 'pointer' }}>
            <Users className="pb-logo-icon" size={22} />
            Madhura<span>HRMS</span>
          </div>

          <nav className="pb-nav">
            <a onClick={() => {
              window.history.pushState({}, '', '/#about');
              scrollToSection('about');
            }}>About</a>
            <a onClick={() => {
              window.history.pushState({}, '', '/#features');
              scrollToSection('modules');
            }}>Features</a>
            <a onClick={() => {
              window.history.pushState({}, '', '/pricing');
              onOpenPricing && onOpenPricing();
            }}>Pricing</a>
            <a onClick={() => {
              window.history.pushState({}, '', '/#contact');
              onOpenContact && onOpenContact();
            }}>Contact</a>
          </nav>

          <div className="pb-actions">
            <button
              className="pb-btn-primary"
              onClick={() => onOpenTrial && onOpenTrial()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 700
              }}
            >
              <Sparkles size={15} />
              <span>Free Trial</span>
            </button>
            <button
              className="pb-btn-ghost"
              onClick={() => onOpenPricing && onOpenPricing()}
              style={{
                border: '1.5px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              Pricing
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION (Pages 1 & 3) */}
      <section className="pb-hero" id="home">
        <div>
          <div className="pb-promo-card">
            <div>
              <div className="pb-promo-title">Welcome to <span>MADHURA HRMS</span></div>
              <div className="text-sm mt-1 text-[var(--slate)]">Intelligent Workforce Management Software</div>
            </div>
            <div className="pb-promo-price-block">
              <div className="pb-promo-price">
                <span className="pb-promo-strike">₹99</span> ₹59
              </div>
              <span className="pb-save-badge">Plans start from ₹59/user/mo</span>
            </div>
          </div>

          <h1 className="pb-hero-title">
            Empowering Organizations with Intelligent Workforce Management
          </h1>
          <p className="pb-hero-sub">
            Simplify workforce management, automate routine HR processes, improve workforce productivity, and gain complete visibility into every stage of employee lifecycle.
          </p>

          <div className="pb-hero-cta-row">
            <button
              className="pb-btn-primary"
              style={{ padding: '14px 28px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={() => onOpenTrial && onOpenTrial()}
            >
              <Sparkles size={16} /> Free Trial (3-Hour Workspace)
            </button>
            <button className="pb-btn-ghost" style={{ padding: '14px 24px', fontSize: '15px' }} onClick={() => onOpenPricing && onOpenPricing()}>
              Pricing (₹59/mo)
            </button>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="pb-hero-visual" id="demo">
          <div className="pb-hero-circle"></div>
          <div className="pb-hero-mockup">
            <div className="pb-hero-mockup-inner">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="font-bold text-lg text-slate-800">HR Intelligence Hub</div>
                  <div className="text-xs text-slate-500">Live Workforce Monitoring</div>
                </div>
                <div className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Real-time Active
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                      <Users size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Total Workforce</div>
                      <div className="text-xs text-slate-500">1,248 Active Employees</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-blue-600">98.4% Present</span>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Payroll Run</div>
                      <div className="text-xs text-slate-500">Auto PF, ESI & Taxes</div>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-semibold">1-Click Ready</span>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-bold">
                      <Bot size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">AI Assistant</div>
                      <div className="text-xs text-slate-500">Instant Policy & Leaves</div>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded font-semibold">Online 24/7</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pb-floating-card">
            Centralized Platform for<br /><strong>All 18 HRMS Modules</strong>
          </div>
        </div>
      </section>

      {/* ABOUT US & MISSION/VISION SECTION (Pages 2 & 3) */}
      <section className="pb-about-section" id="about">
        <div className="pb-about-container">
          <div className="pb-about-card-hero">
            <div className="pb-section-eyebrow" style={{ color: 'var(--amber)' }}>ABOUT US</div>
            <h2 className="pb-about-title">
              Building the Future of Smart Workforce Management
            </h2>
            <p className="pb-about-desc">
              Madhura Technologies helps organizations simplify workforce management, automate HR operations, and build a more connected workplace through intelligent software solutions. Our Madhura HRMS is designed to automate routine HR processes, improve workforce productivity, and provide complete visibility into every stage of employee management—enabling businesses to make faster, data-driven decisions and achieve sustainable organizational growth.
            </p>
          </div>

          <div className="pb-mission-vision-grid">
            <div className="pb-mv-card mission">
              <div className="pb-mv-badge">MISSION</div>
              <h3>Empowering Organizations Through Intelligent HR Technology</h3>
              <p>
                To help businesses automate HR operations, streamline workforce management, and improve employee experiences with secure, scalable, and innovative HRMS solutions that drive organizational growth.
              </p>
            </div>

            <div className="pb-mv-card vision">
              <div className="pb-mv-badge">VISION</div>
              <h3>Building the Future of Smart Workforce Management</h3>
              <p>
                To become a trusted global HR technology partner by delivering intelligent, AI-ready, and future-focused HR solutions that enable organizations to build productive, engaged, and high-performing workforces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ALL 18 MODULES SHOWCASE WITH DETAIL MODAL (Pages 8, 9, 10) */}
      <section className="pb-modules-section" id="modules">
        <div className="pb-section-head">
          <div className="pb-section-eyebrow">COMPLETE PLATFORM MODULES</div>
          <h2 className="pb-section-title" style={{ fontSize: '36px' }}>
            All 18 Functional Modules in One Ecosystem
          </h2>
          <p className="pb-section-sub">
            Click any module card below to open the complete inner-page breakdown, key features, and user workflows.
          </p>

          {/* Category Filter Tabs */}
          <div className="pb-module-filter-tabs">
            <button
              className={`pb-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All 18 Modules ({ALL_MODULES.length})
            </button>
            <button
              className={`pb-tab-btn ${activeTab === 'core' ? 'active' : ''}`}
              onClick={() => setActiveTab('core')}
            >
              Core HR (01–06)
            </button>
            <button
              className={`pb-tab-btn ${activeTab === 'work' ? 'active' : ''}`}
              onClick={() => setActiveTab('work')}
            >
              Work & Business (07–12)
            </button>
            <button
              className={`pb-tab-btn ${activeTab === 'talent' ? 'active' : ''}`}
              onClick={() => setActiveTab('talent')}
            >
              Talent & Administration (13–18)
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="pb-module-cards-grid">
          {filteredModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className="pb-mod-card interactive"
                onClick={() => setSelectedModule(mod)}
                style={{ cursor: 'pointer' }}
              >
                <div className="pb-mod-top">
                  <div className="pb-mod-num-circle">{mod.num}</div>
                  <span className="pb-mod-badge">{mod.category}</span>
                </div>
                <div className="pb-mod-icon-row">
                  <div className="pb-mod-icon-badge" style={{ background: `${mod.color}15`, color: mod.color }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 className="pb-mod-name">{mod.name}</h4>
                    <span className="text-xs text-slate-400 font-medium">{mod.tag}</span>
                  </div>
                </div>
                <p className="pb-mod-desc">{mod.desc}</p>
                <div className="pb-mod-card-footer">
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    View Inner Specs <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* INNER MODULE MODAL / SLIDEOVER DETAILS */}
      {selectedModule && (
        <div className="pb-modal-overlay" onClick={() => setSelectedModule(null)}>
          <div className="pb-module-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pb-modal-header">
              <div className="flex items-center gap-3">
                <div className="pb-mod-num-circle" style={{ background: selectedModule.color }}>
                  {selectedModule.num}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {selectedModule.categoryNum} • {selectedModule.category}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedModule.name}</h3>
                </div>
              </div>
              <button className="pb-modal-close-btn" onClick={() => setSelectedModule(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="pb-modal-body">
              <div className="pb-modal-badge-pill" style={{ background: `${selectedModule.color}15`, color: selectedModule.color }}>
                {selectedModule.tag}
              </div>
              <p className="text-base text-slate-700 leading-relaxed mt-3">
                {selectedModule.desc}
              </p>

              <div className="mt-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Key Functional Capabilities:
                </h4>
                <div className="space-y-2.5">
                  {selectedModule.details.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-800">
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span><strong>Target Audience:</strong> {selectedModule.audience}</span>
              </div>
            </div>

            <div className="pb-modal-footer">
              <button
                className="pb-btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  setSelectedModule(null);
                  onOpenLogin && onOpenLogin();
                }}
              >
                Launch {selectedModule.name} in Live Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE LIVE PRODUCT EXPLORER / INNER PREVIEW SECTION */}
      <section className="pb-live-preview-section" id="preview">
        <div className="pb-section-head">
          <div className="pb-section-eyebrow">INTERACTIVE DEMO</div>
          <h2 className="pb-section-title" style={{ fontSize: '34px' }}>
            Experience the Core Modules in Action
          </h2>
          <p className="pb-section-sub">
            Switch between the live interactive tabs below to preview the modern day minimalist UI designed for today's workforce.
          </p>

          <div className="pb-preview-tabs-row">
            <button
              className={`pb-preview-tab-btn ${activePreviewTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setActivePreviewTab('attendance')}
            >
              <Clock size={16} /> GPS & Attendance
            </button>
            <button
              className={`pb-preview-tab-btn ${activePreviewTab === 'payroll' ? 'active' : ''}`}
              onClick={() => setActivePreviewTab('payroll')}
            >
              <CreditCard size={16} /> 1-Click Payroll
            </button>
            <button
              className={`pb-preview-tab-btn ${activePreviewTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActivePreviewTab('ai')}
            >
              <Bot size={16} /> AI HR Copilot
            </button>
            <button
              className={`pb-preview-tab-btn ${activePreviewTab === 'recruitment' ? 'active' : ''}`}
              onClick={() => setActivePreviewTab('recruitment')}
            >
              <UserPlus size={16} /> Recruitment ATS
            </button>
          </div>
        </div>

        <div className="pb-preview-display-window">
          {/* View 1: Attendance */}
          {activePreviewTab === 'attendance' && (
            <div className="pb-preview-panel">
              <div className="pb-panel-head">
                <div>
                  <h4 className="font-bold text-lg text-slate-800">GPS Geofenced Punch Console</h4>
                  <p className="text-xs text-slate-500">Live radius verification with selfie authentication</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  Geofence Radius: 150m (HQ Office)
                </span>
              </div>
              <div className="pb-panel-content-grid">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Today's Shift</span>
                    <div className="text-xl font-extrabold text-slate-800 mt-1">General (09:00 AM - 06:00 PM)</div>
                    <div className="text-sm text-slate-600 mt-2">Punch In: <strong className="text-emerald-600">08:58 AM</strong> (On Time)</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Selfie Verified</span>
                    <span className="text-xs font-bold text-emerald-600">✓ Location Matched</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center text-center">
                  <div className="text-3xl font-extrabold text-blue-600 font-mono">07h 42m</div>
                  <div className="text-xs text-slate-500 mt-1">Logged Active Time Today</div>
                  <button className="mt-4 pb-btn-primary" style={{ padding: '8px 16px', fontSize: '13px', background: '#ef4444' }} onClick={() => alert('Punch Out Registered!')}>
                    Punch Out (End Shift)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View 2: Payroll */}
          {activePreviewTab === 'payroll' && (
            <div className="pb-preview-panel">
              <div className="pb-panel-head">
                <div>
                  <h4 className="font-bold text-lg text-slate-800">Automated Payroll Calculation Matrix</h4>
                  <p className="text-xs text-slate-500">Full statutory breakdown: Basic, HRA, PF, ESI, and Tax Deductions</p>
                </div>
                <button className="pb-btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => alert('Batch Payslips Generated for 1,248 Staff!')}>
                  Run 1-Click Payroll
                </button>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2.5 rounded-l">Component</th>
                      <th className="p-2.5">Calculation Rule</th>
                      <th className="p-2.5">Earnings</th>
                      <th className="p-2.5 rounded-r">Deductions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">Basic Salary + DA</td>
                      <td className="p-2.5">Fixed Monthly</td>
                      <td className="p-2.5 text-emerald-600 font-bold">₹35,000</td>
                      <td className="p-2.5">-</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">House Rent Allowance (HRA)</td>
                      <td className="p-2.5">40% of Basic</td>
                      <td className="p-2.5 text-emerald-600 font-bold">₹14,000</td>
                      <td className="p-2.5">-</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">Provident Fund (PF)</td>
                      <td className="p-2.5">12% of Basic</td>
                      <td className="p-2.5">-</td>
                      <td className="p-2.5 text-rose-600 font-bold">-₹1,800</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">Employee State Insurance (ESI)</td>
                      <td className="p-2.5">0.75% of Gross</td>
                      <td className="p-2.5">-</td>
                      <td className="p-2.5 text-rose-600 font-bold">-₹368</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-blue-50 font-bold text-blue-900 border-t border-blue-200">
                    <tr>
                      <td colSpan={2} className="p-2.5">Net Disbursed Take-Home Pay</td>
                      <td colSpan={2} className="p-2.5 text-right text-base text-blue-700">₹46,832</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* View 3: AI Assistant */}
          {activePreviewTab === 'ai' && (
            <div className="pb-preview-panel">
              <div className="pb-panel-head">
                <div className="flex items-center gap-2">
                  <Bot size={20} className="text-blue-600" />
                  <div>
                    <h4 className="font-bold text-lg text-slate-800">Madhura AI HR Assistant</h4>
                    <p className="text-xs text-slate-500">Trained on your employee handbook, leave balances, and company SOPs</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                  24/7 Autonomous
                </span>
              </div>
              <div className="pb-ai-chat-preview-box">
                <div className="pb-ai-chat-history">
                  {aiChatMessages.map((msg, idx) => (
                    <div key={idx} className={`pb-chat-bubble ${msg.sender}`}>
                      <span className="pb-chat-sender-label">{msg.sender === 'ai' ? 'Madhura AI' : 'You'}</span>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>
                <form className="pb-ai-chat-input-bar" onSubmit={handleSendChat}>
                  <input
                    type="text"
                    placeholder="Ask anything: 'What is our maternity leave policy?' or 'Show my tax deductions'..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="pb-chat-send-btn">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* View 4: Recruitment ATS */}
          {activePreviewTab === 'recruitment' && (
            <div className="pb-preview-panel">
              <div className="pb-panel-head">
                <div>
                  <h4 className="font-bold text-lg text-slate-800">Visual Hiring Pipeline Kanban</h4>
                  <p className="text-xs text-slate-500">Manage candidates from initial screening to offer rollout</p>
                </div>
                <button className="pb-btn-ghost" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => alert('New Job Opening Created!')}>
                  + Post New Job
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-100 p-3 rounded-xl">
                  <div className="text-xs font-bold text-slate-600 uppercase mb-2">Screening (12)</div>
                  <div className="bg-white p-2.5 rounded-lg shadow-xs border border-slate-200 text-xs">
                    <div className="font-bold text-slate-800">Aravind Swamy</div>
                    <div className="text-slate-500 mt-0.5">Frontend Engineer</div>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl">
                  <div className="text-xs font-bold text-blue-700 uppercase mb-2">Interview (4)</div>
                  <div className="bg-white p-2.5 rounded-lg shadow-xs border border-blue-200 text-xs">
                    <div className="font-bold text-slate-800">Meera Nambiar</div>
                    <div className="text-slate-500 mt-0.5">HR Operations Lead</div>
                  </div>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl">
                  <div className="text-xs font-bold text-amber-700 uppercase mb-2">Evaluation (2)</div>
                  <div className="bg-white p-2.5 rounded-lg shadow-xs border border-amber-200 text-xs">
                    <div className="font-bold text-slate-800">Karthik Raja</div>
                    <div className="text-slate-500 mt-0.5">Senior Backend Dev</div>
                  </div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <div className="text-xs font-bold text-emerald-700 uppercase mb-2">Offered (1)</div>
                  <div className="bg-white p-2.5 rounded-lg shadow-xs border border-emerald-200 text-xs">
                    <div className="font-bold text-slate-800">Sangeetha K.</div>
                    <div className="text-emerald-700 font-semibold mt-0.5">Offer Letter Sent</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* IMPLEMENTATION JOURNEY STEPPER (Page 13) */}
      <section className="pb-impl-journey-section" id="journey">
        <div className="pb-section-head">
          <div className="pb-section-eyebrow">5-STEP ROLLOUT</div>
          <h2 className="pb-section-title" style={{ fontSize: '32px' }}>Implementation Journey</h2>
          <p className="pb-section-sub">
            Click on any stage below to inspect our proven methodology for 100% successful rollout.
          </p>
        </div>

        {/* Stepper Navigation */}
        <div className="pb-stepper-nav-row">
          {IMPLEMENTATION_STEPS.map((step, idx) => (
            <button
              key={step.num}
              className={`pb-stepper-tab ${activeJourneyStep === idx ? 'active' : ''}`}
              onClick={() => setActiveJourneyStep(idx)}
            >
              <span className="step-num">{step.num}</span>
              <span className="step-label">{step.title}</span>
            </button>
          ))}
        </div>

        {/* Active Step Showcase Card */}
        <div className="pb-active-step-card">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                Phase {IMPLEMENTATION_STEPS[activeJourneyStep].num} • {IMPLEMENTATION_STEPS[activeJourneyStep].timeline}
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {IMPLEMENTATION_STEPS[activeJourneyStep].title}
              </h3>
              <p className="text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
                {IMPLEMENTATION_STEPS[activeJourneyStep].desc}
              </p>
            </div>
            <span className="px-4 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
              {IMPLEMENTATION_STEPS[activeJourneyStep].subtitle}
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Key Deliverables for this Phase:
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {IMPLEMENTATION_STEPS[activeJourneyStep].deliverables.map((item, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE ROI & HEADCOUNT GROWTH CALCULATOR (Page 18) */}
      <section className="pb-roi-calculator-section" id="roi">
        <div className="pb-section-head">
          <div className="pb-section-eyebrow">HEADCOUNT CALCULATOR</div>
          <h2 className="pb-section-title" style={{ fontSize: '32px' }}>
            Calculate Your Organization's Projected ROI
          </h2>
          <p className="pb-section-sub">
            See how Madhura HRMS streamlines operations and drives sustainable growth based on your team size.
          </p>
        </div>

        <div className="pb-roi-box">
          <div className="pb-roi-input-side">
            <label className="text-sm font-bold text-slate-700">
              Select Your Current Employee Headcount:
            </label>
            <div className="flex items-center gap-4 my-4">
              <input
                type="range"
                min="10"
                max="1000"
                step="5"
                value={headcount}
                onChange={(e) => setHeadcount(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-2xl font-extrabold text-blue-600 min-w-[70px] text-right">
                {headcount}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Recommended Tier: <strong className="text-slate-800">{recommendedTier}</strong>
            </div>
          </div>

          <div className="pb-roi-metrics-grid">
            <div className="pb-roi-metric-chip">
              <div className="text-xs font-bold text-slate-400 uppercase">Admin Time Saved</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">~{hoursSavedPerMonth} hrs /mo</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">65% reduction in manual logging</div>
            </div>

            <div className="pb-roi-metric-chip">
              <div className="text-xs font-bold text-slate-400 uppercase">Est. Monthly Savings</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">₹{estimatedCostSaving}</div>
              <div className="text-xs text-slate-500 mt-1">ROI positive within 45 days</div>
            </div>
          </div>
        </div>
      </section>

      {/* BUSINESS TRANSFORMATION: BEFORE vs AFTER (Page 17) */}
      <section className="pb-transformation-section" id="transformation">
        <div className="pb-section-head">
          <div className="pb-section-eyebrow">BUSINESS TRANSFORMATION</div>
          <h2 className="pb-section-title" style={{ fontSize: '32px' }}>
            How Madhura HRMS Transforms Your Business
          </h2>
          <p className="pb-section-sub">
            Eliminate operational friction and replace legacy workflows with intelligent automation.
          </p>
        </div>

        <div className="pb-trans-grid">
          <div className="pb-trans-col before">
            <div className="pb-trans-col-header before">
              <span>BEFORE</span>
              <h3>Traditional HR Operations</h3>
            </div>
            <div className="space-y-4">
              {BEFORE_AFTER_ITEMS.map((item, i) => (
                <div key={i} className="pb-trans-item before">
                  <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">{item.beforeTitle}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.beforeDesc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pb-trans-col after">
            <div className="pb-trans-col-header after">
              <span>AFTER</span>
              <h3>With Madhura HRMS</h3>
            </div>
            <div className="space-y-4">
              {BEFORE_AFTER_ITEMS.map((item, i) => (
                <div key={i} className="pb-trans-item after">
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">{item.afterTitle}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.afterDesc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

      {/* PRICING TEASER & CALL TO ACTION */}
      <section className="pb-pricing-cta-banner" id="pricing">
        <div className="pb-pdf-banner-tag" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
          Transparent Pricing
        </div>
        <h2 style={{ marginTop: '16px' }}>Plans start from ₹59 /user/month</h2>
        <p>
          Everything you need to manage customers, sales, and operations with our full 14-feature comparison matrix.
        </p>
        <div className="pb-cta-btn-group">
          <button className="pb-btn-primary" style={{ padding: '14px 32px' }} onClick={() => onOpenPricing && onOpenPricing()}>
            View Pricing & Comparison Table
          </button>
          <button className="pb-btn-ghost" style={{ padding: '14px 28px', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => onOpenLogin && onOpenLogin()}>
            Book Live Demo
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