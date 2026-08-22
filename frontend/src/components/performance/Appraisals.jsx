import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Edit2, Link2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/* ─────────────────── DATA ─────────────────── */
const RATING_PIE = [
  { name: 'Excellent',  value: 25, percent: '10.2%', color: '#2563EB' },
  { name: 'Very Good',  value: 75, percent: '30.6%', color: '#10B981' },
  { name: 'Good',       value: 89, percent: '36.3%', color: '#F59E0B' },
  { name: 'Average',    value: 42, percent: '18.4%', color: '#9CA3AF' },
  { name: 'Poor',       value: 13, percent: '5.3%',  color: '#EF4444' },
];

// Completion donut: 40% complete, 60% remaining
const COMPLETION_PIE = [
  { name: 'Completed', value: 40, color: '#10B981' },
  { name: 'Remaining', value: 60, color: '#E5E7EB' },
];

const TABLE_DATA = [
  { name: 'Rahul Sharma',  initials: 'RS', dept: 'Engineering',   appraiser: 'Amit Mehta',      date: '30 Jun 2024', status: 'Completed',   stars: 4 },
  { name: 'Priya Patel',   initials: 'PP', dept: 'Marketing',     appraiser: 'Karan Malhotra',  date: '30 Jun 2024', status: 'Completed',   stars: 5 },
  { name: 'Vikram Singh',  initials: 'VS', dept: 'Sales',         appraiser: 'Rohan Verma',     date: '30 Jun 2024', status: 'In Progress', stars: 3 },
  { name: 'Sneha Reddy',   initials: 'SR', dept: 'Human Resources',appraiser: 'Pooja Joshi',    date: '30 Jun 2024', status: 'In Progress', stars: 0 },
  { name: 'Amit Kumar',    initials: 'AK', dept: 'Engineering',   appraiser: 'Amit Mehta',      date: '30 Jun 2024', status: 'Pending',     stars: 0 },
  { name: 'Neha Singh',    initials: 'NS', dept: 'Finance',       appraiser: 'Karan Malhotra',  date: '30 Jun 2024', status: 'Pending',     stars: 0 },
  { name: 'Arjun Mehta',   initials: 'AM', dept: 'Operations',    appraiser: 'Rohan Verma',     date: '30 Jun 2024', status: 'Pending',     stars: 0 },
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
  { bg: '#E0E7FF', color: '#3730A3' },
];

/* ─────────────────── STAR RATING ─────────────────── */
const StarRating = ({ count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={13} style={{
        color: i <= count ? '#F59E0B' : '#D1D5DB',
        fill:  i <= count ? '#F59E0B' : 'none',
      }} />
    ))}
  </div>
);

/* ─────────────────── COMPONENT ─────────────────── */
const Appraisals = () => {
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
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Appraisals</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280', fontWeight: 400 }}>Manage employee performance appraisals</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none',
              height: 42, paddingLeft: 14, paddingRight: 36,
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
              fontSize: 13, fontWeight: 500, color: '#111827',
              boxShadow: '0 1px 3px rgba(0,0,0,.06)', cursor: 'pointer', outline: 'none',
            }}>
              <option>2024 Appraisal Cycle</option>
              <option>2023 Appraisal Cycle</option>
            </select>
            <ChevronDown size={15} color="#6B7280" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 42, paddingLeft: 16, paddingRight: 16,
            background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(37,99,235,.3)',
          }}>
            <Plus size={15} /> Create Appraisal
          </button>
        </div>
      </div>

      {/* ── KPI CARDS (5 cards) ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Appraisals', value: 245, iconBg: '#DBEAFE', iconColor: '#2563EB', icon: '📄' },
          { label: 'Completed',        value: 39,  iconBg: '#DCFCE7', iconColor: '#16A34A', icon: '✓'  },
          { label: 'In Progress',      value: 112, iconBg: '#DBEAFE', iconColor: '#2563EB', icon: '↻'  },
          { label: 'Pending',          value: 113, iconBg: '#FEF3C7', iconColor: '#D97706', icon: '⏱' },
          { label: 'Pending',          value: 35,  iconBg: '#FEE2E2', iconColor: '#DC2626', icon: '!'  },
        ].map((card, idx) => (
          <div key={idx} style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(15,23,42,.05)',
            padding: '16px 20px', flex: '1 1 0', minWidth: 120,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{
              width: 34, height: 34, borderRadius: 10,
              background: card.iconBg, color: card.iconColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, flexShrink: 0,
            }}>
              {card.icon}
            </span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 2 }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* LEFT: Table */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(15,23,42,.05)', overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['Employee', 'Department', 'Appraiser', 'Due Date', 'Status', 'Rating', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px 12px 16px', textAlign: 'left',
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
                    <tr key={idx} style={{ height: 56, borderBottom: '1px solid #F3F4F6' }}>
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
                      <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>{row.dept}</td>
                      <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>{row.appraiser}</td>
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
                      <td style={{ padding: '0 16px' }}>
                        {row.stars > 0
                          ? <StarRating count={row.stars} />
                          : <span style={{ color: '#9CA3AF', fontSize: 13 }}>—</span>
                        }
                      </td>
                      <td style={{ padding: '0 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button style={{
                            width: 28, height: 28, borderRadius: 6, border: 'none',
                            background: 'transparent', color: '#2563EB', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          ><Edit2 size={13} /></button>
                          <button style={{
                            width: 28, height: 28, borderRadius: 6, border: 'none',
                            background: 'transparent', color: '#2563EB', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          ><Link2 size={13} /></button>
                        </div>
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
            <span style={{ fontSize: 13, color: '#6B7280' }}>Showing 1 to 7 of 245 entries</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[null, 1, 2, 3, '...', 35, null].map((pg, i) => {
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

        {/* RIGHT SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Rating Distribution */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 20,
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Rating Distribution</h3>

            {/* Donut */}
            <div style={{ width: '100%', height: 160, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={RATING_PIE} cx="50%" cy="50%" innerRadius={52} outerRadius={72}
                    paddingAngle={2} dataKey="value" stroke="none">
                    {RATING_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>245</span>
                <span style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Total</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {RATING_PIE.map((item, i) => (
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

          {/* Appraisal Completion Rate */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 20,
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Appraisal Completion Rate</h3>

            {/* Half donut */}
            <div style={{ width: '100%', height: 120, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={COMPLETION_PIE}
                    cx="50%" cy="90%"
                    startAngle={180} endAngle={0}
                    innerRadius={56} outerRadius={76}
                    paddingAngle={0} dataKey="value" stroke="none"
                  >
                    {COMPLETION_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>40%</span>
                <span style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>86 of 245 Completed</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Appraisals;
