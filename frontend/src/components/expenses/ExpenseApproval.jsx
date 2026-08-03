import React, { useState } from 'react';
import { Download, ChevronDown, Clock, CheckCircle, XCircle, Layers } from 'lucide-react';

const PENDING_APPROVALS = [
  { id: 'CLM00157', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', emp: 'Priya Patel',   dept: 'Marketing',   purpose: 'Team lunch meeting',       date: '30 May 2024', amount: '₹ 2,850' },
  { id: 'CLM00152', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', emp: 'Neha Singh',    dept: 'Sales',       purpose: 'Client presentation - Pune',date: '28 May 2024', amount: '₹ 3,450' },
  { id: 'CLM00151', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', emp: 'Raj Kumar',     dept: 'Engineering', purpose: 'Conference registration', date: '28 May 2024', amount: '₹ 4,250' },
  { id: 'CLM00150', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', emp: 'Anjali Mehta',  dept: 'HR',          purpose: 'Candidate interview lunch',date: '27 May 2024', amount: '₹ 1,750' },
  { id: 'CLM00149', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', emp: 'Karan Verma',   dept: 'Operations',  purpose: 'Site visit - Hyderabad',   date: '27 May 2024', amount: '₹ 2,900' },
];

const KpiCard = ({ label, value, subtext, iconBg, iconColor, icon: Icon }) => (
  <div style={{
    background: '#FFF',
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 4px rgba(15,23,42,.06)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
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
      <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
      {subtext && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{subtext}</div>}
    </div>
  </div>
);

export function ExpenseApproval() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* Header & Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Expense Approval</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Review and approve employee expense claims</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Department Filter */}
          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none', height: 38,
              paddingLeft: 14, paddingRight: 32, background: '#FFF',
              border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none',
            }}>
              <option>All Departments</option>
              <option>Sales</option>
              <option>Marketing</option>
              <option>Engineering</option>
            </select>
            <ChevronDown size={13} color="#6B7280" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Export Report */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px',
            background: '#FFF', border: '1px solid #2563EB', color: '#2563EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* 4 KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Pending Approval" value="28" subtext="₹ 6,45,320"  iconBg="#FEF3C7" iconColor="#D97706" icon={Clock} />
        <KpiCard label="Approved"         value="98" subtext="₹ 15,25,680" iconBg="#ECFDF5" iconColor="#059669" icon={CheckCircle} />
        <KpiCard label="Rejected"         value="32" subtext="₹ 2,87,750"  iconBg="#FEF2F2" iconColor="#EF4444" icon={XCircle} />
        <KpiCard label="Total Amount"     value="₹ 24,58,750" subtext="This Month" iconBg="#EFF6FF" iconColor="#2563EB" icon={Layers} />
      </div>

      {/* Pending Approval List Table */}
      <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Pending Approval List</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                {['Claim ID', 'Employee', 'Department', 'Purpose', 'Claim Date', 'Amount', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PENDING_APPROVALS.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 48 }}>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.id}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#111827', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={r.avatar} alt={r.emp} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontWeight: 500 }}>{r.emp}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.dept}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.purpose}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.date}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.amount}</td>
                  <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{
                        background: 'none', border: 'none', color: '#16A34A', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}>
                        Approve
                      </button>
                      <button style={{
                        background: 'none', border: 'none', color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF' }}>
          <span style={{ fontSize: 12, color: '#6B7280' }}>Showing 1 to 5 of 28 entries</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5, 6].map((page) => (
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
  );
}

export default ExpenseApproval;
