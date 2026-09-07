import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, User, Activity, ShieldCheck, Briefcase, Baby, BookOpen, Users, X, Loader2, ShieldAlert, CheckCircle2, Layers } from 'lucide-react';
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)' }}>
          <div style={{ width: '640px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '22px', boxShadow: '0 32px 80px rgba(15, 23, 42, 0.28)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.8)' }}>
            
            {/* Modal Header */}
            <div style={{ position: 'relative', padding: '20px 24px', background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 50%, #2563EB 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-40px', left: '20%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 1, flex: 1, marginRight: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.3)', display: 'grid', placeItems: 'center', placeContent: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', flexShrink: 0, lineHeight: 0, padding: 0 }}>
                  <Layers size={22} color="#FFFFFF" style={{ display: 'block', margin: 'auto' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                    {editingId ? 'Edit Leave Type' : 'Add Leave Type'}
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    {editingId ? 'Update existing leave category policy parameters' : 'Configure a new leave category and policy parameters'}
                  </p>
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
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>
                    Leave Type Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="e.g. Casual Leave" 
                    style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '11px', border: '1.5px solid #E2E8F0', fontSize: '13.5px', color: '#1E293B', background: '#FAFBFC', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)'; e.target.style.background = '#FFF'; }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAFBFC'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>
                    Leave Code <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={formData.code} 
                    onChange={e => setFormData({ ...formData, code: e.target.value })} 
                    placeholder="e.g. CL" 
                    style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '11px', border: '1.5px solid #E2E8F0', fontSize: '13.5px', color: '#1E293B', background: '#FAFBFC', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)'; e.target.style.background = '#FFF'; }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAFBFC'; }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>
                    Maximum Days Allowed <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="number" 
                    required 
                    value={formData.maxDays} 
                    onChange={e => setFormData({ ...formData, maxDays: e.target.value })} 
                    placeholder="e.g. 12" 
                    style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '11px', border: '1.5px solid #E2E8F0', fontSize: '13.5px', color: '#1E293B', background: '#FAFBFC', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)'; e.target.style.background = '#FFF'; }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAFBFC'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Carry Forward</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, carryForward: opt.val })}
                        style={{
                          flex: 1,
                          height: '44px',
                          borderRadius: '11px',
                          border: formData.carryForward === opt.val ? '1.5px solid #2563EB' : '1.5px solid #E2E8F0',
                          background: formData.carryForward === opt.val ? '#EFF6FF' : '#FAFBFC',
                          color: formData.carryForward === opt.val ? '#1D4ED8' : '#64748B',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Requires Approval</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, requiresApproval: opt.val })}
                        style={{
                          flex: 1,
                          height: '44px',
                          borderRadius: '11px',
                          border: formData.requiresApproval === opt.val ? '1.5px solid #2563EB' : '1.5px solid #E2E8F0',
                          background: formData.requiresApproval === opt.val ? '#EFF6FF' : '#FAFBFC',
                          color: formData.requiresApproval === opt.val ? '#1D4ED8' : '#64748B',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Paid Leave</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, paidLeave: opt.val })}
                        style={{
                          flex: 1,
                          height: '44px',
                          borderRadius: '11px',
                          border: formData.paidLeave === opt.val ? '1.5px solid #2563EB' : '1.5px solid #E2E8F0',
                          background: formData.paidLeave === opt.val ? '#EFF6FF' : '#FAFBFC',
                          color: formData.paidLeave === opt.val ? '#1D4ED8' : '#64748B',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Description</label>
                <textarea 
                  value={formData.desc} 
                  onChange={e => setFormData({ ...formData, desc: e.target.value })} 
                  placeholder="Enter leave description..." 
                  style={{ width: '100%', height: '80px', padding: '12px 14px', borderRadius: '11px', border: '1.5px solid #E2E8F0', fontSize: '13.5px', color: '#1E293B', background: '#FAFBFC', outline: 'none', transition: 'all 0.2s', resize: 'none', boxSizing: 'border-box' }} 
                  onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)'; e.target.style.background = '#FFF'; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAFBFC'; }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>
                  Status <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['Active', 'Inactive'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: st })}
                      style={{
                        padding: '8px 20px',
                        borderRadius: '9999px',
                        border: formData.status === st ? (st === 'Active' ? '1.5px solid #10B981' : '1.5px solid #64748B') : '1.5px solid #E2E8F0',
                        background: formData.status === st ? (st === 'Active' ? '#ECFDF5' : '#F1F5F9') : '#FAFBFC',
                        color: formData.status === st ? (st === 'Active' ? '#047857' : '#334155') : '#64748B',
                        fontWeight: '700',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
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
                  {editingId ? 'Update Leave Type' : 'Save Leave Type'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
