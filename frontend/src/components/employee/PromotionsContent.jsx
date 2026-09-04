import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { MoreVertical, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { getAvatarUrl } from '../../lib/utils';
import './employee-module.css';

export default function PromotionsContent() {
  const { addToast } = useToast();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  
  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [newDesignationName, setNewDesignationName] = useState('Software Engineer');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  // Load promotions list, employees dropdown, and designations dropdown
  const loadData = () => {
    setLoading(true);
    fetch("/app/employees/promotions")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPromotions(data);
        } else {
          setPromotions([]);
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

    fetch("/app/organization/designations")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDesignations(data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestPromotion = (e) => {
    e.preventDefault();
    if (!employeeId) {
      addToast("Please select an employee", "error");
      return;
    }

    fetch("/app/employees/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, newDesignationName, effectiveDate })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to submit request");
      return res.json();
    })
    .then(() => {
      addToast("Promotion request submitted successfully!", "success");
      setShowAddForm(false);
      setEmployeeId('');
      loadData();
    })
    .catch(err => {
      console.error(err);
      addToast("Failed to submit promotion request", "error");
    });
  };

  const handleApprove = (promoId) => {
    fetch(`/app/employees/promotions/${promoId}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approverId: 1 }) // Default Admin
    })
    .then(res => {
      if (!res.ok) throw new Error("Approval failed");
      return res.json();
    })
    .then(() => {
      addToast("Promotion approved and employee record updated!", "success");
      loadData();
    })
    .catch(err => {
      console.error(err);
      addToast("Failed to approve promotion", "error");
    });
  };

  const pendingCount = promotions.filter(p => p.status === 'Pending').length;
  const approvedCount = promotions.filter(p => p.status === 'Approved').length;

  return (
    <div className="hrms-content">
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Promotions</h1>
        <button 
          className="hrms-primary-btn" 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Request Promotion
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleRequestPromotion} className="hrms-card hrms-mb-6" style={{ maxWidth: '600px' }}>
          <h3 className="hrms-font-semibold hrms-mb-4">Request Employee Promotion</h3>
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
              <label className="hrms-label">New Designation *</label>
              <AppDropdown
                value={newDesignationName}
                onChange={v => setNewDesignationName(v)}
                options={[{value:'Software Engineer',label:'Software Engineer'},{value:'Senior Developer',label:'Senior Developer'},{value:'Branch Manager',label:'Branch Manager'},{value:'Sales Manager',label:'Sales Manager'},{value:'Service Staff',label:'Service Staff'},{value:'HR Executive',label:'HR Executive'},{value:'UI/UX Designer',label:'UI/UX Designer'}]}
                size="sm"
              />
            </div>
            <div className="hrms-input-group" style={{ gridColumn: 'span 2' }}>
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
          <span className="hrms-stat-title">Total Promotions</span>
          <span className="hrms-stat-value hrms-text-primary">{promotions.length}</span>
          <span className="hrms-stat-trend hrms-text-muted">All Time</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Pending approval</span>
          <span className="hrms-stat-value" style={{ color: '#d97706' }}>{pendingCount}</span>
          <span className="hrms-stat-trend hrms-text-muted">Requires action</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Approved</span>
          <span className="hrms-stat-value" style={{color: '#10b981'}}>{approvedCount}</span>
          <span className="hrms-stat-trend hrms-text-success">Completed</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Avg. Salary Increase</span>
          <span className="hrms-stat-value hrms-text-primary">15%</span>
          <span className="hrms-stat-trend hrms-text-muted">Estimate</span>
        </div>
      </div>

      <div className="hrms-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="hrms-table-container">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Current Position</th>
                <th>New Position</th>
                <th>Effective Date</th>
                <th>Approved By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading promotions...</td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No promotion records found.</td>
                </tr>
              ) : (
                promotions.map((promo) => (
                  <tr key={promo.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div className="hrms-user-info">
                        <img src={getAvatarUrl(promo.profile_photo, promo.employee_name, promo.employee_id)} alt={promo.employee_name} className="hrms-avatar" style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover'}} />
                        <span className="hrms-font-medium" style={{color: '#0f172a'}}>{promo.employee_name}</span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{promo.old_designation || 'Staff'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{promo.new_designation}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(promo.effective_date).toLocaleDateString()}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{promo.approved_by_name || '—'}</td>
                    <td>
                      <span className={`hrms-badge ${promo.status === 'Approved' ? 'hrms-badge-active' : promo.status === 'Rejected' ? 'hrms-badge-inactive' : 'hrms-badge-pending'}`}>
                        {promo.status}
                      </span>
                    </td>
                    <td>
                      {promo.status === 'Pending' ? (
                        <button 
                          className="hrms-primary-btn" 
                          onClick={() => handleApprove(promo.id)}
                          style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Check size={12} /> Approve
                        </button>
                      ) : (
                        <button style={{background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'}}>
                          <MoreVertical size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
