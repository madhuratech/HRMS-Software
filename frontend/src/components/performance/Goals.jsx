import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Edit2, Link2, ArrowUp, ArrowDown, Target, CheckCircle2, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ─────────────────── DATA ─────────────────── */
const PIE_DATA = [
  { name: 'On Track',    value: 75, percent: '58.6%', color: '#2563EB' },
  { name: 'At Risk',     value: 32, percent: '25.0%', color: '#F59E0B' },
  { name: 'Not Started', value: 15, percent: '11.7%', color: '#CBD5E1' },
  { name: 'Completed',   value: 21, percent: '16.4%', color: '#22C55E' },
];

const BAR_DATA = [
  { name: 'Design',          goals: 10 },
  { name: 'Finance',         goals: 21 },
  { name: 'Human Resources', goals: 26 },
  { name: 'Sales',           goals: 31 },
  { name: 'Marketing',       goals: 34 },
  { name: 'Engineering',     goals: 38 },
];

const TABLE_DATA = [
  { title: 'Improve Product Quality',   owner: 'Rahul Sharma',  dept: 'Engineering', date: '30 Jun 2024', progress: 75, status: 'On Track'    },
  { title: 'Increase Website Traffic',  owner: 'Priya Patel',   dept: 'Marketing',   date: '15 Jul 2024', progress: 60, status: 'On Track'    },
  { title: 'Boost Sales Revenue',       owner: 'Vikram Singh',  dept: 'Sales',       date: '31 Aug 2024', progress: 40, status: 'At Risk'     },
  { title: 'Reduce Employee Turnover',  owner: 'Sneha Reddy',   dept: 'HR',          date: '30 Jun 2024', progress: 55, status: 'At Risk'     },
  { title: 'Optimize Operational Cost', owner: 'Amit Kumar',    dept: 'Finance',     date: '30 Sep 2024', progress: 20, status: 'Not Started' },
];

/* ─────────────────── STYLE HELPERS ─────────────────── */
const STATUS = {
  'On Track':    { bg: '#DCFCE7', color: '#15803D' },
  'At Risk':     { bg: '#FEF3C7', color: '#D97706' },
  'Not Started': { bg: '#F3F4F6', color: '#6B7280' },
};

/* ─────────────────── KPI CARD ─────────────────── */
const KpiCard = ({ icon: Icon, iconBg, iconColor, label, value, pct, pctUp }) => (
  <div style={{
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #E5E7EB',
    boxShadow: '0 2px 8px rgba(15,23,42,.05)',
    padding: '20px 24px',
    height: 120,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: '1 1 0',
    minWidth: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        width: 36, height: 36, borderRadius: '50%',
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={16} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>{label}</span>
    </div>
    <div>
      <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 12 }}>
        {pctUp
          ? <ArrowUp size={12} color="#22C55E" />
          : <ArrowDown size={12} color="#EF4444" />}
        <span style={{ fontWeight: 600, color: pctUp ? '#22C55E' : '#EF4444' }}>{pct}</span>
        <span style={{ color: '#6B7280' }}>vs last quarter</span>
      </div>
    </div>
  </div>
);

/* ─────────────────── COMPONENT ─────────────────── */
const Goals = () => {
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
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Goals</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280', fontWeight: 400 }}>Set, track and achieve organizational and individual goals</p>
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
            <Plus size={15} /> Add Goal
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <KpiCard icon={Target}       iconBg="#DBEAFE" iconColor="#2563EB" label="Total Goals" value={128} pct="12%" pctUp />
        <KpiCard icon={CheckCircle2} iconBg="#DCFCE7" iconColor="#16A34A" label="On Track"    value={75}  pct="10%" pctUp />
        <KpiCard icon={AlertCircle}  iconBg="#FEF3C7" iconColor="#D97706" label="At Risk"     value={32}  pct="6%"  pctUp={false} />
        <KpiCard icon={CheckCircle}  iconBg="#DCFCE7" iconColor="#16A34A" label="Completed"   value={21}  pct="25%" pctUp />
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* LEFT: Donut */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 24, height: 350,
          display: 'flex', flexDirection: 'column',
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Goals Progress Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {/* Doughnut */}
            <div style={{ width: 200, height: 200, position: 'relative', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={66} outerRadius={92}
                    paddingAngle={0} dataKey="value" stroke="none">
                    {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>128</span>
                <span style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Total Goals</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ flex: 1, paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PIE_DATA.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 11, height: 11, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>
                    {item.value} <span style={{ fontWeight: 400, color: '#9CA3AF' }}>({item.percent})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Bar Chart */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 24, height: 350,
          display: 'flex', flexDirection: 'column',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Goals by Department</h3>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_DATA} layout="vertical" margin={{ top: 0, right: 24, left: 30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" axisLine={{ stroke: '#E5E7EB' }} tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }} domain={[0, 40]} ticks={[0, 10, 20, 30, 40]} />
                <YAxis dataKey="name" type="category" axisLine={{ stroke: '#E5E7EB' }} tickLine={false}
                  tick={{ fill: '#111827', fontSize: 12, fontWeight: 500 }} width={118} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
                <Bar dataKey="goals" fill="#2563EB" barSize={14} radius={[0, 6, 6, 0]} animationDuration={900} />
                <text x="55%" y="100%" dy={-2} textAnchor="middle" fill="#9CA3AF" fontSize={11}>No. Goals</text>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(15,23,42,.05)', overflow: 'hidden',
      }}>
        {/* Table header label */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>Recent Goals</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr>
                {['Goal Title', 'Owner', 'Department', 'Due Date', 'Progress', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px 12px 20px',
                    textAlign: h === 'Actions' ? 'center' : 'left',
                    fontSize: 12, fontWeight: 500, color: '#6B7280',
                    borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap',
                    background: '#fff',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_DATA.map((row, idx) => {
                const s = STATUS[row.status];
                return (
                  <tr key={idx} style={{ height: 60, borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '0 16px 0 20px', fontSize: 13, fontWeight: 600, color: '#111827' }}>
                      {row.title}
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>
                      {row.owner}
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>
                      {row.dept}
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>
                      {row.date}
                    </td>
                    <td style={{ padding: '0 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#E5E7EB', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 999, background: '#2563EB',
                            width: loaded ? `${row.progress}%` : '0%',
                            transition: 'width 900ms ease',
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', minWidth: 30 }}>
                          {row.progress}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                        background: s.bg, color: s.color,
                        fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '0 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button style={{
                          width: 28, height: 28, borderRadius: 6, border: 'none',
                          background: 'transparent', color: '#2563EB', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button style={{
                          width: 28, height: 28, borderRadius: 6, border: 'none',
                          background: 'transparent', color: '#2563EB', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Link2 size={14} />
                        </button>
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
          padding: '14px 24px', borderTop: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Showing 1 to 5 of 128 entries</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[null, 1, 2, 3, '...', 26, null].map((pg, i) => {
              if (pg === null) {
                const isLeft = i === 0;
                return (
                  <button key={i} style={{
                    width: 32, height: 32, borderRadius: 6,
                    border: '1px solid #E5E7EB', background: '#fff',
                    color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isLeft ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                  </button>
                );
              }
              if (pg === '...') return <span key={i} style={{ width: 32, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>...</span>;
              const isActive = pg === 1;
              return (
                <button key={i} style={{
                  width: 32, height: 32, borderRadius: 6,
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
    </div>
  );
};

export default Goals;
