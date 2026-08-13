import React, { useState, useEffect } from 'react';
import { Clock, Briefcase, CheckCircle2, RefreshCw, DollarSign, FileText, Plus, Check } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { getAvatarUrl } from '../../lib/utils';
import './employee-module.css';

export default function ExitManagement() {
  const { addToast } = useToast();
  const [exits, setExits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedExit, setSelectedExit] = useState(null);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [exitType, setExitType] = useState('Resignation');
  const [reason, setReason] = useState('');
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split('T')[0]);
  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = () => {
    setLoading(true);
    fetch("http://localhost:3000/app/employees/exits")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExits(data);
          if (data.length > 0) {
            setSelectedExit(data[0]);
          }
        } else {
          setExits([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    fetch("http://localhost:3000/app/employees?status=Active")
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExit = (e) => {
    e.preventDefault();
    if (!employeeId) {
      addToast("Please select an employee", "error");
      return;
    }

    fetch("http://localhost:3000/app/employees/exits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, exitType, noticeDate, exitDate, reason })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to file exit");
      return res.json();
    })
    .then(() => {
      addToast("Exit process recorded successfully!", "success");
      setShowAddForm(false);
      setEmployeeId('');
      loadData();
    })
    .catch(err => {
      console.error(err);
      addToast("Failed to save exit record", "error");
    });
  };

  const handleSettle = (exitId) => {
    fetch(`http://localhost:3000/app/employees/exits/${exitId}/settle`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    })
    .then(res => {
      if (!res.ok) throw new Error("Settlement failed");
      return res.json();
    })
    .then(() => {
      addToast("Exit settled and employee deactivated!", "success");
      loadData();
    })
    .catch(err => {
      console.error(err);
      addToast("Failed to settle exit", "error");
    });
  };

  const resignedCount = exits.filter(e => e.exit_type === 'Resignation').length;
  const terminatedCount = exits.filter(e => e.exit_type === 'Termination').length;
  const retiredCount = exits.filter(e => e.exit_type === 'Retirement').length;

  return (
    <div className="hrms-content">
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Exit Management</h1>
        <button 
          className="hrms-primary-btn" 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> File Resignation/Termination
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateExit} className="hrms-card hrms-mb-6" style={{ maxWidth: '600px' }}>
          <h3 className="hrms-font-semibold hrms-mb-4">File Employee Exit Process</h3>
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
              <label className="hrms-label">Exit Type *</label>
              <select 
                className="hrms-select"
                value={exitType}
                onChange={(e) => setExitType(e.target.value)}
              >
                <option value="Resignation">Resignation</option>
                <option value="Termination">Termination</option>
                <option value="Retirement">Retirement</option>
              </select>
            </div>
            <div className="hrms-input-group">
              <label className="hrms-label">Notice Date *</label>
              <input type="date" className="hrms-input" value={noticeDate} onChange={(e) => setNoticeDate(e.target.value)} />
            </div>
            <div className="hrms-input-group">
              <label className="hrms-label">Last Working Date *</label>
              <input type="date" className="hrms-input" value={exitDate} onChange={(e) => setExitDate(e.target.value)} />
            </div>
            <div className="hrms-input-group" style={{ gridColumn: 'span 2' }}>
              <label className="hrms-label">Reason *</label>
              <textarea className="hrms-input" rows="2" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for exit..." style={{ height: 'auto' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="hrms-secondary-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="submit" className="hrms-primary-btn">File Exit</button>
          </div>
        </form>
      )}

      <div className="hrms-grid-4 hrms-mb-6">
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Employees Resigned</span>
          <span className="hrms-stat-value hrms-text-primary">{resignedCount}</span>
          <span className="hrms-stat-trend hrms-text-muted">This Year</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Terminated</span>
          <span className="hrms-stat-value hrms-text-danger">{terminatedCount}</span>
          <span className="hrms-stat-trend hrms-text-muted">This Year</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Retired</span>
          <span className="hrms-stat-value" style={{color: '#f59e0b'}}>{retiredCount}</span>
          <span className="hrms-stat-trend hrms-text-muted">This Year</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Total Processed</span>
          <span className="hrms-stat-value hrms-text-primary">{exits.length}</span>
          <span className="hrms-stat-trend hrms-text-muted">All Time</span>
        </div>
      </div>

      <div className="hrms-layout" style={{ gridTemplateColumns: '300px 1fr' }}>
        {/* Exit Process Overview Sidebar */}
        {selectedExit && (
          <div className="hrms-card" style={{ alignSelf: 'start' }}>
            <h2 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Exit Process: {selectedExit.employee_name}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="hrms-flex-between">
                <div className="hrms-flex-start" style={{ gap: '12px' }}>
                  <Clock size={16} className="hrms-text-muted" />
                  <span className="hrms-text-sm hrms-font-medium">Notice Submitted</span>
                </div>
                <span className="hrms-badge hrms-badge-active">{new Date(selectedExit.notice_date).toLocaleDateString()}</span>
              </div>
              
              <div className="hrms-flex-between">
                <div className="hrms-flex-start" style={{ gap: '12px' }}>
                  <Briefcase size={16} className="hrms-text-muted" />
                  <span className="hrms-text-sm hrms-font-medium">Exit Type</span>
                </div>
                <span className="hrms-badge hrms-badge-active">{selectedExit.exit_type}</span>
              </div>
              
              <div className="hrms-flex-between">
                <div className="hrms-flex-start" style={{ gap: '12px' }}>
                  <CheckCircle2 size={16} className="hrms-text-muted" />
                  <span className="hrms-text-sm hrms-font-medium">Clearance Checklist</span>
                </div>
                <span className={`hrms-badge ${selectedExit.status === 'Settled' ? 'hrms-badge-active' : 'hrms-badge-pending'}`}>
                  {selectedExit.status === 'Settled' ? 'Cleared' : 'Pending'}
                </span>
              </div>
              
              <div className="hrms-flex-between">
                <div className="hrms-flex-start" style={{ gap: '12px' }}>
                  <DollarSign size={16} className="hrms-text-muted" />
                  <span className="hrms-text-sm hrms-font-medium">Final Settlement</span>
                </div>
                <span className={`hrms-badge ${selectedExit.status === 'Settled' ? 'hrms-badge-active' : 'hrms-badge-inactive'}`}>
                  {selectedExit.status}
                </span>
              </div>

              {selectedExit.status === 'Pending' && (
                <button 
                  className="hrms-primary-btn" 
                  onClick={() => handleSettle(selectedExit.id)}
                  style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Check size={16} /> Approve & Settle
                </button>
              )}
            </div>
          </div>
        )}

        {/* Recent Exits Table */}
        <div className="hrms-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px' }}>
            <h2 className="hrms-font-semibold" style={{ fontSize: '16px', margin: 0 }}>Recent Exits</h2>
          </div>
          <div className="hrms-table-container">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Exit Date</th>
                  <th>Notice Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '16px' }}>Loading exits...</td>
                  </tr>
                ) : exits.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '16px' }}>No exits recorded.</td>
                  </tr>
                ) : (
                  exits.map((exit) => (
                    <tr key={exit.id} onClick={() => setSelectedExit(exit)} style={{ cursor: 'pointer' }}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div className="hrms-user-info">
                          <img src={getAvatarUrl(exit.profile_photo, exit.employee_name, exit.employee_id)} alt={exit.employee_name} className="hrms-avatar" style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover'}} />
                          <span className="hrms-font-medium" style={{color: '#0f172a'}}>{exit.employee_name}</span>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(exit.exit_date).toLocaleDateString()}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(exit.notice_date).toLocaleDateString()}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{exit.reason || '—'}</td>
                      <td>
                        <span className={`hrms-badge ${exit.status === 'Settled' ? 'hrms-badge-active' : 'hrms-badge-pending'}`}>
                          {exit.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
