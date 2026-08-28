import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Edit2, ChevronLeft, ChevronRight, ChevronDown, X, Trash2, User } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { apiFetch, formatDate, getInitials } from '../../lib/api';
import { requireActionPermission, hasPermission } from '../../lib/permissions';
import CustomSelect from '../ui/CustomSelect';

const STATUS_S = { 'To Do': { bg: '#F3F4F6', color: '#6B7280' }, 'Backlog': { bg: '#F3F4F6', color: '#6B7280' }, 'In Progress': { bg: '#DBEAFE', color: '#1D4ED8' }, 'Testing': { bg: '#FEF3C7', color: '#D97706' }, 'Review': { bg: '#FEF3C7', color: '#D97706' }, 'Completed': { bg: '#DCFCE7', color: '#15803D' }, 'Done': { bg: '#DCFCE7', color: '#15803D' } };
const PRIORITY_S = { 'High': { bg: '#FEE2E2', color: '#DC2626' }, 'Medium': { bg: '#FEF3C7', color: '#D97706' }, 'Low': { bg: '#DCFCE7', color: '#15803D' } };
const AVATAR = [{ bg: '#DBEAFE', c: '#1D4ED8' }, { bg: '#FCE7F3', c: '#9D174D' }, { bg: '#D1FAE5', c: '#065F46' }, { bg: '#FEF3C7', c: '#92400E' }, { bg: '#EDE9FE', c: '#5B21B6' }];

const pill = (label, map) => {
  const s = map[label] || { bg: '#F3F4F6', color: '#6B7280' };
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>;
};

const KpiCard = ({ label, value, color, icon }) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.05)', padding: '16px 20px', flex: '1 1 0', minWidth: 110 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>{label}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
  </div>
);

const buildPages = (current, total) => {
  if (total <= 1) return [1];
  const pages = [1];
  for (let p = current - 1; p <= current + 1; p++) { if (p > 1 && p < total) pages.push(p); }
  if (total > 1) pages.push(total);
  const out = []; let prev = 0;
  pages.forEach(p => { if (p - prev > 1) out.push('...'); out.push(p); prev = p; });
  return out;
};

const TASK_STATUSES = ['Backlog', 'To Do', 'In Progress', 'Testing', 'Review', 'Done', 'Completed'];

