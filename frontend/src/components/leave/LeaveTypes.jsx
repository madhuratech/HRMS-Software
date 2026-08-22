import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, User, Activity, ShieldCheck, Briefcase, Baby, BookOpen, Users, X, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const defaultLeaveTypes = [
  {
    name: 'Casual Leave',
    code: 'CL',
    desc: 'Leave for personal work and other casual reasons',
    max: 12,
    forward: 'Yes',
    status: 'Active',
    icon: <User size={18} color="#3b82f6" />,
    iconBg: '#eff6ff'
  },
  {
    name: 'Sick Leave',
    code: 'SL',
    desc: 'Leave for illness or medical reasons',
    max: 15,
    forward: 'Yes',
    status: 'Active',
    icon: <Activity size={18} color="#3b82f6" />,
    iconBg: '#eff6ff'
  },
  {
    name: 'Privilege Leave',
    code: 'PL',
    desc: 'Leave for vacation and personal reasons',
    max: 10,
    forward: 'Yes',
    status: 'Active',
    icon: <ShieldCheck size={18} color="#10b981" />,
    iconBg: '#ecfdf5'
  },
  {
    name: 'Earned Leave',
    code: 'EL',
    desc: 'Leave earned for the service period',
    max: 30,
    forward: 'Yes',
    status: 'Active',
    icon: <Briefcase size={18} color="#ef4444" />,
    iconBg: '#fef2f2'
  },
  {
    name: 'Maternity Leave',
    code: 'ML',
    desc: 'Leave for maternity and child care',
    max: 180,
    forward: 'No',
    status: 'Active',
    icon: <Baby size={18} color="#3b82f6" />,
    iconBg: '#eff6ff'
  },
  {
    name: 'Paternity Leave',
    code: 'PTL',
    desc: 'Leave for paternity and child care',
    max: 15,
    forward: 'No',
    status: 'Active',
    iconBg: '#ecfeff',
    icon: <Briefcase size={18} color="#06b6d4" />
  },
  {
    name: 'Compensatory Off',
    code: 'COMP',
    desc: 'Leave for working on holidays/weekends',
    max: 10,
    forward: 'No',
    status: 'Active',
    iconBg: '#fffbeb',
    icon: <BookOpen size={18} color="#f59e0b" />
  },
  {
    name: 'Bereavement Leave',
    code: 'BL',
    desc: 'Leave for family bereavement',
    max: 7,
    forward: 'No',
    status: 'Active',
    iconBg: '#fffbeb',
    icon: <Users size={18} color="#f59e0b" />
  }
];

