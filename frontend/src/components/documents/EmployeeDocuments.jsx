import React, { useState } from 'react';
import { Search, ChevronDown, Download, Upload, Eye, FileText, CheckCircle, Clock, AlertTriangle, XCircle, Filter } from 'lucide-react';

const DOC_TYPES = [
  { id: 'all',        label: 'All Documents',    count: 1248 },
  { id: 'identity',   label: 'Identity Proof',   count: 256 },
  { id: 'address',    label: 'Address Proof',    count: 168 },
  { id: 'education',  label: 'Educational',      count: 312 },
  { id: 'experience', label: 'Experience',       count: 245 },
  { id: 'other',      label: 'Other Documents',  count: 267 },
];

const EMP_DOCS = [
  { avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', emp: 'Rohit Sharma',  role: 'Software Engineer',  type: 'Identity Proof',  docName: 'Aadhaar Card.pdf',    date: '20 May 2024', expiry: '20 May 2034', status: 'Verified' },
  { avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', emp: 'Priya Patel',   role: 'Marketing Executive',type: 'Address Proof',   docName: 'Passport.pdf',        date: '18 May 2024', expiry: '18 May 2034', status: 'Verified' },
  { avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', emp: 'Amit Kumar',   role: 'Product Manager',    type: 'Educational',     docName: 'Degree Certificate.pdf',date: '15 May 2024', expiry: '-',          status: 'Verified' },
  { avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', emp: 'Sneha Reddy',  role: 'HR Executive',       type: 'Experience',      docName: 'Experience Letter.pdf',date: '10 May 2024', expiry: '-',          status: 'Pending'  },
  { avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', emp: 'Vikram Singh', role: 'UI/UX Designer',    type: 'Identity Proof',  docName: 'PAN Card.pdf',        date: '08 May 2024', expiry: '08 May 2034', status: 'Verified' },
];

const KpiCard = ({ label, value, pct, isPositive, iconBg, iconColor, icon: Icon }) => (
  <div style={{
    background: '#FFF',
    borderRadius: 14,
    border: '1px solid #E5E7EB',
    boxShadow: '0 2px 8px rgba(15,23,42,.04)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: '1 1 0',
    minWidth: 0,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: iconBg, color: iconColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={18} />
    </div>
    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</span>
        {pct && (
          <span style={{ fontSize: 10, fontWeight: 600, color: isPositive ? '#16A34A' : '#DC2626', whiteSpace: 'nowrap' }}>
            {pct} vs last month
          </span>
        )}
      </div>
    </div>
  </div>
);

export function EmployeeDocuments() {
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* ── HEADER & TOOLBAR ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Employee Documents</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Manage and track employee documents and their status</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search documents, employee..."
              style={{
                height: 38, paddingLeft: 34, paddingRight: 14,
                background: '#FFF', border: '1px solid #E5E7EB',
                borderRadius: 8, fontSize: 13, color: '#111827',
                outline: 'none', width: 220,
              }}
            />
          </div>

          {/* Department Select */}
          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none', height: 38,
              paddingLeft: 14, paddingRight: 32, background: '#FFF',
              border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none',
            }}>
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Sales</option>
              <option>HR</option>
            </select>
            <ChevronDown size={13} color="#6B7280" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Upload Document Primary Action Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px',
              background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(41,82,227,0.25)',
            }}
          >
            <Upload size={14} /> Upload Document
          </button>
        </div>
      </div>

      {/* ── 5 KPI CARDS IN A SINGLE ROW ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Total Documents"     value="1,248" pct="+12.5%" isPositive={true}  iconBg="#EFF6FF" iconColor="#2563EB" icon={FileText} />
        <KpiCard label="Verified Documents"  value="1,105" pct="+8.2%"  isPositive={true}  iconBg="#ECFDF5" iconColor="#059669" icon={CheckCircle} />
        <KpiCard label="Pending Documents"   value="98"    pct="+5.6%"  isPositive={true}  iconBg="#FEF3C7" iconColor="#D97706" icon={Clock} />
        <KpiCard label="Expiring Soon"       value="45"    pct="+15.2%" isPositive={false} iconBg="#FFEDD5" iconColor="#EA580C" icon={AlertTriangle} />
        <KpiCard label="Rejected Documents"  value="23"    pct="-3.1%"  isPositive={true}  iconBg="#FEF2F2" iconColor="#EF4444" icon={XCircle} />
      </div>

      {/* ── MAIN LAYOUT: LEFT SIDEBAR + CENTER DATA TABLE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        
        {/* Left Panel: Document Type Filter Sidebar */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 16, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Document Type</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {DOC_TYPES.map((t) => {
              const isActive = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: isActive ? 600 : 500,
                    background: isActive ? '#EFF6FF' : 'transparent',
                    color: isActive ? '#2563EB' : '#4B5563',
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  <span>{t.label}</span>
                  <span style={{ fontSize: 11, background: isActive ? '#DBEAFE' : '#F3F4F6', color: isActive ? '#2563EB' : '#6B7280', padding: '2px 6px', borderRadius: 10 }}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Main Table: Employee Documents */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Employee Documents</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                  {['Employee', 'Document Type', 'Document Name', 'Uploaded On', 'Expiry Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EMP_DOCS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 52 }}>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#111827', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={r.avatar} alt={r.emp} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{r.emp}</div>
                          <div style={{ fontSize: 11, color: '#6B7280' }}>{r.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.type}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 500, color: '#2563EB', whiteSpace: 'nowrap' }}>{r.docName}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.date}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.expiry}</td>
                    <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: r.status === 'Verified' ? '#ECFDF5' : r.status === 'Pending' ? '#FEF3C7' : '#FEF2F2',
                        color: r.status === 'Verified' ? '#059669' : r.status === 'Pending' ? '#D97706' : '#EF4444',
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 8, color: '#6B7280' }}>
                        <button style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}><Eye size={16} /></button>
                        <button style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}><Download size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF' }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Showing 1 to 5 of 1,248 entries</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5, '...', 250].map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  style={{
                    minWidth: 28, height: 28, padding: '0 6px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
                    background: currentPage === page ? '#2563EB' : '#F3F4F6',
                    color: currentPage === page ? '#FFF' : '#374151',
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Upload Employee Document Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Upload Employee Document</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowUploadModal(false); }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Employee Name / ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma (EMP-101)"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Document Type *</label>
                  <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                    <option>Identity Proof</option>
                    <option>Education Certificate</option>
                    <option>Address Proof</option>
                    <option>Tax & Salary</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Document Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aadhaar Card"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Select File *</label>
                <input
                  type="file"
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 18px', background: '#2952E3', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default EmployeeDocuments;
