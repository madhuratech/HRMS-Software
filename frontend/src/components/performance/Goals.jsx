import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Plus, Target, CheckCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { useToast } from '../ui/Toast';

export default function Goals() {
  const { addToast } = useToast();
  const [goalsList, setGoalsList] = useState([]);
  const [employees, setEmployees] = useState([]);
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
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    rate: '0%',
    chartData: [
      { name: 'On Track', value: 0, color: '#2563EB' },
      { name: 'At Risk', value: 0, color: '#F59E0B' },
      { name: 'Not Started', value: 0, color: '#CBD5E1' },
      { name: 'Completed', value: 0, color: '#22C55E' }
    ]
  });

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    owner: '',
    targetDate: '',
    progress: '0',
    status: 'Not Started',
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
      
      // Fetch branches (used as departments in employee records)
      const deptRes = await fetch('/app/requirements/meta/all', { headers });
      const deptData = await deptRes.json();
      if (deptData && deptData.branches) {
        setDepartments(deptData.branches); // branches serve as department grouping
      }

      // Fetch employees
      const empRes = await fetch('/app/employees', { headers });
      const empData = await empRes.json();
      if (Array.isArray(empData)) {
        setEmployees(empData);
      }
    } catch (err) {
      console.error('Failed to load goals metadata:', err);
    }
  };

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch('/app/goals/dashboard', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setKpiData(resData.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/app/goals?page=${page}&limit=${limit}`;
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
        setGoalsList(resData.data.goals || []);
        setTotal(resData.data.total || 0);
      } else {
        addToast(resData.message || 'Failed to fetch goals', 'error');
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
    fetchGoals();
    fetchDashboardStats();
  }, [page, fetchGoals, fetchDashboardStats]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.owner || !formData.targetDate) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        employee_id: parseInt(formData.owner),
        goal_title: formData.title.trim(),
        target_date: formData.targetDate,
        completion_percentage: parseInt(formData.progress) || 0,
        status: formData.status,
        goal_description: formData.description.trim()
      };

      const res = await fetch('/app/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        addToast('Goal scheduled successfully!', 'success');
        setShowAddModal(false);
        setFormData({ title: '', department: '', owner: '', targetDate: '', progress: '0', status: 'Not Started', description: '' });
        fetchGoals();
        fetchDashboardStats();
      } else {
        addToast(resData.message || 'Failed to schedule goal', 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#ECFDF5', color: '#10B981' };
      case 'On Track': return { bg: '#EFF6FF', color: '#2952E3' };
      case 'At Risk': return { bg: '#FEF2F2', color: '#EF4444' };
      default: return { bg: '#F1F5F9', color: '#64748B' };
    }
  };

  const cardStyle = {
    background: '#FFF',
    borderRadius: '12px',
    border: '1px solid #F1F5F9',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif', paddingBottom: '24px' }}>
      
      {/* Add Goal Modal (1100px Standard) */}
      {showAddModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowAddModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw', maxHeight: '90vh' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Add Goal</h2>
                <p className="text-sm text-slate-500 mt-1">Define strategic organizational or individual performance targets.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Goal Title <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Improve Product Quality & Test Coverage" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Goal Owner <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    value={formData.owner} 
                    onChange={e => setFormData({ ...formData, owner: e.target.value })} 
                    className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} (EMP{String(e.id).padStart(3, '0')})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Completion Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.targetDate} onChange={e => setFormData({ ...formData, targetDate: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Progress (%)</label>
                  <input type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({ ...formData, progress: e.target.value })} placeholder="0" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="Not Started">Not Started</option>
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Goal Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed objectives, success metrics, and key results..." style={{ height: '80px' }} className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Goals</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Set, track and achieve organizational and individual goals</p>
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
            <Plus size={16} /> Add Goal
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[
          { title: 'Total Goals', value: kpiData.total, icon: <Target size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
          { title: 'Completed Goals', value: kpiData.completed, icon: <CheckCircle size={20} color="#10B981" />, bgColor: '#ECFDF5' },
          { title: 'Completion Rate', value: kpiData.rate, icon: <Target size={20} color="#8B5CF6" />, bgColor: '#F5F3FF' },
          { title: 'Pending Goals', value: kpiData.pending, icon: <Target size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
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

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
        
        {/* Left Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Goal Tracker</h3>
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
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading goals...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Goal Title</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Goal Owner</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Department</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Target Date</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Progress</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {goalsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No goals defined</td>
                    </tr>
                  ) : (
                    goalsList.map((row, idx) => {
                      const tgtDate = row.target_date ? new Date(row.target_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
                      return (
                        <tr key={row.id} style={{ borderBottom: idx === goalsList.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                          <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{row.goal_title}</td>
                          <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{row.employee_name}</td>
                          <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{row.department_name}</td>
                          <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{tgtDate}</td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563EB' }}>{row.completion_percentage}%</span>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <span style={{ 
                              padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                              backgroundColor: getStatusStyle(row.status).bg, color: getStatusStyle(row.status).color
                            }}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
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

        {/* Right Side: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Goal Completion Status</h3>
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
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Department Wise Goals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {kpiData.deptData?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#475569', fontWeight: '500' }}>{item.name}</span>
                  <span style={{ color: '#1E293B', fontWeight: '600' }}>{item.goals}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
