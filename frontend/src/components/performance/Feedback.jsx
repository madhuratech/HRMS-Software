import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/* ─────────────────── DATA ─────────────────── */
const PIE_DATA = [
  { name: 'Positive',    value: 168, percent: '58.5%', color: '#2563EB' },
  { name: 'Improvement', value: 76,  percent: '27.2%', color: '#10B981' },
  { name: 'Neutral',     value: 53,  percent: '13.8%', color: '#F59E0B' },
];

const TABLE_DATA = [
  { from: 'Amit Mehta',    fromI: 'AM', to: 'Rahul Sharma',  feedback: 'Great leadership and problem solving skills.', type: 'Positive',    date: '22 May 2024' },
  { from: 'Neha Kapoor',   fromI: 'NK', to: 'Priya Patel',   feedback: 'Excellent communication and teamwork.',        type: 'Positive',    date: '21 May 2024' },
  { from: 'Rohan Verma',   fromI: 'RV', to: 'Vikram Singh',  feedback: 'Good effort in meeting targets.',              type: 'Positive',    date: '20 May 2024' },
  { from: 'Pooja Joshi',   fromI: 'PJ', to: 'Sneha Reddy',   feedback: 'Needs improvement in documentation.',          type: 'Improvement', date: '19 May 2024' },
  { from: 'Karan Malhotra',fromI: 'KM', to: 'Amit Kumar',    feedback: 'Very proactive and supportive.',               type: 'Positive',    date: '18 May 2024' },
];

const TYPE_STYLE = {
  'Positive':    { color: '#15803D' },
  'Improvement': { color: '#D97706' },
  'Neutral':     { color: '#6B7280' },
};

const TOP_GIVERS = [
  { name: 'Amit Mehta',  initials: 'AM', count: 45 },
  { name: 'Neha Kapoor', initials: 'NK', count: 38 },
  { name: 'Rohan Verma', initials: 'RV', count: 32 },
];

const AVATAR_COLORS = [
  { bg: '#DBEAFE', color: '#1D4ED8' },
  { bg: '#FCE7F3', color: '#9D174D' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#FEF3C7', color: '#92400E' },
  { bg: '#EDE9FE', color: '#5B21B6' },
];

/* ─────────────────── COMPONENT ─────────────────── */
const Feedback = () => {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Feedback</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280', fontWeight: 400 }}>Continuous feedback and recognition</p>
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
              <option>All Departments</option>
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
            <Plus size={15} /> Give Feedback
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Feedback Given',    value: 342, iconBg: '#DBEAFE', iconColor: '#2563EB', icon: '💬' },
          { label: 'Feedback Received', value: 287, iconBg: '#DCFCE7', iconColor: '#16A34A', icon: '📨' },
          { label: 'Recognitions',      value: 156, iconBg: '#FEF3C7', iconColor: '#D97706', icon: '🏆' },
          { label: 'Improvement Areas', value: 78,  iconBg: '#FEE2E2', iconColor: '#DC2626', icon: '📈' },
        ].map((card, idx) => (
          <div key={idx} style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(15,23,42,.05)',
            padding: '18px 22px', flex: '1 1 0', minWidth: 130,
            display: 'flex', alignItems: 'flex-start', gap: 14,
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
              <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>

        {/* LEFT: Recent Feedback Table */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(15,23,42,.05)', overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>Recent Feedback</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['From', 'To', 'Feedback', 'Type', 'Date'].map(h => (
                    <th key={h} style={{
                      padding: '11px 16px', textAlign: 'left',
                      fontSize: 12, fontWeight: 500, color: '#6B7280',
                      whiteSpace: 'nowrap', background: '#fff',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_DATA.map((row, idx) => {
                  const av = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  const ts = TYPE_STYLE[row.type];
                  return (
                    <tr key={idx} style={{ height: 54, borderBottom: '1px solid #F3F4F6' }}>
                      {/* From */}
                      <td style={{ padding: '0 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: av.bg, color: av.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, flexShrink: 0,
                          }}>
                            {row.fromI}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{row.from}</span>
                        </div>
                      </td>
                      {/* To */}
                      <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{row.to}</td>
                      {/* Feedback text */}
                      <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', maxWidth: 260 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.feedback}
                        </div>
                      </td>
                      {/* Type */}
                      <td style={{ padding: '0 16px' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: ts.color }}>{row.type}</span>
                      </td>
                      {/* Date */}
                      <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{row.date}</td>
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
            <span style={{ fontSize: 13, color: '#6B7280' }}>Showing 1 to 5 of 287 entries</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[null, 1, 2, 3, '...', 58, null].map((pg, i) => {
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

          {/* Feedback Distribution */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 20,
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Feedback Distribution</h3>

            {/* Donut */}
            <div style={{ width: '100%', height: 160, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={70}
                    paddingAngle={2} dataKey="value" stroke="none">
                    {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>287</span>
                <span style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Total</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
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

          {/* Top Feedback Givers */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 20, flex: 1,
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Top Feedback Givers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {TOP_GIVERS.map((person, idx) => {
                const av = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: av.bg, color: av.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, flexShrink: 0,
                      }}>
                        {person.initials}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{person.name}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#2563EB' }}>{person.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Feedback;
