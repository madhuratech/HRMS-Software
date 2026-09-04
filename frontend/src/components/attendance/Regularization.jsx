import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { apiFetch } from '../../lib/api';
import { getAvatarUrl } from '../../lib/utils';
import { Search, Filter, Download, Calendar as CalendarIcon, Edit2, Eye, ChevronDown, Check, X, Plus } from 'lucide-react';

export default function Regularization() {
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form State for new regularization request
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Late Arrival',
    time: '09:30 AM',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

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

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/attendance/regularization?status=${activeTab}`);
      if (Array.isArray(data)) {
        setRequests(data);
      }
    } catch (e) {
      console.error("Failed to load regularization requests:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
    loadEmployees();
  }, [activeTab]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await apiFetch(`/attendance/regularization/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      await loadRequests();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      alert("Please provide a reason for the regularization request.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedEmp = employees.find(emp => String(emp.id) === String(formData.employee_id));
      const formattedDate = new Date(formData.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

      await apiFetch('/attendance/regularization', {
        method: 'POST',
        body: JSON.stringify({
          employee_id: formData.employee_id,
          employee_name: selectedEmp ? selectedEmp.name : 'Employee',
          date: formattedDate,
          type: formData.type,
          time: formData.time,
          reason: formData.reason
        })
      });

      setShowApplyModal(false);
      setFormData(prev => ({ ...prev, reason: '' }));
      await loadRequests();
    } catch (err) {
      console.error("Failed to create regularization request:", err);
      alert("Failed to submit request. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="hrms-content">
      {/* Header and Tabs */}
      <div className="hrms-header" style={{ paddingBottom: '0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Attendance Regularization</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Review and manage employee punch correction & regularization requests</p>
          </div>
          <button
            onClick={() => setShowApplyModal(true)}
            className="hrms-primary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563EB' }}
          >
            <Plus size={16} /> Apply Regularization
          </button>
        </div>

        <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e2e8f0', width: '100%', justifyContent: 'flex-start' }}>
          <button 
            style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'pending' ? '2px solid #2563EB' : '2px solid transparent', color: activeTab === 'pending' ? '#2563EB' : '#64748b', fontWeight: activeTab === 'pending' ? '600' : '400', cursor: 'pointer' }}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests
          </button>
          <button 
            style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'approved' ? '2px solid #2563EB' : '2px solid transparent', color: activeTab === 'approved' ? '#2563EB' : '#64748b', fontWeight: activeTab === 'approved' ? '600' : '400', cursor: 'pointer' }}
            onClick={() => setActiveTab('approved')}
          >
            Approved Requests
          </button>
          <button 
            style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'rejected' ? '2px solid #2563EB' : '2px solid transparent', color: activeTab === 'rejected' ? '#2563EB' : '#64748b', fontWeight: activeTab === 'rejected' ? '600' : '400', cursor: 'pointer' }}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected Requests
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '16px' }}>
          <div className="hrms-flex-start" style={{ flexWrap: 'nowrap', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '160px', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Departments</span>
              <ChevronDown size={16} style={{ color: '#94a3b8' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '160px', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Types</span>
              <ChevronDown size={16} style={{ color: '#94a3b8' }} />
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', flex: 1, display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: 0 }}>
          <div className="hrms-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '12px' }}>
            <div className="hrms-table-container">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading requests...</td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No {activeTab} regularization requests found.</td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div className="hrms-user-info">
                            <img src={getAvatarUrl(req.profile_photo || req.avatar, req.employee_name, req.employee_id || req.id)} alt={req.employee_name} className="hrms-avatar" style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover'}} />
                            <span className="hrms-font-medium hrms-text-primary">{req.employee_name}</span>
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }} className="hrms-font-medium">{req.date}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{req.type}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{req.reason}</td>
                        <td>
                          <span style={{
                            padding: '6px 16px', 
                            borderRadius: '6px', 
                            fontSize: '12px', 
                            fontWeight: '600',
                            backgroundColor: req.status === 'Approved' ? '#f0fdf4' : req.status === 'Rejected' ? '#fef2f2' : '#fff7ed',
                            color: req.status === 'Approved' ? '#16a34a' : req.status === 'Rejected' ? '#dc2626' : '#ea580c'
                          }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {activeTab === 'pending' && (
                              <>
                                <button 
                                  title="Approve"
                                  onClick={() => handleUpdateStatus(req.id, 'Approved')}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', color: '#16a34a' }}
                                >
                                  <Check size={16} />
                                </button>
                                <button 
                                  title="Reject"
                                  onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', color: '#dc2626' }}
                                >
                                  <X size={16} />
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
            
            <div className="hrms-flex-between" style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
              <span className="hrms-text-sm hrms-text-muted">
                Showing {requests.length} entries
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Regularization Modal */}
      {showApplyModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#FFF', borderRadius: 16, width: '100%', maxWidth: 480,
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #E2E8F0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC'
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>New Regularization Request</h3>
              <button onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={handleCreateRequest} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Employee</label>
                <AppDropdown value={formData.employee_id} options={[, ...(employees || [])]} size="sm" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 14, color: '#0F172A', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Type</label>
                  <AppDropdown
                value={formData.type}
                onChange={v => setFormData({ ...formData, type: v })}
                options={[{value:'Late Arrival',label:'Late Arrival'},{value:'Early Exit',label:'Early Exit'},{value:'Missed Punch',label:'Missed Punch'},{value:'On-Duty',label:'On-Duty'},{value:'Absent',label:'Absent'}]}
                size="sm"
              />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Regularization Reason</label>
                <textarea
                  rows="3"
                  placeholder="State the reason for regularization request..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 14, color: '#0F172A', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  style={{ padding: '10px 16px', background: '#F1F5F9', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '10px 20px', background: '#2563EB', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#FFF', cursor: 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
