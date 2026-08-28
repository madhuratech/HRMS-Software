import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, ChevronLeft, ChevronRight, X, Trash2, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useToast } from '../ui/Toast';
import { apiFetch, getInitials } from '../../lib/api';
import { requireActionPermission, hasPermission } from '../../lib/permissions';

import CustomSelect from '../ui/CustomSelect';

const DEPT_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9', '#EC4899', '#64748B'];
const STATUS_S = { Active:{ bg:'#DCFCE7', color:'#15803D' }, 'On Leave':{ bg:'#FEF3C7', color:'#D97706' } };
const AVATAR   = [{ bg:'#DBEAFE', c:'#1D4ED8' },{ bg:'#FCE7F3', c:'#9D174D' },{ bg:'#D1FAE5', c:'#065F46' },{ bg:'#FEF3C7', c:'#92400E' },{ bg:'#EDE9FE', c:'#5B21B6' }];

const inputStyle = { width: '100%', height: 42, padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', background: '#fff' };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

const KpiCard = ({ label, value, iconBg, iconColor, icon }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', padding:'16px 20px', flex:'1 1 0', minWidth:110 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}><span style={{ width:30, height:30, borderRadius:8, background:iconBg, color:iconColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>{icon}</span><span style={{ fontSize:12, fontWeight:500, color:'#6B7280' }}>{label}</span></div>
    <div style={{ fontSize:26, fontWeight:700, color:'#111827' }}>{value}</div>
  </div>
);

export default function TeamMembers() {
  const { addToast } = useToast();
  const [members, setMembers] = useState([]);
  const [meta, setMeta] = useState({ employees: [], projects: [], roles: [] });
  const [loading, setLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '', project_id: '', role: 'Team Member', status: 'Active'
  });

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/project-team');
      if (res.success && Array.isArray(res.data)) {
        setMembers(res.data);
      } else {
        addToast(res.message || 'Failed to fetch team members', 'error');
      }
    } catch (err) {
      addToast('Error connecting to backend server', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await apiFetch('/project-team/meta');
      if (res.success && res.data) setMeta(res.data);
    } catch (err) { console.error('Failed to load team meta:', err); }
  }, []);

  useEffect(() => { fetchMembers(); fetchMeta(); }, [fetchMembers, fetchMeta]);

  const openAdd = () => {
    if (!requireActionPermission('projects', 'team_members', 'create', null, addToast, 'You do not have permission to assign team members. Please contact your administrator.')) {
      return;
    }
    setEditingId(null);
    setFormData({ employee_id:'', project_id:'', role:'Team Member', status:'Active' });
    setShowAddModal(true);
  };

  const openEdit = (m) => {
    if (!requireActionPermission('projects', 'team_members', 'edit', null, addToast, 'You do not have permission to edit team members. Please contact your administrator.')) {
      return;
    }
    setEditingId(m.id);
    setFormData({
      employee_id: String(m.employee_id || ''),
      project_id: String(m.project_id || ''),
      role: m.role || 'Team Member',
      status: m.status || 'Active'
    });
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const actNeeded = editingId ? 'edit' : 'create';
    if (!requireActionPermission('projects', 'team_members', actNeeded, null, addToast, `You do not have permission to ${actNeeded} team members. Please contact your administrator.`)) {
      return;
    }
    if (!formData.employee_id || !formData.project_id) {
      addToast('Employee and Project are required', 'error');
      return;
    }
    const payload = {
      employee_id: parseInt(formData.employee_id),
      project_id: parseInt(formData.project_id),
      role: formData.role,
      status: formData.status
    };
    try {
      const res = await apiFetch(editingId ? `/project-team/${editingId}` : '/project-team', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        addToast(editingId ? 'Team member updated successfully!' : 'Team member assigned successfully!', 'success');
        setShowAddModal(false);
        fetchMembers();
      } else {
        const msg = Array.isArray(res.errors) ? res.errors.join(', ') : (res.message || 'Failed to save team member');
        addToast(msg, 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    }
  };

  const handleRemove = async (m) => {
    if (!requireActionPermission('projects', 'team_members', 'delete', null, addToast, 'You do not have permission to remove team members. Please contact your administrator.')) {
      return;
    }
    if (!window.confirm(`Remove ${m.name} from the project team?`)) return;
    try {
      const res = await apiFetch(`/project-team/${m.id}`, { method: 'DELETE' });
      if (res.success) {
        addToast('Team member removed successfully!', 'success');
        fetchMembers();
      } else {
        addToast(res.message || 'Failed to remove team member', 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    }
  };

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Active').length;
  const onLeave = members.filter(m => m.status === 'On Leave').length;
  const totalOpenTasks = members.reduce((s, m) => s + (m.openTasks || 0), 0);

  const deptCounts = {};
  members.forEach(m => { const d = m.department || 'Other'; deptCounts[d] = (deptCounts[d] || 0) + 1; });
  const DEPT_PIE = Object.keys(deptCounts).map((name, i) => ({ name, value: deptCounts[name], color: DEPT_COLORS[i % DEPT_COLORS.length] }));

  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", width:'100%', boxSizing:'border-box' }}>

      {/* ── ADD/EDIT MEMBER MODAL ── */}
      {showAddModal && (
        <>
          <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.45)', zIndex:1000 }} onClick={() => setShowAddModal(false)} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, maxWidth:'92vw', maxHeight:'90vh', background:'#fff', borderRadius:16, zIndex:1001, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ padding:'24px 32px', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div>
                <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:'#0A1629' }}>{editingId ? 'Edit Team Member' : 'Add Team Member'}</h2>
                <p style={{ margin:'4px 0 0', fontSize:13, color:'#64748B' }}>Assign an employee to a project team.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ width:36, height:36, borderRadius:8, border:'none', background:'#F1F5F9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={18} color="#64748B" /></button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>
              <form id="memberForm" onSubmit={handleSave}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
                  <div>
                    <CustomSelect
                      label="Employee"
                      required
                      options={meta.employees.map(emp => ({ value: emp.id, label: emp.name, sublabel: emp.department_name }))}
                      value={formData.employee_id}
                      onChange={val => setFormData(p=>({...p,employee_id:val}))}
                      placeholder="Select Employee"
                    />
                  </div>
                  <div>
                    <CustomSelect
                      label="Project"
                      required
                      options={meta.projects.map(p => ({ value: p.id, label: p.name, sublabel: p.project_code }))}
                      value={formData.project_id}
                      onChange={val => setFormData(p=>({...p,project_id:val}))}
                      placeholder="Select Project"
                    />
                  </div>
                  <div>
                    <CustomSelect
                      label="Role"
                      options={(meta.roles.length ? meta.roles : ['Team Member'])}
                      value={formData.role}
                      onChange={val => setFormData(p=>({...p,role:val}))}
                      placeholder="Select Role"
                      searchable={false}
                    />
                  </div>
                  <div>
                    <CustomSelect
                      label="Status"
                      options={['Active', 'On Leave']}
                      value={formData.status}
                      onChange={val => setFormData(p=>({...p,status:val}))}
                      placeholder="Select Status"
                      searchable={false}
                    />
                  </div>
                </div>
              </form>
            </div>
            <div style={{ padding:'20px 32px', borderTop:'1px solid #E5E7EB', display:'flex', justifyContent:'flex-end', gap:12, flexShrink:0 }}>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ height:42, padding:'0 24px', border:'1px solid #E5E7EB', borderRadius:8, fontSize:14, fontWeight:600, color:'#374151', background:'#fff', cursor:'pointer' }}>Cancel</button>
              <button type="submit" form="memberForm" style={{ height:42, padding:'0 28px', background:'#2563EB', border:'none', borderRadius:8, fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer' }}>{editingId ? 'Save Member' : 'Add Member'}</button>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div><h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#111827' }}>Team Members</h1><p style={{ margin:'4px 0 0', fontSize:13, color:'#6B7280' }}>Project team and their roles</p></div>
        {hasPermission(null, null, 'projects', 'team_members', 'create') && (
          <button onClick={openAdd} style={{ height:38, padding:'0 16px', background:'#2563EB', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}><Plus size={14}/> Add Member</button>
        )}
      </div>

      <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
        <KpiCard label="Total Members"  value={totalMembers} iconBg="#DBEAFE" iconColor="#2563EB" icon="👥" />
        <KpiCard label="Active Members" value={activeMembers} iconBg="#DCFCE7" iconColor="#16A34A" icon="✓"  />
        <KpiCard label="On Leave"       value={onLeave}       iconBg="#FEF3C7" iconColor="#D97706" icon="🏖" />
        <KpiCard label="Open Tasks"     value={totalOpenTasks} iconBg="#F3F4F6" iconColor="#6B7280" icon="📋" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        {/* Table */}
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #E5E7EB' }}>
                  {['Employee','Role','Department','Assigned Projects','Open Tasks','Status','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:500, color:'#6B7280', whiteSpace:'nowrap', background:'#FAFAFA' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={7} style={{ padding:'20px', textAlign:'center', fontSize:13, color:'#6B7280' }}>Loading team members...</td></tr>}
                {!loading && members.length === 0 && <tr><td colSpan={7} style={{ padding:'20px', textAlign:'center', fontSize:13, color:'#6B7280' }}>No team members yet. Add members to get started.</td></tr>}
                {!loading && members.map((m, i) => {
                  const av = AVATAR[i % AVATAR.length];
                  const s = STATUS_S[m.status] || STATUS_S['Active'];
                  return (
                    <tr key={m.id} style={{ height:56, borderBottom:'1px solid #F3F4F6' }}>
                      <td style={{ padding:'0 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:30, height:30, borderRadius:'50%', background:av.bg, color:av.c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0 }}>{getInitials(m.name)}</div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{m.name}</div>
                            {m.designation && <div style={{ fontSize:11, color:'#9CA3AF' }}>{m.designation}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'0 16px', fontSize:13, color:'#374151' }}>{m.role}</td>
                      <td style={{ padding:'0 16px', fontSize:13, color:'#374151' }}>{m.department || '—'}</td>
                      <td style={{ padding:'0 16px', fontSize:13, fontWeight:600, color:'#111827', textAlign:'center' }}>{m.assignedProjects}</td>
                      <td style={{ padding:'0 16px', fontSize:13, fontWeight:600, color:'#111827', textAlign:'center' }}>{m.openTasks}</td>
                      <td style={{ padding:'0 16px' }}><span style={{ display:'inline-block', padding:'3px 10px', borderRadius:999, background:s.bg, color:s.color, fontSize:11, fontWeight:600 }}>{m.status}</span></td>
                      <td style={{ padding:'0 16px' }}>
                        <div style={{ display:'flex', gap:4 }}>
                          <button title="Edit" onClick={() => openEdit(m)} style={{ width:26,height:26,borderRadius:5,border:'none',background:'transparent',color:'#2563EB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='#EFF6FF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Edit2 size={12}/></button>
                          <button title="Remove" onClick={() => handleRemove(m)} style={{ width:26,height:26,borderRadius:5,border:'none',background:'transparent',color:'#DC2626',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }} onMouseEnter={e=>e.currentTarget.style.background='#FEE2E2'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Trash2 size={12}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding:'12px 20px', borderTop:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, color:'#6B7280' }}>Showing 1 to {members.length} of {members.length} entries</span>
            <div style={{ display:'flex', gap:4 }}>
              <button style={{ width:28,height:28,borderRadius:5,border:'1px solid #E5E7EB',background:'#fff',color:'#6B7280',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><ChevronLeft size={12}/></button>
              <button style={{ width:28,height:28,borderRadius:5,border:'none',background:'#2563EB',color:'#fff',fontWeight:600,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>1</button>
              <button style={{ width:28,height:28,borderRadius:5,border:'1px solid #E5E7EB',background:'#fff',color:'#374151',fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><ChevronRight size={12}/></button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Department Donut */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', padding:20 }}>
            <h3 style={{ margin:'0 0 12px', fontSize:14, fontWeight:600, color:'#111827' }}>Department Distribution</h3>
            <div style={{ height:140, position:'relative' }}>
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={DEPT_PIE} cx="50%" cy="50%" innerRadius={44} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">{DEPT_PIE.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{ borderRadius:8, border:'none' }}/></PieChart></ResponsiveContainer>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:7, marginTop:8 }}>
              {DEPT_PIE.length === 0 && <div style={{ fontSize:12, color:'#9CA3AF', textAlign:'center', padding:'8px 0' }}>No team data yet</div>}
              {DEPT_PIE.map((d,i) => <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}><div style={{ display:'flex', alignItems:'center', gap:7 }}><span style={{ width:8,height:8,borderRadius:'50%',background:d.color }}/><span style={{ fontSize:12, color:'#374151' }}>{d.name}</span></div><span style={{ fontSize:12, fontWeight:600, color:'#111827' }}>{d.value}</span></div>)}
            </div>
          </div>

          {/* Team Overview */}
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(15,23,42,.05)', padding:20 }}>
            <h3 style={{ margin:'0 0 14px', fontSize:14, fontWeight:600, color:'#111827' }}>Team Overview</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'#DBEAFE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}><Users size={13} color="#1D4ED8" /></div>
                <div style={{ flex:1 }}><div style={{ fontSize:12, color:'#111827', lineHeight:1.4 }}>{totalMembers} team members</div><div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>across {DEPT_PIE.length} departments</div></div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'#DCFCE7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}><span style={{ color:'#15803D', fontSize:12, fontWeight:700 }}>✓</span></div>
                <div style={{ flex:1 }}><div style={{ fontSize:12, color:'#111827', lineHeight:1.4 }}>{activeMembers} active members</div><div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>currently working</div></div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}><span style={{ color:'#D97706', fontSize:12, fontWeight:700 }}>🏖</span></div>
                <div style={{ flex:1 }}><div style={{ fontSize:12, color:'#111827', lineHeight:1.4 }}>{onLeave} on leave</div><div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>temporarily unavailable</div></div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}><span style={{ color:'#6B7280', fontSize:12, fontWeight:700 }}>📋</span></div>
                <div style={{ flex:1 }}><div style={{ fontSize:12, color:'#111827', lineHeight:1.4 }}>{totalOpenTasks} open tasks</div><div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>assigned across projects</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}