export default function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState(defaultLeaveTypes);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEmployeeView, setIsEmployeeView] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    desc: '',
    maxDays: '',
    carryForward: false,
    requiresApproval: true,
    paidLeave: true,
    status: 'Active'
  });

  useEffect(() => {
    // Check if user is accessing under /employee route or has EMPLOYEE role
    const isEmpRoute = window.location.pathname.startsWith('/employee');
    let isEmpRole = false;
    const auth = localStorage.getItem('hrms_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed.role === 'EMPLOYEE' || parsed.user?.role === 'EMPLOYEE') {
          isEmpRole = true;
        }
      } catch (e) {}
    }
    setIsEmployeeView(isEmpRoute || isEmpRole);

    const fetchLeaveTypes = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/leaves/types');
        if (Array.isArray(res) && res.length > 0) {
          const formatted = res.map((lt, i) => ({
            id: lt.id,
            name: lt.name || 'Leave Type',
            code: lt.code || 'LV',
            desc: lt.description || 'Company official leave category',
            max: lt.max_days || 12,
            forward: lt.carry_forward ? 'Yes' : 'No',
            status: lt.status || 'Active',
            icon: defaultLeaveTypes[i % defaultLeaveTypes.length].icon,
            iconBg: defaultLeaveTypes[i % defaultLeaveTypes.length].iconBg
          }));
          setLeaveTypes(formatted);
        }
      } catch (err) {
        console.error("Failed to load leave types from API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/leaves/types', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      setFormData({
        name: '',
        code: '',
        desc: '',
        maxDays: '',
        carryForward: false,
        requiresApproval: true,
        paidLeave: true,
        status: 'Active'
      });
      // Refresh list
      const res = await apiFetch('/leaves/types');
      if (Array.isArray(res) && res.length > 0) {
        const formatted = res.map((lt, i) => ({
          id: lt.id,
          name: lt.name || 'Leave Type',
          code: lt.code || 'LV',
          desc: lt.description || 'Company official leave category',
          max: lt.max_days || 12,
          forward: lt.carry_forward ? 'Yes' : 'No',
          status: lt.status || 'Active',
          icon: defaultLeaveTypes[i % defaultLeaveTypes.length].icon,
          iconBg: defaultLeaveTypes[i % defaultLeaveTypes.length].iconBg
        }));
        setLeaveTypes(formatted);
      }
    } catch (err) {
      console.error("Failed to save leave type:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this leave type?")) {
      try {
        await apiFetch(`/leaves/types/${id}`, { method: 'DELETE' });
        setLeaveTypes(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        console.error("Failed to delete leave type:", err);
      }
    }
  };

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid #f1f5f9',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', padding: '24px', width: '100%' }}>
      {/* Header & Toolbar (Only show Add Leave Type button if NOT employee view) */}
      {!isEmployeeView && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#2952E3',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add Leave Type
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Main Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9' }}>Leave Type</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9' }}>Description</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9', textAlign: 'center', whiteSpace: 'nowrap' }}>Short Code</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9', textAlign: 'center', whiteSpace: 'nowrap' }}>Max Days</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9', textAlign: 'center', whiteSpace: 'nowrap' }}>Carry Forward</th>
                  <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>Status</th>
                  {!isEmployeeView && (
                    <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isEmployeeView ? 6 : 7} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                      Loading Leave Types…
                    </td>
                  </tr>
                ) : (
                  leaveTypes.map((type, idx) => (
                    <tr key={idx} style={{ borderBottom: idx === leaveTypes.length - 1 ? 'none' : '1px solid #f8fafc' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: type.iconBg || '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {type.icon || <Briefcase size={18} color="#3b82f6" />}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155', whiteSpace: 'nowrap' }}>{type.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b', whiteSpace: 'nowrap' }}>{type.desc}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontWeight: '600', textAlign: 'center' }}>{type.code}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', textAlign: 'center' }}>{type.max}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', textAlign: 'center' }}>{type.forward}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: type.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                          color: type.status === 'Active' ? '#10b981' : '#ef4444',
                          border: `1px solid ${type.status === 'Active' ? '#d1fae5' : '#fee2e2'}`
                        }}>
                          {type.status}
                        </span>
                      </td>
                      {!isEmployeeView && (
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <button
                              onClick={() => setShowModal(true)}
                              style={{
                                background: '#eff6ff',
                                border: '1px solid #dbeafe',
                                borderRadius: '6px',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#3b82f6',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(type.id)}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fee2e2',
                                borderRadius: '6px',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#ef4444',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Leave Type Modal (Admin view only) */}
      {!isEmployeeView && showModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw' }}>
            <div className="p-8 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Add Leave Type</h2>
                <p className="text-sm text-slate-500 mt-1">Configure a new leave category and policy parameters.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Leave Type Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Casual Leave" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Leave Code <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. CL" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Maximum Days Allowed <span className="text-red-500">*</span></label>
                  <input type="number" required value={formData.maxDays} onChange={e => setFormData({ ...formData, maxDays: e.target.value })} placeholder="e.g. 12" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Carry Forward</label>
                  <div className="flex items-center gap-4 h-12">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="carryForward" checked={formData.carryForward} onChange={() => setFormData({ ...formData, carryForward: true })} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="carryForward" checked={!formData.carryForward} onChange={() => setFormData({ ...formData, carryForward: false })} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-700">No</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Requires Approval</label>
                  <div className="flex items-center gap-4 h-12">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="requiresApproval" checked={formData.requiresApproval} onChange={() => setFormData({ ...formData, requiresApproval: true })} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="requiresApproval" checked={!formData.requiresApproval} onChange={() => setFormData({ ...formData, requiresApproval: false })} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-700">No</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Paid Leave</label>
                  <div className="flex items-center gap-4 h-12">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="paidLeave" checked={formData.paidLeave} onChange={() => setFormData({ ...formData, paidLeave: true })} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="paidLeave" checked={!formData.paidLeave} onChange={() => setFormData({ ...formData, paidLeave: false })} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-700">No</span>
                    </label>
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} placeholder="Enter leave description" style={{ height: '100px' }} className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Status <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="leaveTypeStatus" checked={formData.status === 'Active'} onChange={() => setFormData({ ...formData, status: 'Active' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm font-semibold text-slate-700">Active</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="leaveTypeStatus" checked={formData.status === 'Inactive'} onChange={() => setFormData({ ...formData, status: 'Inactive' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm font-semibold text-slate-700">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md">Save Leave Type</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
