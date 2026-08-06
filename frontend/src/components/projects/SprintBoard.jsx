import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { apiFetch, formatDate } from '../../lib/api';

const PRIORITY_COLOR = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' };
const LABEL_COLOR    = { Feature:'#DBEAFE/#2563EB', Backend:'#D1FAE5/#065F46', Security:'#FEE2E2/#DC2626', Design:'#EDE9FE/#5B21B6', QA:'#FEF3C7/#D97706', Bug:'#FEE2E2/#DC2626', Enhancement:'#F3F4F6/#6B7280', Setup:'#E0E7FF/#3730A3', Auth:'#FCE7F3/#9D174D', Admin:'#DBEAFE/#1D4ED8' };

const LabelPill = ({ label }) => {
  const parts = (LABEL_COLOR[label] || '#F3F4F6/#6B7280').split('/');
  return <span style={{ display:'inline-block', padding:'2px 7px', borderRadius:999, background:parts[0], color:parts[1], fontSize:10, fontWeight:600 }}>{label}</span>;
};

const Avatar = ({ initials }) => {
  const [bg, c] = ['#DBEAFE', '#1D4ED8'];
  return <div style={{ width:22, height:22, borderRadius:'50%', background:bg, color:c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700 }}>{initials}</div>;
};

const KanbanCard = ({ card, onEdit, onDelete }) => (
  <div style={{ background:'#fff', borderRadius:10, border:'1px solid #E5E7EB', boxShadow:'0 1px 4px rgba(15,23,42,.06)', padding:'12px 14px', cursor:'pointer', transition:'box-shadow .2s', position:'relative' }}
    onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(15,23,42,.12)'}
    onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(15,23,42,.06)'}
    onClick={() => onEdit && onEdit(card)}
  >
    <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(card); }} style={{ position:'absolute', top:8, right:8, width:20, height:20, borderRadius:5, border:'none', background:'transparent', color:'#9CA3AF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={12} /></button>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
      <LabelPill label={card.label} />
      <div style={{ width:8, height:8, borderRadius:'50%', background:PRIORITY_COLOR[card.priority] }} />
    </div>
    <div style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:8, lineHeight:1.4 }}>{card.title}</div>
    <div style={{ fontSize:11, color:'#6B7280', marginBottom:10 }}>{card.project}</div>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <Avatar initials={card.assignee} />
      <span style={{ fontSize:11, color:'#9CA3AF' }}>{formatDate(card.due)}</span>
    </div>
  </div>
);

const inputStyle = { width: '100%', height: 42, padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', background: '#fff' };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

const COLUMN_STATUS = { backlog: 'Backlog', todo: 'To Do', inprogress: 'In Progress', testing: 'Testing', done: 'Done' };
const DEFAULT_COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: '#6B7280', bg: '#F9FAFB' },
  { id: 'todo', label: 'To Do', color: '#6B7280', bg: '#F9FAFB' },
  { id: 'inprogress', label: 'In Progress', color: '#1D4ED8', bg: '#EFF6FF' },
  { id: 'testing', label: 'Testing', color: '#D97706', bg: '#FFFBEB' },
  { id: 'done', label: 'Done', color: '#15803D', bg: '#F0FDF4' }
];

