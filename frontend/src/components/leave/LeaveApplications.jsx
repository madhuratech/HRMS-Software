import React, { useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, XCircle, Download, ChevronLeft, ChevronRight, X, Upload, Calendar } from 'lucide-react';

const applicationsData = [
  { id: 'EMP001', name: 'Priya Nair', type: 'CL', from: '20 May 2024', to: '21 May 2024', days: 2, reason: 'Personal Work', applied: '18 May 2024', status: 'Pending' },
  { id: 'EMP042', name: 'Rohan Mehta', type: 'SL', from: '18 May 2024', to: '18 May 2024', days: 1, reason: 'Fever', applied: '17 May 2024', status: 'Pending' },
  { id: 'EMP023', name: 'Neha Patel', type: 'PL', from: '15 May 2024', to: '17 May 2024', days: 3, reason: 'Vacation', applied: '10 May 2024', status: 'Approved' },
  { id: 'EMP015', name: 'Aarav Sharma', type: 'EL', from: '10 May 2024', to: '14 May 2024', days: 5, reason: 'Family Trip', applied: '01 May 2024', status: 'Approved' },
  { id: 'EMP088', name: 'Karan Verma', type: 'SL', from: '8 May 2024', to: '8 May 2024', days: 1, reason: 'Medical Checkup', applied: '07 May 2024', status: 'Rejected' },
  { id: 'EMP034', name: 'Anjali Desai', type: 'CL', from: '6 May 2024', to: '7 May 2024', days: 2, reason: 'Personal Work', applied: '05 May 2024', status: 'Approved' },
  { id: 'EMP091', name: 'Vikram Singh', type: 'SL', from: '3 May 2024', to: '6 May 2024', days: 4, reason: 'Hometown Visit', applied: '01 May 2024', status: 'Approved' },
];

const EMPLOYEES = [
  { name: 'Priya Nair', id: 'EMP001', dept: 'Design', balance: '12 Days Available' },
  { name: 'Rohan Mehta', id: 'EMP042', dept: 'Engineering', balance: '8 Days Available' },
  { name: 'Neha Patel', id: 'EMP023', dept: 'Human Resources', balance: '15 Days Available' },
  { name: 'Aarav Sharma', id: 'EMP015', dept: 'Product', balance: '10 Days Available' },
  { name: 'Karan Verma', id: 'EMP088', dept: 'Marketing', balance: '5 Days Available' },
];

const LEAVE_TYPES = [
  'Casual Leave',
  'Sick Leave',
  'Annual Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Compensatory Leave',
  'Work From Home',
  'Unpaid Leave'
];

