import React, { useState } from 'react';
import { MessageSquare, Building2, Mail, Phone, Send, Check, X, User } from 'lucide-react';

export function ContactModal({ isOpen, onClose }) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactTopic, setContactTopic] = useState('Custom Enterprise Plan');
  const [contactMessage, setContactMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim()) return;
    setLoading(true);

    const newInquiry = {
      id: 'INQ-' + Date.now().toString().slice(-5),
      type: 'Sales & Advisory Inquiry',
      name: contactName.trim(),
      email: contactEmail.trim(),
      company: contactCompany.trim() || 'Undisclosed Org',
      phone: contactPhone.trim() || '+91 90036 63660',
      topic: contactTopic,
      message: contactMessage.trim() || 'Requested product walkthrough and custom quotation.',
      status: 'New Inquiry',
      submittedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };

    try {
      const existing = JSON.parse(localStorage.getItem('hrms_contact_submissions') || '[]');
      const updated = [newInquiry, ...existing.filter(item => item.email !== newInquiry.email)];
      localStorage.setItem('hrms_contact_submissions', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving contact submission:', err);
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          border: '1px solid #e2e8f0',
          padding: '32px',
          position: 'relative',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #dbeafe'
              }}
            >
              <MessageSquare size={22} />
            </div>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: '#2563eb',
                  display: 'block'
                }}
              >
                Product Advisory & Sales
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                Contact Sales Team
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '9px 12px'
                  }}
                >
                  <User size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  Work Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '9px 12px'
                  }}
                >
                  <Mail size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a' }}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  Company Name
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '9px 12px'
                  }}
                >
                  <Building2 size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  Phone Number
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '9px 12px'
                  }}
                >
                  <Phone size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <input
                    type="tel"
                    placeholder="+91 90036 63660"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Topic of Interest
              </label>
              <select
                value={contactTopic}
                onChange={(e) => setContactTopic(e.target.value)}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Custom Enterprise Plan">Custom Enterprise Plan</option>
                <option value="Biometric Device Integration & GPS">Biometric Device Integration & GPS</option>
                <option value="Cloud or On-Premises Deployment">Cloud or On-Premises Deployment</option>
                <option value="Schedule Guided 1-on-1 Product Demo">Schedule Guided 1-on-1 Product Demo</option>
                <option value="General Inquiries & Pricing">General Inquiries & Pricing</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Message / Requirement Details
              </label>
              <textarea
                rows={3}
                placeholder="Tell us about your headcount, rollout timeline, or specific module requirements..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#0f172a',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '10px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 700,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '12px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Submitting Inquiry...' : 'Submit Contact Inquiry'}
              <Send size={15} />
            </button>
          </form>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', background: '#ecfdf5', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                background: '#10b981',
                color: '#ffffff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}
            >
              <Check size={26} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#065f46', margin: '0 0 6px' }}>Inquiry Submitted!</h4>
            <p style={{ fontSize: '13px', color: '#047857', margin: '0 0 16px', lineHeight: 1.5 }}>
              Thank you for reaching out. Our solution specialist will contact you at <strong>{contactEmail}</strong> within 2 business hours.
            </p>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', borderTop: '1px solid #a7f3d0', paddingTop: '12px' }}>
              Direct Line: +91 90036 63660 • biz@madhuratech.com
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
