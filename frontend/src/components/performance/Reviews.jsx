import React, { useState, useEffect } from 'react';
import { ChevronDown, Star, Edit2, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/* ─────────────────── DATA ─────────────────── */
const PIE_DATA = [
  { name: 'Completed',   value: 76, percent: '61.4%', color: '#10B981' },
  { name: 'In-Progress', value: 52, percent: '33.2%', color: '#2563EB' },
  { name: 'Pending',     value: 30, percent: '14.3%', color: '#F59E0B' },
];

const TABLE_DATA = [
  { name: 'Rahul Sharma', initials: 'RS', type: 'Manager Review', reviewer: 'Amit Mehta',     date: '22 May 2024', status: 'Completed'   },
  { name: 'Priya Patel',  initials: 'PP', type: 'Peer Review',    reviewer: 'Via Kapoor',      date: '21 May 2024', status: 'Completed'   },
  { name: 'Vikram Singh', initials: 'VS', type: 'Self Review',    reviewer: '—',               date: '20 May 2024', status: 'Completed'   },
  { name: 'Sneha Reddy',  initials: 'SR', type: '360° Review',    reviewer: '—',               date: '19 May 2024', status: 'In Progress' },
  { name: 'Amit Kumar',   initials: 'AK', type: 'Peer Review',    reviewer: 'Rohan Verma',     date: '18 May 2024', status: 'In Progress' },
  { name: 'Neha Singh',   initials: 'NS', type: 'Manager Review', reviewer: 'Karan Malhotra',  date: '17 May 2024', status: 'Pending'     },
];

const STATUS_STYLE = {
  'Completed':   { bg: '#DCFCE7', color: '#15803D' },
  'In Progress': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Pending':     { bg: '#FEF3C7', color: '#D97706' },
};

const AVATAR_COLORS = [
  { bg: '#DBEAFE', color: '#1D4ED8' },
  { bg: '#FCE7F3', color: '#9D174D' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#FEF3C7', color: '#92400E' },
  { bg: '#EDE9FE', color: '#5B21B6' },
  { bg: '#FEE2E2', color: '#991B1B' },
];

/* ─────────────────── COMPONENT ─────────────────── */
const Reviews = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Reviews</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280', fontWeight: 400 }}>Track and manage performance reviews</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* All Departments */}
          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none',
              height: 40, paddingLeft: 14, paddingRight: 34,
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
              fontSize: 13, fontWeight: 500, color: '#111827',
              boxShadow: '0 1px 3px rgba(0,0,0,.06)', cursor: 'pointer', outline: 'none',
            }}>
              <option>All Departments</option>
              <option>Engineering</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          {/* All Status */}
          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none',
              height: 40, paddingLeft: 14, paddingRight: 34,
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
              fontSize: 13, fontWeight: 500, color: '#111827',
              boxShadow: '0 1px 3px rgba(0,0,0,.06)', cursor: 'pointer', outline: 'none',
            }}>
              <option>All Status</option>
              <option>Completed</option>
              <option>In Progress</option>
              <option>Pending</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* ── KPI CARDS (5 + summary card) ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Reviews',   value: 156, iconBg: '#F1F5F9', iconColor: '#475569', icon: '📋' },
          { label: 'Peer Reviews',    value: 45,  iconBg: '#DBEAFE', iconColor: '#2563EB', icon: '👥' },
          { label: 'Self Reviews',    value: 56,  iconBg: '#EDE9FE', iconColor: '#7C3AED', icon: '👤' },
          { label: 'Manager Reviews', value: 55,  iconBg: '#DCFCE7', iconColor: '#16A34A', icon: '💼' },
          { label: '360° Reviews',    value: 32,  iconBg: '#FEF3C7', iconColor: '#D97706', icon: '🔄' },
        ].map((card, idx) => (
          <div key={idx} style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(15,23,42,.05)',
            padding: '14px 18px', flex: '1 1 0', minWidth: 110,
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8,
              background: card.iconBg, color: card.iconColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0,
            }}>
              {card.icon}
            </span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 2 }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{card.value}</div>
            </div>
          </div>
        ))}

        {/* Top Review Summary card */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(15,23,42,.05)',
          padding: '14px 18px', minWidth: 120,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', textAlign: 'center', lineHeight: 1.4 }}>
            Top review<br />Summaries
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>

        {/* LEFT: Table */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(15,23,42,.05)', overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>Recent Reviews</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['Employee', 'Review Type', 'Reviewer', 'Review Date', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '11px 16px 11px 16px', textAlign: 'left',
                      fontSize: 12, fontWeight: 500, color: '#6B7280',
                      whiteSpace: 'nowrap', background: '#fff',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_DATA.map((row, idx) => {
                  const s = STATUS_STYLE[row.status];
                  const av = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <tr key={idx} style={{ height: 54, borderBottom: '1px solid #F3F4F6' }}>
                      {/* Employee */}
                      <td style={{ padding: '0 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: av.bg, color: av.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, flexShrink: 0,
                          }}>
                            {row.initials}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{row.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>{row.type}</td>
                      <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>{row.reviewer}</td>
                      <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>{row.date}</td>
                      <td style={{ padding: '0 16px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                          background: s.bg, color: s.color,
                          fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                        }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{
            padding: '14px 20px', borderTop: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <span style={{ fontSize: 13, color: '#6B7280' }}>Showing 1 to 6 of 156 entries</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[null, 1, 2, 3, '...', 28, null].map((pg, i) => {
                if (pg === null) {
                  const isLeft = i === 0;
                  return (
                    <button key={i} style={{
                      width: 30, height: 30, borderRadius: 6,
                      border: '1px solid #E5E7EB', background: '#fff',
                      color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isLeft ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
                    </button>
                  );
                }
                if (pg === '...') return <span key={i} style={{ width: 30, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>...</span>;
                const isActive = pg === 1;
                return (
                  <button key={i} style={{
                    width: 30, height: 30, borderRadius: 6,
                    border: isActive ? 'none' : '1px solid #E5E7EB',
                    background: isActive ? '#2563EB' : '#fff',
                    color: isActive ? '#fff' : '#374151',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {pg}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Review Summary */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 20,
          display: 'flex', flexDirection: 'column',
        }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Review Summary</h3>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #F3F4F6' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>4.3</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 3 }}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={13} style={{ color: i <= 4 ? '#F59E0B' : '#D1D5DB', fill: i <= 4 ? '#F59E0B' : 'none' }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>Average Rating</div>
            </div>
          </div>

          {/* Sub-rating row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>4.2</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={11} style={{ color: i <= 4 ? '#F59E0B' : '#D1D5DB', fill: i <= 4 ? '#F59E0B' : 'none' }} />
              ))}
            </div>
            <span style={{ fontSize: 11, color: '#6B7280' }}>% total done</span>
          </div>

          {/* Donut Chart */}
          <div style={{ width: '100%', height: 160, position: 'relative', marginBottom: 14 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={70}
                  paddingAngle={2} dataKey="value" stroke="none">
                  {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PIE_DATA.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{item.name}</span>
                </div>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  {item.value} <span style={{ color: '#9CA3AF' }}>({item.percent})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Reviews;