export default function SprintBoard() {
  const { addToast } = useToast();
  const [board, setBoard] = useState({ sprint: null, columns: DEFAULT_COLUMNS, cards: {}, progress: { total: 0, done: 0, pending: 0, pct: 0 } });
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create/Edit Sprint Modal
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [editingSprintId, setEditingSprintId] = useState(null);
  const [sprintForm, setSprintForm] = useState({ name: '', goal: '', startDate: '', endDate: '', project_id: '', status: 'Planning' });

  // Add Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskColumn, setTaskColumn] = useState('todo');
  const [taskForm, setTaskForm] = useState({ title: '', project_id: '', assignee_id: '', priority: 'Medium', label: 'Feature', due: '' });

  const fetchMeta = useCallback(async () => {
    try {
      const res = await apiFetch('/projects/meta');
      if (res.success && res.data) {
        setProjects(res.data.projects || []);
        setEmployees(res.data.employees || []);
      }
    } catch (err) {
      console.error('Failed to load sprint meta:', err);
    }
  }, []);

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/sprints/board');
      if (res.success && res.data) {
        const rawColumns = (res.data.columns && res.data.columns.length) ? res.data.columns : DEFAULT_COLUMNS;
        const columns = DEFAULT_COLUMNS.map(def => {
          const matched = rawColumns.find(c => c.id === def.id) || {};
          return { ...def, ...matched, id: def.id };
        });
        setBoard({ ...res.data, columns });
      } else {
        addToast(res.message || 'Failed to fetch sprint board', 'error');
      }
    } catch (err) {
      addToast('Error connecting to backend server', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchMeta(); fetchBoard(); }, [fetchMeta, fetchBoard]);

  const openCreateSprint = () => {
    setEditingSprintId(null);
    setSprintForm({ name: '', goal: '', startDate: '', endDate: '', project_id: '', status: 'Planning' });
    setShowSprintModal(true);
  };

  const openEditSprint = () => {
    const s = board.sprint;
    if (!s) return;
    setEditingSprintId(s.id);
    setSprintForm({ name: s.name || '', goal: s.goal || '', startDate: s.start_date || '', endDate: s.end_date || '', project_id: String(s.project_id || ''), status: s.status || 'Planning' });
    setShowSprintModal(true);
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!sprintForm.name) {
      addToast('Sprint Name is required', 'error');
      return;
    }
    try {
      const payload = {
        name: sprintForm.name.trim(),
        goal: sprintForm.goal,
        project_id: sprintForm.project_id ? parseInt(sprintForm.project_id) : null,
        start_date: sprintForm.startDate,
        end_date: sprintForm.endDate,
        status: sprintForm.status
      };
      const res = await apiFetch(editingSprintId ? `/sprints/${editingSprintId}` : '/sprints', {
        method: editingSprintId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        addToast(editingSprintId ? 'Sprint updated successfully!' : 'Sprint created successfully!', 'success');
        setShowSprintModal(false);
        fetchBoard();
      } else {
        const msg = Array.isArray(res.errors) ? res.errors.join(', ') : (res.message || 'Failed to save sprint');
        addToast(msg, 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    }
  };

  const handleDeleteSprint = async () => {
    const s = board.sprint;
    if (!s) return;
    if (!window.confirm(`Delete sprint "${s.name}"?`)) return;
    try {
      const res = await apiFetch(`/sprints/${s.id}`, { method: 'DELETE' });
      if (res.success) {
        addToast('Sprint deleted successfully!', 'success');
        fetchBoard();
      } else {
        addToast(res.message || 'Failed to delete sprint', 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    }
  };

  const openAddTask = (colId) => {
    setEditingTaskId(null);
    setTaskColumn(colId);
    setTaskForm({ title: '', project_id: '', assignee_id: '', priority: 'Medium', label: 'Feature', due: '' });
    setShowTaskModal(true);
  };

  const openEditTask = (card) => {
    setEditingTaskId(card.id);
    const col = board.columns.find(c => board.cards && board.cards[c.id] && board.cards[c.id].find(x => x.id === card.id));
    setTaskColumn(col ? col.id : 'todo');
    setTaskForm({
      title: card.title,
      project_id: card.project_id !== undefined ? String(card.project_id) : '',
      assignee_id: card.assignee_id !== undefined ? String(card.assignee_id) : '',
      priority: card.priority || 'Medium',
      label: card.label || 'Feature',
      due: card.due || ''
    });
    setShowTaskModal(true);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title) {
      addToast('Task Title is required', 'error');
      return;
    }
    if (!taskForm.project_id) {
      addToast('Project is required', 'error');
      return;
    }
    const status = COLUMN_STATUS[taskColumn] || 'To Do';
    const payload = {
      title: taskForm.title.trim(),
      project_id: parseInt(taskForm.project_id),
      assignee_id: taskForm.assignee_id ? parseInt(taskForm.assignee_id) : null,
      priority: taskForm.priority,
      label: taskForm.label,
      due_date: taskForm.due,
      status
    };
    try {
      const res = await apiFetch(editingTaskId ? `/tasks/${editingTaskId}` : '/tasks', {
        method: editingTaskId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        addToast(editingTaskId ? 'Task updated successfully!' : 'Task added successfully!', 'success');
        setShowTaskModal(false);
        fetchBoard();
      } else {
        const msg = Array.isArray(res.errors) ? res.errors.join(', ') : (res.message || 'Failed to save task');
        addToast(msg, 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    }
  };

  const handleDeleteTask = async (card) => {
    if (!window.confirm(`Delete task "${card.title}"?`)) return;
    try {
      const res = await apiFetch(`/tasks/${card.id}`, { method: 'DELETE' });
      if (res.success) {
        addToast('Task deleted successfully!', 'success');
        fetchBoard();
      } else {
        addToast(res.message || 'Failed to delete task', 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    }
  };

  const sprint = board.sprint;
  const subtitle = sprint
    ? `${sprint.name} (${formatDate(sprint.start_date)} - ${formatDate(sprint.end_date)})`
    : 'No active sprint';

  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", width:'100%', boxSizing:'border-box' }}>

      {/* ── CREATE/EDIT SPRINT MODAL ── */}
      {showSprintModal && (
        <>
          <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.45)', zIndex:1000 }} onClick={() => setShowSprintModal(false)} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, maxWidth:'92vw', maxHeight:'90vh', background:'#fff', borderRadius:16, zIndex:1001, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ padding:'24px 32px', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div>
                <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:'#0A1629' }}>{editingSprintId ? 'Edit Sprint' : 'Create Sprint'}</h2>
                <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748B' }}>Define a new sprint for your project team.</p>
              </div>
              <button onClick={() => setShowSprintModal(false)} style={{ width:36, height:36, borderRadius:8, border:'none', background:'#F1F5F9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={18} color="#64748B" /></button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>
              <form id="sprintForm" onSubmit={handleCreateSprint}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
                  <div>
                    <label style={labelStyle}>Sprint Name <span style={{ color:'#EF4444' }}>*</span></label>
                    <input style={inputStyle} placeholder="e.g. Sprint 14" value={sprintForm.name} onChange={e => setSprintForm(p=>({...p,name:e.target.value}))} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Project</label>
                    <select style={inputStyle} value={sprintForm.project_id} onChange={e => setSprintForm(p=>({...p,project_id:e.target.value}))}>
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input type="date" style={inputStyle} value={sprintForm.startDate} onChange={e => setSprintForm(p=>({...p,startDate:e.target.value}))} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input type="date" style={inputStyle} value={sprintForm.endDate} onChange={e => setSprintForm(p=>({...p,endDate:e.target.value}))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select style={inputStyle} value={sprintForm.status} onChange={e => setSprintForm(p=>({...p,status:e.target.value}))}>
                      <option>Planning</option>
                      <option>Active</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Sprint Goal</label>
                  <textarea style={{ ...inputStyle, height:90, padding:'10px 12px', resize:'vertical' }} placeholder="Describe the goal of this sprint..." value={sprintForm.goal} onChange={e => setSprintForm(p=>({...p,goal:e.target.value}))} />
                </div>
              </form>
            </div>
            <div style={{ padding:'20px 32px', borderTop:'1px solid #E5E7EB', display:'flex', justifyContent:'flex-end', gap:12, flexShrink:0 }}>
              <button type="button" onClick={() => setShowSprintModal(false)} style={{ height:42, padding:'0 24px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:14, fontWeight:600, color:'#374151', background:'#fff', cursor:'pointer' }}>Cancel</button>
              <button type="submit" form="sprintForm" style={{ height:42, padding:'0 28px', background:'#2563EB', border:'none', borderRadius:8, fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer' }}>{editingSprintId ? 'Save Sprint' : 'Create Sprint'}</button>
            </div>
          </div>
        </>
      )}

      {/* ── ADD TASK MODAL ── */}
      {showTaskModal && (
        <>
          <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.45)', zIndex:1000 }} onClick={() => setShowTaskModal(false)} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, maxWidth:'92vw', maxHeight:'90vh', background:'#fff', borderRadius:16, zIndex:1001, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ padding:'24px 32px', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div>
                <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:'#0A1629' }}>{editingTaskId ? 'Edit Task' : 'Add Task'}</h2>
                <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748B' }}>Add a new task to the <strong>{board.columns.find(c=>c.id===taskColumn)?.label}</strong> column.</p>
              </div>
              <button onClick={() => setShowTaskModal(false)} style={{ width:36, height:36, borderRadius:8, border:'none', background:'#F1F5F9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={18} color="#64748B" /></button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>
              <form id="taskForm" onSubmit={handleAddTask}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
                  <div style={{ gridColumn:'1 / -1' }}>
                    <label style={labelStyle}>Task Title <span style={{ color:'#EF4444' }}>*</span></label>
                    <input style={inputStyle} placeholder="Enter task title" value={taskForm.title} onChange={e => setTaskForm(p=>({...p,title:e.target.value}))} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Project <span style={{ color:'#EF4444' }}>*</span></label>
                    <select style={inputStyle} value={taskForm.project_id} onChange={e => setTaskForm(p=>({...p,project_id:e.target.value}))} required>
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Assignee</label>
                    <select style={inputStyle} value={taskForm.assignee_id} onChange={e => setTaskForm(p=>({...p,assignee_id:e.target.value}))}>
                      <option value="">Unassigned</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Priority</label>
                    <select style={inputStyle} value={taskForm.priority} onChange={e => setTaskForm(p=>({...p,priority:e.target.value}))}>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Label</label>
                    <select style={inputStyle} value={taskForm.label} onChange={e => setTaskForm(p=>({...p,label:e.target.value}))}>
                      {Object.keys(LABEL_COLOR).map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Due Date</label>
                    <input type="date" style={inputStyle} value={taskForm.due} onChange={e => setTaskForm(p=>({...p,due:e.target.value}))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Column</label>
                    <select style={inputStyle} value={taskColumn} onChange={e => setTaskColumn(e.target.value)}>
                      {board.columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div style={{ padding:'20px 32px', borderTop:'1px solid #E5E7EB', display:'flex', justifyContent:'flex-end', gap:12, flexShrink:0 }}>
              <button type="button" onClick={() => setShowTaskModal(false)} style={{ height:42, padding:'0 24px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:14, fontWeight:600, color:'#374151', background:'#fff', cursor:'pointer' }}>Cancel</button>
              <button type="submit" form="taskForm" style={{ height:42, padding:'0 28px', background:'#2563EB', border:'none', borderRadius:8, fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer' }}>{editingTaskId ? 'Save Task' : 'Add Task'}</button>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#111827' }}>Sprint Board</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#6B7280' }}>{subtitle}{sprint && board.progress ? ` · ${board.progress.pct}% done` : ''}</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {sprint && (
            <>
              <button onClick={openEditSprint} style={{ height:38, padding:'0 14px', background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, color:'#374151', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Pencil size={14} /> Edit</button>
              <button onClick={handleDeleteSprint} style={{ height:38, padding:'0 14px', background:'#fff', border:'1px solid #FECACA', borderRadius:8, fontSize:13, color:'#DC2626', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Trash2 size={14} /> Delete</button>
            </>
          )}
          <button onClick={openCreateSprint} style={{ height:38, padding:'0 16px', background:'#2563EB', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Plus size={14} /> Create Sprint</button>
        </div>
      </div>

      {loading && <div style={{ padding:20, textAlign:'center', fontSize:13, color:'#6B7280' }}>Loading sprint board...</div>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:16, overflowX:'auto' }}>
        {board.columns.map(col => {
          const colCards = board.cards ? (board.cards[col.id] || []) : [];
          return (
            <div key={col.id} style={{ minWidth:220 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:col.bg, borderRadius:'10px 10px 0 0', border:'1px solid #E5E7EB', borderBottom:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:col.color }} />
                  <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{col.label}</span>
                </div>
                <span style={{ width:20, height:20, borderRadius:'50%', background:'#fff', border:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:col.color }}>{colCards.length}</span>
              </div>
              <div style={{ background:'#F8FAFC', border:'1px solid #E5E7EB', borderTop:'none', borderRadius:'0 0 10px 10px', padding:'10px 10px', display:'flex', flexDirection:'column', gap:10, minHeight:300 }}>
                {colCards.length === 0 && <div style={{ fontSize:11, color:'#9CA3AF', textAlign:'center', padding:'8px 0' }}>No tasks</div>}
                {colCards.map((c,i) => <KanbanCard key={i} card={c} onEdit={openEditTask} onDelete={handleDeleteTask} />)}
                <button onClick={() => openAddTask(col.id)} style={{ marginTop:4, width:'100%', height:32, borderRadius:8, border:'1px dashed #D1D5DB', background:'transparent', color:'#9CA3AF', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }} onMouseEnter={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#2563EB';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#9CA3AF';}}><Plus size={12}/> Add Task</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}