import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { MoreVertical, ChevronLeft, ChevronRight, Plus, ArrowRight, Check, X, ArrowRightLeft } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { getAvatarUrl } from '../../lib/utils';
import './employee-module.css';

export default function TransfersContent() {
  const { addToast } = useToast();
  const [transfers, setTransfers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [transferType, setTransferType] = useState('Department');
  const [newValueName, setNewValueName] = useState('Marketing');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = () => {
    setLoading(true);
    fetch("/app/employees/transfers")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTransfers(data);
          if (data.length > 0) {
            setSelectedTransfer(data[0]);
          }
        } else {
          setTransfers([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    fetch("/app/employees?status=Active")
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestTransfer = (e) => {
    e.preventDefault();
    if (!employeeId || !newValueName) {
      addToast("Please fill all fields", "error");
      return;
    }

    fetch("/app/employees/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, transferType, newValueName, effectiveDate })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to submit transfer");
      return res.json();
    })
    .then(() => {
      addToast("Transfer request submitted successfully!", "success");
      setShowAddForm(false);
      setEmployeeId('');
      loadData();
    })
    .catch(err => {
      console.error(err);
      addToast("Failed to submit transfer request", "error");
    });
  };

  const handleApprove = (transferId) => {
    fetch(`/app/employees/transfers/${transferId}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approverId: 1 }) // Default Admin
    })
    .then(res => {
      if (!res.ok) throw new Error("Approval failed");
      return res.json();
    })
    .then(() => {
      addToast("Transfer approved and employee record updated!", "success");
      loadData();
    })
    .catch(err => {
      console.error(err);
      addToast("Failed to approve transfer", "error");
    });
  };

  const totalCount = transfers.length;
  const pendingCount = transfers.filter(t => t.status === 'Pending').length;

  return (
    <div className="hrms-content">
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Transfers</h1>
        <button 
          className="hrms-primary-btn" 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Request Transfer
        </button>
      </div>

      {showAddForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            width: '580px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#FFFFFF',
            borderRadius: '22px',
            boxShadow: '0 32px 80px rgba(15, 23, 42, 0.28)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.8)'
          }}>
            {/* Modal Header */}
            <div style={{
              position: 'relative',
              padding: '20px 24px',
              background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 50%, #2563EB 100%)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '120px',
                height: '120px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 1, flex: 1, marginRight: '16px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  placeContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  flexShrink: 0,
                  lineHeight: 0,
                  padding: 0
                }}>
                  <ArrowRightLeft size={22} style={{ display: 'block', margin: 'auto' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.2px' }}>
                    Request Employee Transfer
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)' }}>
                    Reassign employee to another department, branch, or manager
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  zIndex: 1,
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  display: 'grid',
                  placeItems: 'center',
                  placeContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  marginLeft: 'auto',
                  lineHeight: 0,
                  padding: 0
                }}
              >
                <X size={18} style={{ display: 'block', margin: 'auto' }} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleRequestTransfer} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
                <div className="hrms-input-group">
                  <label className="hrms-label" style={{ fontWeight: '600', color: '#334155' }}>Select Employee *</label>
                  <AppDropdown
                    value={employeeId}
                    onChange={v => setEmployeeId(v)}
                    options={[
                      { value: '', label: 'Choose Employee...' },
                      ...employees.map(emp => ({
                        value: String(emp.id),
                        label: `${emp.first_name || emp.name || ''} ${emp.last_name || ''} (EMP${String(emp.id).padStart(4, '0')})`
                      }))
                    ]}
                    size="sm"
                  />
                </div>

                <div className="hrms-input-group">
                  <label className="hrms-label" style={{ fontWeight: '600', color: '#334155' }}>Transfer Type *</label>
                  <AppDropdown
                    value={transferType}
                    onChange={v => {
                      setTransferType(v);
                      if (v === 'Branch') setNewValueName('Westside');
                      else if (v === 'Department') setNewValueName('Marketing');
                      else setNewValueName('Super Admin');
                    }}
                    options={[
                      { value: 'Department', label: 'Department Transfer' },
                      { value: 'Branch', label: 'Branch Transfer' },
                      { value: 'Manager', label: 'Manager Transfer' }
                    ]}
                    size="sm"
                  />
                </div>

                <div className="hrms-input-group">
                  <label className="hrms-label" style={{ fontWeight: '600', color: '#334155' }}>
                    To (New {transferType} Target) *
                  </label>
                  {transferType === 'Branch' ? (
                    <AppDropdown
                      value={newValueName}
                      onChange={v => setNewValueName(v)}
                      options={[
                        { value: 'Westside', label: 'Westside' },
                        { value: 'Downtown', label: 'Downtown' },
                        { value: 'North Hills', label: 'North Hills' },
                        { value: 'East End', label: 'East End' }
                      ]}
                      size="sm"
                    />
                  ) : transferType === 'Department' ? (
                    <AppDropdown
                      value={newValueName}
                      onChange={v => setNewValueName(v)}
                      options={[
                        { value: 'Marketing', label: 'Marketing' },
                        { value: 'Sales', label: 'Sales' },
                        { value: 'Engineering', label: 'Engineering' },
                        { value: 'Customer Support', label: 'Customer Support' },
                        { value: 'Human Resources', label: 'Human Resources' }
                      ]}
                      size="sm"
                    />
                  ) : (
                    <input
                      type="text"
                      className="hrms-input"
                      value={newValueName}
                      onChange={(e) => setNewValueName(e.target.value)}
                      placeholder="Enter Manager Name..."
                      style={{ borderRadius: '10px', padding: '10px 14px', borderColor: '#CBD5E1' }}
                    />
                  )}
                </div>

                <div className="hrms-input-group">
                  <label className="hrms-label" style={{ fontWeight: '600', color: '#334155' }}>Effective Date *</label>
                  <input 
                    type="date"
                    className="hrms-input"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    style={{ borderRadius: '10px', padding: '10px 14px', borderColor: '#CBD5E1' }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 28px',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                flexShrink: 0
              }}>
                <button 
                  type="button" 
                  className="hrms-secondary-btn" 
                  onClick={() => setShowAddForm(false)}
                  style={{ borderRadius: '10px', padding: '9px 18px', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="hrms-primary-btn"
                  style={{
                    borderRadius: '10px',
                    padding: '9px 22px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="hrms-grid-4 hrms-mb-6">
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Total Transfers</span>
          <span className="hrms-stat-value hrms-text-primary">{totalCount}</span>
          <span className="hrms-stat-trend hrms-text-muted">All Time</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Pending Transfers</span>
          <span className="hrms-stat-value hrms-text-primary">{pendingCount}</span>
          <span className="hrms-stat-trend hrms-text-muted">Requires action</span>
        </div>
      </div>

      <div className="hrms-layout">
        {/* Recent Transfers Timeline List */}
        <div className="hrms-card">
          <h2 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Recent Transfers</h2>
          
          {loading ? (
            <p className="hrms-text-muted">Loading transfers...</p>
          ) : transfers.length === 0 ? (
            <p className="hrms-text-muted">No transfer logs found.</p>
          ) : (
            <div className="hrms-timeline">
              {transfers.map(item => (
                <div 
                  key={item.id} 
                  className={`hrms-timeline-item ${selectedTransfer?.id === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedTransfer(item)}
                  style={{ cursor: 'pointer', paddingBottom: '16px' }}
                >
                  <div className="hrms-timeline-dot" style={{ backgroundColor: selectedTransfer?.id === item.id ? '#2952E3' : '#cbd5e1', border: '4px solid #fff' }}></div>
                  <div className="hrms-timeline-content" style={{ backgroundColor: 'transparent', padding: '0 0 0 16px' }}>
                    <div className="hrms-flex-between hrms-mb-4">
                      <div className="hrms-user-info">
                        <img src={getAvatarUrl(item.profile_photo, item.employee_name, item.employee_id)} alt={item.employee_name} className="hrms-avatar" style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover'}} />
                        <span className="hrms-font-medium hrms-text-sm" style={{color: '#0f172a'}}>{item.employee_name}</span>
                      </div>
                      <span className="hrms-text-xs hrms-text-muted">{new Date(item.effective_date).toLocaleDateString()}</span>
                    </div>
                    <p className="hrms-text-xs hrms-text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.transfer_type} Transfer • <span className={`hrms-badge ${item.status === 'Approved' ? 'hrms-badge-active' : 'hrms-badge-pending'}`}>{item.status}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transfer Details Card */}
        {selectedTransfer && (
          <div className="hrms-card" style={{ alignSelf: 'start' }}>
            <h2 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Transfer Details</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px 24px', alignItems: 'center' }}>
              <span className="hrms-text-sm hrms-text-muted">Employee</span>
              <div className="hrms-user-info">
                <img src={getAvatarUrl(selectedTransfer.profile_photo, selectedTransfer.employee_name, selectedTransfer.employee_id)} alt={selectedTransfer.employee_name} className="hrms-avatar" style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover'}} />
                <div>
                  <span className="hrms-font-medium hrms-text-sm" style={{color: '#0f172a', display: 'block'}}>{selectedTransfer.employee_name}</span>
                  <span className="hrms-text-xs hrms-text-muted">EMP00{selectedTransfer.employee_id}</span>
                </div>
              </div>

              <div className="hrms-mt-4" style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#f1f5f9' }}></div>

              <span className="hrms-text-sm hrms-text-muted">Transfer Type</span>
              <span className="hrms-text-sm hrms-font-medium">{selectedTransfer.transfer_type} Transfer</span>

              <span className="hrms-text-sm hrms-text-muted">Effective Date</span>
              <span className="hrms-text-sm hrms-font-medium">{new Date(selectedTransfer.effective_date).toLocaleDateString()}</span>

              <span className="hrms-text-sm hrms-text-muted">Approved By</span>
              <span className="hrms-text-sm hrms-font-medium">{selectedTransfer.approved_by_name || '—'}</span>

              <span className="hrms-text-sm hrms-text-muted">Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`hrms-badge ${selectedTransfer.status === 'Approved' ? 'hrms-badge-active' : 'hrms-badge-pending'}`}>{selectedTransfer.status}</span>
              </div>
              
              {selectedTransfer.status === 'Pending' && (
                <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                  <button 
                    className="hrms-primary-btn" 
                    onClick={() => handleApprove(selectedTransfer.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Check size={16} /> Approve Transfer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
