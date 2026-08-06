import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Link2, ChevronLeft, ChevronRight, ChevronDown, X, Trash2 } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { apiFetch, formatDate, getInitials } from '../../lib/api';

const STATUS_S   = { 'In Progress':{ bg:'#DBEAFE', color:'#1D4ED8' }, 'Completed':{ bg:'#DCFCE7', color:'#15803D' }, 'On Hold':{ bg:'#FEF3C7', color:'#D97706' }, 'Overdue':{ bg:'#FEE2E2', color:'#DC2626' }, 'Not Started':{ bg:'#F3F4F6', color:'#6B7280' }, 'Planning':{ bg:'#EDE9FE', color:'#5B21B6' } };
const PRIORITY_S = { 'High':{ bg:'#FEE2E2', color:'#DC2626' }, 'Medium':{ bg:'#FEF3C7', color:'#D97706' }, 'Low':{ bg:'#DCFCE7', color:'#15803D' } };
const AVATAR     = [{ bg:'#DBEAFE', c:'#1D4ED8' },{ bg:'#FCE7F3', c:'#9D174D' },{ bg:'#D1FAE5', c:'#065F46' },{ bg:'#FEF3C7', c:'#92400E' },{ bg:'#EDE9FE', c:'#5B21B6' },{ bg:'#FEE2E2', c:'#991B1B' },{ bg:'#E0E7FF', c:'#3730A3' },{ bg:'#FECACA', c:'#7F1D1D' }];

const pill = (label, map) => { const s = map[label] || { bg:'#F3F4F6', color:'#6B7280' }; return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:999, background:s.bg, color:s.color, fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>{label}</span>; };

const Sel = ({ children }) => (
  <div style={{ position:'relative' }}>
    <select style={{ appearance:'none', WebkitAppearance:'none', height:38, paddingLeft:12, paddingRight:30, background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, color:'#374151', cursor:'pointer', outline:'none' }}>{children}</select>
    <ChevronDown size={13} color="#9CA3AF" style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
  </div>
);

const buildPages = (current, total) => {
  if (total <= 1) return [1];
  const pages = [1];
  for (let p = current - 1; p <= current + 1; p++) {
    if (p > 1 && p < total) pages.push(p);
  }
  if (total > 1) pages.push(total);
  const out = [];
  let prev = 0;
  pages.forEach(p => {
    if (p - prev > 1) out.push('...');
    out.push(p);
    prev = p;
  });
  return out;
};

