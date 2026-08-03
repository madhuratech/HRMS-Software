import React from 'react';
import { Plus, Calendar, Filter, Briefcase, Users, CalendarDays, FileCheck, UserCheck, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Label } from 'recharts';

const kpiData = [
  { title: 'Total Openings', value: '24', trend: '10%', isUp: true, icon: <Briefcase size={16} color="#2952E3" />, bgColor: '#EFF6FF', arrowBg: '#EFF6FF', arrowColor: '#2952E3' },
  { title: 'Active Candidates', value: '154', trend: '18%', isUp: true, icon: <Users size={16} color="#10B981" />, bgColor: '#ECFDF5', arrowBg: '#ECFDF5', arrowColor: '#10B981' },
  { title: 'Interviews Scheduled', value: '32', trend: '48%', isUp: true, icon: <CalendarDays size={16} color="#8B5CF6" />, bgColor: '#F5F3FF', arrowBg: '#F5F3FF', arrowColor: '#8B5CF6' },
  { title: 'Offers Extended', value: '12', trend: '18%', isUp: true, icon: <FileCheck size={16} color="#10B981" />, bgColor: '#ECFDF5', arrowBg: '#ECFDF5', arrowColor: '#10B981' },
  { title: 'Hires This Month', value: '8', trend: '114%', isUp: true, icon: <UserCheck size={16} color="#EF4444" />, bgColor: '#FEF2F2', arrowBg: '#FEF2F2', arrowColor: '#EF4444' },
];

const lineData = [
  { date: 'May 1', Applications: 20, Shortlisted: 5 },
  { date: 'May 8', Applications: 45, Shortlisted: 15 },
  { date: 'May 15', Applications: 30, Shortlisted: 10 },
  { date: 'May 22', Applications: 60, Shortlisted: 25 },
  { date: 'May 31', Applications: 80, Shortlisted: 30 },
];

const pieData = [
  { name: 'Applied', value: 84, color: '#3B82F6' },
  { name: 'Screening', value: 32, color: '#A855F7' },
  { name: 'Interview', value: 22, color: '#8B5CF6' },
  { name: 'Offered', value: 12, color: '#D946EF' },
  { name: 'Rejected', value: 4, color: '#E879F9' },
];

const topJobs = [
  { title: 'Senior React Developer', apps: 38 },
  { title: 'HR Executive', apps: 22 },
  { title: 'UI/UX Designer', apps: 18 },
  { title: 'Business Analyst', apps: 15 },
  { title: 'Backend Developer', apps: 14 },
];

const recentJobs = [
  { id: 1, title: 'Senior React Developer', dept: 'Engineering', location: 'Bangalore', type: 'Full Time', exp: '3-5 Years', apps: 28, status: 'Open' },
  { id: 2, title: 'HR Executive', dept: 'Human Resources', location: 'Mumbai', type: 'Full Time', exp: '1-3 Years', apps: 22, status: 'Open' },
  { id: 3, title: 'UI/UX Designer', dept: 'Design', location: 'Bangalore', type: 'Full Time', exp: '2-4 Years', apps: 16, status: 'Open' },
  { id: 4, title: 'Business Analyst', dept: 'Business', location: 'Hyderabad', type: 'Full Time', exp: '2-5 Years', apps: 15, status: 'Open' },
  { id: 5, title: 'Backend Developer', dept: 'Engineering', location: 'Pune', type: 'Full Time', exp: '3-5 Years', apps: 14, status: 'Open' },
];

// Funnel Mock Data
const funnelData = [
  { stage: 'Applications', value: 154, color: '#3B82F6' },
  { stage: 'Screening', value: 96, color: '#6366F1' },
  { stage: 'Interview', value: 32, color: '#8B5CF6' },
  { stage: 'Offered', value: 12, color: '#A855F7' },
  { stage: 'Hired', value: 6, color: '#D946EF' },
];

