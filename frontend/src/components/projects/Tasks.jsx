import React, { useState } from 'react';
import { Search, Plus, Edit2, Link2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const TASKS = [
  { name:'Design Landing Page',  project:'Website Redesign',  assignee:'Amit Kumar',    due:'25 May 2024', priority:'High',   status:'In Progress' },
  { name:'API Integration',      project:'HRM Software',      assignee:'Rahul Sharma',  due:'28 May 2024', priority:'High',   status:'In Progress' },
  { name:'Database Schema',      project:'Mobile App',        assignee:'Priya Patel',   due:'22 May 2024', priority:'Medium', status:'To Do'       },
  { name:'UI Improvements',      project:'HRM Software',      assignee:'Sneha Kapoor', due:'20 May 2024', priority:'Medium', status:'Review'      },
  { name:'Fix UI Issues',        project:'Website Redesign',  assignee:'Amit Kumar',    due:'17 May 2024', priority:'Low',    status:'Completed'   },
];

const STATUS_S   = { 'To Do':{ bg:'#F3F4F6', color:'#6B7280' }, 'In Progress':{ bg:'#DBEAFE', color:'#1D4ED8' }, 'Review':{ bg:'#FEF3C7', color:'#D97706' }, 'Completed':{ bg:'#DCFCE7', color:'#15803D' } };
const PRIORITY_S = { 'High':{ bg:'#FEE2E2', color:'#DC2626' }, 'Medium':{ bg:'#FEF3C7', color:'#D97706' }, 'Low':{ bg:'#DCFCE7', color:'#15803D' } };
const AVATAR     = [{ bg:'#DBEAFE', c:'#1D4ED8' },{ bg:'#FCE7F3', c:'#9D174D' },{ bg:'#D1FAE5', c:'#065F46' },{ bg:'#FEF3C7', c:'#92400E' },{ bg:'#EDE9FE', c:'#5B21B6' }];

const pill = (label, map) => { const s = map[label] || { bg:'#F3F4F6', color:'#6B7280' }; return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:999, background:s.bg, color:s.color, fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>{label}</span>; };
const Sel = ({ children }) => (
  <div style={{ position:'relative' }}>
    <select style={{ appearance:'none', WebkitAppearance:'none', height:38, paddingLeft:12, paddingRight:28, background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, color:'#374151', cursor:'pointer', outline:'none' }}>{children}</select>
    <ChevronDown size={13} color="#9CA3AF" style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
  </div>
);

const KpiCard = ({ label, value, color, icon }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', padding:'16px 20px', flex:'1 1 0', minWidth:110 }}>
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      <span style={{ fontSize:12, fontWeight:500, color:'#6B7280' }}>{label}</span>
    </div>
    <div style={{ fontSize:28, fontWeight:700, color, lineHeight:1 }}>{value}</div>
  </div>
);

export default function Tasks() {
  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", width:'100%', boxSizing:'border-box' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#111827' }}>Tasks</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#6B7280' }}>Build and manage project tasks</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <Sel><option>All Projects</option><option>HRM Software</option></Sel>
          <Sel><option>All Status</option><option>In Progress</option><option>To Do</option></Sel>
          <button style={{ height:38, padding:'0 16px', background:'#2563EB', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Plus size={14} /> Add Task</button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
        <KpiCard label="Total Tasks" value={128} color="#111827" icon="📋" />
        <KpiCard label="To Do"       value={32}  color="#6B7280" icon="📝" />
        <KpiCard label="In Progress" value={45}  color="#2563EB" icon="▶"  />
        <KpiCard label="Review"      value={18}  color="#D97706" icon="🔍" />
        <KpiCard label="Completed"   value={33}  color="#10B981" icon="✓"  />
      </div>

      <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ position:'relative', flex:1, maxWidth:280 }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', pointerEvents:'none' }} />
            <input placeholder="Search tasks..." style={{ width:'100%', height:36, paddingLeft:30, paddingRight:12, border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, outline:'none' }} />
          </div>
          <Sel><option>All Assignees</option></Sel>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #E5E7EB' }}>
                {['Task Name','Project','Assigned To','Due Date','Priority','Status','Actions'].map(h => (
                  <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:12, fontWeight:500, color:'#6B7280', whiteSpace:'nowrap', background:'#FAFAFA' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TASKS.map((t, i) => {
                const av = AVATAR[i % AVATAR.length];
                return (
                  <tr key={i} style={{ height:54, borderBottom:'1px solid #F3F4F6' }}>
                    <td style={{ padding:'0 16px', fontSize:13, fontWeight:600, color:'#111827' }}>{t.name}</td>
                    <td style={{ padding:'0 16px', fontSize:13, color:'#374151' }}>{t.project}</td>
                    <td style={{ padding:'0 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:26, height:26, borderRadius:'50%', background:av.bg, color:av.c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, flexShrink:0 }}>{t.assignee.split(' ').map(x=>x[0]).join('')}</div>
                        <span style={{ fontSize:13, color:'#374151' }}>{t.assignee}</span>
                      </div>
                    </td>
                    <td style={{ padding:'0 16px', fontSize:13, color:'#374151' }}>{t.due}</td>
                    <td style={{ padding:'0 16px' }}>{pill(t.priority, PRIORITY_S)}</td>
                    <td style={{ padding:'0 16px' }}>{pill(t.status, STATUS_S)}</td>
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
          <span style={{ fontSize:13, color:'#6B7280' }}>Showing 1 to 5 of 128 entries</span>
          <div style={{ display:'flex', gap:4 }}>
            {[null,1,2,3,'...',26,null].map((pg,i) => {
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
