import React, { useState, useEffect } from 'react';
import {
  Users, Building2, Mail, Phone, Calendar, Search, Filter, ShieldCheck,
  CheckCircle2, Sparkles, ArrowRight, Trash2, Clock, MessageSquare,
  LogOut, RefreshCw, ExternalLink, PlusCircle, Check, X, Download, Compass
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

export function MasterAdminDashboard({ onLogout, onLaunchWorkspace, onHomeClick }) {
  const [activeTab, setActiveTab] = useState('trials'); // 'trials' | 'contacts'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [trialSubmissions, setTrialSubmissions] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Real-time ticking interval for live demo countdown timer
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // New Lead form state
  const [newOrgName, setNewOrgName] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newHeadcount, setNewHeadcount] = useState('21-100');

  const MOCK_LEAD_EMAILS = new Set([
    'rajesh.kumar@acmetech.com',
    'priya.s@infonet.in',
    'vmehta@zenithglobal.com',
    'ananya@apexlogistics.com'
  ]);

  const loadData = async () => {
    try {
      let backendLeads = [];
      try {
        const res = await apiFetch('/trial/leads');
        if (res && res.success && Array.isArray(res.leads)) {
          backendLeads = res.leads.filter(l => !MOCK_LEAD_EMAILS.has((l.email || '').toLowerCase()));
        }
      } catch (err) {
        console.warn('Backend trial leads notice:', err);
      }

      const storedTrials = localStorage.getItem('hrms_trial_submissions');
      let localTrials = storedTrials ? JSON.parse(storedTrials) : [];
      localTrials = localTrials.filter(l => !MOCK_LEAD_EMAILS.has((l.email || '').toLowerCase()));

      // Merge backend leads and local trials (avoid duplicate emails)
      const mergedMap = new Map();
      backendLeads.forEach(item => mergedMap.set(item.email.toLowerCase(), item));
      localTrials.forEach(item => {
        if (!mergedMap.has(item.email.toLowerCase())) {
          mergedMap.set(item.email.toLowerCase(), item);
        } else {
          // Merge fresher fields
          const existing = mergedMap.get(item.email.toLowerCase());
          mergedMap.set(item.email.toLowerCase(), { ...existing, ...item });
        }
      });

      const mergedList = Array.from(mergedMap.values());
      setTrialSubmissions(mergedList);
      localStorage.setItem('hrms_trial_submissions', JSON.stringify(mergedList));

      const storedContacts = localStorage.getItem('hrms_contact_submissions');
      if (storedContacts) {
        const parsedContacts = JSON.parse(storedContacts);
        const cleanContacts = Array.isArray(parsedContacts)
          ? parsedContacts.filter(c => !MOCK_LEAD_EMAILS.has((c.email || '').toLowerCase()))
          : [];
        setContactSubmissions(cleanContacts);
        localStorage.setItem('hrms_contact_submissions', JSON.stringify(cleanContacts));
      } else {
        setContactSubmissions([]);
        localStorage.setItem('hrms_contact_submissions', JSON.stringify([]));
      }
    } catch (e) {
      console.error('Error loading master admin data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteTrial = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this customer trial record?')) {
      try {
        await apiFetch(`/trial/leads/${id}`, { method: 'DELETE' });
      } catch (err) {}
      const updated = trialSubmissions.filter(t => t.id !== id);
      setTrialSubmissions(updated);
      localStorage.setItem('hrms_trial_submissions', JSON.stringify(updated));
    }
  };

  const handleDeleteContact = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this contact inquiry?')) {
      const updated = contactSubmissions.filter(c => c.id !== id);
      setContactSubmissions(updated);
      localStorage.setItem('hrms_contact_submissions', JSON.stringify(updated));
    }
  };

  const handleToggleContactStatus = (id, e) => {
    e.stopPropagation();
    const updated = contactSubmissions.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'Contacted' ? 'New Inquiry' : 'Contacted' };
      }
      return c;
    });
    setContactSubmissions(updated);
    localStorage.setItem('hrms_contact_submissions', JSON.stringify(updated));
  };

  const handleExtendTrial = async (id, e) => {
    e.stopPropagation();
    try {
      await apiFetch(`/trial/leads/${id}/extend`, { method: 'POST' });
    } catch (err) {}

    const now = Date.now();
    const updated = trialSubmissions.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'Active 3-Hr Demo',
          demoStartedAt: now,
          demoExpiresAt: now + 3 * 60 * 60 * 1000
        };
      }
      return t;
    });
    setTrialSubmissions(updated);
    localStorage.setItem('hrms_trial_submissions', JSON.stringify(updated));
    alert('Extended customer demo by 3 hours successfully.');
  };

  const handleAddOrganization = (e) => {
    e.preventDefault();
    if (!newOrgName || !newAdminName || !newEmail) return;

    const newLead = {
      id: 'TRL-' + Date.now().toString().slice(-5),
      name: newAdminName.trim(),
      company: newOrgName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || '+91 98765 00000',
      headcount: newHeadcount,
      role: 'SUPER_ADMIN',
      status: 'Active 3-Day Trial',
      submittedAt: 'Just Now',
      daysRemaining: 3
    };

    const updated = [newLead, ...trialSubmissions];
    setTrialSubmissions(updated);
    localStorage.setItem('hrms_trial_submissions', JSON.stringify(updated));
    setShowAddModal(false);
    setNewOrgName('');
    setNewAdminName('');
    setNewEmail('');
    setNewPhone('');
  };

  const handleExportCSV = () => {
    const dataToExport = activeTab === 'trials' ? trialSubmissions : contactSubmissions;
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hrms_${activeTab}_records_${Date.now()}.json`;
    a.click();
  };

  // Filtered lists
  const filteredTrials = trialSubmissions.filter(t => {
    const matchesQuery = !searchQuery ||
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone?.includes(searchQuery);

    if (filterStatus === 'ALL') return matchesQuery;
    if (filterStatus === 'ACTIVE') return matchesQuery && t.status?.includes('Active');
    return matchesQuery;
  });

  const filteredContacts = contactSubmissions.filter(c => {
    const matchesQuery = !searchQuery ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topic?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'ALL') return matchesQuery;
    if (filterStatus === 'NEW') return matchesQuery && c.status === 'New Inquiry';
    if (filterStatus === 'CONTACTED') return matchesQuery && c.status === 'Contacted';
    return matchesQuery;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* ── TOP MASTER BAR (Clean White Minimalist Header) ── */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '14px 28px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #dbeafe'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                  Madhura<span style={{ color: '#2563eb' }}>Master</span>
                </span>
                <span style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '100px'
                }}>
                  Admin Portal
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Customer Organizations & Forms Tracking
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={onHomeClick}
              style={{
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Website
            </button>

            <button
              onClick={onLogout}
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN CONTENT (Clean White Layout) ── */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '28px' }}>

        {/* Top Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Registered Organizations</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{trialSubmissions.length}</div>
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active 3-Day Trials</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                {trialSubmissions.filter(t => t.status?.includes('Active')).length}
              </div>
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Contact Inquiries</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{contactSubmissions.length}</div>
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Lead Conversion</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>94.2%</div>
            </div>
          </div>

        </div>

        {/* ── CLEAN WHITE TABLE CARD ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden'
        }}>

          {/* Controls Bar */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            background: '#fafcff'
          }}>
            
            {/* Tab Switcher */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '3px' }}>
              <button
                type="button"
                onClick={() => { setActiveTab('trials'); setFilterStatus('ALL'); }}
                style={{
                  background: activeTab === 'trials' ? '#ffffff' : 'transparent',
                  color: activeTab === 'trials' ? '#2563eb' : '#64748b',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'trials' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Building2 size={15} />
                <span>3-Day Trial Organizations</span>
                <span style={{
                  background: activeTab === 'trials' ? '#eff6ff' : '#e2e8f0',
                  color: activeTab === 'trials' ? '#1d4ed8' : '#64748b',
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '100px',
                  fontWeight: 800
                }}>
                  {trialSubmissions.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('contacts'); setFilterStatus('ALL'); }}
                style={{
                  background: activeTab === 'contacts' ? '#ffffff' : 'transparent',
                  color: activeTab === 'contacts' ? '#2563eb' : '#64748b',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'contacts' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <MessageSquare size={15} />
                <span>Contact Inquiries</span>
                <span style={{
                  background: activeTab === 'contacts' ? '#eff6ff' : '#e2e8f0',
                  color: activeTab === 'contacts' ? '#1d4ed8' : '#64748b',
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '100px',
                  fontWeight: 800
                }}>
                  {contactSubmissions.length}
                </span>
              </button>
            </div>

            {/* Actions & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              
              {/* Search Box (Clean, No double border) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                padding: '7px 12px'
              }}>
                <Search size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search name, org, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#0f172a',
                    fontSize: '12.5px',
                    width: '180px',
                    padding: 0,
                    margin: 0
                  }}
                />
              </div>

              {/* Export JSON */}
              <button
                onClick={handleExportCSV}
                title="Export Records"
                style={{
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                Export
              </button>

              <button
                onClick={loadData}
                title="Refresh Records"
                style={{
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} />
              </button>
            </div>

          </div>

          {/* ── TAB 1: 3-HOUR TRIAL & DEMO CUSTOMERS TABLE ── */}
          {activeTab === 'trials' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>Customer Name</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>Email (OTP Verified) & Phone</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>Company & Industry</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>Org Size</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>Heard From</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>Status & 3-Hr Demo</th>
                    <th style={{ padding: '12px 18px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrials.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8' }}>
                        No customer trial records found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredTrials.map((t, idx) => {
                      const isExpired = t.demoExpiresAt && now > t.demoExpiresAt;
                      const isPending = t.status === 'Pending Activation';
                      const diffMs = t.demoExpiresAt ? Math.max(0, t.demoExpiresAt - now) : 0;
                      const remHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const remMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                      const remSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

                      return (
                        <tr
                          key={idx}
                          style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                          className="hover:bg-slate-50/80"
                        >
                          {/* 1. Customer Name */}
                          <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                                {t.name ? t.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div style={{ fontSize: '13.5px' }}>{t.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Super Admin (Trial)</div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Contact: Email + Verified Badge & Phone */}
                          <td style={{ padding: '14px 18px', color: '#334155' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600 }}>
                              <Mail size={13} color="#2563eb" />
                              <span>{t.email}</span>
                              <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#059669', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                OTP ✓
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                              <Phone size={12} color="#94a3b8" />
                              <span>{t.phone || 'No phone'}</span>
                            </div>
                          </td>

                          {/* 3. Company & Industry */}
                          <td style={{ padding: '14px 18px', color: '#334155' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px' }}>
                              <Building2 size={14} color="#64748b" />
                              <span>{t.company || <span style={{ color: '#d97706', fontWeight: 500 }}>Pending Setup</span>}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', paddingLeft: '20px' }}>
                              {t.industry || 'IT & Software'}
                            </div>
                          </td>

                          {/* 4. Org Size */}
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 600
                            }}>
                              {t.employeeSize || t.headcount || '21-100'} Employees
                            </span>
                          </td>

                          {/* 5. Where Heard About */}
                          <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Compass size={13} color="#94a3b8" />
                              <span>{t.heardAbout || 'Google Search'}</span>
                            </div>
                          </td>

                          {/* 6. Status & 3-Hour Demo Timer */}
                          <td style={{ padding: '14px 18px' }}>
                            {isPending ? (
                              <span style={{
                                background: '#fffbeb',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                padding: '3px 10px',
                                borderRadius: '100px',
                                fontSize: '11px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }}></span>
                                Pending Activation
                              </span>
                            ) : isExpired ? (
                              <span style={{
                                background: '#fef2f2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                padding: '3px 10px',
                                borderRadius: '100px',
                                fontSize: '11px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></span>
                                Demo Expired
                              </span>
                            ) : (
                              <div>
                                <span style={{
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  border: '1px solid #a7f3d0',
                                  padding: '3px 10px',
                                  borderRadius: '100px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                                  Active 3-Hr Demo
                                </span>
                                <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={11} />
                                  <span>{String(remHours).padStart(2, '0')}h {String(remMins).padStart(2, '0')}m {String(remSecs).padStart(2, '0')}s remaining</span>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 7. Actions */}
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                onClick={(e) => handleDeleteTrial(t.id, e)}
                                title="Delete Record"
                                style={{
                                  background: '#fef2f2',
                                  color: '#ef4444',
                                  border: '1px solid #fecaca',
                                  padding: '6px 8px',
                                  borderRadius: '7px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TAB 2: CONTACT & SALES INQUIRIES TABLE ── */}
          {activeTab === 'contacts' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 20px', fontWeight: 700 }}>Prospect / Name</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700 }}>Company</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700 }}>Email & Phone</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700 }}>Topic of Interest</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700 }}>Message Details</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8' }}>
                        No contact inquiries found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((c, idx) => (
                      <tr
                        key={idx}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                        className="hover:bg-slate-50/80"
                      >
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                              {c.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div>{c.name}</div>
                              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{c.id}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 20px', color: '#334155', fontWeight: 600 }}>
                          {c.company || 'Undisclosed Org'}
                        </td>

                        <td style={{ padding: '14px 20px', color: '#475569' }}>
                          <div style={{ fontSize: '12.5px' }}>{c.email}</div>
                          <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>{c.phone}</div>
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600
                          }}>
                            {c.topic}
                          </span>
                        </td>

                        <td style={{ padding: '14px 20px', color: '#475569', maxWidth: '300px' }}>
                          <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {c.message}
                          </p>
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <button
                            onClick={(e) => handleToggleContactStatus(c.id, e)}
                            style={{
                              background: c.status === 'Contacted' ? '#f1f5f9' : '#fffbeb',
                              color: c.status === 'Contacted' ? '#64748b' : '#b45309',
                              border: `1px solid ${c.status === 'Contacted' ? '#cbd5e1' : '#fde68a'}`,
                              padding: '3px 10px',
                              borderRadius: '100px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {c.status || 'New Inquiry'}
                          </button>
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <button
                            onClick={(e) => handleDeleteContact(c.id, e)}
                            title="Delete Inquiry"
                            style={{
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: '1px solid #fecaca',
                              padding: '6px 8px',
                              borderRadius: '7px',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      {/* ── MODAL: MANUALLY ADD ORGANIZATION (Clean White Design) ── */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Add New Customer Organization
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddOrganization} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Tech Solutions"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                  Admin Contact Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                  Work Email Address *
                </label>
                <input
                  type="email"
                  placeholder="admin@acmetech.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                  Employee Headcount Tier
                </label>
                <select
                  value={newHeadcount}
                  onChange={(e) => setNewHeadcount(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="1-20">1 - 20 Employees (Starter)</option>
                  <option value="21-100">21 - 100 Employees (Professional)</option>
                  <option value="101-300">101 - 300 Employees (Business)</option>
                  <option value="300+">300+ Employees (Enterprise)</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '8px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  padding: '11px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                }}
              >
                Provision 3-Day Trial Organization
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