const MANAGERS = [
  'Rajesh Kumar (Design Lead)',
  'Anita Roy (Engineering Director)',
  'Sunil Varma (VP HR)',
  'Meera Kapoor (Product Manager)'
];

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
  const [showModal, setShowModal] = useState(false);
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

  const handleEmployeeChange = (name) => {
    const emp = EMPLOYEES.find(e => e.name === name);
    setFormData(prev => ({
      ...prev,
      employeeName: name,
      employeeId: emp ? emp.id : '',
      department: emp ? emp.dept : '',
      leaveBalance: emp ? emp.balance : ''
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setShowModal(false);
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      
      {/* Header & Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <button onClick={() => setShowModal(true)} style={{ background: '#2952E3', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(41,82,227,0.2)' }}>
          <Plus size={18} /> Apply Leave
        </button>
      </div>

      <div style={cardStyle}>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
            <input type="text" placeholder="Search employee..." style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
          </div>
          <select style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#475569', minWidth: '140px' }}>
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <select style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#475569', minWidth: '160px' }}>
            <option>All Departments</option>
            <option>Design</option>
            <option>Engineering</option>
            <option>HR</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
            <Filter size={14} /> More Filters
          </div>
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
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicationsData.map((app, idx) => {
                const statusStyle = getStatusStyle(app.status);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=f1f5f9&color=64748b`} alt={app.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{app.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{app.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>{app.type}</td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>{app.from}</td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>{app.to}</td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>{app.days}</td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>{app.reason}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}><Eye size={16} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit size={16} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><XCircle size={16} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b5cf6' }}><Download size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Showing 1 to 7 of 28 entries</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button style={{ padding: '6px', border: '1px solid #E5E7EB', background: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={16} color="#64748b" /></button>
            <button style={{ padding: '6px 12px', border: 'none', background: '#2952E3', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>1</button>
            <button style={{ padding: '6px 12px', border: '1px solid #E5E7EB', background: '#fff', color: '#64748b', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>2</button>
            <button style={{ padding: '6px 12px', border: '1px solid #E5E7EB', background: '#fff', color: '#64748b', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>3</button>
            <button style={{ padding: '6px', border: '1px solid #E5E7EB', background: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={16} color="#64748b" /></button>
          </div>
        </div>
      </div>

      {/* Enterprise Apply Leave Form Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw' }}>
            {/* Header */}
            <div className="p-8 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Apply Leave</h2>
                <p className="text-sm text-slate-500 mt-1">Submit a new leave request for approval.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <CustomSelect
                    label="Employee Name"
                    required
                    value={formData.employeeName}
                    onChange={handleEmployeeChange}
                    options={EMPLOYEES.map(e => e.name)}
                    placeholder="Select employee"
                  />
                  {errors.employeeName && <p className="text-xs text-red-500 mt-1.5">{errors.employeeName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Employee ID</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.employeeId}
                    placeholder="Employee ID"
                    className="w-full h-12 px-4 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-600 focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <CustomSelect
                    label="Leave Type"
                    required
                    value={formData.leaveType}
                    onChange={val => {
                      setFormData(prev => ({ ...prev, leaveType: val }));
                      if (errors.leaveType) setErrors(prev => ({ ...prev, leaveType: null }));
                    }}
                    options={LEAVE_TYPES}
                    placeholder="Select leave type"
                  />
                  {errors.leaveType && <p className="text-xs text-red-500 mt-1.5">{errors.leaveType}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.department}
                    placeholder="Department"
                    className="w-full h-12 px-4 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-600 focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={e => handleDateChange('startDate', e.target.value)}
                      className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  {errors.startDate && <p className="text-xs text-red-500 mt-1.5">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">End Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={e => handleDateChange('endDate', e.target.value)}
                      className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  {errors.endDate && <p className="text-xs text-red-500 mt-1.5">{errors.endDate}</p>}
                </div>
              </div>
              {errors.dateRange && <p className="text-xs text-red-500 font-medium -mt-3">{errors.dateRange}</p>}

              {/* Row 4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Total Days</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.totalDays}
                    className="w-full h-12 px-4 border border-slate-200 bg-slate-50 rounded-xl text-sm font-semibold text-blue-600 focus:outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <CustomSelect
                    label="Reporting Manager"
                    value={formData.reportingManager}
                    onChange={val => setFormData(prev => ({ ...prev, reportingManager: val }))}
                    options={MANAGERS}
                    placeholder="Select reporting manager"
                  />
                </div>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Leave Balance</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.leaveBalance || 'Select an employee'}
                    className="w-full h-12 px-4 border border-slate-200 bg-slate-50 rounded-xl text-sm font-semibold text-emerald-600 focus:outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <CustomSelect
                    label="Priority"
                    value={formData.priority}
                    onChange={val => setFormData(prev => ({ ...prev, priority: val }))}
                    options={['Normal', 'High', 'Urgent']}
                    placeholder="Select priority"
                  />
                </div>
              </div>

              {/* Row 6 (Full Width) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Leave <span className="text-red-500">*</span></label>
                <textarea
                  value={formData.reason}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, reason: e.target.value }));
                    if (errors.reason) setErrors(prev => ({ ...prev, reason: null }));
                  }}
                  placeholder="Enter reason for leave"
                  style={{ height: '120px' }}
                  className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-slate-800"
                />
                {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
              </div>

              {/* Row 7 (Full Width - Attachment & Status) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Attachment (PDF, JPG, PNG)</label>
                  <div className="relative flex items-center justify-center w-full h-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer px-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => setFormData(prev => ({ ...prev, attachment: e.target.files[0] }))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <Upload size={18} className="text-blue-600" />
                      <span>{formData.attachment ? formData.attachment.name : 'Upload Document'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-0">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Status <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="leaveStatus" checked={formData.status === 'Pending'} onChange={() => setFormData(prev => ({ ...prev, status: 'Pending' }))} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm font-semibold text-slate-700">Pending</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="leaveStatus" checked={formData.status === 'Approved'} onChange={() => setFormData(prev => ({ ...prev, status: 'Approved' }))} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm font-semibold text-slate-700">Approved</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="leaveStatus" checked={formData.status === 'Rejected'} onChange={() => setFormData(prev => ({ ...prev, status: 'Rejected' }))} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm font-semibold text-slate-700">Rejected</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  Apply Leave
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
