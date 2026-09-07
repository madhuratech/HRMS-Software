import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { Search, Filter, Plus, Eye, Edit, XCircle, Download, ChevronLeft, ChevronRight, X, Upload, Calendar, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { canCreate, canEdit, canDelete, guardCreateAction, checkActionPermission } from '../../lib/permissions';

const CustomSelect = ({ label, required, value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>
        {label}{required && <span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>}
      </label>
      <button 
        type="button" 
        onClick={() => setOpen(!open)} 
        style={{ width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', border: '1.5px solid #E2E8F0', borderRadius: '11px', fontSize: '13.5px', background: '#FAFBFC', cursor: 'pointer', transition: 'all 0.2s', boxSizing: 'border-box' }}
      >
        <span style={{ color: value ? '#1E293B' : '#94A3B8', fontWeight: value ? '500' : '400' }}>{value || placeholder}</span>
        <ChevronRight size={16} color="#94A3B8" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', zIndex: 50, marginTop: '4px', width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '11px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', maxHeight: '192px', overflowY: 'auto' }}>
          {options.map((opt) => (
            <button 
              key={opt} 
              type="button" 
              onClick={() => { onChange(opt); setOpen(false); }} 
              style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '13px', border: 'none', background: value === opt ? '#EFF6FF' : 'transparent', color: value === opt ? '#2563EB' : '#334155', fontWeight: value === opt ? '600' : '400', cursor: 'pointer' }}
            >
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
      } catch (err) { }
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
    if (!checkActionPermission('my_leave', 'CREATE')) return;
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
    const nameMatch = (app.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      `EMP${String(app.employee_id).padStart(3, '0')}`.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'All Status' || app.status === statusFilter;
    const deptMatch = deptFilter === 'All Departments' || (app.department || '') === deptFilter;
    return nameMatch && statusMatch && deptMatch;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      <div style={cardStyle}>
        {/* Filters and Header Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 160px 180px auto', gap: '12px', flex: 1, minWidth: '300px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <AppDropdown
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: 'All Status', label: 'All Status' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Rejected', label: 'Rejected' }
              ]}
              size="sm"
            />
            <AppDropdown
              value={deptFilter}
              onChange={(val) => setDeptFilter(val)}
              options={[
                { value: 'All Departments', label: 'All Departments' },
                { value: 'Design', label: 'Design' },
                { value: 'Engineering', label: 'Engineering' },
                { value: 'HR', label: 'HR' }
              ]}
              size="sm"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <Filter size={14} /> More Filters
            </div>
          </div>

          {canCreate('leave', 'my_leave') && (
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
          )}
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
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>EMP{String(app.employee_id).padStart(3, '0')}</div>
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
      {showModal && canCreate('leave', 'my_leave') && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)' }}>
          <div style={{ width: '580px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '22px', boxShadow: '0 32px 80px rgba(15, 23, 42, 0.28)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.8)' }}>

            {/* Modal Header */}
            <div style={{ position: 'relative', padding: '20px 24px', background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 50%, #2563EB 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-40px', left: '20%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 1, flex: 1, marginRight: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.3)', display: 'grid', placeItems: 'center', placeContent: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', flexShrink: 0, lineHeight: 0, padding: 0 }}>
                  <Calendar size={22} color="#FFFFFF" style={{ display: 'block', margin: 'auto' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.01em' }}>New Leave Request</h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Apply for casual, sick, or paid leave with manager approval</p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setShowModal(false)} 
                style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.25)', background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', placeContent: 'center', cursor: 'pointer', zIndex: 1, transition: 'all 0.2s', flexShrink: 0, marginLeft: 'auto', lineHeight: 0, padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
              >
                <X size={16} color="#FFFFFF" style={{ display: 'block', margin: 'auto' }} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#FFFFFF', overflowY: 'auto', flex: 1 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                <CustomSelect
                  label="Employee Name"
                  required
                  placeholder="Select employee"
                  value={formData.employeeName}
                  onChange={handleEmployeeChange}
                  options={employees.map(e => e.name)}
                />

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Employee ID</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={formData.employeeId ? `EMP${String(formData.employeeId).padStart(3, '0')}` : ''} 
                    style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '11px', border: '1.5px solid #E2E8F0', fontSize: '13.5px', background: '#F8FAFC', color: '#64748B', outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>

              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Department</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={formData.department} 
                    style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '11px', border: '1.5px solid #E2E8F0', fontSize: '13.5px', background: '#F8FAFC', color: '#64748B', outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Available Balance</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={formData.leaveBalance} 
                    style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '11px', border: '1.5px solid #E2E8F0', fontSize: '13.5px', background: '#F8FAFC', color: '#2563EB', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <CustomSelect
                  label="Leave Type"
                  required
                  placeholder="Select leave type"
                  value={formData.leaveType}
                  onChange={(val) => setFormData({ ...formData, leaveType: val })}
                  options={leaveTypes.map(t => t.name)}
                />
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Total Days</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={formData.totalDays} 
                    style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '11px', border: '1.5px solid #E2E8F0', fontSize: '13.5px', background: '#F8FAFC', color: '#10B981', fontWeight: '700', outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>
                    Start Date <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="date" 
                    required 
                    value={formData.startDate} 
                    onChange={(e) => handleDateChange('startDate', e.target.value)} 
                    style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '11px', border: '1.5px solid #E2E8F0', fontSize: '13.5px', color: '#1E293B', background: '#FAFBFC', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)'; e.target.style.background = '#FFF'; }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAFBFC'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>
                    End Date <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="date" 
                    required 
                    value={formData.endDate} 
                    onChange={(e) => handleDateChange('endDate', e.target.value)} 
                    style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '11px', border: '1.5px solid #E2E8F0', fontSize: '13.5px', color: '#1E293B', background: '#FAFBFC', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)'; e.target.style.background = '#FFF'; }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAFBFC'; }}
                  />
                </div>
              </div>

              {errors.dateRange && (
                <div style={{ color: '#EF4444', fontSize: '12px', fontWeight: '600', marginTop: '-6px' }}>
                  {errors.dateRange}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>
                  Reason for Leave <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea 
                  required 
                  value={formData.reason} 
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })} 
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '11px', border: '1.5px solid #E2E8F0', fontSize: '13.5px', color: '#1E293B', background: '#FAFBFC', outline: 'none', transition: 'all 0.2s', resize: 'none', boxSizing: 'border-box' }} 
                  rows={2}
                  placeholder="Enter detailed reason here..." 
                  onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)'; e.target.style.background = '#FFF'; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAFBFC'; }}
                />
              </div>

              {/* Info Notice Banner */}
              <div style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', borderRadius: '12px', padding: '12px 16px', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '12px', color: '#1E40AF', fontWeight: '500', lineHeight: '1.4' }}>
                  Leave requests are sent to reporting manager for approval and auto-deducted from balance.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  style={{ height: '44px', padding: '0 20px', borderRadius: '11px', border: '1.5px solid #E2E8F0', background: '#FFFFFF', color: '#475569', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ height: '44px', padding: '0 26px', borderRadius: '11px', border: 'none', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 18px rgba(37, 99, 235, 0.45)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.35)'}
                >
                  <CheckCircle2 size={16} />
                  Submit Request
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
