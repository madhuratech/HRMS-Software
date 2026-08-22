import React, { useState } from 'react';
import { Plus, Eye, Download, FileText, CheckCircle, Clock, AlertCircle, Archive } from 'lucide-react';

const POLICY_CATS = [
  { id: 'all',          label: 'All Categories', count: 24 },
  { id: 'hr-policies',  label: 'HR Policies',    count: 8 },
  { id: 'leave',        label: 'Leave Policies', count: 4 },
  { id: 'work',         label: 'Work Policies',  count: 5 },
  { id: 'compensation', label: 'Compensation',   count: 3 },
  { id: 'conduct',      label: 'Code of Conduct',count: 2 },
  { id: 'others',       label: 'Others',         count: 2 },
];

const HR_POLICIES = [
  { name: 'Employee Code of Conduct',      cat: 'Code of Conduct', version: '2.1', effectiveDate: '01 Jan 2024', updated: '20 May 2024', status: 'Published' },
  { name: 'Leave Policy',                  cat: 'Leave Policies',  version: '1.3', effectiveDate: '01 Jan 2024', updated: '15 May 2024', status: 'Published' },
  { name: 'Remote Work Policy',            cat: 'Work Policies',   version: '1.1', effectiveDate: '01 Mar 2024', updated: '10 May 2024', status: 'Published' },
  { name: 'Performance Management Policy', cat: 'HR Policies',     version: '2.0', effectiveDate: '01 Apr 2024', updated: '08 May 2024', status: 'Under Review' },
  { name: 'Travel & Expense Policy',       cat: 'HR Policies',     version: '1.2', effectiveDate: '01 Jan 2024', updated: '05 May 2024', status: 'Draft' },
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

export function HRPolicies() {
  const [selectedCat, setSelectedCat] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* Header & Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>HR Policies</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Manage and publish HR policies for your organization</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Primary Action Button */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px',
            background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(41,82,227,0.25)',
          }}>
            <Plus size={16} /> Add Policy
          </button>
        </div>
      </div>

      {/* 5 KPI Cards Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Total Policies"     value="24" pct="+8.1%"  isPositive={true} iconBg="#EFF6FF" iconColor="#2563EB" icon={FileText} />
        <KpiCard label="Published Policies" value="18" pct="+12.5%" isPositive={true} iconBg="#ECFDF5" iconColor="#059669" icon={CheckCircle} />
        <KpiCard label="Draft Policies"     value="4"  pct="+0.0%"  isPositive={true} iconBg="#FEF3C7" iconColor="#D97706" icon={Clock} />
        <KpiCard label="Under Review"       value="2"  pct="+0.0%"  isPositive={true} iconBg="#EFF6FF" iconColor="#2563EB" icon={AlertCircle} />
        <KpiCard label="Archived Policies"  value="0"  pct="+0.0%"  isPositive={true} iconBg="#F3F4F6" iconColor="#6B7280" icon={Archive} />
      </div>

      {/* Main Layout: Left Categories + Center Data Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        
        {/* Left Panel: Policy Categories */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 16, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Policy Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {POLICY_CATS.map((c) => {
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

        {/* Center Main Table: HR Policies */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>HR Policies</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                  {['Policy Name', 'Category', 'Version', 'Effective Date', 'Last Updated', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HR_POLICIES.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 48 }}>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.name}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#2563EB', whiteSpace: 'nowrap' }}>{r.cat}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.version}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.effectiveDate}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.updated}</td>
                    <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: r.status === 'Published' ? '#ECFDF5' : r.status === 'Under Review' ? '#EFF6FF' : '#FEF3C7',
                        color: r.status === 'Published' ? '#059669' : r.status === 'Under Review' ? '#2563EB' : '#D97706',
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
            <span style={{ fontSize: 12, color: '#6B7280' }}>Showing 1 to 5 of 24 entries</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    width: 28, height: 28, borderRadius: 6, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
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

    </div>
  );
}

export default HRPolicies;
