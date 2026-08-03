import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const MILESTONES = [
  { name:'Requirement Gathering', project:'HRM Software',      due:'10 May 2024', status:'Completed',   pct:100, owner:'Rahul Sharma'  },
  { name:'Design Phase',          project:'Website Redesign',  due:'15 May 2024', status:'Completed',   pct:100, owner:'Priya Patel'   },
  { name:'Development Phase 1',   project:'HRM Software',      due:'30 May 2024', status:'In Progress', pct:65,  owner:'Amit Kumar'    },
  { name:'Development Phase 2',   project:'HRM Software',      due:'30 May 2024', status:'In Progress', pct:30,  owner:'Sneha Kapoor' },
  { name:'Testing Phase',         project:'Mobile App',        due:'15 Jun 2024', status:'In Progress', pct:20,  owner:'Vikram Singh'  },
  { name:'Final Deployment',      project:'HRM Software',      due:'30 Aug 2024', status:'Upcoming',    pct:0,   owner:'Rahul Sharma'  },
];

const UPCOMING = [
  { name:'Development Phase 1', date:'15 Jun 2024', project:'HRM Software'     },
  { name:'User Acceptance Testing', date:'25 Jun 2024', project:'HRM Software' },
  { name:'Final Deployment',    date:'30 Aug 2024', project:'HRM Software'     },
];

const PIE_DATA = [
  { name:'Completed',   value:5,  percent:'35.4%', color:'#10B981' },
  { name:'In Progress', value:6,  percent:'44%',   color:'#2563EB' },
  { name:'Delayed',     value:3,  percent:'20.6%', color:'#EF4444' },
];

const STATUS_S = { 'Completed':{ bg:'#DCFCE7', color:'#15803D' }, 'In Progress':{ bg:'#DBEAFE', color:'#1D4ED8' }, 'Delayed':{ bg:'#FEE2E2', color:'#DC2626' }, 'Upcoming':{ bg:'#F3F4F6', color:'#6B7280' } };
const KpiCard = ({ label, value, iconBg, iconColor, icon }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', padding:'16px 20px', flex:'1 1 0', minWidth:110 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}><span style={{ width:30, height:30, borderRadius:8, background:iconBg, color:iconColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>{icon}</span><span style={{ fontSize:12, fontWeight:500, color:'#6B7280' }}>{label}</span></div>
    <div style={{ fontSize:26, fontWeight:700, color:'#111827' }}>{value}</div>
  </div>
);

export default function Milestones() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", width:'100%', boxSizing:'border-box' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#111827' }}>Milestones</h1><p style={{ margin:'4px 0 0', fontSize:13, color:'#6B7280' }}>Track project milestones</p></div>
        <button style={{ height:38, padding:'0 16px', background:'#2563EB', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Plus size={14}/> Add Milestone</button>
      </div>

      <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
        <KpiCard label="Total Milestones" value={18} iconBg="#DBEAFE" iconColor="#2563EB" icon="🎯" />
        <KpiCard label="Completed"        value={5}  iconBg="#DCFCE7" iconColor="#16A34A" icon="✓"  />
        <KpiCard label="Upcoming"         value={7}  iconBg="#FEF3C7" iconColor="#D97706" icon="📅" />
        <KpiCard label="Delayed"          value={3}  iconBg="#FEE2E2" iconColor="#DC2626" icon="⚠"  />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20 }}>
        {/* Table */}
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #E5E7EB' }}>
                  {['Milestone','Project','Due Date','Progress','Status','Owner','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:500, color:'#6B7280', whiteSpace:'nowrap', background:'#FAFAFA' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MILESTONES.map((m, i) => {
                  const s = STATUS_S[m.status];
                  return (
                    <tr key={i} style={{ height:52, borderBottom:'1px solid #F3F4F6' }}>
                      <td style={{ padding:'0 16px', fontSize:13, fontWeight:600, color:'#111827' }}>{m.name}</td>
                      <td style={{ padding:'0 16px', fontSize:13, color:'#374151' }}>{m.project}</td>
                      <td style={{ padding:'0 16px', fontSize:13, color:'#374151', whiteSpace:'nowrap' }}>{m.due}</td>
                      <td style={{ padding:'0 16px', minWidth:120 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ flex:1, height:5, borderRadius:999, background:'#E5E7EB', overflow:'hidden' }}><div style={{ height:'100%', width:loaded?`${m.pct}%`:'0%', background: m.status==='Completed'?'#10B981': m.status==='Delayed'?'#EF4444':'#2563EB', borderRadius:999, transition:'width 900ms ease' }} /></div>
                          <span style={{ fontSize:11, fontWeight:600, color:'#374151', minWidth:30 }}>{m.pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding:'0 16px' }}><span style={{ display:'inline-block', padding:'3px 10px', borderRadius:999, background:s.bg, color:s.color, fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>{m.status}</span></td>
                      <td style={{ padding:'0 16px', fontSize:13, color:'#374151', whiteSpace:'nowrap' }}>{m.owner}</td>
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
            <span style={{ fontSize:13, color:'#6B7280' }}>Showing 1 to 6 of 18 entries</span>
            <div style={{ display:'flex', gap:4 }}>
              {[null,1,2,3,null].map((pg,i) => {
                if(pg===null){ const isL=i===0; return <button key={i} style={{ width:28,height:28,borderRadius:5,border:'1px solid #E5E7EB',background:'#fff',color:'#6B7280',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{isL?<ChevronLeft size={12}/>:<ChevronRight size={12}/>}</button>; }
                const a=pg===1; return <button key={i} style={{ width:28,height:28,borderRadius:5,border:a?'none':'1px solid #E5E7EB',background:a?'#2563EB':'#fff',color:a?'#fff':'#374151',fontWeight:a?600:500,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{pg}</button>;
              })}
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Donut */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', padding:20 }}>
            <h3 style={{ margin:'0 0 12px', fontSize:14, fontWeight:600, color:'#111827' }}>Milestone Progress</h3>
            <div style={{ height:140, position:'relative' }}>
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={46} outerRadius={62} paddingAngle={2} dataKey="value" stroke="none">{PIE_DATA.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{ borderRadius:8, border:'none', boxShadow:'0 4px 12px rgba(0,0,0,.1)' }}/></PieChart></ResponsiveContainer>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8 }}>
              {PIE_DATA.map((d,i) => <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}><div style={{ display:'flex', alignItems:'center', gap:7 }}><span style={{ width:8,height:8,borderRadius:'50%',background:d.color }}/><span style={{ fontSize:12, color:'#374151' }}>{d.name}</span></div><span style={{ fontSize:12, color:'#6B7280' }}>{d.value} ({d.percent})</span></div>)}
            </div>
          </div>

          {/* Upcoming */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', padding:20 }}>
            <h3 style={{ margin:'0 0 14px', fontSize:14, fontWeight:600, color:'#111827' }}>Upcoming Milestones</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {UPCOMING.map((u, i) => (
                <div key={i} style={{ display:'flex', gap:12, paddingBottom: i<UPCOMING.length-1?16:0, marginBottom: i<UPCOMING.length-1?16:0, borderBottom: i<UPCOMING.length-1?'1px solid #F3F4F6':'' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:'#2563EB', flexShrink:0, marginTop:3 }} />
                    {i<UPCOMING.length-1 && <div style={{ width:2, flex:1, background:'#E5E7EB', marginTop:4 }} />}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{u.name}</div>
                    <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>{u.project}</div>
                    <div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>{u.date}</div>
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
