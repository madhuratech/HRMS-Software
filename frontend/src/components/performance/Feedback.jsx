import React, { useState, useEffect, useCallback } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { ChevronDown, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { useToast } from '../ui/Toast';
import { canCreate, checkActionPermission } from '../../lib/permissions';

export default function Feedback() {
  const { addToast } = useToast();
  const [feedbackList, setFeedbackList] = useState([]);
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
    positive: 0,
    negative: 0,
    neutral: 0,
    rate: '0%',
    chartData: [
      { name: 'Positive', value: 0, color: '#10B981' },
      { name: 'Neutral', value: 0, color: '#F59E0B' },
      { name: 'Improvement', value: 0, color: '#EF4444' }
    ]
  });

  const [formData, setFormData] = useState({
    recipient: '',
    department: '',
    type: 'Recognition',
    rating: '5',
    subject: '',
    comments: ''
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

      // Fetch departments
      const deptRes = await fetch('/app/requirements/meta/all', { headers });
      const deptData = await deptRes.json();
      if (deptData && deptData.departments) {
        setDepartments(deptData.departments);
      }

      // Fetch employees
      const empRes = await fetch('/app/employees?status=Active', { headers });
      const empData = await empRes.json();
      if (Array.isArray(empData)) {
        setEmployees(empData);
      }
    } catch (err) {
      console.error('Failed to load feedback metadata:', err);
    }
  };

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch('/app/feedback/dashboard', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setKpiData(resData.data);
      }
    } catch (err) {
      console.error('Failed to fetch feedback stats:', err);
    }
  }, []);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/app/feedback?page=${page}&limit=${limit}`;
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
        setFeedbackList(resData.data.feedbacks || []);
        setTotal(resData.data.total || 0);
      } else {
        addToast(resData.message || 'Failed to fetch feedback', 'error');
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
    fetchFeedback();
    fetchDashboardStats();
  }, [page, fetchFeedback, fetchDashboardStats]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!checkActionPermission('feedback', 'CREATE')) {
      return;
    }
    if (!formData.recipient || !formData.department || !formData.comments) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        employee_id: parseInt(formData.recipient),
        department_id: parseInt(formData.department),
        feedback_type: formData.type,
        rating: parseInt(formData.rating),
        subject: formData.subject.trim(),
        comments: formData.comments.trim()
      };

      const res = await fetch('/app/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        addToast('Feedback saved successfully!', 'success');
        setShowAddModal(false);
        setFormData({ recipient: '', department: '', type: 'Recognition', rating: '5', subject: '', comments: '' });
        fetchFeedback();
        fetchDashboardStats();
      } else {
        addToast(resData.message || 'Failed to save feedback', 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getFeedbackTypeStyle = (type) => {
    switch (type) {
      case 'Recognition': return { bg: '#ECFDF5', color: '#10B981' };
      case 'Constructive': return { bg: '#FEF2F2', color: '#EF4444' };
      default: return { bg: '#EFF6FF', color: '#2952E3' };
    }
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

      {/* Add Feedback Modal */}
      {showAddModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowAddModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw', maxHeight: '90vh' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Give Performance Feedback</h2>
                <p className="text-sm text-slate-500 mt-1">Provide constructive feedback, praise, or peer recognition.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Recipient Employee <span className="text-red-500">*</span></label>
                  <AppDropdown
                value={formData.recipient}
                onChange={v => setFormData({ ...formData, recipient: v })}
                options={[{value:'',label:'Select Employee'}]}
                size="sm"
              />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department <span className="text-red-500">*</span></label>
                  <AppDropdown
                value={formData.department}
                onChange={v => setFormData({ ...formData, department: v })}
                options={[{value:'',label:'Select Department'}]}
                size="sm"
              />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Feedback Type</label>
                  <AppDropdown
                value={formData.type}
                onChange={v => setFormData({ ...formData, type: v })}
                options={[{value:'Recognition',label:'Recognition & Praise'},{value:'Constructive',label:'Constructive Guidance'},{value:'General',label:'General Feedback'}]}
                size="sm"
              />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Rating (1 to 5 Stars)</label>
                  <AppDropdown
                value={formData.rating}
                onChange={v => setFormData({ ...formData, rating: v })}
                options={[{value:'5',label:'5 - Excellent'},{value:'4',label:'4 - Good'},{value:'3',label:'3 - Satisfactory'},{value:'2',label:'2 - Needs Improvement'},{value:'1',label:'1 - Unsatisfactory'}]}
                size="sm"
              />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                  <input type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="e.g. Exceptional teamwork during deployment" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Feedback / Comments <span className="text-red-500">*</span></label>
                  <textarea required value={formData.comments} onChange={e => setFormData({ ...formData, comments: e.target.value })} placeholder="Detailed remarks or guidance comments..." style={{ height: '80px' }} className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Feedback'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Feedback</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Track and manage feedback logs</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AppDropdown
                value={filterDept}
                onChange={v => setFilterDept(v)}
                options={[{value:'All Departments',label:'All Departments'}]}
                size="sm"
              />
          <button 
            disabled={!canCreate('feedback')}
            onClick={() => {
              if (!checkActionPermission('feedback', 'CREATE')) {
                return;
              }
              setShowAddModal(true);
            }} 
            style={{ 
              padding: '10px 20px', 
              borderRadius: '8px', 
              border: 'none', 
              background: canCreate('feedback') ? '#2952E3' : '#94A3B8', 
              color: '#FFF', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: canCreate('feedback') ? 'pointer' : 'not-allowed', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}
          >
            <Plus size={16} /> Add Feedback
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[
          { title: 'Total Feedbacks', value: kpiData.total, icon: <ChevronDown size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
          { title: 'Positive Reviews', value: kpiData.positive, icon: <ChevronDown size={20} color="#10B981" />, bgColor: '#ECFDF5' },
          { title: 'Positive Rate', value: kpiData.rate, icon: <ChevronDown size={20} color="#8B5CF6" />, bgColor: '#F5F3FF' },
          { title: 'Constructive Logs', value: kpiData.negative, icon: <ChevronDown size={20} color="#EF4444" />, bgColor: '#FEF2F2' },
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
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Feedback Tracker</h3>
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
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading feedbacks...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Recipient Employee</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Department</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Subject</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Feedback type</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No feedback logs available</td>
                    </tr>
                  ) : (
                    feedbackList.map((row, idx) => (
                      <tr key={row.id} style={{ borderBottom: idx === feedbackList.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                              {row.employee_name ? row.employee_name.split(' ').map(n => n[0]).join('') : 'FB'}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{row.employee_name}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{row.department_name}</td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{row.subject || '-'}</td>
                        <td style={{ padding: '16px 24px', fontSize: '13px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                            backgroundColor: getFeedbackTypeStyle(row.feedback_type).bg, color: getFeedbackTypeStyle(row.feedback_type).color
                          }}>
                            {row.feedback_type}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#1E293B', fontWeight: '600', textAlign: 'center' }}>{row.rating} ★</td>
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

        {/* Right Side: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Feedback Distribution</h3>
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
        </div>

      </div>

    </div>
  );
}
