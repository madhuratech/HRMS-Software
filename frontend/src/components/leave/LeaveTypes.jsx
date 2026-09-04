import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, User, Activity, ShieldCheck, Briefcase, Baby, BookOpen, Users, X, Loader2, ShieldAlert } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { usePermissions } from '../../context/PermissionContext';

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
    name: 'Earned Leave',
    code: 'EL',
    desc: 'Privilege leaves earned for active service days',
    max: 18,
    forward: 'Yes',
    status: 'Active',
    icon: <Briefcase size={18} color="#3b82f6" />,
    iconBg: '#eff6ff'
  },
  {
    name: 'Maternity Leave',
    code: 'ML',
    desc: 'Paid leave provided to female employees for childbirth',
    max: 180,
    forward: 'No',
    status: 'Active',
    icon: <Baby size={18} color="#3b82f6" />,
    iconBg: '#eff6ff'
  },
  {
    name: 'Paternity Leave',
    code: 'PL',
    desc: 'Paid leave provided to male employees after childbirth',
    max: 15,
    forward: 'No',
    status: 'Active',
    icon: <Users size={18} color="#3b82f6" />,
    iconBg: '#eff6ff'
  },
  {
    name: 'Bereavement Leave',
    code: 'BL',
    desc: 'Compassionate leave for death of an immediate family member',
    max: 5,
    forward: 'No',
    status: 'Active',
    icon: <ShieldCheck size={18} color="#3b82f6" />,
    iconBg: '#eff6ff'
  },
  {
    name: 'Compensatory Off',
    code: 'COMP',
    desc: 'Leave given against work done on weekends or holidays',
    max: 10,
    forward: 'No',
    status: 'Active',
    icon: <BookOpen size={18} color="#3b82f6" />,
    iconBg: '#eff6ff'
  }
];

export default function LeaveTypes() {
  const { canView, canCreate, canUpdate, canDelete, loadingPermissions } = usePermissions();

  const isAllowedView = canView('leave', 'leave_types');
  const isAllowedCreate = canCreate('leave', 'leave_types');
  const isAllowedUpdate = canUpdate('leave', 'leave_types');
  const isAllowedDelete = canDelete('leave', 'leave_types');

  const [leaveTypes, setLeaveTypes] = useState(defaultLeaveTypes);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  const fetchLeaveTypes = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (isAllowedView) {
      fetchLeaveTypes();
    } else {
      setLoading(false);
    }
  }, [isAllowedView, fetchLeaveTypes]);

  const handleOpenCreate = () => {
    if (!isAllowedCreate) {
      alert("Permission Denied: You do not have permission to add leave types.");
      return;
    }
    setEditingId(null);
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
    setShowModal(true);
  };

  const handleOpenEdit = (type) => {
    if (!isAllowedUpdate) {
      alert("Permission Denied: You do not have permission to edit leave types.");
      return;
    }
    setEditingId(type.id);
    setFormData({
      name: type.name || '',
      code: type.code || '',
      desc: type.desc || '',
      maxDays: type.max !== undefined ? String(type.max) : '',
      carryForward: type.forward === 'Yes',
      requiresApproval: true,
      paidLeave: true,
      status: type.status || 'Active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      if (!isAllowedUpdate) {
        alert("Permission Denied: You do not have permission to edit leave types.");
        return;
      }
      try {
        await apiFetch(`/leaves/types/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setShowModal(false);
        setEditingId(null);
        fetchLeaveTypes();
      } catch (err) {
        console.error("Failed to update leave type:", err);
      }
    } else {
      if (!isAllowedCreate) {
        alert("Permission Denied: You do not have permission to create leave types.");
        return;
      }
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
        fetchLeaveTypes();
      } catch (err) {
        console.error("Failed to save leave type:", err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!isAllowedDelete) {
      alert("Permission Denied: You do not have permission to delete leave types.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this leave type?")) {
      try {
        await apiFetch(`/leaves/types/${id}`, { method: 'DELETE' });
        setLeaveTypes(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        console.error("Failed to delete leave type:", err);
      }
    }
  };

  if (loadingPermissions) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', color: '#64748b' }}>
        <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
        <span>Verifying access permissions...</span>
      </div>
    );
  }

  if (!isAllowedView) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '12px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>Access Denied</h2>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>You do not have permission to view Leave Types. Please contact your administrator.</p>
      </div>
    );
  }

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid #f1f5f9',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', padding: '24px', width: '100%' }}>
      {isAllowedCreate && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            onClick={handleOpenCreate}
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
                  {(isAllowedUpdate || isAllowedDelete) && (
                    <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={(isAllowedUpdate || isAllowedDelete) ? 7 : 6} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
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
                      {(isAllowedUpdate || isAllowedDelete) && (
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {isAllowedUpdate && (
                              <button
                                onClick={() => handleOpenEdit(type)}
                                title="Edit Leave Type"
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
                            )}
                            {isAllowedDelete && (
                              <button
                                onClick={() => handleDelete(type.id)}
                                title="Delete Leave Type"
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
                            )}
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

      {showModal && (editingId ? isAllowedUpdate : isAllowedCreate) && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw' }}>
            <div className="p-8 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">{editingId ? 'Edit Leave Type' : 'Add Leave Type'}</h2>
                <p className="text-sm text-slate-500 mt-1">{editingId ? 'Update existing leave category policy parameters.' : 'Configure a new leave category and policy parameters.'}</p>
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
                <button type="submit" className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md">{editingId ? 'Update Leave Type' : 'Save Leave Type'}</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
