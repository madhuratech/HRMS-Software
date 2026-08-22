import React, { useState } from 'react';
import { Download, Calendar, ChevronDown, Plus, Eye, ArrowUpRight, Layers, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const REIMB_OVER_TIME = [
  { day: 'May 1-5', amount: 120000 },
  { day: 'May 6-10', amount: 180000 },
  { day: 'May 11-15', amount: 140000 },
  { day: 'May 16-20', amount: 220000 },
  { day: 'May 21-25', amount: 190000 },
  { day: 'May 26-31', amount: 85450 },
];

const REIMB_DEPT = [
  { name: 'Sales',       amount: 245620 },
  { name: 'Engineering', amount: 210450 },
  { name: 'Marketing',   amount: 175300 },
  { name: 'Operations',  amount: 135150 },
  { name: 'HR',          amount: 85800 },
  { name: 'Finance',     amount: 50300 },
  { name: 'Others',      amount: 67750 },
];

const RECENT_REIMBURSEMENTS = [
  { id: 'RMB00125', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', emp: 'Rohit Sharma',  dept: 'Sales',       purpose: 'Travel reimbursement',     date: '31 May 2024', amount: '₹ 8,450', status: 'Paid',   paidOn: '31 May 2024' },
  { id: 'RMB00124', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', emp: 'Priya Patel',   dept: 'Marketing',   purpose: 'Client lunch reimbursement',date: '30 May 2024', amount: '₹ 6,300', status: 'Paid',   paidOn: '30 May 2024' },
  { id: 'RMB00123', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', emp: 'Amit Kumar',   dept: 'Engineering', purpose: 'Conference reimbursement', date: '30 May 2024', amount: '₹ 7,850', status: 'Pending',paidOn: '-' },
  { id: 'RMB00122', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', emp: 'Sneha Reddy',  dept: 'HR',          purpose: 'Interview lunch reimbursement',date: '29 May 2024', amount: '₹ 4,050', status: 'Paid', paidOn: '29 May 2024' },
  { id: 'RMB00121', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', emp: 'Vikram Singh', dept: 'Operations',  purpose: 'Site visit reimbursement',  date: '29 May 2024', amount: '₹ 5,120', status: 'Rejected',paidOn: '-' },
];

const KpiCard = ({ label, value, subtext, iconBg, iconColor, icon: Icon }) => (
  <div style={{
    background: '#FFF',
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 4px rgba(15,23,42,.06)',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
    minWidth: 0,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: iconBg, color: iconColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={16} />
    </div>
    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
        {subtext && <span style={{ fontSize: 10, color: '#6B7280', whiteSpace: 'nowrap' }}>{subtext}</span>}
      </div>
    </div>
  </div>
);

export function Reimbursements() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* Header & Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Reimbursements</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Track and manage all reimbursements</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px',
            background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer',
          }}>
            <Calendar size={14} color="#6B7280" /> May 1 – May 31, 2024 <ChevronDown size={13} color="#6B7280" />
          </button>

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

          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px',
            background: '#FFF', border: '1px solid #2563EB', color: '#2563EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Download size={14} /> Export Report
          </button>

          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px',
            background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(41,82,227,0.25)',
          }}>
            <Plus size={16} /> New Reimbursement
          </button>
        </div>
      </div>

      {/* 5 KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Total Reimbursements" value="56"        subtext="₹ 9,35,450" iconBg="#EFF6FF" iconColor="#2563EB" icon={FileText} />
        <KpiCard label="Paid"                 value="42"        subtext="₹ 7,25,600" iconBg="#ECFDF5" iconColor="#059669" icon={CheckCircle} />
        <KpiCard label="Pending"              value="10"        subtext="₹ 1,85,320" iconBg="#FEF3C7" iconColor="#D97706" icon={Clock} />
        <KpiCard label="Rejected"             value="4"         subtext="₹ 24,530"  iconBg="#FEF2F2" iconColor="#EF4444" icon={XCircle} />
        <KpiCard label="Avg. Reimbursement"   value="₹ 16,704"  subtext="6.3% vs last month" iconBg="#EFF6FF" iconColor="#2563EB" icon={Layers} />
      </div>

      {/* Analytics Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        
        {/* Left: Reimbursement Over Time Line Chart */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Reimbursement Over Time</h3>
            <select style={{ fontSize: 11, color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 6, padding: '2px 6px', background: '#FFF', cursor: 'pointer' }}>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REIMB_OVER_TIME} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip formatter={(val) => `₹ ${val.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Line type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Reimbursement by Department Horizontal Bar */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Reimbursement by Department</h3>
          <div style={{ width: '100%', height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={REIMB_DEPT} margin={{ top: 0, right: 30, left: 25, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => `${val / 100000}L`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#374151' }} width={75} />
                <Tooltip formatter={(val) => `₹ ${val.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Bar dataKey="amount" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Main Table: Recent Reimbursements */}
      <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Recent Reimbursements</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                {['Reimbursement ID', 'Employee', 'Department', 'Purpose', 'Date', 'Amount', 'Status', 'Paid On', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_REIMBURSEMENTS.map((r, i) => (
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
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: r.status === 'Paid' ? '#ECFDF5' : r.status === 'Pending' ? '#FEF3C7' : '#FEF2F2',
                      color: r.status === 'Paid' ? '#059669' : r.status === 'Pending' ? '#D97706' : '#EF4444',
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.paidOn}</td>
                  <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                    <button style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF' }}>
          <span style={{ fontSize: 12, color: '#6B7280' }}>Showing 1 to 5 of 56 entries</span>
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
  );
}

export default Reimbursements;
