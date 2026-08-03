import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Link2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const PROJECTS = [
  { name:'HRM Software',        code:'PRJ-001', manager:'Rahul Sharma',  dept:'Development', start:'01 May 2024', end:'30 Aug 2024', pct:75, status:'In Progress', priority:'High'   },
  { name:'Mobile App Development', code:'PRJ-002', manager:'Priya Patel',   dept:'Development', start:'10 May 2024', end:'10 Sep 2024', pct:60, status:'In Progress', priority:'High'   },
  { name:'Website Redesign',    code:'PRJ-003', manager:'Amit Kumar',    dept:'Design',      start:'12 Apr 2024', end:'15 Jun 2024', pct:45, status:'In Progress', priority:'Medium' },
  { name:'CRM Integration',     code:'PRJ-004', manager:'Sneha Kapoor', dept:'Marketing',   start:'20 May 2024', end:'20 Jul 2024', pct:30, status:'In Progress', priority:'Medium' },
  { name:'API Development',     code:'PRJ-005', manager:'Vikram Singh',  dept:'Development', start:'25 May 2024', end:'25 Aug 2024', pct:20, status:'On Hold',     priority:'Low'    },
  { name:'Employee Portal',     code:'PRJ-006', manager:'Karen Mehta',   dept:'HR',          start:'01 May 2024', end:'01 Sep 2024', pct:10, status:'On Hold',     priority:'Low'    },
  { name:'Data Migration',      code:'PRJ-007', manager:'Arjun Desai',   dept:'IT',          start:'10 Jun 2024', end:'10 Aug 2024', pct:5,  status:'Overdue',     priority:'High'   },
  { name:'Performance Module',  code:'PRJ-008', manager:'Rahul Verma',   dept:'Development', start:'05 Apr 2024', end:'05 Aug 2024', pct:100,status:'Completed',   priority:'High'   },
];

const STATUS_S   = { 'In Progress':{ bg:'#DBEAFE', color:'#1D4ED8' }, 'Completed':{ bg:'#DCFCE7', color:'#15803D' }, 'On Hold':{ bg:'#FEF3C7', color:'#D97706' }, 'Overdue':{ bg:'#FEE2E2', color:'#DC2626' } };
const PRIORITY_S = { 'High':{ bg:'#FEE2E2', color:'#DC2626' }, 'Medium':{ bg:'#FEF3C7', color:'#D97706' }, 'Low':{ bg:'#DCFCE7', color:'#15803D' } };
const AVATAR     = [{ bg:'#DBEAFE', c:'#1D4ED8' },{ bg:'#FCE7F3', c:'#9D174D' },{ bg:'#D1FAE5', c:'#065F46' },{ bg:'#FEF3C7', c:'#92400E' },{ bg:'#EDE9FE', c:'#5B21B6' },{ bg:'#FEE2E2', c:'#991B1B' },{ bg:'#E0E7FF', c:'#3730A3' },{ bg:'#FECACA', c:'#7F1D1D' }];

const pill = (label, map) => { const s = map[label] || { bg:'#F3F4F6', color:'#6B7280' }; return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:999, background:s.bg, color:s.color, fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>{label}</span>; };

const Sel = ({ children }) => (
  <div style={{ position:'relative' }}>
    <select style={{ appearance:'none', WebkitAppearance:'none', height:38, paddingLeft:12, paddingRight:30, background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, color:'#374151', cursor:'pointer', outline:'none' }}>{children}</select>
    <ChevronDown size={13} color="#9CA3AF" style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
  </div>
);

export default function Projects() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", width:'100%', boxSizing:'border-box' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#111827' }}>Projects</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#6B7280' }}>Manage and track all projects</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <Sel><option>All Status</option><option>In Progress</option><option>Completed</option></Sel>
          <Sel><option>All Departments</option><option>Development</option><option>Design</option></Sel>
          <div style={{ position:'relative' }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', pointerEvents:'none' }} />
            <input placeholder="Search projects..." style={{ height:38, paddingLeft:30, paddingRight:12, border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, outline:'none', background:'#fff', width:180 }} />
          </div>
          <button style={{ height:38, padding:'0 16px', background:'#2563EB', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Plus size={14} /> Add Project</button>
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #E5E7EB' }}>
                {['Project Name','Project Code','Project Manager','Department','Start Date','End Date','Progress','Status','Priority','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:12, fontWeight:500, color:'#6B7280', whiteSpace:'nowrap', background:'#FAFAFA' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROJECTS.map((r, i) => {
                const av = AVATAR[i % AVATAR.length];
                return (
                  <tr key={i} style={{ height:56, borderBottom:'1px solid #F3F4F6' }}>
                    <td style={{ padding:'0 14px', fontSize:13, fontWeight:600, color:'#111827' }}>{r.name}</td>
                    <td style={{ padding:'0 14px', fontSize:12, fontWeight:600, color:'#6B7280', fontFamily:'monospace' }}>{r.code}</td>
                    <td style={{ padding:'0 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:av.bg, color:av.c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, flexShrink:0 }}>{r.manager.split(' ').map(x=>x[0]).join('')}</div>
                        <span style={{ fontSize:13, color:'#374151', whiteSpace:'nowrap' }}>{r.manager}</span>
                      </div>
                    </td>
                    <td style={{ padding:'0 14px', fontSize:13, color:'#374151' }}>{r.dept}</td>
                    <td style={{ padding:'0 14px', fontSize:13, color:'#374151', whiteSpace:'nowrap' }}>{r.start}</td>
                    <td style={{ padding:'0 14px', fontSize:13, color:'#374151', whiteSpace:'nowrap' }}>{r.end}</td>
                    <td style={{ padding:'0 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:100 }}>
                        <div style={{ flex:1, height:5, borderRadius:999, background:'#E5E7EB', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:loaded?`${r.pct}%`:'0%', background: r.pct===100?'#10B981':r.status==='Overdue'?'#EF4444':'#2563EB', borderRadius:999, transition:'width 900ms ease' }} />
                        </div>
                        <span style={{ fontSize:11, fontWeight:600, color:'#374151', minWidth:28 }}>{r.pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding:'0 14px' }}>{pill(r.status, STATUS_S)}</td>
                    <td style={{ padding:'0 14px' }}>{pill(r.priority, PRIORITY_S)}</td>
                    <td style={{ padding:'0 14px' }}>
                      <div style={{ display:'flex', gap:4 }}>
                        <button style={{ width:28, height:28, borderRadius:6, border:'none', background:'transparent', color:'#2563EB', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='#EFF6FF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Edit2 size={13} /></button>
                        <button style={{ width:28, height:28, borderRadius:6, border:'none', background:'transparent', color:'#2563EB', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='#EFF6FF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Link2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'12px 20px', borderTop:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, color:'#6B7280' }}>Showing 1 to 8 of 34 entries</span>
          <div style={{ display:'flex', gap:4 }}>
            {[null,1,2,3,'...',5,null].map((pg,i) => {
              if(pg===null){ const isL=i===0; return <button key={i} style={{ width:28,height:28,borderRadius:5,border:'1px solid #E5E7EB',background:'#fff',color:'#6B7280',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{isL?<ChevronLeft size={12}/>:<ChevronRight size={12}/>}</button>; }
              if(pg==='...') return <span key={i} style={{ width:28,textAlign:'center',color:'#6B7280',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center' }}>...</span>;
              const a=pg===1; return <button key={i} style={{ width:28,height:28,borderRadius:5,border:a?'none':'1px solid #E5E7EB',background:a?'#2563EB':'#fff',color:a?'#fff':'#374151',fontWeight:a?600:500,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{pg}</button>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