export default function Projects() {
  const { addToast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [meta, setMeta] = useState({ employees: [], departments: [], projects: [] });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

  const [formData, setFormData] = useState({
    project_name: '',
    project_code: '',
    client: '',
    project_manager_id: '',
    team_members: [],
    start_date: '',
    end_date: '',
    budget: '',
    priority: 'Medium',
    status: 'In Progress',
    description: ''
  });


  useEffect(() => { setPage(1); }, [search, statusFilter, deptFilter]);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await apiFetch('/projects/meta');
      if (res.success && res.data) setMeta(res.data);
    } catch (err) {
      console.error('Failed to load project meta:', err);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setLoaded(false);
    try {
      let url = `/projects?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      if (deptFilter) url += `&department_id=${deptFilter}`;
      const res = await apiFetch(url);
      if (res.success && res.data) {
        setProjectsList(res.data.projects || []);
        setTotal(res.data.total || 0);
        setTimeout(() => setLoaded(true), 150);
      } else {
        addToast(res.message || 'Failed to fetch projects', 'error');
      }
    } catch (err) {
      addToast('Error connecting to backend server', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, deptFilter, addToast]);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);
  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ project_name:'', project_code:'', client:'', project_manager_id:'', team_members:[], start_date:'', end_date:'', budget:'', priority:'Medium', status:'In Progress', description:'' });
    setShowAddModal(true);
  };

  const openEdit = async (project) => {
    setEditingId(project.id);
    const teamIds = (project.team_members || []).map(t => t.employee_id);
    setFormData({
      project_name: project.project_name,
      project_code: project.project_code,
      client: project.client || '',
      project_manager_id: String(project.project_manager_id || ''),
      team_members: teamIds,
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget || '',
      priority: project.priority || 'Medium',
      status: project.status || 'In Progress',
      description: project.description || ''
    });
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.project_name || !formData.project_code || !formData.project_manager_id) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    setSubmitting(true);
    const payload = {
      project_name: formData.project_name.trim(),
      project_code: formData.project_code.trim(),
      client: formData.client.trim(),
      project_manager_id: parseInt(formData.project_manager_id),
      team_members: (formData.team_members || []).map(Number),
      start_date: formData.start_date,
      end_date: formData.end_date,
      budget: formData.budget,
      priority: formData.priority,
      status: formData.status,
      description: formData.description.trim()
    };
    try {
      const res = await apiFetch(editingId ? `/projects/${editingId}` : '/projects', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        addToast(editingId ? 'Project updated successfully!' : 'Project created successfully!', 'success');
        setShowAddModal(false);
        fetchProjects();
      } else {
        const msg = Array.isArray(res.errors) ? res.errors.join(', ') : (res.message || 'Failed to save project');
        addToast(msg, 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.project_name}"?`)) return;
    try {
      const res = await apiFetch(`/projects/${project.id}`, { method: 'DELETE' });
      if (res.success) {
        addToast('Project deleted successfully!', 'success');
        fetchProjects();
      } else {
        addToast(res.message || 'Failed to delete project', 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    }
  };

  const selectedManager = meta.employees.find(e => e.id === parseInt(formData.project_manager_id));
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", width:'100%', boxSizing:'border-box' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#111827' }}>Projects</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'#6B7280' }}>Manage and track all projects</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <div style={{ position:'relative' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ appearance:'none', WebkitAppearance:'none', height:38, paddingLeft:12, paddingRight:30, background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, color:'#374151', cursor:'pointer', outline:'none' }}>
              <option value="">All Status</option>
              {(['Not Started','Planning','In Progress','On Hold','Overdue','Completed']).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={13} color="#9CA3AF" style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
          </div>
          <div style={{ position:'relative' }}>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ appearance:'none', WebkitAppearance:'none', height:38, paddingLeft:12, paddingRight:30, background:'#fff', border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, color:'#374151', cursor:'pointer', outline:'none' }}>
              <option value="">All Departments</option>
              {meta.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <ChevronDown size={13} color="#9CA3AF" style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
          </div>
          <div style={{ position:'relative' }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', pointerEvents:'none' }} />
            <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ height:38, paddingLeft:30, paddingRight:12, border:'1px solid #E5E7EB', borderRadius:8, fontSize:13, outline:'none', background:'#fff', width:180 }} />
          </div>
          <button onClick={openAdd} style={{ height:38, padding:'0 16px', background:'#2563EB', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Plus size={14} /> Add Project</button>
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          {loading && <div style={{ padding:20, textAlign:'center', fontSize:13, color:'#6B7280' }}>Loading projects...</div>}
          {!loading && projectsList.length === 0 && <div style={{ padding:20, textAlign:'center', fontSize:13, color:'#6B7280' }}>No projects found.</div>}
          {!loading && projectsList.length > 0 && (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #E5E7EB' }}>
                {['Project Name','Project Code','Project Manager','Department','Start Date','End Date','Progress','Status','Priority','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:12, fontWeight:500, color:'#6B7280', whiteSpace:'nowrap', background:'#FAFAFA' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projectsList.map((r, i) => {
                const av = AVATAR[i % AVATAR.length];
                return (
                  <tr key={r.id} style={{ height:56, borderBottom:'1px solid #F3F4F6' }}>
                    <td style={{ padding:'0 14px', fontSize:13, fontWeight:600, color:'#111827' }}>{r.project_name}</td>
                    <td style={{ padding:'0 14px', fontSize:12, fontWeight:600, color:'#6B7280', fontFamily:'monospace' }}>{r.project_code}</td>
                    <td style={{ padding:'0 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', background:av.bg, color:av.c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, flexShrink:0 }}>{getInitials(r.project_manager_name)}</div>
                        <span style={{ fontSize:13, color:'#374151', whiteSpace:'nowrap' }}>{r.project_manager_name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'0 14px', fontSize:13, color:'#374151' }}>{r.department_name}</td>
                    <td style={{ padding:'0 14px', fontSize:13, color:'#374151', whiteSpace:'nowrap' }}>{formatDate(r.start_date)}</td>
                    <td style={{ padding:'0 14px', fontSize:13, color:'#374151', whiteSpace:'nowrap' }}>{formatDate(r.end_date)}</td>
                    <td style={{ padding:'0 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:100 }}>
                        <div style={{ flex:1, height:5, borderRadius:999, background:'#E5E7EB', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:loaded?`${r.pct}%`:'0%', background: r.pct===100?'#10B981':r.status==='Overdue'?'#EF4444':'#2563EB', borderRadius:999, transition:'width 900ms ease' }} />
                        </div>
                        <span style={{ fontSize:11, fontWeight:600, color:'#374151', minWidth:28 }}>{r.pct || 0}%</span>
                      </div>
                    </td>
                    <td style={{ padding:'0 14px' }}>{pill(r.status, STATUS_S)}</td>
                    <td style={{ padding:'0 14px' }}>{pill(r.priority, PRIORITY_S)}</td>
                    <td style={{ padding:'0 14px' }}>
                      <div style={{ display:'flex', gap:4 }}>
                        <button style={{ width:28, height:28, borderRadius:6, border:'none', background:'transparent', color:'#2563EB', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='#EFF6FF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'} onClick={() => openEdit(r)}><Edit2 size={13} /></button>
                        <button style={{ width:28, height:28, borderRadius:6, border:'none', background:'transparent', color:'#94A3B8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='#FEF2F2'} onMouseLeave={e=>e.currentTarget.style.background='transparent'} onClick={() => handleDelete(r)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
        <div style={{ padding:'12px 20px', borderTop:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, color:'#6B7280' }}>Showing {startIndex} to {endIndex} of {total} entries</span>
          <div style={{ display:'flex', gap:4 }}>
            {[null, ...buildPages(page, totalPages), null].map((pg,i) => {
              if(pg===null){ const isL=i===0; return <button key={i} onClick={() => { (isL ? page>1 : page<totalPages) && setPage(isL ? page-1 : page+1); }} disabled={(isL?page<=1:page>=totalPages)} style={{ width:28,height:28,borderRadius:5,border:'1px solid #E5E7EB',background:'#fff',color:(isL?page<=1:page>=totalPages)?'#D1D5DB':'#6B7280',cursor:(isL?page<=1:page>=totalPages)?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{isL?<ChevronLeft size={12}/>:<ChevronRight size={12}/>}</button>; }
              if(pg==='...') return <span key={i} style={{ width:28,textAlign:'center',color:'#6B7280',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center' }}>...</span>;
              const a=pg===page; return <button key={i} onClick={()=>setPage(pg)} style={{ width:28,height:28,borderRadius:5,border:a?'none':'1px solid #E5E7EB',background:a?'#2563EB':'#fff',color:a?'#fff':'#374151',fontWeight:a?600:500,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>{pg}</button>;
            })}
          </div>
        </div>
      </div>

      {showAddModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowAddModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw', maxHeight: '90vh' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">{editingId ? 'Edit Project' : 'Add Project'}</h2>
                <p className="text-sm text-slate-500 mt-1">Initialize a new project, assign project manager and budget parameters.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.project_name} onChange={e => setFormData({ ...formData, project_name: e.target.value })} placeholder="e.g. HRM Enterprise Software" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Code <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.project_code} onChange={e => setFormData({ ...formData, project_code: e.target.value })} placeholder="e.g. PRJ-009" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} placeholder="e.g. Acme Corporation" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Manager <span className="text-red-500">*</span></label>
                  <select required value={formData.project_manager_id} onChange={e => setFormData({ ...formData, project_manager_id: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Select Manager</option>
                    {meta.employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} (EMP{String(emp.id).padStart(3, '0')})</option>
                    ))}
                  </select>
                </div>
                {selectedManager && (
                  <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                    <div><strong>Department:</strong> {selectedManager.department_name}</div>
                    <div><strong>Designation:</strong> {selectedManager.designation_name}</div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">End Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Budget (₹) <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} placeholder="e.g. ₹ 25,00,000" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Planning">Planning</option>
                    <option value="Not Started">Not Started</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Team Members</label>
                  <select multiple size={4} value={formData.team_members} onChange={e => setFormData({ ...formData, team_members: Array.from(e.target.selectedOptions, o => o.value) })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    {meta.employees.filter(emp => emp.id !== parseInt(formData.project_manager_id)).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} — {emp.department_name} ({emp.designation_name})</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple team members.</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description <span className="text-red-500">*</span></label>
                  <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Project objectives and technical scope..." style={{ height: '90px' }} className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">{submitting ? 'Saving...' : (editingId ? 'Save Project' : 'Save Project')}</button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}