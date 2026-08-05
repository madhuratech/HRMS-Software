import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, ArrowUp, ArrowDown, Target, CheckCircle2, AlertCircle, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ─────────────────── DATA ─────────────────── */
const PIE_DATA = [
  { name: 'On Target',       value: 28, percent: '50.0%', color: '#2563EB' },
  { name: 'Needs Attention', value: 16, percent: '28.6%', color: '#F59E0B' },
  { name: 'Off Target',      value: 12, percent: '21.4%', color: '#EF4444' },
];

const BAR_DATA = [
  { name: 'Operations',      score: 5  },
  { name: 'Human Resources', score: 6  },
  { name: 'Finance',         score: 8  },
  { name: 'Marketing',       score: 9  },
  { name: 'Sales',           score: 11 },
  { name: 'Engineering',     score: 13 },
];

const TABLE_DATA = [
  { name: 'Customer Satisfaction Score', dept: 'Sales',       target: '90%', actual: '88%', progress: 98,  progressLabel: '98%',  status: 'On Target',       trendUp: true  },
  { name: 'Revenue Growth',              dept: 'Sales',       target: '$50M',actual: '$42M',progress: 84,  progressLabel: '84%',  status: 'On Target',       trendUp: true  },
  { name: 'Product Quality Index',       dept: 'Engineering', target: '95%', actual: '91%', progress: 96,  progressLabel: '96%',  status: 'On Target',       trendUp: true  },
  { name: 'Employee Engagement',         dept: 'HR',          target: '85%', actual: '72%', progress: 85,  progressLabel: '85%',  status: 'Needs Attention', trendUp: true  },
  { name: 'Cost Optimization',           dept: 'Finance',     target: '$20M',actual: '$18M',progress: 90,  progressLabel: '90%',  status: 'On Target',       trendUp: true  },
  { name: 'Lead Conversion Rate',        dept: 'Marketing',   target: '25%', actual: '18%', progress: 72,  progressLabel: '72%',  status: 'Needs Attention', trendUp: true  },
  { name: 'Project Delivery Rate',       dept: 'Operations',  target: '90%', actual: '65%', progress: 72,  progressLabel: '72%',  status: 'Off Target',      trendUp: false },
];

/* ─────────────────── STATUS MAP ─────────────────── */
const STATUS_STYLE = {
  'On Target':       { bg: '#DCFCE7', color: '#15803D' },
  'Needs Attention': { bg: '#FEF3C7', color: '#D97706' },
  'Off Target':      { bg: '#FEE2E2', color: '#DC2626' },
};

const PROGRESS_BAR_COLOR = {
  'On Target':       '#10B981',
  'Needs Attention': '#F59E0B',
  'Off Target':      '#EF4444',
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
        width: 36, height: 36, borderRadius: 10,
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
const KPIs = () => {
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
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>KPI</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280', fontWeight: 400 }}>Track key performance indicators across the organization</p>
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
            <Plus size={15} /> Add KPI
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <KpiCard icon={Target}       iconBg="#DBEAFE" iconColor="#2563EB" label="Total KPIs"       value={56} pct="14%" pctUp />
        <KpiCard icon={CheckCircle2} iconBg="#DCFCE7" iconColor="#16A34A" label="On Target"        value={28} pct="18%" pctUp />
        <KpiCard icon={AlertCircle}  iconBg="#FEF3C7" iconColor="#D97706" label="Needs Attention"  value={16} pct="6%"  pctUp={false} />
        <KpiCard icon={XCircle}      iconBg="#FEE2E2" iconColor="#DC2626" label="Off Target"       value={12} pct="5%"  pctUp={false} />
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* LEFT: Donut */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 24, height: 320,
          display: 'flex', flexDirection: 'column',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>KPI Performance</h3>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {/* Doughnut */}
            <div style={{ width: 180, height: 180, position: 'relative', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={84}
                    paddingAngle={2} dataKey="value" stroke="none">
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
                <span style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1 }}>56</span>
                <span style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>Total KPIs</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ flex: 1, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 24, height: 320,
          display: 'flex', flexDirection: 'column',
        }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#111827' }}>KPI by Department</h3>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_DATA} layout="vertical" margin={{ top: 4, right: 20, left: 30, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" axisLine={{ stroke: '#E5E7EB' }} tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }} domain={[0, 15]} ticks={[0, 5, 10, 15]} />
                <YAxis dataKey="name" type="category" axisLine={{ stroke: '#E5E7EB' }} tickLine={false}
                  tick={{ fill: '#111827', fontSize: 12, fontWeight: 500 }} width={110} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
                <Bar dataKey="score" fill="#2563EB" barSize={14} radius={[0, 6, 6, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── KPI LIST TABLE ── */}
      <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(15,23,42,.05)', overflow: 'hidden',
      }}>
        {/* Table header label */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>KPI List</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '26%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr>
                {['KPI Name', 'Department', 'Target', 'Actual', 'Progress', 'Status', 'Trend'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px 12px 20px',
                    textAlign: 'left',
                    fontSize: 12, fontWeight: 500, color: '#6B7280',
                    borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap',
                    background: '#fff',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_DATA.map((row, idx) => {
                const s = STATUS_STYLE[row.status];
                const barColor = PROGRESS_BAR_COLOR[row.status];
                return (
                  <tr key={idx} style={{ height: 60, borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '0 16px 0 20px', fontSize: 13, fontWeight: 600, color: '#111827' }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>
                      {row.dept}
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 500, color: '#111827' }}>
                      {row.target}
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 500, color: '#111827' }}>
                      {row.actual}
                    </td>
                    <td style={{ padding: '0 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#E5E7EB', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 999,
                            background: barColor,
                            width: loaded ? `${row.progress}%` : '0%',
                            transition: 'width 900ms ease',
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', minWidth: 36 }}>
                          {row.progressLabel}
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
                    <td style={{ padding: '0 16px' }}>
                      {row.trendUp
                        ? <ArrowUpRight size={16} color={PROGRESS_BAR_COLOR[row.status]} />
                        : <ArrowDownRight size={16} color={PROGRESS_BAR_COLOR[row.status]} />
                      }
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
          <span style={{ fontSize: 13, color: '#6B7280' }}>Showing 1 to 7 of 56 entries</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[null, 1, 2, 3, '...', 8, null].map((pg, i) => {
              if (pg === null) {
                const isLeft = i === 0;
                return (
                  <button key={i} style={{
                    width: 32, height: 32, borderRadius: 6,
                    border: '1px solid #E5E7EB', background: '#fff',
                    color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isLeft ? '‹' : '›'}
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

export default KPIs;
