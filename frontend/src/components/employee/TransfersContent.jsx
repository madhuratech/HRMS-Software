import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { MoreVertical, ChevronLeft, ChevronRight, Plus, ArrowRight, Check } from 'lucide-react';
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
        <form onSubmit={handleRequestTransfer} className="hrms-card hrms-mb-6" style={{ maxWidth: '600px' }}>
          <h3 className="hrms-font-semibold hrms-mb-4">Request Employee Transfer</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="hrms-input-group">
              <label className="hrms-label">Select Employee *</label>
              <AppDropdown
                value={employeeId}
                onChange={v => setEmployeeId(v)}
                options={[{value:'',label:'Choose Employee'}]}
                size="sm"
              />
            </div>
            <div className="hrms-input-group">
              <label className="hrms-label">Transfer Type *</label>
              <AppDropdown
                value={transferType}
                onChange={v => {
                  setTransferType(v);
                  if (v === 'Branch') setNewValueName('Westside');
                  else if (v === 'Department') setNewValueName('Marketing');
                  else setNewValueName('Super Admin');
                }}
                options={[{value:'Department',label:'Department Transfer'},{value:'Branch',label:'Branch Transfer'},{value:'Manager',label:'Manager Transfer'}]}
                size="sm"
              />
            </div>
            <div className="hrms-input-group">
              <label className="hrms-label">To (New Department/Branch/Manager Name) *</label>
              {transferType === 'Branch' ? (
                <AppDropdown
                value={newValueName}
                onChange={v => setNewValueName(v)}
                options={[{value:'Westside',label:'Westside'},{value:'Downtown',label:'Downtown'},{value:'North Hills',label:'North Hills'},{value:'East End',label:'East End'}]}
                size="sm"
              />
              ) : transferType === 'Department' ? (
                <AppDropdown
                value={newValueName}
                onChange={v => setNewValueName(v)}
                options={[{value:'Marketing',label:'Marketing'},{value:'Sales',label:'Sales'},{value:'Engineering',label:'Engineering'},{value:'Customer Support',label:'Customer Support'},{value:'Human Resources',label:'Human Resources'}]}
                size="sm"
              />
              ) : (
                <input type="text" className="hrms-input" value={newValueName} onChange={(e) => setNewValueName(e.target.value)} placeholder="Manager Name" />
              )}
            </div>
            <div className="hrms-input-group">
              <label className="hrms-label">Effective Date *</label>
              <input 
                type="date"
                className="hrms-input"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="hrms-secondary-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="submit" className="hrms-primary-btn">Submit Request</button>
          </div>
        </form>
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
