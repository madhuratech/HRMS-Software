import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Link2, ChevronLeft, ChevronRight, ChevronDown, X, Trash2 } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { apiFetch, formatDate, getInitials } from '../../lib/api';
import { guardCreateAction, requireActionPermission, hasPermission } from '../../lib/permissions';

const STATUS_S = { 'In Progress': { bg: '#DBEAFE', color: '#1D4ED8' }, 'Completed': { bg: '#DCFCE7', color: '#15803D' }, 'On Hold': { bg: '#FEF3C7', color: '#D97706' }, 'Overdue': { bg: '#FEE2E2', color: '#DC2626' }, 'Not Started': { bg: '#F3F4F6', color: '#6B7280' }, 'Planning': { bg: '#EDE9FE', color: '#5B21B6' } };
const PRIORITY_S = { 'High': { bg: '#FEE2E2', color: '#DC2626' }, 'Medium': { bg: '#FEF3C7', color: '#D97706' }, 'Low': { bg: '#DCFCE7', color: '#15803D' } };
const AVATAR = [{ bg: '#DBEAFE', c: '#1D4ED8' }, { bg: '#FCE7F3', c: '#9D174D' }, { bg: '#D1FAE5', c: '#065F46' }, { bg: '#FEF3C7', c: '#92400E' }, { bg: '#EDE9FE', c: '#5B21B6' }, { bg: '#FEE2E2', c: '#991B1B' }, { bg: '#E0E7FF', c: '#3730A3' }, { bg: '#FECACA', c: '#7F1D1D' }];

const pill = (label, map) => { const s = map[label] || { bg: '#F3F4F6', color: '#6B7280' }; return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>; };

