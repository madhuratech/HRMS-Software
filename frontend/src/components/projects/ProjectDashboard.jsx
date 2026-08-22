import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Edit2, Link2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const PIE_DATA = [
  { name: 'In Progress', value: 16, percent: '66.7%', color: '#2563EB' },
  { name: 'Completed',   value: 4,  percent: '16.7%', color: '#10B981' },
  { name: 'On Hold',     value: 2,  percent: '8.3%',  color: '#F59E0B' },
  { name: 'Overdue',     value: 5,  percent: '13.3%', color: '#EF4444' },
];

const LINE_DATA = [
  { month: 'Jan', InProgress: 5,  Completed: 1, Overdue: 1 },
  { month: 'Feb', InProgress: 8,  Completed: 2, Overdue: 1 },
  { month: 'Mar', InProgress: 10, Completed: 3, Overdue: 2 },
  { month: 'Apr', InProgress: 12, Completed: 3, Overdue: 2 },
  { month: 'May', InProgress: 14, Completed: 4, Overdue: 3 },
  { month: 'Jun', InProgress: 16, Completed: 4, Overdue: 5 },
];

const TOP_PROJECTS = [
  { name: 'HRM Software',        pct: 75 },
  { name: 'Mobile App',          pct: 60 },
  { name: 'Website Redesign',    pct: 45 },
  { name: 'CRM Integration',     pct: 30 },
  { name: 'API Development',     pct: 20 },
];

const RECENT = [
  { name: 'HRM Software',        manager: 'Rahul Sharma',  start: '01 May 2024', end: '30 Aug 2024', pct: 75, status: 'In Progress', priority: 'High'   },
  { name: 'Mobile App Dev',      manager: 'Priya Patel',   start: '10 May 2024', end: '10 Sep 2024', pct: 60, status: 'In Progress', priority: 'High'   },
  { name: 'Website Redesign',    manager: 'Amit Kumar',    start: '15 Apr 2024', end: '15 Jun 2024', pct: 45, status: 'In Progress', priority: 'Medium' },
  { name: 'CRM Integration',     manager: 'Sneha Kapoor',  start: '20 May 2024', end: '20 Jul 2024', pct: 30, status: 'In Progress', priority: 'Medium' },
  { name: 'API Development',     manager: 'Vikram Singh',  start: '26 May 2024', end: '26 Aug 2024', pct: 20, status: 'On Hold',     priority: 'Low'    },
];

const STATUS_S = { 'In Progress': { bg: '#DBEAFE', color: '#1D4ED8' }, 'Completed': { bg: '#DCFCE7', color: '#15803D' }, 'On Hold': { bg: '#FEF3C7', color: '#D97706' }, 'Overdue': { bg: '#FEE2E2', color: '#DC2626' } };
const PRIORITY_S = { 'High': { bg: '#FEE2E2', color: '#DC2626' }, 'Medium': { bg: '#FEF3C7', color: '#D97706' }, 'Low': { bg: '#DCFCE7', color: '#15803D' } };
const AVATAR = [{ bg: '#DBEAFE', c: '#1D4ED8' }, { bg: '#FCE7F3', c: '#9D174D' }, { bg: '#D1FAE5', c: '#065F46' }, { bg: '#FEF3C7', c: '#92400E' }, { bg: '#EDE9FE', c: '#5B21B6' }];

const pill = (label, map) => {
  const s = map[label] || { bg: '#F3F4F6', color: '#6B7280' };
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>;
};

const KpiCard = ({ label, value, growth, up, iconBg, iconColor, icon }) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: '18px 20px', flex: '1 1 0', minWidth: 140 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>{label}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: 6 }}>{value}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
      <span style={{ color: up ? '#10B981' : '#EF4444', fontWeight: 600 }}>{up ? '↑' : '↓'} {growth}</span>
      <span style={{ color: '#9CA3AF' }}>vs last month</span>
    </div>
  </div>
);

