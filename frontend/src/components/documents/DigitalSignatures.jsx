import React, { useState } from 'react';
import { Download, Plus, Eye, FileText, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const SIG_PIE = [
  { name: 'Completed', value: 68, percent: '79.1%', color: '#10B981' },
  { name: 'Pending',   value: 14, percent: '16.3%', color: '#F59E0B' },
  { name: 'Declined',  value: 4,  percent: '4.6%',  color: '#EF4444' },
  { name: 'Expired',   value: 2,  percent: '2.3%',  color: '#9CA3AF' },
];

const SIG_REQUESTS = [
  { docName: 'Employment Contract - Rohit Sharma', requestedBy: 'HR Manager', requestedTo: 'Rohit Sharma', date: '21 May 2024', expiry: '28 May 2024', status: 'Completed' },
  { docName: 'Offer Letter - Priya Patel',          requestedBy: 'HR Manager', requestedTo: 'Priya Patel',   date: '20 May 2024', expiry: '27 May 2024', status: 'Pending'   },
  { docName: 'NDA - Amit Kumar',                   requestedBy: 'HR Manager', requestedTo: 'Amit Kumar',    date: '18 May 2024', expiry: '25 May 2024', status: 'Completed' },
  { docName: 'Policy Acknowledgement - Sneha Reddy',requestedBy: 'HR Manager', requestedTo: 'Sneha Reddy',   date: '15 May 2024', expiry: '22 May 2024', status: 'Declined'  },
  { docName: 'Offer Letter - Vikram Singh',         requestedBy: 'HR Manager', requestedTo: 'Vikram Singh',  date: '12 May 2024', expiry: '19 May 2024', status: 'Expired'   },
];

const RECENT_ACTIVITIES = [
  { text: 'Rohit Sharma signed Employment Contract', time: '2 mins ago', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { text: 'Priya Patel signature is pending',        time: '15 mins ago', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
  { text: 'Amit Kumar signed NDA',                  time: '1 hour ago', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80' },
  { text: 'Sneha Reddy declined Policy Acknowledgement', time: '2 hours ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { text: 'Vikram Singh signature request expired', time: '1 day ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
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

export function DigitalSignatures() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* Header & Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Digital Signatures</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Manage digital signatures and document signing</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px',
            background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(41,82,227,0.25)',
          }}>
            <Plus size={16} /> Request Signature
          </button>
        </div>
      </div>

      {/* 5 KPI Cards Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Total Requests" value="86" pct="+12.4%" isPositive={true}  iconBg="#EFF6FF" iconColor="#2563EB" icon={FileText} />
        <KpiCard label="Completed"      value="68" pct="+10.3%" isPositive={true}  iconBg="#ECFDF5" iconColor="#059669" icon={CheckCircle} />
        <KpiCard label="Pending"        value="14" pct="+16.7%" isPositive={true}  iconBg="#FEF3C7" iconColor="#D97706" icon={Clock} />
        <KpiCard label="Declined"       value="4"  pct="-20.0%" isPositive={true}  iconBg="#FEF2F2" iconColor="#EF4444" icon={XCircle} />
        <KpiCard label="Expired"        value="2"  pct="+0.0%"  isPositive={true}  iconBg="#F3F4F6" iconColor="#6B7280" icon={AlertTriangle} />
      </div>

      {/* Main Grid: Left Signature Requests Table + Right Signature Overview Widget */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        
        {/* Left: Signature Requests Table */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Signature Requests</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                  {['Document Name', 'Requested By', 'Requested To', 'Request Date', 'Expiry Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIG_REQUESTS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 48 }}>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.docName}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.requestedBy}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.requestedTo}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.date}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.expiry}</td>
                    <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: r.status === 'Completed' ? '#ECFDF5' : r.status === 'Pending' ? '#FEF3C7' : r.status === 'Declined' ? '#FEF2F2' : '#F3F4F6',
                        color: r.status === 'Completed' ? '#059669' : r.status === 'Pending' ? '#D97706' : r.status === 'Declined' ? '#EF4444' : '#6B7280',
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
        </div>

        {/* Right Widget Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Signature Overview Donut */}
          <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Signature Overview</h3>
            <div style={{ width: '100%', height: 160, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SIG_PIE} cx="50%" cy="50%" innerRadius={48} outerRadius={68} dataKey="value" stroke="none">
                    {SIG_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#111827', lineHeight: 1 }}>86</span>
                <span style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Total</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {SIG_PIE.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    {item.name}
                  </span>
                  <span style={{ color: '#6B7280', fontWeight: 500 }}>{item.value} ({item.percent})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity List Widget */}
          <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {RECENT_ACTIVITIES.map((act, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <img src={act.avatar} alt="User" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.3 }}>{act.text}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default DigitalSignatures;
