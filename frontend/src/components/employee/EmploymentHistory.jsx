import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { User } from 'lucide-react';
import './employee-module.css';

export default function EmploymentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  
  const [currentEmpId, setCurrentEmpId] = useState(() => localStorage.getItem('selectedEmployeeId') || '1');

  const handleEmployeeSelect = (newId) => {
    localStorage.setItem('selectedEmployeeId', newId);
    setCurrentEmpId(newId);
  };

  useEffect(() => {
    fetch('/app/employees')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllEmployees(data);
      })
      .catch(err => console.error("Error fetching all employees:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    // Fetch profile first to get default details
    fetch(`/app/employees/${currentEmpId}/profile`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        return fetch(`/app/employees/${currentEmpId}/history`);
      })
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [currentEmpId]);

  if (loading) {
    return (
      <div className="hrms-content" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="hrms-text-muted hrms-mt-4">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="hrms-content">
      <div className="hrms-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Employment History</h1>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px',
          padding: '8px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <User size={16} color="#475569" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Select Employee:</span>
          <AppDropdown value={currentEmpId} options={[, ...(allEmployees || [])]} size="sm" />
        </div>
      </div>

      <div className="hrms-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="hrms-font-semibold hrms-mb-8">Employees &gt; EMP00{currentEmpId} {profile && `(${profile.name})`}</h2>

        {history.length === 0 ? (
          <div className="hrms-timeline">
            {/* If no history recorded yet, show joining as default */}
            {profile && (
              <div className="hrms-timeline-item">
                <div className="hrms-timeline-dot"></div>
                <div className="hrms-timeline-content">
                  <div className="hrms-flex-between hrms-mb-4">
                    <span className="hrms-text-sm hrms-text-muted">{new Date(profile.joinDate).toLocaleDateString()} - Present</span>
                    <span className="hrms-badge hrms-badge-active" style={{ backgroundColor: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0' }}>Current</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>{profile.roleName || 'Employee'}</h3>
                  <p className="hrms-text-sm hrms-text-muted" style={{ marginBottom: '16px' }}>{profile.deptName || 'General'} Department | {profile.branchName || 'Head Office'}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p className="hrms-text-sm"><span className="hrms-text-muted">Reporting To:</span> <span className="hrms-font-medium">{profile.managerName || '—'}</span></p>
                    <p className="hrms-text-sm"><span className="hrms-text-muted">Salary:</span> <span className="hrms-font-medium">INR {parseFloat(profile.salary).toLocaleString()}</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hrms-timeline">
            {history.map((item, index) => (
              <div key={item.id} className="hrms-timeline-item">
                <div className="hrms-timeline-dot" style={{ backgroundColor: index === 0 ? '#2952E3' : '#cbd5e1', border: '4px solid #fff' }}></div>
                <div className="hrms-timeline-content" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
                  <div className="hrms-flex-between hrms-mb-4">
                    <span className="hrms-text-sm hrms-text-muted">{new Date(item.effective_date).toLocaleDateString()}</span>
                    {index === 0 && <span className="hrms-badge hrms-badge-active" style={{ backgroundColor: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0' }}>Latest</span>}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>{item.change_type}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {item.old_value && <p className="hrms-text-sm"><span className="hrms-text-muted">Previous:</span> <span className="hrms-font-medium">{item.old_value}</span></p>}
                    <p className="hrms-text-sm"><span className="hrms-text-muted">Details/New Value:</span> <span className="hrms-font-medium">{item.new_value}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
