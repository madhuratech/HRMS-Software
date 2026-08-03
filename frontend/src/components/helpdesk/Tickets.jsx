import React, { useState } from 'react';
import { Search, ChevronDown, Plus, Eye, FileText, Clock, CheckCircle, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TICKETS_DATA = [
  { id: 'TKT-1248', subject: 'System not logging in',       cat: 'IT Support',          priority: 'High',   requester: 'Rohit Sharma',  status: 'Resolved',    date: '31 May 2024 10:30 AM' },
  { id: 'TKT-1247', subject: 'Salary not credited',        cat: 'Payroll',             priority: 'High',   requester: 'Priya Patel',   status: 'Resolved',    date: '31 May 2024 09:15 AM' },
  { id: 'TKT-1246', subject: 'Leave application issue',    cat: 'Leave & Attendance',  priority: 'Medium', requester: 'Amit Kumar',    status: 'Pending',     date: '31 May 2024 08:45 AM' },
  { id: 'TKT-1245', subject: 'Email not working',          cat: 'IT Support',          priority: 'Medium', requester: 'Sneha Reddy',   status: 'Resolved',    date: '30 May 2024 06:20 PM' },
  { id: 'TKT-1244', subject: 'ID card not received',       cat: 'HR Support',          priority: 'Low',    requester: 'Vikram Singh',  status: 'In Progress', date: '30 May 2024 05:10 PM' },
  { id: 'TKT-1243', subject: 'Printer not working',        cat: 'IT Support',          priority: 'Medium', requester: 'Anjali Mehta',  status: 'Open',        date: '30 May 2024 04:05 PM' },
  { id: 'TKT-1242', subject: 'PF not updated',             cat: 'Payroll',             priority: 'High',   requester: 'Karan Verma',   status: 'Pending',     date: '29 May 2024 02:40 PM' },
  { id: 'TKT-1241', subject: 'Training access issue',      cat: 'Training',            priority: 'Low',    requester: 'Neha Singh',    status: 'Resolved',    date: '29 May 2024 01:15 PM' },
  { id: 'TKT-1240', subject: 'Shift change request',       cat: 'HR Support',          priority: 'Low',    requester: 'Rahul Das',     status: 'Resolved',    date: '29 May 2024 11:30 AM' },
  { id: 'TKT-1239', subject: 'Software installation',      cat: 'IT Support',          priority: 'Medium', requester: 'Pooja Mehta',   status: 'Open',        date: '29 May 2024 10:15 AM' },
];

const KpiCard = ({ label, value, subtext, isPositive, iconBg, iconColor, icon: Icon }) => (
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
        {subtext && (
          <span style={{ fontSize: 10, fontWeight: 600, color: isPositive ? '#16A34A' : '#DC2626', display: 'flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap' }}>
            {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {subtext}
          </span>
        )}
      </div>
    </div>
  </div>
);

export function Tickets() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* ── HEADER & TOOLBAR ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Tickets</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Manage and track all support tickets</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search tickets..."
              style={{
                height: 38, paddingLeft: 34, paddingRight: 14,
                background: '#FFF', border: '1px solid #E5E7EB',
                borderRadius: 8, fontSize: 13, color: '#111827',
                outline: 'none', width: 200,
              }}
            />
          </div>

          {/* Department Dropdown */}
          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none', height: 38,
              paddingLeft: 14, paddingRight: 32, background: '#FFF',
              border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none',
            }}>
              <option>All Departments</option>
              <option>IT Support</option>
              <option>HR Support</option>
              <option>Payroll</option>
            </select>
            <ChevronDown size={13} color="#6B7280" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Status Dropdown */}
          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none', height: 38,
              paddingLeft: 14, paddingRight: 32, background: '#FFF',
              border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none',
            }}>
              <option>All Status</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Pending</option>
              <option>Resolved</option>
            </select>
            <ChevronDown size={13} color="#6B7280" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Primary Action Button */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px',
            background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(41,82,227,0.25)',
          }}>
            <Plus size={16} /> New Ticket
          </button>
        </div>
      </div>

      {/* ── 5 KPI CARDS IN A SINGLE ROW ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Total Tickets" value="1,248" subtext="12.5% vs last month" isPositive={true}  iconBg="#EFF6FF" iconColor="#2563EB" icon={FileText} />
        <KpiCard label="Open"          value="261"   subtext="5.8% vs last month"  isPositive={false} iconBg="#FEF2F2" iconColor="#EF4444" icon={Clock} />
        <KpiCard label="In Progress"   value="312"   subtext="9.4% vs last month"  isPositive={true}  iconBg="#FEF3C7" iconColor="#D97706" icon={Clock} />
        <KpiCard label="Pending"       value="185"   subtext="5.2% vs last month"  isPositive={false} iconBg="#EFF6FF" iconColor="#818CF8" icon={AlertCircle} />
        <KpiCard label="Resolved"      value="490"   subtext="15.3% vs last month" isPositive={true}  iconBg="#ECFDF5" iconColor="#059669" icon={CheckCircle} />
      </div>

      {/* ── MAIN DATA TABLE: Tickets List ── */}
      <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                {['Ticket ID', 'Subject', 'Category', 'Priority', 'Requester', 'Status', 'Created On', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TICKETS_DATA.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 48 }}>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.id}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap' }}>{r.subject}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.cat}</td>
                  <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: r.priority === 'High' ? '#FEF2F2' : r.priority === 'Medium' ? '#FEF3C7' : '#F3F4F6',
                      color: r.priority === 'High' ? '#EF4444' : r.priority === 'Medium' ? '#D97706' : '#6B7280',
                    }}>
                      {r.priority}
                    </span>
                  </td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.requester}</td>
                  <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: r.status === 'Resolved' ? '#ECFDF5' : r.status === 'In Progress' ? '#FEF3C7' : r.status === 'Pending' ? '#EFF6FF' : '#FEF2F2',
                      color: r.status === 'Resolved' ? '#059669' : r.status === 'In Progress' ? '#D97706' : r.status === 'Pending' ? '#818CF8' : '#EF4444',
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.date}</td>
                  <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                    <button style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF' }}>
          <span style={{ fontSize: 12, color: '#6B7280' }}>Showing 1 to 10 of 1,248 entries</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5, '...', 125].map((page, idx) => (
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
  );
}

export default Tickets;
