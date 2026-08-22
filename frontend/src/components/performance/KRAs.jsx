import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Edit2, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/* ─────────────────── DATA ─────────────────── */
const PIE_DATA = [
  { name: 'On Track',        value: 64, percent: '74.4%', color: '#2563EB' },
  { name: 'Needs Attention', value: 12, percent: '11.6%', color: '#F59E0B' },
  { name: 'Overdue',         value: 10, percent: '11.6%', color: '#EF4444' },
];

const TABLE_DATA = [
  { name: 'Product Development',   dept: 'Engineering', owner: 'Rahul Sharma',             weightage: '30%', progress: 75, status: 'On Track'         },
  { name: 'Quality Assurance',     dept: 'Engineering', owner: 'Rahul Sharma',             weightage: '20%', progress: 10, status: 'Needs Attention'   },
  { name: 'Client Management',     dept: 'Sales',       owner: 'Vikram Singh',             weightage: '25%', progress: 25, status: 'On Track'          },
  { name: 'Market Research',       dept: 'Marketing',   owner: 'Priya Patel',              weightage: '20%', progress: 55, status: 'Needs Attention'   },
  { name: 'Financial Planning',    dept: 'Finance',     owner: 'Neha Singh\nSneha Reddy', weightage: '25%', progress: 70, status: 'On Track'          },
  { name: 'Recruitment',           dept: 'HR',          owner: 'Sneha Reddy',              weightage: '20%', progress: 55, status: 'Needs Attention'   },
  { name: 'Operations Efficiency', dept: 'Operations',  owner: 'Arjun Mehta',              weightage: '25%', progress: 20, status: 'Needs Attention'   },
];

const TOP_OVERDUE = [
  { name: 'Operations Efficiency', owner: 'Arjun Mehta' },
  { name: 'Market Research',       owner: 'Priya Patel' },
  { name: 'Recruitment',           owner: 'Sneha Reddy' },
];

/* ─────────────────── STATUS STYLES ─────────────────── */
const STATUS_STYLE = {
  'On Track':        { bg: '#DCFCE7', color: '#15803D' },
  'Needs Attention': { bg: '#FEF3C7', color: '#D97706' },
  'Overdue':         { bg: '#FEE2E2', color: '#DC2626' },
};

const PROGRESS_COLOR = {
  'On Track':        '#2563EB',
  'Needs Attention': '#F59E0B',
  'Overdue':         '#EF4444',
};

/* ─────────────────── KPI CARD ─────────────────── */
const KpiCard = ({ iconBg, iconColor, icon, label, value }) => (
  <div style={{
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #E5E7EB',
    boxShadow: '0 2px 8px rgba(15,23,42,.05)',
    padding: '20px 24px',
    height: 110,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: '1 1 0',
    minWidth: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        width: 34, height: 34, borderRadius: 10,
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}>
        {icon}
      </span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>{label}</span>
    </div>
    <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
  </div>
);

/* ─────────────────── COMPONENT ─────────────────── */
const KRAs = () => {
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
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>KRAs</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280', fontWeight: 400 }}>Key Result Areas for roles and employees</p>
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
            <Plus size={15} /> Add KRA
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <KpiCard iconBg="#DBEAFE" iconColor="#2563EB" icon="📋" label="Total KRAs"  value={86} />
        <KpiCard iconBg="#DCFCE7" iconColor="#16A34A" icon="✓"  label="Active KRAs" value={64} />
        <KpiCard iconBg="#ECFDF5" iconColor="#10B981" icon="✔"  label="Completed"   value={12} />
        <KpiCard iconBg="#FEE2E2" iconColor="#DC2626" icon="⚠"  label="Overdue"     value={10} />
      </div>

      {/* ── FULL-WIDTH TABLE ── */}
      <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(15,23,42,.05)', overflow: 'hidden', marginBottom: 20,
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['KRA Name', 'Department', 'Owner', 'Weightage', 'Progress', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px 12px 20px', textAlign: 'left',
                    fontSize: 12, fontWeight: 500, color: '#6B7280',
                    whiteSpace: 'nowrap', background: '#fff',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_DATA.map((row, idx) => {
                const s = STATUS_STYLE[row.status];
                const barColor = PROGRESS_COLOR[row.status];
                return (
                  <tr key={idx} style={{ height: 58, borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '0 16px 0 20px', fontSize: 13, fontWeight: 600, color: '#111827' }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>
                      {row.dept}
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>
                      {row.owner}
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 500, color: '#111827' }}>
                      {row.weightage}
                    </td>
                    <td style={{ padding: '0 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#E5E7EB', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 999, background: barColor,
                            width: loaded ? `${row.progress}%` : '0%',
                            transition: 'width 900ms ease',
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', minWidth: 32 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
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
          padding: '14px 24px', borderTop: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Showing 1 to 7 of 86 entries</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[null, 1, 2, 3, '...', 13, null].map((pg, i) => {
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

      {/* ── BOTTOM ROW: Donut + Top Overdue ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* LEFT: KRA Progress Overview */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 24,
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>KRA Progress Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Donut */}
            <div style={{ width: 160, height: 160, position: 'relative', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={72}
                    paddingAngle={0} dataKey="value" stroke="none">
                    {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ flex: 1, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {PIE_DATA.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>
                    {item.value} <span style={{ color: '#9CA3AF' }}>({item.percent})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Top Overdue KRAs */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>Top Overdue KRAs</h3>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Owner</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TOP_OVERDUE.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? '#2563EB' : i === 1 ? '#F59E0B' : '#EF4444',
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: 13, color: '#374151' }}>{item.owner}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default KRAs;
