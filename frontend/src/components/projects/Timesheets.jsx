import React from 'react';
import { Plus, Edit2, Link2, ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';

const ROWS = [
  { emp:'Rahul Sharma',  initials:'RS', project:'HRM Software',      date:'25 May 2024', hours:8, billable:true,  status:'Approved'  },
  { emp:'Priya Patel',   initials:'PP', project:'Mobile App',        date:'25 May 2024', hours:7, billable:true,  status:'Approved'  },
  { emp:'Amit Kumar',    initials:'AK', project:'Website Redesign',  date:'25 May 2024', hours:6, billable:false, status:'Pending'   },
  { emp:'Sneha Kapoor',  initials:'SK', project:'HRM Software',      date:'25 May 2024', hours:5, billable:true,  status:'Approved'  },
  { emp:'Vikram Singh',  initials:'VS', project:'HRM Software',      date:'25 May 2024', hours:7, billable:true,  status:'Approved'  },
];

const STATUS_S = { Approved:{ bg:'#DCFCE7', color:'#15803D' }, Pending:{ bg:'#FEF3C7', color:'#D97706' }, Rejected:{ bg:'#FEE2E2', color:'#DC2626' } };
const AVATAR   = [{ bg:'#DBEAFE', c:'#1D4ED8' },{ bg:'#FCE7F3', c:'#9D174D' },{ bg:'#D1FAE5', c:'#065F46' },{ bg:'#FEF3C7', c:'#92400E' },{ bg:'#EDE9FE', c:'#5B21B6' }];
const Sel = ({ children }) => <div style={{ position:'relative' }}><select style={{ appearance:'none', WebkitAppearance:'none', height:38, paddingLeft:12, paddingRight:28, background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, color:'#374151', cursor:'pointer', outline:'none' }}>{children}</select><ChevronDown size={13} color="#9CA3AF" style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} /></div>;
const KpiCard = ({ label, value, unit, iconBg, iconColor, icon, up }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', padding:'16px 20px', flex:'1 1 0', minWidth:120 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}><span style={{ width:30, height:30, borderRadius:8, background:iconBg, color:iconColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>{icon}</span><span style={{ fontSize:12, fontWeight:500, color:'#6B7280' }}>{label}</span></div>
    <div style={{ display:'flex', alignItems:'baseline', gap:4 }}><span style={{ fontSize:26, fontWeight:700, color:'#111827' }}>{value}</span><span style={{ fontSize:12, color:'#6B7280' }}>{unit}</span></div>
    <div style={{ marginTop:4, fontSize:11, color: up ? '#10B981' : '#EF4444', fontWeight:600 }}>{up ? '↑' : '↓'} vs last period</div>
  </div>
);

export default function Timesheets() {
  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", width:'100%', boxSizing:'border-box' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#111827' }}>Timesheets</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#6B7280' }}>Track time logged by team members</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <button style={{ display:'flex', alignItems:'center', gap:6, height:38, padding:'0 14px', background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, color:'#374151', cursor:'pointer' }}><Calendar size={14}/> May 1 - May 31, 2024</button>
          <Sel><option>All Employees</option></Sel>
          <Sel><option>All Projects</option></Sel>
          <button style={{ height:38, padding:'0 16px', background:'#2563EB', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Plus size={14}/> Log Time</button>
        </div>
      </div>

      <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
        <KpiCard label="Total Hours"       value={456} unit="h" iconBg="#DBEAFE" iconColor="#2563EB" icon="⏱" up />
        <KpiCard label="Billable Hours"    value={320} unit="h" iconBg="#DCFCE7" iconColor="#16A34A" icon="💰" up />
        <KpiCard label="Non-Billable Hrs"  value={136} unit="h" iconBg="#FEF3C7" iconColor="#D97706" icon="📋" up={false} />
        <KpiCard label="Pending Approval"  value={24}  unit="h" iconBg="#FEE2E2" iconColor="#DC2626" icon="⚠" up={false} />
      </div>

      <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #E5E7EB' }}>
                {['Employee','Project','Date','Hours','Billable','Approval Status','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:500, color:'#6B7280', whiteSpace:'nowrap', background:'#FAFAFA' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => {
                const av = AVATAR[i % AVATAR.length];
                return (
                  <tr key={i} style={{ height:54, borderBottom:'1px solid #F3F4F6' }}>
                    <td style={{ padding:'0 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:av.bg, color:av.c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, flexShrink:0 }}>{r.initials}</div>
                        <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{r.emp}</span>
                      </div>
                    </td>
                    <td style={{ padding:'0 16px', fontSize:13, color:'#374151' }}>{r.project}</td>
                    <td style={{ padding:'0 16px', fontSize:13, color:'#374151' }}>{r.date}</td>
                    <td style={{ padding:'0 16px', fontSize:13, fontWeight:600, color:'#111827' }}>{r.hours}h</td>
                    <td style={{ padding:'0 16px' }}>
                      <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:999, background: r.billable?'#DCFCE7':'#F3F4F6', color: r.billable?'#15803D':'#6B7280', fontSize:11, fontWeight:600 }}>{r.billable ? 'Billable' : 'Non-Billable'}</span>
                    </td>
                    <td style={{ padding:'0 16px' }}>
                      <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:999, background:STATUS_S[r.status].bg, color:STATUS_S[r.status].color, fontSize:11, fontWeight:600 }}>{r.status}</span>
                    </td>
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
          <span style={{ fontSize:13, color:'#6B7280' }}>Showing 1 to 5 of 90 entries</span>
          <div style={{ display:'flex', gap:4 }}>
            {[null,1,2,3,4,5,'...',12,null].map((pg,i) => {
              if(pg===null){ const isL=i===0; return <button key={i} style={{ width:28,height:28,borderRadius:5,border:'1px solid #E5E7EB',background:'#fff',color:'#6B7280',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{isL?<ChevronLeft size={12}/>:<ChevronRight size={12}/>}</button>; }
              if(pg==='...') return <span key={i} style={{ width:28,textAlign:'center',color:'#6B7280',fontSize:13,lineHeight:'28px' }}>...</span>;
              const a=pg===1; return <button key={i} style={{ width:28,height:28,borderRadius:5,border:a?'none':'1px solid #E5E7EB',background:a?'#2563EB':'#fff',color:a?'#fff':'#374151',fontWeight:a?600:500,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{pg}</button>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
