import React, { useState } from 'react';
import { Calendar as CalendarIcon, Filter, MoreHorizontal, ChevronDown, Plus, X } from 'lucide-react';

export default function Overtime() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    date: '',
    hours: '',
    reason: '',
  });

  const [overtimeData, setOvertimeData] = useState([
    { id: '1', employee: 'Aarav Sharma', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', date: 'May 20, 2024', hours: '02h 30m', reason: 'Project Deadline', status: 'Approved' },
    { id: '2', employee: 'Neha Patel', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', date: 'May 19, 2024', hours: '01h 45m', reason: 'Client Meeting', status: 'Pending' },
    { id: '3', employee: 'Rohan Mehta', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', date: 'May 18, 2024', hours: '03h 15m', reason: 'System Deployment', status: 'Approved' },
    { id: '4', employee: 'Priya Nair', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d', date: 'May 17, 2024', hours: '02h 00m', reason: 'Month End Closing', status: 'Pending' },
    { id: '5', employee: 'Karan Verma', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026703d', date: 'May 16, 2024', hours: '01h 30m', reason: 'Bug Fixing', status: 'Approved' },
    { id: '6', employee: 'Anjali Desai', avatar: 'https://i.pravatar.cc/150?img=32', date: 'May 15, 2024', hours: '02h 45m', reason: 'Campaign Launch', status: 'Approved' },
    { id: '7', employee: 'Vikram Singh', avatar: 'https://i.pravatar.cc/150?img=11', date: 'May 14, 2024', hours: '01h 15m', reason: 'Report Preparation', status: 'Pending' },
  ]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.employee || !formData.date || !formData.hours) return;
    const newItem = {
      id: String(Date.now()),
      employee: formData.employee,
      avatar: 'https://i.pravatar.cc/150?u=' + Date.now(),
      date: formData.date,
      hours: formData.hours,
      reason: formData.reason || 'N/A',
      status: 'Pending',
    };
    setOvertimeData([newItem, ...overtimeData]);
    setFormData({ employee: '', date: '', hours: '', reason: '' });
    setShowAddModal(false);
  };

  return (
    <div className="hrms-content">
      {/* Header and Toolbar */}
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '16px' }}>
        <div className="hrms-flex-start" style={{ flexWrap: 'nowrap', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '220px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>May 1 - May 31, 2024</span>
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
          {/* KPI Cards */}
          <div className="hrms-grid-4">
            <div className="hrms-card hrms-stat-card">
              <div className="hrms-text-sm hrms-font-medium hrms-text-muted" style={{ marginBottom: '12px' }}>Total Overtime Hours</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>248h 30m</div>
            </div>
            <div className="hrms-card hrms-stat-card">
              <div className="hrms-text-sm hrms-font-medium hrms-text-muted" style={{ marginBottom: '12px' }}>Total Employees</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>45</div>
            </div>
            <div className="hrms-card hrms-stat-card">
              <div className="hrms-text-sm hrms-font-medium hrms-text-muted" style={{ marginBottom: '12px' }}>Pending Approval</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>18h 45m</div>
            </div>
            <div className="hrms-card hrms-stat-card">
              <div className="hrms-text-sm hrms-font-medium hrms-text-muted" style={{ marginBottom: '12px' }}>Approved Hours</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>229h 45m</div>
            </div>
          </div>

          {/* Main Table */}
          <div className="hrms-card" style={{ padding: '0', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="hrms-table-container">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Overtime Hours</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overtimeData.map((record) => (
                    <tr key={record.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div className="hrms-user-info">
                          <img src={record.avatar} alt={record.employee} className="hrms-avatar" style={{width: '32px', height: '32px'}} />
                          <span className="hrms-font-medium hrms-text-primary">{record.employee}</span>
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
                          backgroundColor: record.status === 'Approved' ? '#ecfdf5' : '#fff7ed',
                          color: record.status === 'Approved' ? '#10b981' : '#ea580c'
                        }}>
                          {record.status}
                        </span>
                      </td>
                      <td>
                        <button style={{background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'}}>
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="hrms-flex-between" style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
              <span className="hrms-text-sm hrms-text-muted">
                Showing 1 to 7 of 45 entries
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }} disabled>&lt;</button>
                <button className="hrms-primary-btn" style={{ padding: '6px 12px', borderRadius: '4px' }}>1</button>
                <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>2</button>
                <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>3</button>
                <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>4</button>
                <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>5</button>
                <span className="hrms-text-muted" style={{ padding: '0 4px' }}>...</span>
                <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>29</button>
                <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }}>&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Create Overtime Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Log Overtime</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Employee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.employee}
                  onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
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
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
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
