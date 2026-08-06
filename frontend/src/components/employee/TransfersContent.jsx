import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { useToast } from '../ui/Toast';
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
    fetch("http://localhost:3000/app/employees/transfers")
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

    fetch("http://localhost:3000/app/employees")
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

    fetch("http://localhost:3000/app/employees/transfers", {
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
    fetch(`http://localhost:3000/app/employees/transfers/${transferId}/approve`, {
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
              <select 
                className="hrms-select"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">Choose Employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} (EMP00{e.id})</option>)}
              </select>
            </div>
            <div className="hrms-input-group">
              <label className="hrms-label">Transfer Type *</label>
              <select 
                className="hrms-select"
                value={transferType}
                onChange={(e) => {
                  setTransferType(e.target.value);
                  if (e.target.value === 'Branch') setNewValueName('Westside');
                  else if (e.target.value === 'Department') setNewValueName('Marketing');
                  else setNewValueName('Super Admin');
                }}
              >
                <option value="Department">Department Transfer</option>
                <option value="Branch">Branch Transfer</option>
                <option value="Manager">Manager Transfer</option>
              </select>
            </div>
            <div className="hrms-input-group">
              <label className="hrms-label">To (New Department/Branch/Manager Name) *</label>
              {transferType === 'Branch' ? (
                <select className="hrms-select" value={newValueName} onChange={(e) => setNewValueName(e.target.value)}>
                  <option value="Westside">Westside</option>
                  <option value="Downtown">Downtown</option>
                  <option value="North Hills">North Hills</option>
                  <option value="East End">East End</option>
                </select>
              ) : transferType === 'Department' ? (
                <select className="hrms-select" value={newValueName} onChange={(e) => setNewValueName(e.target.value)}>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
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
                        <img src={`https://i.pravatar.cc/150?u=EMP00${item.employee_id}`} alt={item.employee_name} className="hrms-avatar" style={{width: '32px', height: '32px'}} />
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
                <img src={`https://i.pravatar.cc/150?u=EMP00${selectedTransfer.employee_id}`} alt={selectedTransfer.employee_name} className="hrms-avatar" style={{width: '40px', height: '40px'}} />
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