export default function ProjectDashboard() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Project Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Overview of all projects and key metrics</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}><Calendar size={14} /> May 1 - May 31, 2024</button>
          <select style={{ height: 38, padding: '0 12px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none' }}><option>All Departments</option></select>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
            <input placeholder="Search project..." style={{ height: 38, paddingLeft: 30, paddingRight: 12, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', width: 170 }} />
          </div>
          <button style={{ height: 38, padding: '0 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Download size={14} /> Export</button>
          <button style={{ height: 38, padding: '0 16px', background: '#2563EB', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> New Project</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <KpiCard label="Total Projects"    value={24} growth="12%"  up    iconBg="#DBEAFE" iconColor="#2563EB" icon="📋" />
        <KpiCard label="In Progress"       value={16} growth="15%"  up    iconBg="#DBEAFE" iconColor="#2563EB" icon="▶" />
        <KpiCard label="Completed"         value={6}  growth="18%"  up    iconBg="#DCFCE7" iconColor="#16A34A" icon="✓" />
        <KpiCard label="On Hold"           value={2}  growth="10%"  up={false} iconBg="#FEF3C7" iconColor="#D97706" icon="⏸" />
        <KpiCard label="Overdue"           value={3}  growth="4.5%" up={false} iconBg="#FEE2E2" iconColor="#DC2626" icon="⚠" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Donut */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Projects Overview</h3>
          <div style={{ width: '100%', height: 140, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={46} outerRadius={64} paddingAngle={2} dataKey="value" stroke="none">{PIE_DATA.map((e,i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} /></PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>24</span>
              <span style={{ fontSize: 10, color: '#6B7280' }}>Total</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
            {PIE_DATA.map((d,i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} /><span style={{ fontSize: 11, color: '#374151' }}>{d.name}</span></div>
                <span style={{ fontSize: 11, color: '#6B7280' }}>{d.value} ({d.percent})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Projects Progress</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={LINE_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="InProgress" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }} name="In Progress" />
                <Line type="monotone" dataKey="Completed"  stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} name="Completed" />
                <Line type="monotone" dataKey="Overdue"    stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444', stroke: '#fff', strokeWidth: 2 }} name="Overdue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Projects */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#111827' }}>Top 5 Projects by Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {TOP_PROJECTS.map((p, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{p.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{p.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: '#E5E7EB', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: loaded ? `${p.pct}%` : '0%', background: '#2563EB', borderRadius: 999, transition: 'width 900ms ease' }} />
                </div>
              </div>
            ))}
          </div>
          <button style={{ marginTop: 16, fontSize: 12, color: '#2563EB', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>Recent Projects</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['Project Name','Project Manager','Start Date','End Date','Progress','Status','Priority','Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT.map((r, i) => {
                const av = AVATAR[i % AVATAR.length];
                return (
                  <tr key={i} style={{ height: 52, borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.name}</td>
                    <td style={{ padding: '0 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: av.bg, color: av.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{r.manager.split(' ').map(x=>x[0]).join('')}</div>
                        <span style={{ fontSize: 13, color: '#374151' }}>{r.manager}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>{r.start}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>{r.end}</td>
                    <td style={{ padding: '0 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 5, borderRadius: 999, background: '#E5E7EB', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: loaded ? `${r.pct}%` : '0%', background: '#2563EB', borderRadius: 999, transition: 'width 900ms ease' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{r.pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '0 16px' }}>{pill(r.status, STATUS_S)}</td>
                    <td style={{ padding: '0 16px' }}>{pill(r.priority, PRIORITY_S)}</td>
                    <td style={{ padding: '0 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ width: 26, height: 26, borderRadius: 5, border: 'none', background: 'transparent', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e=>e.currentTarget.style.background='#EFF6FF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Edit2 size={12} /></button>
                        <button style={{ width: 26, height: 26, borderRadius: 5, border: 'none', background: 'transparent', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e=>e.currentTarget.style.background='#EFF6FF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Link2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Showing 1 to 5 of 26 entries</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[null,1,2,3,4,5,null].map((pg,i)=>{
              if(pg===null){ const isL=i===0; return <button key={i} style={{ width:28,height:28,borderRadius:5,border:'1px solid #E5E7EB',background:'#fff',color:'#6B7280',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{isL?<ChevronLeft size={12}/>:<ChevronRight size={12}/>}</button>; }
              const active=pg===1; return <button key={i} style={{ width:28,height:28,borderRadius:5,border:active?'none':'1px solid #E5E7EB',background:active?'#2563EB':'#fff',color:active?'#fff':'#374151',fontWeight:active?600:500,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{pg}</button>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
