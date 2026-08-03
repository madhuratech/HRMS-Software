import React, { useState, useEffect } from 'react';
import { Download, Calendar, ChevronDown, FolderKanban, UserCheck, Clock, UserX, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const PRIMARY = '#2563EB';

const PROJ_STATUS_PIE = [
  { name: 'In Progress', value: 16, percent: '66.67%', color: '#2563EB' },
  { name: 'Completed', value: 4, percent: '16.67%', color: '#10B981' },
  { name: 'On Hold', value: 2, percent: '8.33%', color: '#F59E0B' },
  { name: 'Overdue', value: 2, percent: '8.33%', color: '#EF4444' },
];

const TOP_PROJECTS_PROGRESS = [
  { name: 'HRM Software', pct: 75, status: 'In Progress' },
  { name: 'Mobile App Development', pct: 60, status: 'In Progress' },
  { name: 'Website Redesign', pct: 45, status: 'In Progress' },
  { name: 'CRM Integration', pct: 30, status: 'In Progress' },
  { name: 'API Development', pct: 20, status: 'On Hold' },
];

const PROJ_DEPT_BAR = [
  { dept: 'Engineering', count: 12 },
  { dept: 'Sales & Marketing', count: 5 },
  { dept: 'Finance', count: 3 },
  { dept: 'Operations', count: 2 },
  { dept: 'IT', count: 2 },
];

const KpiCard = ({ label, value, iconBg, iconColor, icon: Icon }) => (
  <div style={{
    background: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB',
    boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: '16px 20px', flex: '1 1 0', minWidth: 130,
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7280' }}>{label}</span>
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
    </div>
  </div>
);

export function ProjectReports() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header & Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Project Reports</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Track project progress and performance</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px',
            background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer',
          }}>
            <Calendar size={14} color="#6B7280" /> May 1 – May 31, 2024 <ChevronDown size={14} color="#6B7280" />
          </button>

          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none', height: 38,
              paddingLeft: 14, paddingRight: 32, background: '#FFF',
              border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none',
            }}>
              <option>All Projects</option>
              <option>HRM Software</option>
            </select>
            <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px',
            background: '#FFF', border: '1px solid #2563EB', color: '#2563EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards (6 Cards) */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <KpiCard label="Total Projects" value="24" iconBg="#DBEAFE" iconColor="#2563EB" icon={FolderKanban} />
        <KpiCard label="In Progress" value="16" iconBg="#DBEAFE" iconColor="#2563EB" icon={FolderKanban} />
        <KpiCard label="Completed" value="4" iconBg="#DCFCE7" iconColor="#16A34A" icon={UserCheck} />
        <KpiCard label="On Hold" value="2" iconBg="#FEF3C7" iconColor="#D97706" icon={Clock} />
        <KpiCard label="Overdue" value="2" iconBg="#FEE2E2" iconColor="#DC2626" icon={UserX} />
        <KpiCard label="Avg. Progress" value="65%" iconBg="#E0F2FE" iconColor="#0284C7" icon={Award} />
      </div>

      {/* Analytics Grid: Projects by Status + Top Projects Progress + Projects by Department */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 20 }}>
        
        {/* Projects by Status Donut */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Projects by Status</h3>
          <div style={{ width: '100%', height: 160, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PROJ_STATUS_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" stroke="none">
                  {PROJ_STATUS_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>24</span>
              <span style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Total</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {PROJ_STATUS_PIE.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} /> {item.name}
                </span>
                <span style={{ fontWeight: 500, color: '#6B7280' }}>{item.value} ({item.percent})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Projects by Progress */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Top Projects by Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {TOP_PROJECTS_PROGRESS.map((p, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{p.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{p.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: '#E5E7EB', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: loaded ? `${p.pct}%` : '0%', background: PRIMARY, borderRadius: 999, transition: 'width 900ms ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects by Department Horizontal Bar */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Projects by Department</h3>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PROJ_DEPT_BAR} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 15]} ticks={[0, 5, 10, 15]} tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis dataKey="dept" type="category" tick={{ fill: '#374151', fontSize: 11 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" fill={PRIMARY} barSize={12} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

export default ProjectReports;
