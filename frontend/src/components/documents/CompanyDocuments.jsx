import React, { useState } from 'react';
import { Search, Download, Upload, Eye, FileText, CheckCircle, Folder, HardDrive, Clock, Globe } from 'lucide-react';

const CAT_LIST = [
  { id: 'all',        label: 'All Categories', count: 342 },
  { id: 'legal',      label: 'Legal',          count: 78 },
  { id: 'finance',    label: 'Finance',        count: 64 },
  { id: 'operations', label: 'Operations',     count: 56 },
  { id: 'compliance', label: 'Compliance',     count: 48 },
  { id: 'reports',    label: 'Reports',        count: 42 },
  { id: 'others',     label: 'Others',         count: 54 },
];

const COMPANY_DOCS = [
  { docName: 'Certificate of Incorporation.pdf', cat: 'Legal',      dept: 'Legal',   uploadedBy: 'Admin User', date: '21 May 2024', size: '1.2 MB', actions: '' },
  { docName: 'GST Registration Certificate.pdf', cat: 'Legal',      dept: 'Finance', uploadedBy: 'Admin User', date: '20 May 2024', size: '1.4 MB', actions: '' },
  { docName: 'Annual Report 2023.pdf',           cat: 'Reports',    dept: 'Finance', uploadedBy: 'Admin User', date: '18 May 2024', size: '3.6 MB', actions: '' },
  { docName: 'Office Security Policy.pdf',        cat: 'Compliance', dept: 'HR',      uploadedBy: 'HR Manager', date: '15 May 2024', size: '0.8 MB', actions: '' },
  { docName: 'IT Policy Document.pdf',           cat: 'Operations', dept: 'IT',      uploadedBy: 'IT Admin',   date: '12 May 2024', size: '1.1 MB', actions: '' },
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
          <span style={{ fontSize: 10, fontWeight: 600, color: isPositive ? '#16A34A' : '#6B7280', whiteSpace: 'nowrap' }}>
            {pct} vs last month
          </span>
        )}
      </div>
    </div>
  </div>
);

export function CompanyDocuments() {
  const [selectedCat, setSelectedCat] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* ── HEADER & TOOLBAR ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Company Documents</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Central repository for all company documents</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search documents..."
              style={{
                height: 38, paddingLeft: 34, paddingRight: 14,
                background: '#FFF', border: '1px solid #E5E7EB',
                borderRadius: 8, fontSize: 13, color: '#111827',
                outline: 'none', width: 220,
              }}
            />
          </div>

          {/* Primary Action Button */}
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
        <KpiCard label="Total Documents" value="342"     pct="+10.2%" isPositive={true} iconBg="#EFF6FF" iconColor="#2563EB" icon={FileText} />
        <KpiCard label="Departments"     value="12"      pct="+0.0%"  isPositive={true} iconBg="#ECFDF5" iconColor="#059669" icon={Folder} />
        <KpiCard label="Storage Used"    value="2.45 GB" pct="+6.3%"  isPositive={true} iconBg="#EFF6FF" iconColor="#2563EB" icon={HardDrive} />
        <KpiCard label="Recently Added"  value="24"      pct="+14.8%" isPositive={true} iconBg="#EFF6FF" iconColor="#2563EB" icon={Clock} />
        <KpiCard label="Public Documents" value="68"     pct="+5.7%"  isPositive={true} iconBg="#EFF6FF" iconColor="#2563EB" icon={Globe} />
      </div>

      {/* ── MAIN LAYOUT: LEFT SIDEBAR + MAIN TABLE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        
        {/* Left Panel: Document Categories Sidebar */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 16, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Document Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {CAT_LIST.map((c) => {
              const isActive = selectedCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCat(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: isActive ? 600 : 500,
                    background: isActive ? '#EFF6FF' : 'transparent',
                    color: isActive ? '#2563EB' : '#4B5563',
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  <span>{c.label}</span>
                  <span style={{ fontSize: 11, background: isActive ? '#DBEAFE' : '#F3F4F6', color: isActive ? '#2563EB' : '#6B7280', padding: '2px 6px', borderRadius: 10 }}>
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Main Table: Company Documents */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Company Documents</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                  {['Document Name', 'Category', 'Department', 'Uploaded By', 'Uploaded On', 'File Size', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPANY_DOCS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 48 }}>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 500, color: '#2563EB', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={16} color="#2563EB" />
                        <span>{r.docName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.cat}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.dept}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.uploadedBy}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.date}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.size}</td>
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
            <span style={{ fontSize: 12, color: '#6B7280' }}>Showing 1 to 5 of 342 entries</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5, '...', 69].map((page, idx) => (
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

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Upload Company Document</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowUploadModal(false); }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Employee Handbook 2024"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Category *</label>
                  <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                    <option>Policy & Handbook</option>
                    <option>Legal & Compliance</option>
                    <option>Safety & Guidelines</option>
                    <option>Finance & Tax</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Access Scope</label>
                  <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                    <option>All Employees</option>
                    <option>Management Only</option>
                    <option>HR Only</option>
                  </select>
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

export default CompanyDocuments;
