import React from 'react';
import { Download, Calendar, ChevronDown, Briefcase, Users, UserCheck, Clock, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const PRIMARY = '#2563EB';

const SOURCE_PIE = [
  { name: 'Job Portal', value: 96, percent: '37.50%', color: '#2563EB' },
  { name: 'Employee Referral', value: 64, percent: '25.00%', color: '#60A5FA' },
  { name: 'Company Website', value: 48, percent: '18.75%', color: '#38BDF8' },
  { name: 'LinkedIn', value: 32, percent: '12.50%', color: '#818CF8' },
  { name: 'Others', value: 16, percent: '6.25%', color: '#9CA3AF' },
];

const HIRING_FUNNEL = [
  { stage: 'Applications', count: 256, pct: '100%' },
  { stage: 'Screening', count: 120, pct: '46.88%' },
  { stage: 'Interviews', count: 68, pct: '26.56%' },
  { stage: 'Offers', count: 18, pct: '7.03%' },
  { stage: 'Hired', count: 16, pct: '6.25%' },
];

const DEPT_HIRING = [
  { dept: 'Engineering', count: 6 },
  { dept: 'Sales & Marketing', count: 3 },
  { dept: 'Finance', count: 2 },
  { dept: 'Operations', count: 2 },
  { dept: 'IT', count: 1 },
  { dept: 'Human Resources', count: 0 },
  { dept: 'Support', count: 0 },
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

export function RecruitmentReports() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header & Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Recruitment Reports</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Track recruitment and hiring metrics</p>
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
              <option>All Departments</option>
              <option>Engineering</option>
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
        <KpiCard label="Total Openings" value="28" iconBg="#DBEAFE" iconColor="#2563EB" icon={Briefcase} />
        <KpiCard label="Applications" value="256" iconBg="#DBEAFE" iconColor="#2563EB" icon={Users} />
        <KpiCard label="Interviews Conducted" value="68" iconBg="#DBEAFE" iconColor="#2563EB" icon={Users} />
        <KpiCard label="Offers Made" value="18" iconBg="#DBEAFE" iconColor="#2563EB" icon={Award} />
        <KpiCard label="Hired" value="16" iconBg="#DCFCE7" iconColor="#16A34A" icon={UserCheck} />
        <KpiCard label="Time to Hire" value="22 Days" iconBg="#E0F2FE" iconColor="#0284C7" icon={Clock} />
      </div>

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 20 }}>
        
        {/* Applications by Source */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Applications by Source</h3>
          <div style={{ width: '100%', height: 160, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={SOURCE_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" stroke="none">
                  {SOURCE_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>256</span>
              <span style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Total</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {SOURCE_PIE.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} /> {item.name}
                </span>
                <span style={{ fontWeight: 500, color: '#6B7280' }}>{item.value} ({item.percent})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hiring Funnel */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Hiring Funnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginTop: 10 }}>
            {HIRING_FUNNEL.map((f, i) => {
              const widths = ['100%', '80%', '62%', '44%', '28%'];
              const bgColors = ['#2563EB', '#3B82F6', '#0284C7', '#0EA5E9', '#D97706'];
              return (
                <div key={i} style={{
                  width: widths[i], height: 32, background: bgColors[i], borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0 12px', color: '#FFF', fontSize: 11, fontWeight: 600,
                }}>
                  <span>{f.stage}</span>
                  <span>{f.count} ({f.pct})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hiring by Department Horizontal Bar */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Hiring by Department</h3>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_HIRING} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fill: '#6B7280', fontSize: 11 }} />
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

export default RecruitmentReports;
