import React from 'react';
import { Plus, Edit2, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const MEMBERS = [
  { name:'Rahul Sharma', initials:'RS', role:'Project Manager',  dept:'Development', projects:4, tasks:12, status:'Active'   },
  { name:'Priya Patel',  initials:'PP', role:'Developer',        dept:'Development', projects:2, tasks:8,  status:'Active'   },
  { name:'Amit Kumar',   initials:'AK', role:'UI/UX Designer',   dept:'Design',      projects:2, tasks:10, status:'Active'   },
  { name:'Sneha Kapoor', initials:'SK', role:'QA Engineer',      dept:'QA',          projects:2, tasks:6,  status:'Active'   },
  { name:'Vikram Singh', initials:'VS', role:'Developer',        dept:'Development', projects:3, tasks:14, status:'Active'   },
];

const DEPT_PIE = [
  { name:'Development', value:12, color:'#2563EB' },
  { name:'Design',      value:4,  color:'#10B981' },
  { name:'QA',          value:3,  color:'#F59E0B' },
  { name:'Management',  value:3,  color:'#EF4444' },
  { name:'HR',          value:2,  color:'#8B5CF6' },
];

const ACTIVITY = [
  { text:'Rahul Sharma updated project HRM Software', time:'30 May 2024, 10:37 AM', color:'#2563EB', icon:'📋' },
  { text:'Priya Patel completed task: API Integration', time:'30 May 2024, 10:15 AM', color:'#10B981', icon:'✓'  },
  { text:'Amit Kumar added a new milestone: Testing Phase', time:'29 May 2024, 04:44 PM', color:'#F59E0B', icon:'🎯' },
  { text:'Sneha Kapoor commented on task UI Improvements', time:'29 May 2024, 04:30 PM', color:'#8B5CF6', icon:'💬' },
  { text:'Vikram Singh logged 7h in HRM Software', time:'29 May 2024, 08:13 AM', color:'#EF4444', icon:'⏱' },
];

const STATUS_S = { Active:{ bg:'#DCFCE7', color:'#15803D' }, 'On Leave':{ bg:'#FEF3C7', color:'#D97706' } };
const AVATAR   = [{ bg:'#DBEAFE', c:'#1D4ED8' },{ bg:'#FCE7F3', c:'#9D174D' },{ bg:'#D1FAE5', c:'#065F46' },{ bg:'#FEF3C7', c:'#92400E' },{ bg:'#EDE9FE', c:'#5B21B6' }];
const KpiCard = ({ label, value, iconBg, iconColor, icon }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', padding:'16px 20px', flex:'1 1 0', minWidth:110 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}><span style={{ width:30, height:30, borderRadius:8, background:iconBg, color:iconColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>{icon}</span><span style={{ fontSize:12, fontWeight:500, color:'#6B7280' }}>{label}</span></div>
    <div style={{ fontSize:26, fontWeight:700, color:'#111827' }}>{value}</div>
  </div>
);

export default function TeamMembers() {
  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", width:'100%', boxSizing:'border-box' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#111827' }}>Team Members</h1><p style={{ margin:'4px 0 0', fontSize:13, color:'#6B7280' }}>Project team and their roles</p></div>
        <button style={{ height:38, padding:'0 16px', background:'#2563EB', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Plus size={14}/> Add Member</button>
      </div>

      <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
        <KpiCard label="Total Members"  value={24} iconBg="#DBEAFE" iconColor="#2563EB" icon="👥" />
        <KpiCard label="Active Members" value={20} iconBg="#DCFCE7" iconColor="#16A34A" icon="✓"  />
        <KpiCard label="On Leave"       value={2}  iconBg="#FEF3C7" iconColor="#D97706" icon="🏖" />
        <KpiCard label="Available"      value={2}  iconBg="#F3F4F6" iconColor="#6B7280" icon="⏸" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        {/* Table */}
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #E5E7EB' }}>
                  {['Employee','Role','Department','Assigned Projects','Open Tasks','Status','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:500, color:'#6B7280', whiteSpace:'nowrap', background:'#FAFAFA' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEMBERS.map((m, i) => {
                  const av = AVATAR[i % AVATAR.length];
                  const s = STATUS_S[m.status];
                  return (
                    <tr key={i} style={{ height:56, borderBottom:'1px solid #F3F4F6' }}>
                      <td style={{ padding:'0 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:30, height:30, borderRadius:'50%', background:av.bg, color:av.c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0 }}>{m.initials}</div>
                          <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{m.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:'0 16px', fontSize:13, color:'#374151' }}>{m.role}</td>
                      <td style={{ padding:'0 16px', fontSize:13, color:'#374151' }}>{m.dept}</td>
                      <td style={{ padding:'0 16px', fontSize:13, fontWeight:600, color:'#111827', textAlign:'center' }}>{m.projects}</td>
                      <td style={{ padding:'0 16px', fontSize:13, fontWeight:600, color:'#111827', textAlign:'center' }}>{m.tasks}</td>
                      <td style={{ padding:'0 16px' }}><span style={{ display:'inline-block', padding:'3px 10px', borderRadius:999, background:s.bg, color:s.color, fontSize:11, fontWeight:600 }}>{m.status}</span></td>
                      <td style={{ padding:'0 16px' }}>
                        <div style={{ display:'flex', gap:4 }}>
                          <button style={{ width:26,height:26,borderRadius:5,border:'none',background:'transparent',color:'#2563EB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='#EFF6FF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Edit2 size={12}/></button>
                          <button style={{ width:26,height:26,borderRadius:5,border:'none',background:'transparent',color:'#2563EB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='#EFF6FF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Link2 size={12}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding:'12px 20px', borderTop:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, color:'#6B7280' }}>Showing 1 to 5 of 24 entries</span>
            <div style={{ display:'flex', gap:4 }}>
              {[null,1,2,3,4,5,null].map((pg,i) => {
                if(pg===null){ const isL=i===0; return <button key={i} style={{ width:28,height:28,borderRadius:5,border:'1px solid #E5E7EB',background:'#fff',color:'#6B7280',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{isL?<ChevronLeft size={12}/>:<ChevronRight size={12}/>}</button>; }
                const a=pg===1; return <button key={i} style={{ width:28,height:28,borderRadius:5,border:a?'none':'1px solid #E5E7EB',background:a?'#2563EB':'#fff',color:a?'#fff':'#374151',fontWeight:a?600:500,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{pg}</button>;
              })}
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Department Donut */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', padding:20 }}>
            <h3 style={{ margin:'0 0 12px', fontSize:14, fontWeight:600, color:'#111827' }}>Department Distribution</h3>
            <div style={{ height:140, position:'relative' }}>
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={DEPT_PIE} cx="50%" cy="50%" innerRadius={44} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">{DEPT_PIE.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{ borderRadius:8, border:'none' }}/></PieChart></ResponsiveContainer>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:7, marginTop:8 }}>
              {DEPT_PIE.map((d,i) => <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}><div style={{ display:'flex', alignItems:'center', gap:7 }}><span style={{ width:8,height:8,borderRadius:'50%',background:d.color }}/><span style={{ fontSize:12, color:'#374151' }}>{d.name}</span></div><span style={{ fontSize:12, fontWeight:600, color:'#111827' }}>{d.value}</span></div>)}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <h3 style={{ margin:0, fontSize:14, fontWeight:600, color:'#111827' }}>Recent Activity</h3>
              <button style={{ fontSize:12, color:'#2563EB', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>View All</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{ display:'flex', gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background: a.color + '20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0, marginTop:1 }}>{a.icon}</div>
                  <div>
                    <div style={{ fontSize:12, color:'#111827', lineHeight:1.4 }}>{a.text}</div>
                    <div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