export default function Tasks() {
  const { addToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [meta, setMeta] = useState({ employees: [], projects: [] });
  const [kpiData, setKpiData] = useState({ totalTasks: 0, todo: 0, inProgress: 0, review: 0, completed: 0 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const limit = 10;

  const [formData, setFormData] = useState({ title: '', project_id: '', assignee_id: '', priority: 'Medium', start_date: '', due_date: '', status: 'In Progress', description: '' });

  useEffect(() => { setPage(1); }, [search, projectFilter, statusFilter, assigneeFilter]);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await apiFetch('/projects/meta');
      if (res.success && res.data) setMeta({ employees: res.data.employees || [], projects: res.data.projects || [] });
    } catch (err) { console.error('Failed to load task meta:', err); }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/tasks?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (projectFilter) url += `&project_id=${projectFilter}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      if (assigneeFilter) url += `&assignee_id=${assigneeFilter}`;
      const res = await apiFetch(url);
      if (res.success && res.data) { setTaskList(res.data.tasks || []); setTotal(res.data.total || 0); }
      else addToast(res.message || 'Failed to fetch tasks', 'error');
    } catch (err) { addToast('Error connecting to backend server', 'error'); }
    finally { setLoading(false); }
  }, [page, search, projectFilter, statusFilter, assigneeFilter, addToast]);

  const fetchDashboard = useCallback(async () => {
    try { const res = await apiFetch('/tasks/dashboard'); if (res.success && res.data) setKpiData(res.data); }
    catch (err) { console.error('Failed to load task stats:', err); }
  }, []);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);
  useEffect(() => { fetchTasks(); fetchDashboard(); }, [fetchTasks, fetchDashboard]);

  const openAdd = () => {
    if (!requireActionPermission('projects', 'tasks', 'create', null, addToast, 'You do not have permission to create a task.')) return;
    setEditingId(null);
    setFormData({ title: '', project_id: '', assignee_id: '', priority: 'Medium', start_date: '', due_date: '', status: 'In Progress', description: '' });
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEdit = (task) => {
    if (!requireActionPermission('projects', 'tasks', 'edit', null, addToast, 'You do not have permission to edit this task.')) return;
    setEditingId(task.id);
    setFormData({ title: task.title, project_id: String(task.project_id || ''), assignee_id: String(task.assignee_id || ''), priority: task.priority || 'Medium', start_date: task.start_date || '', due_date: task.due_date || '', status: task.status || 'In Progress', description: task.description || '' });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const act = editingId ? 'edit' : 'create';
    if (!requireActionPermission('projects', 'tasks', act, null, addToast, `You do not have permission to ${act} a task.`)) return;

    const errors = {};
    if (!formData.title.trim()) errors.title = true;
    if (!formData.project_id) errors.project_id = true;
    if (!formData.assignee_id) errors.assignee_id = true;
    if (!formData.start_date) errors.start_date = true;
    if (!formData.due_date) errors.due_date = true;
    if (!formData.description.trim()) errors.description = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setFormErrors({});
    setSubmitting(true);
    const payload = { title: formData.title.trim(), project_id: parseInt(formData.project_id), assignee_id: parseInt(formData.assignee_id), priority: formData.priority, start_date: formData.start_date, due_date: formData.due_date, status: formData.status, description: formData.description.trim() };
    try {
      const res = await apiFetch(editingId ? `/tasks/${editingId}` : '/tasks', { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      if (res.success) { addToast(editingId ? 'Task updated!' : 'Task created!', 'success'); setShowAddModal(false); fetchTasks(); fetchDashboard(); }
      else { const msg = Array.isArray(res.errors) ? res.errors.join(', ') : (res.message || 'Failed to save task'); addToast(msg, 'error'); }
    } catch (err) { addToast('Connection error occurred', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (task, status) => {
    try {
      const res = await apiFetch(`/tasks/${task.id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      if (res.success) { addToast('Task status updated!', 'success'); fetchTasks(); fetchDashboard(); }
      else addToast(res.message || 'Failed to update status', 'error');
    } catch (err) { addToast('Connection error occurred', 'error'); }
  };

  const handleDelete = async (task) => {
    if (!requireActionPermission('projects', 'tasks', 'delete', null, addToast, 'You do not have permission to delete this task.')) return;
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    try {
      const res = await apiFetch(`/tasks/${task.id}`, { method: 'DELETE' });
      if (res.success) { addToast('Task deleted!', 'success'); fetchTasks(); fetchDashboard(); }
      else addToast(res.message || 'Failed to delete task', 'error');
    } catch (err) { addToast('Connection error occurred', 'error'); }
  };

  const authRaw = localStorage.getItem('hrms_auth');
  let userRole = 'SUPER_ADMIN';
  if (authRaw) { try { const p = JSON.parse(authRaw); if (p.role) userRole = p.role; } catch (e) { } }
  const isEmployeeRole = userRole === 'EMPLOYEE';

  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Tasks</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Build and manage project tasks</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <CustomSelect
            options={[{ value: '', label: 'All Projects' }, ...meta.projects.map(p => ({ value: p.id, label: p.name, sublabel: p.project_code }))]}
            value={projectFilter}
            onChange={val => setProjectFilter(val)}
            placeholder="All Projects"
            searchable
            style={{ width: 180 }}
          />
          <CustomSelect
            options={[{ value: '', label: 'All Status' }, ...TASK_STATUSES.map(s => ({ value: s, label: s }))]}
            value={statusFilter}
            onChange={val => setStatusFilter(val)}
            placeholder="All Status"
            searchable={false}
            style={{ width: 150 }}
          />
          {hasPermission(null, null, 'projects', 'tasks', 'create') && (
            <button onClick={openAdd} style={{ height: 44, padding: '0 16px', background: '#2563EB', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <KpiCard label="Total Tasks" value={kpiData.totalTasks} color="#111827" icon="📋" />
        <KpiCard label="To Do" value={kpiData.todo} color="#6B7280" icon="📝" />
        <KpiCard label="In Progress" value={kpiData.inProgress} color="#2563EB" icon="▶" />
        <KpiCard label="Review" value={kpiData.review} color="#D97706" icon="🔍" />
        <KpiCard label="Completed" value={kpiData.completed} color="#10B981" icon="✓" />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.05)', overflow: 'visible' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
            <input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', height: 42, paddingLeft: 30, paddingRight: 12, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none' }} />
          </div>
          <CustomSelect
            options={[{ value: '', label: 'All Assignees' }, ...meta.employees.map(e => ({ value: e.id, label: e.name, sublabel: e.department_name }))]}
            value={assigneeFilter}
            onChange={val => setAssigneeFilter(val)}
            placeholder="All Assignees"
            searchable
            style={{ width: 180 }}
          />
        </div>
        <div style={{ overflowX: 'visible' }}>
          {loading && <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>Loading tasks...</div>}
          {!loading && taskList.length === 0 && <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>No tasks found.</div>}
          {!loading && taskList.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['Task Name', 'Project', 'Assigned To', 'Due Date', 'Priority', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#6B7280', whiteSpace: 'nowrap', background: '#FAFAFA' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {taskList.map((t, i) => {
                  const av = AVATAR[i % AVATAR.length];
                  return (
                    <tr key={t.id} style={{ height: 54, borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{t.title}</td>
                      <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>{t.project_name}</td>
                      <td style={{ padding: '0 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: av.bg, color: av.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{getInitials(t.assignee_name)}</div>
                          <span style={{ fontSize: 13, color: '#374151' }}>{t.assignee_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0 16px', fontSize: 13, color: '#374151' }}>{formatDate(t.due_date)}</td>
                      <td style={{ padding: '0 16px' }}>{pill(t.priority, PRIORITY_S)}</td>
                      <td style={{ padding: '0 16px' }}>
                        <CustomSelect
                          options={TASK_STATUSES}
                          value={t.status}
                          onChange={val => handleStatusChange(t, val)}
                          searchable={false}
                          style={{ width: 130 }}
                        />
                      </td>
                      <td style={{ padding: '0 16px' }}>
                        {!isEmployeeRole ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button style={{ width: 26, height: 26, borderRadius: 5, border: 'none', background: 'transparent', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => openEdit(t)}><Edit2 size={12} /></button>
                            <button style={{ width: 26, height: 26, borderRadius: 5, border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => handleDelete(t)}><Trash2 size={12} /></button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Status Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Showing {startIndex} to {endIndex} of {total} entries</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[null, ...buildPages(page, totalPages), null].map((pg, i) => {
              if (pg === null) { const isL = i === 0; return <button key={i} onClick={() => { (isL ? page > 1 : page < totalPages) && setPage(isL ? page - 1 : page + 1); }} disabled={isL ? page <= 1 : page >= totalPages} style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid #E5E7EB', background: '#fff', color: (isL ? page <= 1 : page >= totalPages) ? '#D1D5DB' : '#6B7280', cursor: (isL ? page <= 1 : page >= totalPages) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isL ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}</button>; }
              if (pg === '...') return <span key={i} style={{ width: 28, textAlign: 'center', color: '#6B7280', fontSize: 13, lineHeight: '28px' }}>...</span>;
              const a = pg === page; return <button key={i} onClick={() => setPage(pg)} style={{ width: 28, height: 28, borderRadius: 5, border: a ? 'none' : '1px solid #E5E7EB', background: a ? '#2563EB' : '#fff', color: a ? '#fff' : '#374151', fontWeight: a ? 600 : 500, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pg}</button>;
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (editingId ? hasPermission(null, null, 'projects', 'tasks', 'edit') : hasPermission(null, null, 'projects', 'tasks', 'create')) && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowAddModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw', maxHeight: '90vh', overflow: 'visible' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">{editingId ? 'Edit Task' : 'Add Task'}</h2>
                <p className="text-sm text-slate-500 mt-1">Assign a task to a project team member.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSave} noValidate className="p-6 overflow-y-auto flex-1 space-y-6" style={{ overflowY: 'auto' }}>
              <style>{`
                .task-modal-input {
                  width: 100%;
                  height: 48px;
                  padding: 0 16px;
                  border: 1px solid #E2E8F0;
                  border-radius: 12px;
                  font-size: 14px;
                  color: #0F172A;
                  background-color: #FFFFFF;
                  outline: none !important;
                  transition: border-color 0.15s ease, box-shadow 0.15s ease;
                  box-sizing: border-box;
                }
                .task-modal-input:focus {
                  border-color: #2563EB !important;
                  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.20) !important;
                  outline: none !important;
                }
                .task-modal-input-error {
                  border-color: #EF4444 !important;
                }
                .task-modal-textarea {
                  width: 100%;
                  padding: 14px 16px;
                  border: 1px solid #E2E8F0;
                  border-radius: 12px;
                  font-size: 14px;
                  color: #0F172A;
                  background-color: #FFFFFF;
                  outline: none !important;
                  resize: none;
                  transition: border-color 0.15s ease, box-shadow 0.15s ease;
                  box-sizing: border-box;
                }
                .task-modal-textarea:focus {
                  border-color: #2563EB !important;
                  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.20) !important;
                  outline: none !important;
                }
              `}</style>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ overflow: 'visible' }}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Task Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => {
                      setFormData({ ...formData, title: e.target.value });
                      if (formErrors.title) setFormErrors(prev => ({ ...prev, title: false }));
                    }}
                    placeholder="e.g. Design Landing Page"
                    className={`task-modal-input ${formErrors.title ? 'task-modal-input-error' : ''}`}
                  />
                  {formErrors.title && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#EF4444' }}>Please enter task name</p>}
                </div>

                <div style={{ overflow: 'visible' }}>
                  <CustomSelect
                    label="Project"
                    required
                    options={meta.projects.map(p => ({ value: p.id, label: p.name, sublabel: p.project_code }))}
                    value={formData.project_id}
                    onChange={val => {
                      setFormData(prev => ({ ...prev, project_id: val }));
                      if (formErrors.project_id) setFormErrors(prev => ({ ...prev, project_id: false }));
                    }}
                    placeholder="Select Project"
                    error={formErrors.project_id}
                  />
                  {formErrors.project_id && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#EF4444' }}>Please select a project</p>}
                </div>

                <div style={{ overflow: 'visible' }}>
                  <CustomSelect
                    label="Assigned To"
                    required
                    options={meta.employees.map(emp => ({
                      value: emp.id,
                      label: `${emp.name} (EMP${String(emp.id).padStart(3, '0')})`,
                      sublabel: emp.department_name
                    }))}
                    value={formData.assignee_id}
                    onChange={val => {
                      setFormData(prev => ({ ...prev, assignee_id: val }));
                      if (formErrors.assignee_id) setFormErrors(prev => ({ ...prev, assignee_id: false }));
                    }}
                    placeholder="Select Employee"
                    error={formErrors.assignee_id}
                  />
                  {formErrors.assignee_id && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#EF4444' }}>Please select an employee</p>}
                </div>

                <div>
                  <CustomSelect
                    label="Priority"
                    options={['High', 'Medium', 'Low']}
                    value={formData.priority}
                    onChange={val => setFormData(prev => ({ ...prev, priority: val }))}
                    placeholder="Select Priority"
                    searchable={false}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => {
                      setFormData({ ...formData, start_date: e.target.value });
                      if (formErrors.start_date) setFormErrors(prev => ({ ...prev, start_date: false }));
                    }}
                    className={`task-modal-input ${formErrors.start_date ? 'task-modal-input-error' : ''}`}
                  />
                  {formErrors.start_date && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#EF4444' }}>Please select start date</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={e => {
                      setFormData({ ...formData, due_date: e.target.value });
                      if (formErrors.due_date) setFormErrors(prev => ({ ...prev, due_date: false }));
                    }}
                    className={`task-modal-input ${formErrors.due_date ? 'task-modal-input-error' : ''}`}
                  />
                  {formErrors.due_date && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#EF4444' }}>Please select due date</p>}
                </div>

                <div>
                  <CustomSelect
                    label="Status"
                    options={TASK_STATUSES}
                    value={formData.status}
                    onChange={val => setFormData(prev => ({ ...prev, status: val }))}
                    placeholder="Select Status"
                    searchable={false}
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description <span className="text-red-500">*</span></label>
                  <textarea
                    value={formData.description}
                    onChange={e => {
                      setFormData({ ...formData, description: e.target.value });
                      if (formErrors.description) setFormErrors(prev => ({ ...prev, description: false }));
                    }}
                    placeholder="Enter detailed task instructions and acceptance criteria..."
                    style={{ height: '90px' }}
                    className={`task-modal-textarea ${formErrors.description ? 'task-modal-input-error' : ''}`}
                  />
                  {formErrors.description && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#EF4444' }}>Please enter task description</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">{submitting ? 'Saving...' : 'Save Task'}</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
