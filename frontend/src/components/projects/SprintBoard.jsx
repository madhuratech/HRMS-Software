import React from 'react';
import { Plus } from 'lucide-react';

const COLUMNS = [
  { id: 'backlog',     label: 'Backlog',     color: '#6B7280', bg: '#F9FAFB', count: 4 },
  { id: 'todo',        label: 'To Do',       color: '#6B7280', bg: '#F9FAFB', count: 5 },
  { id: 'inprogress',  label: 'In Progress', color: '#1D4ED8', bg: '#EFF6FF', count: 6 },
  { id: 'testing',     label: 'Testing',     color: '#D97706', bg: '#FFFBEB', count: 3 },
  { id: 'done',        label: 'Done',        color: '#15803D', bg: '#F0FDF4', count: 4 },
];

const CARDS = {
  backlog: [
    { title: 'User analytics dashboard', project: 'HRM Software',     assignee: 'RS', due: 'May 20', priority: 'Low',    label: 'Enhancement' },
    { title: 'Dark mode support',        project: 'Mobile App',        assignee: 'PP', due: 'May 25', priority: 'Medium', label: 'Feature'     },
  ],
  todo: [
    { title: 'Create wireframes',        project: 'Website Redesign',  assignee: 'AK', due: 'May 11', priority: 'High',   label: 'Design'      },
    { title: 'Setup dev env',            project: 'HRM Software',      assignee: 'RS', due: 'May 12', priority: 'Medium', label: 'Setup'       },
    { title: 'Database schema',          project: 'Mobile App',        assignee: 'PP', due: 'May 14', priority: 'High',   label: 'Backend'     },
  ],
  inprogress: [
    { title: 'API authentication',       project: 'HRM Software',      assignee: 'VS', due: 'May 08', priority: 'High',   label: 'Security'    },
    { title: 'Employee modules',         project: 'HRM Software',      assignee: 'SK', due: 'May 10', priority: 'Medium', label: 'Feature'     },
    { title: 'Payment integration',      project: 'Mobile App',        assignee: 'AK', due: 'May 12', priority: 'High',   label: 'Backend'     },
  ],
  testing: [
    { title: 'UI improvements',          project: 'Website Redesign',  assignee: 'PP', due: 'May 07', priority: 'Medium', label: 'QA'          },
    { title: 'Bug fixes',                project: 'HRM Software',      assignee: 'RS', due: 'May 09', priority: 'High',   label: 'Bug'         },
    { title: 'Test case update',         project: 'Mobile App',        assignee: 'SK', due: 'May 10', priority: 'Low',    label: 'QA'          },
  ],
  done: [
    { title: 'Login page',               project: 'HRM Software',      assignee: 'AK', due: 'May 05', priority: 'High',   label: 'Auth'        },
    { title: 'User management',          project: 'HRM Software',      assignee: 'RS', due: 'May 06', priority: 'Medium', label: 'Admin'       },
    { title: 'Dashboard API',            project: 'Mobile App',        assignee: 'VS', due: 'May 07', priority: 'High',   label: 'Backend'     },
  ],
};

const PRIORITY_COLOR = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' };
const LABEL_COLOR    = { Feature:'#DBEAFE/#2563EB', Backend:'#D1FAE5/#065F46', Security:'#FEE2E2/#DC2626', Design:'#EDE9FE/#5B21B6', QA:'#FEF3C7/#D97706', Bug:'#FEE2E2/#DC2626', Enhancement:'#F3F4F6/#6B7280', Setup:'#E0E7FF/#3730A3', Auth:'#FCE7F3/#9D174D', Admin:'#DBEAFE/#1D4ED8' };
const AVATAR_BG = { RS:['#DBEAFE','#1D4ED8'], PP:['#FCE7F3','#9D174D'], AK:['#D1FAE5','#065F46'], SK:['#FEF3C7','#92400E'], VS:['#EDE9FE','#5B21B6'] };

const LabelPill = ({ label }) => {
  const parts = (LABEL_COLOR[label] || '#F3F4F6/#6B7280').split('/');
  return <span style={{ display:'inline-block', padding:'2px 7px', borderRadius:999, background:parts[0], color:parts[1], fontSize:10, fontWeight:600 }}>{label}</span>;
};

const Avatar = ({ initials }) => {
  const [bg, c] = AVATAR_BG[initials] || ['#F3F4F6','#6B7280'];
  return <div style={{ width:22, height:22, borderRadius:'50%', background:bg, color:c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700 }}>{initials}</div>;
};

const KanbanCard = ({ card }) => (
  <div style={{ background:'#fff', borderRadius:10, border:'1px solid #E5E7EB', boxShadow:'0 1px 4px rgba(15,23,42,.06)', padding:'12px 14px', cursor:'pointer', transition:'box-shadow .2s' }}
    onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(15,23,42,.12)'}
    onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(15,23,42,.06)'}
  >
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
      <LabelPill label={card.label} />
      <div style={{ width:8, height:8, borderRadius:'50%', background:PRIORITY_COLOR[card.priority] }} />
    </div>
    <div style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:8, lineHeight:1.4 }}>{card.title}</div>
    <div style={{ fontSize:11, color:'#6B7280', marginBottom:10 }}>{card.project}</div>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <Avatar initials={card.assignee} />
      <span style={{ fontSize:11, color:'#9CA3AF' }}>May {card.due.replace('May ','')}</span>
    </div>
  </div>
);

export default function SprintBoard() {
  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", width:'100%', boxSizing:'border-box' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#111827' }}>Sprint Board</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#6B7280' }}>Sprint 13 (May 1 - May 15, 2024)</p>
        </div>
        <button style={{ height:38, padding:'0 16px', background:'#2563EB', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Plus size={14} /> Create Sprint</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:16, overflowX:'auto' }}>
        {COLUMNS.map(col => {
          const cards = CARDS[col.id] || [];
          return (
            <div key={col.id} style={{ minWidth:220 }}>
              {/* Column header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:col.bg, borderRadius:'10px 10px 0 0', border:'1px solid #E5E7EB', borderBottom:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:col.color }} />
                  <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{col.label}</span>
                </div>
                <span style={{ width:20, height:20, borderRadius:'50%', background:'#fff', border:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:col.color }}>{cards.length}</span>
              </div>
              {/* Cards */}
              <div style={{ background:'#F8FAFC', border:'1px solid #E5E7EB', borderTop:'none', borderRadius:'0 0 10px 10px', padding:'10px 10px', display:'flex', flexDirection:'column', gap:10, minHeight:300 }}>
                {cards.map((c,i) => <KanbanCard key={i} card={c} />)}
                <button style={{ marginTop:4, width:'100%', height:32, borderRadius:8, border:'1px dashed #D1D5DB', background:'transparent', color:'#9CA3AF', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }} onMouseEnter={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#2563EB';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#9CA3AF';}}><Plus size={12}/> Add Task</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
