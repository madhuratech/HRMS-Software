import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, ChevronLeft, ChevronRight, ChevronDown, Calendar, X, Trash2 } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { apiFetch, formatDate, getInitials } from '../../lib/api';

const STATUS_S = { Approved:{ bg:'#DCFCE7', color:'#15803D' }, Pending:{ bg:'#FEF3C7', color:'#D97706' }, Rejected:{ bg:'#FEE2E2', color:'#DC2626' } };
const AVATAR   = [{ bg:'#DBEAFE', c:'#1D4ED8' },{ bg:'#FCE7F3', c:'#9D174D' },{ bg:'#D1FAE5', c:'#065F46' },{ bg:'#FEF3C7', c:'#92400E' },{ bg:'#EDE9FE', c:'#5B21B6' }];

const Sel = ({ children, value, onChange }) => <div style={{ position:'relative' }}><select value={value} onChange={onChange} style={{ appearance:'none', WebkitAppearance:'none', height:38, paddingLeft:12, paddingRight:28, background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, color:'#374151', cursor:'pointer', outline:'none' }}>{children}</select><ChevronDown size={13} color="#9CA3AF" style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} /></div>;

const KpiCard = ({ label, value, unit, iconBg, iconColor, icon, up }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', padding:'16px 20px', flex:'1 1 0', minWidth:120 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}><span style={{ width:30, height:30, borderRadius:8, background:iconBg, color:iconColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>{icon}</span><span style={{ fontSize:12, fontWeight:500, color:'#6B7280' }}>{label}</span></div>
    <div style={{ display:'flex', alignItems:'baseline', gap:4 }}><span style={{ fontSize:26, fontWeight:700, color:'#111827' }}>{value}</span><span style={{ fontSize:12, color:'#6B7280' }}>{unit}</span></div>
  </div>
);