const Sel = ({ children }) => (
  <div style={{ position: 'relative' }}>
    <select style={{ appearance: 'none', WebkitAppearance: 'none', height: 38, paddingLeft: 12, paddingRight: 30, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none' }}>{children}</select>
    <ChevronDown size={13} color="#9CA3AF" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
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
  }); const [accessDenied, setAccessDenied] = useState(false);

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
    setAccessDenied(false);
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
        if ((res.message || '').toLowerCase().includes('forbidden') || res.status === 403) {
          setAccessDenied(true);
        } else {
          addToast(res.message || 'Failed to fetch projects', 'error');
        }
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
    if (!requireActionPermission('projects', 'projects_list', 'create', null, addToast, 'You do not have permission to create a project. Please contact your administrator.')) {
      return;
    }
    setEditingId(null);
    setFormData({ project_name: '', project_code: '', client: '', project_manager_id: '', team_members: [], start_date: '', end_date: '', budget: '', priority: 'Medium', status: 'In Progress', description: '' });
    setShowAddModal(true);
  };

  const openEdit = async (project) => {
    if (!requireActionPermission('projects', 'projects_list', 'edit', null, addToast, 'You do not have permission to edit this project. Please contact your administrator.')) {
      return;
    }
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
    const actNeeded = editingId ? 'edit' : 'create';
    if (!requireActionPermission('projects', 'projects_list', actNeeded, null, addToast, `You do not have permission to ${actNeeded} a project. Please contact your administrator.`)) {
      return;
    }
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
    if (!requireActionPermission('projects', 'projects_list', 'delete', null, addToast, 'You do not have permission to delete this project. Please contact your administrator.')) {
      return;
    }
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

  // Filter out Super Admin / MD from being listed as regular team members
  const nonAdminEmployees = meta.employees.filter(emp => {
    const nameLower = (emp.name || '').toLowerCase();
    const roleKeyLower = (emp.role_key || '').toLowerCase();
    const desgLower = (emp.designation_name || '').toLowerCase();

    if (nameLower.includes('super admin') || roleKeyLower === 'super_admin' || (nameLower.includes('admin') && desgLower.includes('staff'))) {
      return false;
    }
    return true;
  });

  const teamLeaders = nonAdminEmployees.filter(emp => {
    const des = (emp.designation_name || '').toLowerCase();
    const rName = (emp.role_name || '').toLowerCase();
    const rKey = (emp.role_key || '').toLowerCase();
    return des.includes('lead') || des.includes('manager') ||
      rName.includes('lead') || rName.includes('manager') ||
      rKey.includes('team_leader') || rKey.includes('manager');
  });
  const managerOptions = teamLeaders.length > 0 ? teamLeaders : nonAdminEmployees;
  const selectedManager = meta.employees.find(e => e.id === parseInt(formData.project_manager_id));

  // Team Members: Filter strictly for selected Team Leader's team or department
  const teamMembersOptions = nonAdminEmployees.filter(emp => {
    if (emp.id === parseInt(formData.project_manager_id)) return false;
    if (!selectedManager) return true;

    if (selectedManager.team_id && emp.team_id) {
      return emp.team_id === selectedManager.team_id;
    }
    if (selectedManager.department_id && emp.department_id) {
      return emp.department_id === selectedManager.department_id;
    }
    return false;
  });

  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Projects</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Manage and track all projects</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', height: 38, paddingLeft: 12, paddingRight: 30, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none' }}>
              <option value="">All Status</option>
              {(['Not Started', 'Planning', 'In Progress', 'On Hold', 'Overdue', 'Completed']).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={13} color="#9CA3AF" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', height: 38, paddingLeft: 12, paddingRight: 30, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none' }}>
              <option value="">All Departments</option>
              {meta.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <ChevronDown size={13} color="#9CA3AF" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
            <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ height: 38, paddingLeft: 30, paddingRight: 12, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', width: 180 }} />
          </div>
          {hasPermission(null, null, 'projects', 'projects_list', 'create') && (
            <button onClick={openAdd} style={{ height: 38, padding: '0 16px', background: '#2563EB', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> Add Project</button>
          )}
        </div>
      </div>

      {accessDenied && (
        <div style={{ padding: 30, textAlign: 'center', background: '#FEF2F2', borderRadius: 12, border: '1px solid #FCA5A5', color: '#991B1B', margin: '20px 0' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Access Denied</h3>
          <p style={{ fontSize: 13 }}>You do not have permission to view the Projects module. Please contact your administrator if you require access.</p>
        </div>
      )}

      {!accessDenied && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.05)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            {loading && <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>Loading projects...</div>}
            {!loading && projectsList.length === 0 && <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>No projects found.</div>}
            {!loading && projectsList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    {['Project Name', 'Project Code', 'Project Manager', 'Department', 'Start Date', 'End Date', 'Progress', 'Status', 'Priority', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#6B7280', whiteSpace: 'nowrap', background: '#FAFAFA' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projectsList.map((r, i) => {
                    const av = AVATAR[i % AVATAR.length];
                    return (
                      <tr key={r.id} style={{ height: 56, borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '0 14px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.project_name}</td>
                        <td style={{ padding: '0 14px', fontSize: 12, fontWeight: 600, color: '#6B7280', fontFamily: 'monospace' }}>{r.project_code}</td>
                        <td style={{ padding: '0 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: av.bg, color: av.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{getInitials(r.project_manager_name)}</div>
                            <span style={{ fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.project_manager_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0 14px', fontSize: 13, color: '#374151' }}>{r.department_name}</td>
                        <td style={{ padding: '0 14px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{formatDate(r.start_date)}</td>
                        <td style={{ padding: '0 14px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{formatDate(r.end_date)}</td>
                        <td style={{ padding: '0 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
                            <div style={{ flex: 1, height: 5, borderRadius: 999, background: '#E5E7EB', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: loaded ? `${r.pct}%` : '0%', background: r.pct === 100 ? '#10B981' : r.status === 'Overdue' ? '#EF4444' : '#2563EB', borderRadius: 999, transition: 'width 900ms ease' }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', minWidth: 28 }}>{r.pct || 0}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '0 14px' }}>{pill(r.status, STATUS_S)}</td>
                        <td style={{ padding: '0 14px' }}>{pill(r.priority, PRIORITY_S)}</td>
                        <td style={{ padding: '0 14px' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => openEdit(r)}><Edit2 size={13} /></button>
                            <button style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => handleDelete(r)}><Trash2 size={13} /></button>
                          </div>
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
                if (pg === null) { const isL = i === 0; return <button key={i} onClick={() => { (isL ? page > 1 : page < totalPages) && setPage(isL ? page - 1 : page + 1); }} disabled={(isL ? page <= 1 : page >= totalPages)} style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid #E5E7EB', background: '#fff', color: (isL ? page <= 1 : page >= totalPages) ? '#D1D5DB' : '#6B7280', cursor: (isL ? page <= 1 : page >= totalPages) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isL ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}</button>; }
                if (pg === '...') return <span key={i} style={{ width: 28, textAlign: 'center', color: '#6B7280', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</span>;
                const a = pg === page; return <button key={i} onClick={() => setPage(pg)} style={{ width: 28, height: 28, borderRadius: 5, border: a ? 'none' : '1px solid #E5E7EB', background: a ? '#2563EB' : '#fff', color: a ? '#fff' : '#374151', fontWeight: a ? 600 : 500, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pg}</button>;
              })}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (editingId ? hasPermission(null, null, 'projects', 'projects_list', 'edit') : hasPermission(null, null, 'projects', 'projects_list', 'create')) && (
        <>
          <div 
            onClick={() => setShowAddModal(false)} 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 1000,
              animation: 'fadeIn 0.2s ease-out'
            }} 
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '900px',
            maxWidth: '92vw',
            maxHeight: '90vh',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              color: '#ffffff'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, letterSpacing: '-0.025em' }}>
                  {editingId ? 'Edit Project Details' : 'Create New Project'}
                </h2>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                  Set up your project details, assign a project manager and select team members.
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* Basic Details Section */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    1. Basic Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                        Project Name <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={formData.project_name} 
                        onChange={e => setFormData({ ...formData, project_name: e.target.value })} 
                        placeholder="e.g. HRM Enterprise Software" 
                        style={{ width: '100%', height: '44px', padding: '0 16px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '14px', color: '#1E293B', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = '#3B82F6'}
                        onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                        Project Code <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={formData.project_code} 
                        onChange={e => setFormData({ ...formData, project_code: e.target.value })} 
                        placeholder="e.g. PRJ-009" 
                        style={{ width: '100%', height: '44px', padding: '0 16px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '14px', color: '#1E293B', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = '#3B82F6'}
                        onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                        Client <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={formData.client} 
                        onChange={e => setFormData({ ...formData, client: e.target.value })} 
                        placeholder="e.g. Acme Corporation" 
                        style={{ width: '100%', height: '44px', padding: '0 16px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '14px', color: '#1E293B', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = '#3B82F6'}
                        onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                      />
                    </div>
                  </div>
                </div>

                {/* Team Allocation Section */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    2. Team Allocation & Role Assignment
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    
                    {/* Project Manager Selection */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                        Project Manager / Team Leader <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select 
                          required 
                          value={formData.project_manager_id} 
                          onChange={e => setFormData({ ...formData, project_manager_id: e.target.value })} 
                          style={{ width: '100%', height: '44px', padding: '0 40px 0 16px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '14px', color: '#1E293B', outline: 'none', appearance: 'none', WebkitAppearance: 'none', background: '#ffffff', cursor: 'pointer', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                          onFocus={e => e.target.style.borderColor = '#3B82F6'}
                          onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                        >
                          <option value="">Select Project Manager</option>
                          {managerOptions.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation_name || 'Team Lead'})</option>
                          ))}
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B' }} />
                      </div>
                      
                      {selectedManager && (
                        <div style={{ marginTop: '12px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0', display: 'flex', gap: '20px', fontSize: '12px', color: '#64748B' }}>
                          <div><strong>Department:</strong> {selectedManager.department_name || 'General'}</div>
                          <div><strong>Designation:</strong> {selectedManager.designation_name || 'Team Leader'}</div>
                        </div>
                      )}
                    </div>

                    {/* Custom Team Members Checklist (Avoiding congested dropdowns) */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                        Team Members {selectedManager && <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 'normal' }}>(Filtered for {selectedManager.name}'s department/team)</span>}
                      </label>
                      
                      <div style={{
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '12px',
                        background: '#ffffff',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        boxSizing: 'border-box'
                      }}>
                        {teamMembersOptions.length === 0 ? (
                          <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>
                            {selectedManager ? 'No members found under this manager\'s team.' : 'Select a Project Manager to view eligible team members.'}
                          </div>
                        ) : (
                          teamMembersOptions.map(emp => {
                            const isChecked = formData.team_members.includes(emp.id) || formData.team_members.includes(String(emp.id));
                            return (
                              <label 
                                key={emp.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '10px 12px',
                                  borderRadius: '8px',
                                  background: isChecked ? '#EFF6FF' : 'transparent',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s',
                                  userSelect: 'none'
                                }}
                                onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = '#F8FAFC'; }}
                                onMouseLeave={e => { if (!isChecked) e.currentTarget.style.background = 'transparent'; }}
                              >
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const idNum = Number(emp.id);
                                    let newMembers = [...formData.team_members];
                                    if (newMembers.includes(idNum) || newMembers.includes(String(idNum))) {
                                      newMembers = newMembers.filter(id => Number(id) !== idNum);
                                    } else {
                                      newMembers.push(idNum);
                                    }
                                    setFormData({ ...formData, team_members: newMembers });
                                  }}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    accentColor: '#2563EB',
                                    cursor: 'pointer'
                                  }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{emp.name}</span>
                                  <span style={{ fontSize: '11px', color: '#64748B' }}>{emp.designation_name || 'Staff Member'}</span>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Scheduling & Budget Section */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                    3. Schedule, Budget & Status
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                        Start Date <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input 
                        type="date" 
                        required 
                        value={formData.start_date} 
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })} 
                        style={{ width: '100%', height: '44px', padding: '0 12px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '14px', color: '#1E293B', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                        End Date <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input 
                        type="date" 
                        required 
                        value={formData.end_date} 
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })} 
                        style={{ width: '100%', height: '44px', padding: '0 12px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '14px', color: '#1E293B', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                        Budget (₹) <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={formData.budget} 
                        onChange={e => setFormData({ ...formData, budget: e.target.value })} 
                        placeholder="e.g. 25,00,000" 
                        style={{ width: '100%', height: '44px', padding: '0 16px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '14px', color: '#1E293B', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                        Priority
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select 
                          value={formData.priority} 
                          onChange={e => setFormData({ ...formData, priority: e.target.value })} 
                          style={{ width: '100%', height: '44px', padding: '0 40px 0 16px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '14px', color: '#1E293B', outline: 'none', appearance: 'none', WebkitAppearance: 'none', background: '#ffffff', cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                          <option value="High">🔴 High</option>
                          <option value="Medium">🟡 Medium</option>
                          <option value="Low">🟢 Low</option>
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                        Status
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select 
                          value={formData.status} 
                          onChange={e => setFormData({ ...formData, status: e.target.value })} 
                          style={{ width: '100%', height: '44px', padding: '0 40px 0 16px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '14px', color: '#1E293B', outline: 'none', appearance: 'none', WebkitAppearance: 'none', background: '#ffffff', cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Planning">Planning</option>
                          <option value="Not Started">Not Started</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748B' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                        Description <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <textarea 
                        required 
                        value={formData.description} 
                        onChange={e => setFormData({ ...formData, description: e.target.value })} 
                        placeholder="Define project objectives and technical scope..." 
                        style={{ width: '100%', height: '44px', minHeight: '44px', maxHeight: '120px', padding: '10px 16px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '14px', color: '#1E293B', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
                        onFocus={e => e.target.style.borderColor = '#3B82F6'}
                        onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', borderTop: '1px solid #F1F5F9', paddingTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  style={{
                    height: '44px',
                    padding: '0 24px',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#475569',
                    background: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  style={{
                    height: '44px',
                    padding: '0 28px',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    background: submitting ? '#93C5FD' : '#2563EB',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => { if(!submitting) e.currentTarget.style.background = '#1D4ED8'; }}
                  onMouseLeave={e => { if(!submitting) e.currentTarget.style.background = '#2563EB'; }}
                >
                  {submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Project')}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}