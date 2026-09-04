import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { apiFetch } from '../../lib/api';
import { getAvatarUrl } from '../../lib/utils';
import { Calendar as CalendarIcon, Filter, MoreHorizontal, ChevronDown, Plus, X, Check, Trash2, RotateCcw } from 'lucide-react';

export default function Overtime() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [overtimeData, setOvertimeData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    hours: '02h 00m',
    reason: ''
  });

  const loadEmployees = async () => {
    try {
      const data = await apiFetch('/employees?status=Active');
      if (Array.isArray(data)) {
        setEmployees(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, employee_id: data[0].id }));
        }
      }
    } catch (e) {
      console.error("Failed to load employees:", e);
    }
  };

  const loadOvertime = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/attendance/overtime');
      if (Array.isArray(data)) {
        setOvertimeData(data);
      }
    } catch (e) {
      console.error("Failed to load overtime records:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOvertime();
    loadEmployees();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    // Optimistically update local state for instant UI responsiveness
    setOvertimeData(prev => prev.map(rec => rec.id === id ? { ...rec, status: newStatus } : rec));
    try {
      await apiFetch(`/attendance/overtime/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      await loadOvertime();
    } catch (err) {
      console.error("Failed to update status:", err);
      await loadOvertime();
    }
  };

  const handleReset = async (id) => {
    await handleUpdateStatus(id, 'Pending');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this overtime record?")) return;
    setOvertimeData(prev => prev.filter(rec => rec.id !== id));
    try {
      await apiFetch(`/attendance/overtime/${id}`, { method: 'DELETE' });
      await loadOvertime();
    } catch (err) {
      console.error("Failed to delete overtime record:", err);
      await loadOvertime();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.date || !formData.hours) return;

    try {
      const selectedEmp = employees.find(emp => String(emp.id) === String(formData.employee_id));
      const formattedDate = new Date(formData.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

      await apiFetch('/attendance/overtime', {
        method: 'POST',
        body: JSON.stringify({
          employee_id: formData.employee_id,
          employee_name: selectedEmp ? selectedEmp.name : 'Employee',
          date: formattedDate,
          hours: formData.hours,
          reason: formData.reason
        })
      });
      await loadOvertime();
    } catch (err) {
      console.error("Failed to log overtime:", err);
    }

    setFormData({
      employee_id: employees.length > 0 ? employees[0].id : '',
      date: new Date().toISOString().split('T')[0],
      hours: '02h 00m',
      reason: ''
    });
    setShowAddModal(false);
  };

  // Helper calculation functions for KPIs
  const parseOvertimeMinutes = (str) => {
    if (!str) return 0;
    const hMatch = String(str).match(/(\d+)\s*h/i);
    const mMatch = String(str).match(/(\d+)\s*m/i);
    let mins = 0;
    if (hMatch) mins += parseInt(hMatch[1], 10) * 60;
    if (mMatch) mins += parseInt(mMatch[1], 10);
    if (!hMatch && !mMatch) {
      const floatVal = parseFloat(str);
      if (!isNaN(floatVal)) mins = Math.round(floatVal * 60);
    }
    return mins;
  };

  const formatMinutesToHours = (totalMins) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m}m`;
  };

  const totalMins = overtimeData.reduce((acc, curr) => acc + parseOvertimeMinutes(curr.hours), 0);
  const pendingMins = overtimeData.filter(d => d.status === 'Pending').reduce((acc, curr) => acc + parseOvertimeMinutes(curr.hours), 0);
  const approvedMins = overtimeData.filter(d => d.status === 'Approved').reduce((acc, curr) => acc + parseOvertimeMinutes(curr.hours), 0);

  return (
    <div className="hrms-content">
      {/* Header and Toolbar */}
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '16px' }}>
        <div className="hrms-flex-start" style={{ flexWrap: 'nowrap', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '180px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>August 2026</span>
            <CalendarIcon size={16} style={{ color: '#64748b' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '160px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Departments</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '160px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Status</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Filter size={16} /> Filter
          </button>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ height: 38, padding: '0 16px', background: '#2563EB', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <Plus size={15} /> Log Overtime
        </button>
      </div>

      <div style={{ width: '100%', flex: 1, display: 'flex' }}>
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: 0 }}>
          {/* Dynamic KPI Cards */}
          <div className="hrms-grid-4">
            <div className="hrms-card hrms-stat-card">
              <div className="hrms-text-sm hrms-font-medium hrms-text-muted" style={{ marginBottom: '12px' }}>Total Overtime Hours</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>{formatMinutesToHours(totalMins)}</div>
            </div>
            <div className="hrms-card hrms-stat-card">
              <div className="hrms-text-sm hrms-font-medium hrms-text-muted" style={{ marginBottom: '12px' }}>Total Employees</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>{employees.length || 1}</div>
            </div>
            <div className="hrms-card hrms-stat-card">
              <div className="hrms-text-sm hrms-font-medium hrms-text-muted" style={{ marginBottom: '12px' }}>Pending Approval</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{formatMinutesToHours(pendingMins)}</div>
            </div>
            <div className="hrms-card hrms-stat-card">
              <div className="hrms-text-sm hrms-font-medium hrms-text-muted" style={{ marginBottom: '12px' }}>Approved Hours</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{formatMinutesToHours(approvedMins)}</div>
            </div>
          </div>

          {/* Main Table */}
          <div className="hrms-card" style={{ padding: '0', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '12px' }}>
            <div className="hrms-table-container">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Overtime Hours</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading overtime records...</td>
                    </tr>
                  ) : overtimeData.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No overtime records found.</td>
                    </tr>
                  ) : (
                    overtimeData.map((record) => (
                      <tr key={record.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div className="hrms-user-info">
                            <img src={getAvatarUrl(record.profile_photo || record.avatar, record.employee_name, record.employee_id || record.id)} alt={record.employee_name} className="hrms-avatar" style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover'}} />
                            <span className="hrms-font-medium hrms-text-primary">{record.employee_name}</span>
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{record.date}</td>
                        <td style={{ whiteSpace: 'nowrap' }} className="hrms-font-medium">{record.hours}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{record.reason}</td>
                        <td>
                          <span style={{
                            padding: '6px 16px', 
                            borderRadius: '6px', 
                            fontSize: '12px', 
                            fontWeight: '600',
                            backgroundColor: record.status === 'Approved' ? '#ecfdf5' : record.status === 'Rejected' ? '#fef2f2' : '#fff7ed',
                            color: record.status === 'Approved' ? '#10b981' : record.status === 'Rejected' ? '#dc2626' : '#ea580c'
                          }}>
                            {record.status}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                            {record.status === 'Pending' ? (
                              <>
                                <button 
                                  title="Approve Overtime"
                                  onClick={() => handleUpdateStatus(record.id, 'Approved')}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0',
                                    borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600',
                                    cursor: 'pointer', transition: 'all 0.15s ease'
                                  }}
                                >
                                  <Check size={14} strokeWidth={2.5} /> Approve
                                </button>
                                <button 
                                  title="Reject Overtime"
                                  onClick={() => handleUpdateStatus(record.id, 'Rejected')}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA',
                                    borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600',
                                    cursor: 'pointer', transition: 'all 0.15s ease'
                                  }}
                                >
                                  <X size={14} strokeWidth={2.5} /> Reject
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  title="Reset Status to Pending"
                                  onClick={() => handleReset(record.id)}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0',
                                    borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600',
                                    cursor: 'pointer', transition: 'all 0.15s ease'
                                  }}
                                >
                                  <RotateCcw size={14} strokeWidth={2.5} /> Reset
                                </button>
                                <button
                                  title="Delete Record"
                                  onClick={() => handleDelete(record.id)}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA',
                                    borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer'
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            <div className="hrms-flex-between" style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
              <span className="hrms-text-sm hrms-text-muted">
                Showing {overtimeData.length} entries
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Log Overtime Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#F8FAFC' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Log Overtime Record</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Employee *</label>
                <AppDropdown value={formData.employee_id} options={[, ...(employees || [])]} size="sm" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Overtime Hours *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 02h 30m"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Reason</label>
                <textarea
                  rows={3}
                  placeholder="Brief reason for overtime..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 18px', background: '#2563EB', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