export default function RecruitmentDashboard() {
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #F1F5F9',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif', background: '#F8FAFC', paddingBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Recruitment Dashboard</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Overview of recruitment activities and key metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
            <Calendar size={14} /> May 1 - May 31, 2024
          </button>
          <button style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#3B82F6', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
            <Plus size={14} /> Create Job Opening
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
        {kpiData.map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: kpi.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {kpi.icon}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>{kpi.title}</div>
            </div>
            <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700', marginLeft: '44px', lineHeight: '1' }}>{kpi.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '44px', fontSize: '12px', color: '#94A3B8' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: kpi.arrowBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.arrowColor }}>
                {kpi.isUp ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />}
              </div>
              <span style={{ color: kpi.arrowColor, fontWeight: '600' }}>{kpi.trend}</span> vs last month
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr', gap: '24px' }}>
        
        {/* Applications Over Time Area Chart */}
        <div style={{ ...cardStyle, padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Applications Over Time</h3>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorShort" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} verticalAlign="top" align="center" height={36} />
                <Area type="monotone" dataKey="Applications" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                <Area type="monotone" dataKey="Shortlisted" stroke="#A855F7" strokeWidth={2} fillOpacity={1} fill="url(#colorShort)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applications by Status Donut */}
        <div style={{ ...cardStyle, padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Applications by Status</h3>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '150px', height: '150px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={55} outerRadius={70} paddingAngle={0} dataKey="value" cx="50%" cy="50%" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <Label value="154" position="center" fill="#1E293B" style={{ fontSize: '24px', fontWeight: '700' }} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '62%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '11px', color: '#64748B' }}>Total</div>
            </div>
            
            {/* Custom Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginLeft: '20px' }}>
              {pieData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '500' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }}></div>
                    {item.name}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ fontWeight: '600', color: '#1E293B' }}>{item.value}</span>
                    <span style={{ color: '#94A3B8' }}>({((item.value/154)*100).toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Job Openings */}
        <div style={{ ...cardStyle, padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Top Job Openings</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', fontWeight: '600', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
            <span>Position</span>
            <span>Applications</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', flex: 1 }}>
            {topJobs.map((job, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#334155', fontWeight: '500' }}>{job.title}</span>
                <span style={{ color: '#1E293B', fontWeight: '600' }}>{job.apps}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', textAlign: 'right' }}>
            <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View All</button>
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Recent Job Openings Table */}
        <div style={{ ...cardStyle, padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Recent Job Openings</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 0', fontSize: '11px', fontWeight: '600', color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }}>Job Title</th>
                  <th style={{ padding: '8px 0', fontSize: '11px', fontWeight: '600', color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }}>Department</th>
                  <th style={{ padding: '8px 0', fontSize: '11px', fontWeight: '600', color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }}>Location</th>
                  <th style={{ padding: '8px 0', fontSize: '11px', fontWeight: '600', color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }}>Type</th>
                  <th style={{ padding: '8px 0', fontSize: '11px', fontWeight: '600', color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }}>Experience</th>
                  <th style={{ padding: '8px 0', fontSize: '11px', fontWeight: '600', color: '#94A3B8', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Applications</th>
                  <th style={{ padding: '8px 0', fontSize: '11px', fontWeight: '600', color: '#94A3B8', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '8px 0', fontSize: '11px', fontWeight: '600', color: '#94A3B8', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((row, index) => (
                  <tr key={row.id}>
                    <td style={{ padding: '12px 0', fontSize: '12px', fontWeight: '500', color: '#334155', borderBottom: index !== recentJobs.length - 1 ? '1px solid #F8FAFC' : 'none' }}>{row.title}</td>
                    <td style={{ padding: '12px 0', fontSize: '12px', color: '#475569', borderBottom: index !== recentJobs.length - 1 ? '1px solid #F8FAFC' : 'none' }}>{row.dept}</td>
                    <td style={{ padding: '12px 0', fontSize: '12px', color: '#475569', borderBottom: index !== recentJobs.length - 1 ? '1px solid #F8FAFC' : 'none' }}>{row.location}</td>
                    <td style={{ padding: '12px 0', fontSize: '12px', color: '#475569', borderBottom: index !== recentJobs.length - 1 ? '1px solid #F8FAFC' : 'none' }}>{row.type}</td>
                    <td style={{ padding: '12px 0', fontSize: '12px', color: '#475569', borderBottom: index !== recentJobs.length - 1 ? '1px solid #F8FAFC' : 'none' }}>{row.exp}</td>
                    <td style={{ padding: '12px 0', fontSize: '12px', fontWeight: '600', color: '#1E293B', textAlign: 'center', borderBottom: index !== recentJobs.length - 1 ? '1px solid #F8FAFC' : 'none' }}>{row.apps}</td>
                    <td style={{ padding: '12px 0', textAlign: 'center', borderBottom: index !== recentJobs.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', backgroundColor: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0' }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', textAlign: 'center', borderBottom: index !== recentJobs.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><MoreHorizontal size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '16px' }}>
            <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>View All Openings</button>
          </div>
        </div>

        {/* Funnel Widget Row */}
        <div style={{ ...cardStyle, padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Recruitment Funnel</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            
            {/* SVG Funnel */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <svg width="140" height="180" viewBox="0 0 140 180">
                <polygon points="0,0 140,0 115,40 25,40" fill="#3B82F6" />
                <polygon points="26,42 114,42 98,82 42,82" fill="#6366F1" opacity="0.9" />
                <polygon points="43,84 97,84 84,124 56,124" fill="#8B5CF6" opacity="0.8" />
                <polygon points="57,126 83,126 73,166 67,166" fill="#A855F7" opacity="0.7" />
                <polygon points="68,168 72,168 70,180 70,180" fill="#D946EF" opacity="0.6" />
              </svg>
            </div>

            {/* Funnel Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginLeft: '16px', flex: 1 }}>
              {funnelData.map((stage, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '500' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: stage.color }}></div>
                    {stage.stage}
                  </div>
                  <div style={{ fontWeight: '600', color: '#1E293B' }}>{stage.value}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
