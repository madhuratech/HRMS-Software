import React, { useState } from 'react';
import { ChevronDown, Plus, Edit2, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

/* ─────────────────── DATA ─────────────────── */
const BAR_DATA = [
  { name: 'Finance',         count: 2  },
  { name: 'Human Resources', count: 4  },
  { name: 'Marketing',       count: 5  },
  { name: 'Sales',           count: 9  },
  { name: 'Engineering',     count: 12 },
];

const LINE_DATA = [
  { name: 'Jan', value: 2  },
  { name: 'Feb', value: 4  },
  { name: 'Mar', value: 3  },
  { name: 'Apr', value: 5  },
  { name: 'May', value: 8  },
  { name: 'Jun', value: 6  },
  { name: 'Jul', value: 9  },
  { name: 'Aug', value: 7  },
  { name: 'Sep', value: 11 },
  { name: 'Oct', value: 9  },
  { name: 'Nov', value: 13 },
  { name: 'Dec', value: 12 },
];

const TABLE_DATA = [
  { name: 'Rahul Sharma', initials: 'RS', from: 'Senior Developer',       to: 'Lead Developer',          date: '01 Jun 2024', status: 'Approved' },
  { name: 'Priya Patel',  initials: 'PP', from: 'Marketing Executive',    to: 'Marketing Specialist',    date: '15 May 2024', status: 'Approved' },
  { name: 'Vikram Singh', initials: 'VS', from: 'Sales Executive',        to: 'Senior Sales Executive',  date: '10 May 2024', status: 'Approved' },
  { name: 'Sneha Reddy',  initials: 'SR', from: 'HR Executive',           to: 'HR Specialist',           date: '05 May 2024', status: 'Pending'  },
  { name: 'Amit Kumar',   initials: 'AK', from: 'Junior Developer',       to: 'Developer',               date: '01 Apr 2024', status: 'Approved' },
];

const STATUS_STYLE = {
  'Approved': { bg: '#DCFCE7', color: '#15803D' },
  'Pending':  { bg: '#FEF3C7', color: '#D97706' },
  'Rejected': { bg: '#FEE2E2', color: '#DC2626' },
};

const AVATAR_COLORS = [
  { bg: '#DBEAFE', color: '#1D4ED8' },
  { bg: '#FCE7F3', color: '#9D174D' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#FEF3C7', color: '#92400E' },
  { bg: '#EDE9FE', color: '#5B21B6' },
];

/* ─────────────────── COMPONENT ─────────────────── */
const Promotions = () => {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Promotions</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280', fontWeight: 400 }}>Track and manage employee promotions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Year */}
          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none',
              height: 40, paddingLeft: 14, paddingRight: 32,
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
              fontSize: 13, fontWeight: 500, color: '#111827',
              boxShadow: '0 1px 3px rgba(0,0,0,.06)', cursor: 'pointer', outline: 'none',
            }}>
              <option>2024</option>
              <option>2023</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          {/* Period */}
          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none',
              height: 40, paddingLeft: 14, paddingRight: 32,
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
              fontSize: 13, fontWeight: 500, color: '#111827',
              boxShadow: '0 1px 3px rgba(0,0,0,.06)', cursor: 'pointer', outline: 'none',
            }}>
              <option>6M</option>
              <option>3M</option>
              <option>1Y</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 40, paddingLeft: 16, paddingRight: 16,
            background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(37,99,235,.3)',
          }}>
            <Plus size={15} /> Add Promotion
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Promotions',  value: 32, iconBg: '#DBEAFE', iconColor: '#2563EB', icon: '📋' },
          { label: 'This Year',         value: 18, iconBg: '#DCFCE7', iconColor: '#16A34A', icon: '📅' },
          { label: 'Pending Approval',  value: 6,  iconBg: '#FEF3C7', iconColor: '#D97706', icon: '⏳' },
          { label: 'Approved',          value: 26, iconBg: '#DCFCE7', iconColor: '#16A34A', icon: '✅' },
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

        {/* LEFT: Recent Promotions Table */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(15,23,42,.05)', overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>Recent Promotions</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['Employee', 'From Position', 'To Position', 'Effective Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '11px 14px', textAlign: 'left',
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
                      <td style={{ padding: '0 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: av.bg, color: av.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, flexShrink: 0,
                          }}>
                            {row.initials}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{row.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0 14px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{row.from}</td>
                      <td style={{ padding: '0 14px', fontSize: 13, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap' }}>{row.to}</td>
                      <td style={{ padding: '0 14px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{row.date}</td>
                      <td style={{ padding: '0 14px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                          background: s.bg, color: s.color,
                          fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '0 14px' }}>
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
            <span style={{ fontSize: 13, color: '#6B7280' }}>Showing 1 to 5 of 33 entries</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[null, 1, 2, 3, '...', 7, null].map((pg, i) => {
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

          {/* Promotions by Department */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 20,
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Promotions by Department</h3>
            <div style={{ height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BAR_DATA} layout="vertical" margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" axisLine={{ stroke: '#E5E7EB' }} tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 11 }} domain={[0, 15]} ticks={[0, 5, 10, 15]} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false}
                    tick={{ fill: '#111827', fontSize: 11, fontWeight: 500 }} width={100} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
                  <Bar dataKey="count" fill="#2563EB" barSize={12} radius={[0, 5, 5, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Promotion Trend */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 20, flex: 1,
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Promotion Trend</h3>
            <div style={{ height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={LINE_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={{ stroke: '#E5E7EB' }} tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
                  <Line
                    type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 5 }} animationDuration={900}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Promotions;