const inputStyle = { width: '100%', height: 42, padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', background: '#fff' };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

const weekRange = () => {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const monday = new Date(now); monday.setDate(now.getDate() - day);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  const iso = d => d.toISOString().slice(0, 10);
  return { week_start: iso(monday), week_end: iso(sunday) };
};

export default function Timesheets() {
  const { addToast } = useToast();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ totalHours:0, billableHours:0, nonBillableHours:0, pendingCount:0 });
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '', project_id: '', log_date: '', hours: '', billable: 'Billable',
    task_description: '', status: 'Pending',
  });

  const buildQuery = useCallback(() => {
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (employeeFilter) q.set('employee_id', employeeFilter);
    if (projectFilter) q.set('project_id', projectFilter);
    if (statusFilter) q.set('status', statusFilter);
    if (period === 'monthly') q.set('month', new Date().toISOString().slice(0, 7));
    if (period === 'weekly') { const w = weekRange(); q.set('week_start', w.week_start); q.set('week_end', w.week_end); }
    q.set('page', String(page));
    q.set('limit', String(limit));
    return q.toString();
  }, [search, employeeFilter, projectFilter, statusFilter, period, page]);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await apiFetch('/projects/meta');
      if (res.success && res.data) {
        setProjects(res.data.projects || []);
        setEmployees(res.data.employees || []);
      }
    } catch (err) { console.error('Failed to load timesheet meta:', err); }
  }, []);

  const fetchTimesheets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/timesheets?${buildQuery()}`);
      if (res.success && res.data) {
        setRows(res.data.timesheets || []);
        setTotal(res.data.total || 0);
      } else {
        addToast(res.message || 'Failed to fetch timesheets', 'error');
      }
    } catch (err) {
      addToast('Error connecting to backend server', 'error');
    } finally {
      setLoading(false);
    }
  }, [buildQuery, addToast]);

  const fetchSummary = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (employeeFilter) q.set('employee_id', employeeFilter);
      if (projectFilter) q.set('project_id', projectFilter);
      if (period === 'monthly') q.set('month', new Date().toISOString().slice(0, 7));
      if (period === 'weekly') { const w = weekRange(); q.set('week_start', w.week_start); q.set('week_end', w.week_end); }
      const res = await apiFetch(`/timesheets/summary?${q.toString()}`);
      if (res.success && res.data) setSummary(res.data);
    } catch (err) { console.error('Failed to fetch timesheet summary:', err); }
  }, [employeeFilter, projectFilter, period]);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);
  useEffect(() => { fetchTimesheets(); }, [fetchTimesheets]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  useEffect(() => { setPage(1); }, [search, employeeFilter, projectFilter, statusFilter, period]);

  const openLogTime = () => {
    setEditingId(null);
    setFormData({ employee_id:'', project_id:'', log_date:'', hours:'', billable:'Billable', task_description:'', status:'Pending' });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditingId(r.id);
    setFormData({
      employee_id: String(r.employee_id || ''),
      project_id: String(r.project_id || ''),
      log_date: r.log_date ? r.log_date.slice(0,10) : '',
      hours: r.hours,
      billable: r.billable === 'Billable' ? 'Billable' : 'Non-Billable',
      task_description: r.task_description || '',
      status: r.status || 'Pending'
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.project_id || !formData.hours) {
      addToast('Employee, Project and Hours are required', 'error');
      return;
    }
    const payload = {
      employee_id: parseInt(formData.employee_id),
      project_id: parseInt(formData.project_id),
      log_date: formData.log_date,
      hours: parseFloat(formData.hours),
      billable: formData.billable,
      status: formData.status,
      task_description: formData.task_description
    };
    try {
      const res = await apiFetch(editingId ? `/timesheets/${editingId}` : '/timesheets', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        addToast(editingId ? 'Timesheet updated successfully!' : 'Time logged successfully!', 'success');
        setShowModal(false);
        fetchTimesheets();
        fetchSummary();
      } else {
        const msg = Array.isArray(res.errors) ? res.errors.join(', ') : (res.message || 'Failed to save timesheet');
        addToast(msg, 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete timesheet entry for ${r.employee_name} (${r.hours}h)?`)) return;
    try {
      const res = await apiFetch(`/timesheets/${r.id}`, { method: 'DELETE' });
      if (res.success) {
        addToast('Timesheet deleted successfully!', 'success');
        fetchTimesheets();
        fetchSummary();
      } else {
        addToast(res.message || 'Failed to delete timesheet', 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const periodLabel = period === 'weekly'
    ? `${formatDate(weekRange().week_start)} - ${formatDate(weekRange().week_end)}`
    : `${new Date().toLocaleDateString('en-US', { month:'long', year:'numeric' })}`;

  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", width:'100%', boxSizing:'border-box' }}>

      {/* ── LOG TIME MODAL ── */}
      {showModal && (
        <>
          <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.45)', zIndex:1000 }} onClick={() => setShowModal(false)} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, maxWidth:'92vw', maxHeight:'90vh', background:'#fff', borderRadius:16, zIndex:1001, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ padding:'24px 32px', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div>
                <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:'#0A1629' }}>{editingId ? 'Edit Timesheet' : 'Log Time'}</h2>
                <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748B' }}>Record time spent on a project task.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width:36, height:36, borderRadius:8, border:'none', background:'#F1F5F9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={18} color="#64748B" /></button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>
              <form id="timesheetForm" onSubmit={handleSave}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
                  <div>
                    <label style={labelStyle}>Employee <span style={{ color:'#EF4444' }}>*</span></label>
                    <select style={inputStyle} value={formData.employee_id} onChange={e => setFormData(p=>({...p,employee_id:e.target.value}))} required>
                      <option value="">Select Employee</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Project <span style={{ color:'#EF4444' }}>*</span></label>
                    <select style={inputStyle} value={formData.project_id} onChange={e => setFormData(p=>({...p,project_id:e.target.value}))} required>
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.project_name || p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" style={inputStyle} value={formData.log_date} onChange={e => setFormData(p=>({...p,log_date:e.target.value}))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Hours Logged <span style={{ color:'#EF4444' }}>*</span></label>
                    <input type="number" min="0.5" max="24" step="0.5" style={inputStyle} placeholder="e.g. 8" value={formData.hours} onChange={e => setFormData(p=>({...p,hours:e.target.value}))} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Billable Type</label>
                    <select style={inputStyle} value={formData.billable} onChange={e => setFormData(p=>({...p,billable:e.target.value}))}>
                      <option>Billable</option>
                      <option>Non-Billable</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Approval Status</label>
                    <select style={inputStyle} value={formData.status} onChange={e => setFormData(p=>({...p,status:e.target.value}))}>
                      <option>Pending</option>
                      <option>Approved</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                  <div style={{ gridColumn:'1 / -1' }}>
                    <label style={labelStyle}>Task Description</label>
                    <textarea style={{ ...inputStyle, height:80, padding:'10px 12px', resize:'vertical' }} placeholder="Describe the work done..." value={formData.task_description} onChange={e => setFormData(p=>({...p,task_description:e.target.value}))} />
                  </div>
                </div>
              </form>
            </div>
            <div style={{ padding:'20px 32px', borderTop:'1px solid #E5E7EB', display:'flex', justifyContent:'flex-end', gap:12, flexShrink:0 }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ height:42, padding:'0 24px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:14, fontWeight:600, color:'#374151', background:'#fff', cursor:'pointer' }}>Cancel</button>
              <button type="submit" form="timesheetForm" style={{ height:42, padding:'0 28px', background:'#2563EB', border:'none', borderRadius:8, fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer' }}>{editingId ? 'Save Timesheet' : 'Log Time'}</button>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#111827' }}>Timesheets</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#6B7280' }}>Track time logged by team members</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <button style={{ display:'flex', alignItems:'center', gap:6, height:38, padding:'0 14px', background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, color:'#374151', cursor:'pointer' }}><Calendar size={14}/> {periodLabel}</button>
          <Sel value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="all">All Time</option>
            <option value="monthly">This Month</option>
            <option value="weekly">This Week</option>
          </Sel>
          <Sel value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)}>
            <option value="">All Employees</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </Sel>
          <Sel value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.project_name || p.name}</option>)}
          </Sel>
          <button onClick={openLogTime} style={{ height:38, padding:'0 16px', background:'#2563EB', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Plus size={14}/> Log Time</button>
        </div>
      </div>

      <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
        <KpiCard label="Total Hours"      value={summary.totalHours} unit="h" iconBg="#DBEAFE" iconColor="#2563EB" icon="⏱" />
        <KpiCard label="Billable Hours"   value={summary.billableHours} unit="h" iconBg="#DCFCE7" iconColor="#16A34A" icon="💰" />
        <KpiCard label="Non-Billable Hrs" value={summary.nonBillableHours} unit="h" iconBg="#FEF3C7" iconColor="#D97706" icon="📋" />
        <KpiCard label="Pending Approval" value={summary.pendingCount} unit="" iconBg="#FEE2E2" iconColor="#DC2626" icon="⚠" />
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
        <input
          placeholder="Search employee, project or task..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width:280, height:36, fontSize:13 }}
        />
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
              {loading && (
                <tr><td colSpan={7} style={{ padding:'20px', textAlign:'center', fontSize:13, color:'#6B7280' }}>Loading timesheets...</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={7} style={{ padding:'20px', textAlign:'center', fontSize:13, color:'#6B7280' }}>No timesheet entries found</td></tr>
              )}
              {!loading && rows.map((r, i) => {
                const av = AVATAR[i % AVATAR.length];
                return (
                  <tr key={r.id} style={{ height:54, borderBottom:'1px solid #F3F4F6' }}>
                    <td style={{ padding:'0 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:av.bg, color:av.c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, flexShrink:0 }}>{getInitials(r.employee_name)}</div>
                        <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{r.employee_name || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding:'0 16px', fontSize:13, color:'#374151' }}>{r.project_name || '—'}</td>
                    <td style={{ padding:'0 16px', fontSize:13, color:'#374151' }}>{formatDate(r.log_date)}</td>
                    <td style={{ padding:'0 16px', fontSize:13, fontWeight:600, color:'#111827' }}>{r.hours}h</td>
                    <td style={{ padding:'0 16px' }}>
                      <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:999, background: r.billable==='Billable'?'#DCFCE7':'#F3F4F6', color: r.billable==='Billable'?'#15803D':'#6B7280', fontSize:11, fontWeight:600 }}>{r.billable}</span>
                    </td>
                    <td style={{ padding:'0 16px' }}>
                      <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:999, background:STATUS_S[r.status]?.bg || '#F3F4F6', color:STATUS_S[r.status]?.color || '#6B7280', fontSize:11, fontWeight:600 }}>{r.status}</span>
                    </td>
                    <td style={{ padding:'0 16px' }}>
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={() => openEdit(r)} style={{ width:26,height:26,borderRadius:5,border:'none',background:'transparent',color:'#2563EB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='#EFF6FF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Edit2 size={12}/></button>
                        <button onClick={() => handleDelete(r)} style={{ width:26,height:26,borderRadius:5,border:'none',background:'transparent',color:'#DC2626',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='#FEE2E2'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Trash2 size={12}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'12px 20px', borderTop:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, color:'#6B7280' }}>Showing {(page-1)*limit+1} to {Math.min(page*limit, total)} of {total} entries</span>
          <div style={{ display:'flex', gap:4 }}>
            <button onClick={() => page > 1 && setPage(page-1)} style={{ width:28,height:28,borderRadius:5,border:'1px solid #E5E7EB',background:'#fff',color:'#6B7280',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><ChevronLeft size={12}/></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map(pg => {
              const a = pg === page;
              return <button key={pg} onClick={() => setPage(pg)} style={{ width:28,height:28,borderRadius:5,border:a?'none':'1px solid #E5E7EB',background:a?'#2563EB':'#fff',color:a?'#fff':'#374151',fontWeight:a?600:500,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{pg}</button>;
            })}
            <button onClick={() => page < totalPages && setPage(page+1)} style={{ width:28,height:28,borderRadius:5,border:'1px solid #E5E7EB',background:'#fff',color:'#6B7280',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><ChevronRight size={12}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}