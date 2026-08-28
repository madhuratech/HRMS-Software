import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Edit, XCircle, Download, ChevronLeft, ChevronRight, X, Upload, Calendar } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { canCreate, canEdit, canDelete, guardCreateAction } from '../../lib/permissions';

const CustomSelect = ({ label, required, value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <button type="button" onClick={() => setOpen(!open)} className="w-full h-12 flex items-center justify-between px-4 border border-slate-200 rounded-xl text-sm bg-white hover:border-slate-300 transition-colors">
        <span className={value ? 'text-slate-900 font-medium' : 'text-slate-400'}>{value || placeholder}</span>
        <ChevronRight size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 ${value === opt ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function LeaveApplications() {
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [deptFilter, setDeptFilter] = useState('All Departments');

  // Permissions state
  const [userRole, setUserRole] = useState('EMPLOYEE');
  const [userPermissions, setUserPermissions] = useState(null);

  // Dynamic lists from backend
  const [applications, setApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerms = async () => {
      try {
        const auth = localStorage.getItem('hrms_auth');
        if (auth) {
          const parsed = JSON.parse(auth);
          setUserRole(parsed.role || (parsed.user && parsed.user.role) || 'EMPLOYEE');
        }
        const data = await apiFetch('/rbac/user-permissions');
        if (data && data.success && data.permissions) {
          setUserPermissions(data.permissions);
        }
      } catch (err) {}
    };
    fetchPerms();
  }, []);

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    department: '',
    leaveBalance: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    totalDays: '0 Days',
    reportingManager: '',
    priority: 'Normal',
    reason: '',
    attachment: null,
    status: 'Pending'
  });

  const [errors, setErrors] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load Applications
      const apps = await apiFetch('/leaves/applications');
      if (Array.isArray(apps)) setApplications(apps);

      // 2. Load Active Employees
      const emps = await apiFetch('/employees?status=Active');
      if (Array.isArray(emps)) setEmployees(emps);

      // 3. Load Leave Types
      const types = await apiFetch('/leaves/types');
      if (Array.isArray(types)) setLeaveTypes(types);

    } catch (e) {
      console.error(e);
      addToast("Failed to load leave data", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEmployeeChange = async (name) => {
    const emp = employees.find(e => e.name === name);
    if (!emp) return;

    setFormData(prev => ({
      ...prev,
      employeeName: name,
      employeeId: emp.id,
      department: emp.dept_name || 'General',
      leaveBalance: 'Loading...'
    }));

    try {
      // Query real balance for selected employee
      const balances = await apiFetch(`/leaves/balances/${emp.id}`);
      if (Array.isArray(balances) && balances.length > 0) {
        // Summarize remaining days
        const totalAvail = balances.reduce((sum, b) => sum + (b.days_remaining || 0), 0);
        setFormData(prev => ({ ...prev, leaveBalance: `${totalAvail} Days Available` }));
      } else {
        setFormData(prev => ({ ...prev, leaveBalance: '0 Days Available' }));
      }
    } catch (err) {
      setFormData(prev => ({ ...prev, leaveBalance: 'N/A' }));
    }

    if (errors.employeeName) setErrors(prev => ({ ...prev, employeeName: null }));
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return '0 Days';
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 'Invalid Range';
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
  };

  const handleDateChange = (field, val) => {
    const nextForm = { ...formData, [field]: val };
    const days = calculateDays(field === 'startDate' ? val : formData.startDate, field === 'endDate' ? val : formData.endDate);
    setFormData({ ...nextForm, totalDays: days });
    
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    if (field === 'endDate' || field === 'startDate') {
      if (nextForm.startDate && nextForm.endDate && new Date(nextForm.endDate) < new Date(nextForm.startDate)) {
        setErrors(prev => ({ ...prev, dateRange: 'End Date cannot be before Start Date' }));
      } else {
        setErrors(prev => ({ ...prev, dateRange: null }));
      }
    }
  };

  const validate = () => {
    const newErr = {};
    if (!formData.employeeName) newErr.employeeName = 'Employee is required';
    if (!formData.leaveType) newErr.leaveType = 'Leave Type is required';
    if (!formData.startDate) newErr.startDate = 'Start Date is required';
    if (!formData.endDate) newErr.endDate = 'End Date is required';
    if (!formData.reason.trim()) newErr.reason = 'Reason for leave is required';
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErr.dateRange = 'End Date cannot be before Start Date';
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const selectedType = leaveTypes.find(t => t.name === formData.leaveType);
      const payload = {
        employee_id: formData.employeeId,
        leave_type_code: selectedType ? selectedType.code : 'CL',
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason
      };

      const res = await apiFetch('/leaves/applications', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.id) {
        addToast("Leave application submitted successfully!", "success");
        setShowModal(false);
        setFormData({
          employeeName: '', employeeId: '', department: '', leaveBalance: '',
          leaveType: '', startDate: '', endDate: '', totalDays: '0 Days',
          reportingManager: '', priority: 'Normal', reason: '', attachment: null, status: 'Pending'
        });
        loadData();
      } else {
        addToast(res.message || "Failed to submit leave application", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to submit leave application", "error");
    }
  };

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
    border: '1px solid #E5E7EB',
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#ecfdf5', color: '#10b981' };
      case 'Pending': return { bg: '#fffbeb', color: '#f59e0b' };
      case 'Rejected': return { bg: '#fef2f2', color: '#ef4444' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  // Filter local rows
  const filtered = applications.filter(app => {
    const nameMatch = app.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      `EMP${String(app.employee_id).padStart(3,'0')}`.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'All Status' || app.status === statusFilter;
    return nameMatch && statusMatch;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      <div style={cardStyle}>
        {/* Filters and Header Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search employee..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} 
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#475569', minWidth: '130px' }}
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#475569', minWidth: '150px' }}
            >
              <option>All Departments</option>
              <option>Design</option>
              <option>Engineering</option>
              <option>HR</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
              <Filter size={14} /> More Filters
            </div>
          </div>

          <button 
            onClick={() => {
              if (!guardCreateAction(userPermissions, userRole, 'leave', 'my_leave', addToast)) return;
              setShowModal(true);
            }} 
            style={{ 
              background: '#2563EB', color: '#fff', border: 'none', 
              padding: '10px 18px', borderRadius: '8px', fontSize: '13px', 
              fontWeight: '600', display: 'flex', alignItems: 'center', 
              gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={16} /> Apply Leave
            </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Employee</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Leave Type</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>From Date</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>To Date</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Days</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Reason</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading leave applications...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No leave applications found.</td>
                </tr>
              ) : (
                filtered.map((app, idx) => {
                  const statusStyle = getStatusStyle(app.status);
                  // Calculate days count
                  const s = new Date(app.start_date);
                  const e = new Date(app.end_date);
                  const days = isNaN(s) || isNaN(e) ? 1 : Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
                  
                  return (
                    <tr key={app.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.employee_name)}&background=f1f5f9&color=64748b`} alt={app.employee_name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{app.employee_name}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>EMP{String(app.employee_id).padStart(3,'0')}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>{app.leave_code}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>{new Date(app.start_date).toLocaleDateString()}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>{new Date(app.end_date).toLocaleDateString()}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>{days}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>{app.reason}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>New Leave Request</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                <CustomSelect 
                  label="Employee Name"
                  required
                  placeholder="Select employee"
                  value={formData.employeeName}
                  onChange={handleEmployeeChange}
                  options={employees.map(e => e.name)}
                />

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Employee ID</label>
                  <input type="text" readOnly value={formData.employeeId ? `EMP${String(formData.employeeId).padStart(3,'0')}` : ''} style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', color: '#64748b', boxSizing: 'border-box' }} />
                </div>

              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Department</label>
                  <input type="text" readOnly value={formData.department} style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', color: '#64748b', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Available Balance</label>
                  <input type="text" readOnly value={formData.leaveBalance} style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', color: '#64748b', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <CustomSelect 
                  label="Leave Type"
                  required
                  placeholder="Select leave type"
                  value={formData.leaveType}
                  onChange={(val) => setFormData({ ...formData, leaveType: val })}
                  options={leaveTypes.map(t => t.name)}
                />
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Total Days</label>
                  <input type="text" readOnly value={formData.totalDays} style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#f8fafc', color: '#64748b', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Start Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.startDate} onChange={(e) => handleDateChange('startDate', e.target.value)} style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>End Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.endDate} onChange={(e) => handleDateChange('endDate', e.target.value)} style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Reason for Leave <span className="text-red-500">*</span></label>
                <textarea required value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} style={{ width: '100%', height: '100px', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', resize: 'none', boxSizing: 'border-box' }} placeholder="Enter detailed reason here..." />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, height: '48px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, height: '48px', background: '#2952E3', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}>Submit Request</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
