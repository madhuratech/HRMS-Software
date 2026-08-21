import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Plus, ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { useToast } from '../ui/Toast';

export default function KRAs() {
  const { addToast } = useToast();
  const [kraList, setKraList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All Departments');

  // KPI Dashboard Stats
  const [kpiData, setKpiData] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    rate: '0%',
    chartData: [
      { name: 'Active', value: 0, color: '#10B981' },
      { name: 'Inactive', value: 0, color: '#EF4444' }
    ],
    deptData: []
  });

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    role: '',
    weightage: '',
    status: 'Active',
    description: ''
  });

  const getAuthToken = () => {
    const auth = localStorage.getItem('hrms_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        return parsed.token || 'mock_jwt_token';
      } catch (e) {
        return 'mock_jwt_token';
      }
    }
    return 'mock_jwt_token';
  };

  const fetchMeta = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${getAuthToken()}` };
      const deptRes = await fetch('/app/requirements/meta/all', { headers });
      const deptData = await deptRes.json();
      if (deptData && deptData.departments) {
        setDepartments(deptData.departments);
      }
    } catch (err) {
      console.error('Failed to load KRAs metadata:', err);
    }
  };

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch('/app/kras/dashboard', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setKpiData(resData.data);
      }
    } catch (err) {
      console.error('Failed to fetch KRA dashboard stats:', err);
    }
  }, []);

  const fetchKras = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/app/kras?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (filterDept && filterDept !== 'All Departments') {
        url += `&department_id=${encodeURIComponent(filterDept)}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setKraList(resData.data.kras || []);
        setTotal(resData.data.total || 0);
      } else {
        addToast(resData.message || 'Failed to fetch KRAs', 'error');
      }
    } catch (err) {
      addToast('Error connecting to backend server', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterDept, addToast]);

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filterDept]);

  useEffect(() => {
    fetchKras();
    fetchDashboardStats();
  }, [page, fetchKras, fetchDashboardStats]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.department || !formData.role) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
<<<<<<< HEAD
      const payload = {
        kra_title: formData.title.trim(),
        department_id: parseInt(formData.department),
        role_id: formData.role.trim(),
        weightage: formData.weightage.trim(),
        status: formData.status,
        description: formData.description.trim()
=======
      const parsedDept = parseInt(formData.department, 10) || 1;

      const payload = {
        kra_title: formData.title.trim(),
        title: formData.title.trim(),
        department_id: parsedDept,
        role_id: formData.role.trim(),
        weightage: formData.weightage ? formData.weightage.trim() : '',
        status: formData.status || 'Active',
        description: formData.description ? formData.description.trim() : ''
>>>>>>> origin/main
      };

      const res = await fetch('/app/kras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        addToast('KRA created successfully!', 'success');
        setShowAddModal(false);
        setFormData({ title: '', department: '', role: '', weightage: '', status: 'Active', description: '' });
        fetchKras();
        fetchDashboardStats();
      } else {
<<<<<<< HEAD
        addToast(resData.message || 'Failed to save KRA', 'error');
=======
        addToast(resData.message || (resData.errors ? JSON.stringify(resData.errors) : 'Failed to save KRA'), 'error');
>>>>>>> origin/main
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    return status === 'Active'
      ? { bg: '#DCFCE7', color: '#15803D' }
      : { bg: '#F3F4F6', color: '#6B7280' };
  };

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif', paddingBottom: '24px' }}>
      
      {/* Add KRA Modal */}
      {showAddModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowAddModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw', maxHeight: '90vh' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Add KRA Target</h2>
                <p className="text-sm text-slate-500 mt-1">Define key result areas and roles assignments.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">KRA Title <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Optimize CI/CD Pipelines" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department <span className="text-red-500">*</span></label>
                  <select required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">KRA Role / Designation <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Software Engineer" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Weightage</label>
                  <input type="text" value={formData.weightage} onChange={e => setFormData({ ...formData, weightage: e.target.value })} placeholder="e.g. 20%" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Role responsibilities and key goals..." style={{ height: '80px' }} className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save KRA'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Key Result Areas (KRAs)</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Configure department job roles performance areas</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={filterDept} 
            onChange={e => setFilterDept(e.target.value)} 
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '13px', color: '#334155', cursor: 'pointer' }}
          >
            <option value="All Departments">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button onClick={() => setShowAddModal(true)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <Plus size={16} /> Add KRA
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[
          { title: 'Total KRAs', value: kpiData.total, icon: <CheckCircle size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
          { title: 'Active KRAs', value: kpiData.active, icon: <CheckCircle size={20} color="#10B981" />, bgColor: '#ECFDF5' },
          { title: 'Active Rate', value: kpiData.rate, icon: <CheckCircle size={20} color="#8B5CF6" />, bgColor: '#F5F3FF' },
          { title: 'Inactive KRAs', value: kpiData.inactive, icon: <CheckCircle size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
        ].map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, display: 'flex', gap: '16px', padding: '20px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: kpi.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500', marginBottom: '4px' }}>{kpi.title}</div>
              <div style={{ fontSize: '24px', color: '#1E293B', fontWeight: '700' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
        
        {/* Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>KRA Tracker</h3>
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '13px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading KRAs...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>KRA Title</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Department</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Target Role</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Weightage</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {kraList.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No KRAs defined</td>
                    </tr>
                  ) : (
                    kraList.map((row, idx) => (
                      <tr key={row.id} style={{ borderBottom: idx === kraList.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                        <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{row.kra_title}</td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{row.department_name}</td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{row.role_id}</td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{row.weightage || '-'}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                            backgroundColor: getStatusStyle(row.status).bg, color: getStatusStyle(row.status).color
                          }}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: '13px', color: '#64748B' }}>
              Showing {total === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button disabled={page === 1} onClick={() => setPage(prev => prev - 1)} style={{ padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: '6px', background: '#FFF', cursor: page === 1 ? 'not-allowed' : 'pointer' }}><ChevronLeft size={16} /></button>
              <button disabled={page === totalPages} onClick={() => setPage(prev => prev + 1)} style={{ padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: '6px', background: '#FFF', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* Right Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>KRA Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={kpiData.chartData} innerRadius={40} outerRadius={55} paddingAngle={2} dataKey="value" cx="50%" cy="50%" stroke="none">
                    {kpiData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <Label value={kpiData.total} position="center" fill="#1E293B" style={{ fontSize: '24px', fontWeight: '700' }} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Department Wise KRAs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {kpiData.deptData?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#475569', fontWeight: '500' }}>{item.name}</span>
                  <span style={{ color: '#1E293B', fontWeight: '600' }}>{item.kras}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
