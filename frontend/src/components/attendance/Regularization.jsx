import React, { useState } from 'react';
import { Search, Filter, Download, Calendar as CalendarIcon, Edit2, Eye, ChevronDown } from 'lucide-react';

export default function Regularization() {
  const [activeTab, setActiveTab] = useState('pending');

  const requests = [
    { id: '1', employee: 'Priya Nair', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d', date: 'May 20, 2024', type: 'Late Arrival', reason: 'Traffic due to heavy rain', status: 'Pending', time: '09:45 AM' },
    { id: '2', employee: 'Karan Verma', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026703d', date: 'May 19, 2024', type: 'Early Exit', reason: 'Doctor appointment', status: 'Pending', time: '04:30 PM' },
    { id: '3', employee: 'Anjali Desai', avatar: 'https://i.pravatar.cc/150?img=32', date: 'May 17, 2024', type: 'Late Arrival', reason: 'Personal work', status: 'Pending', time: '10:15 AM' },
    { id: '4', employee: 'Vikram Singh', avatar: 'https://i.pravatar.cc/150?img=11', date: 'May 16, 2024', type: 'Absent', reason: 'Family emergency', status: 'Pending', time: '--' },
    { id: '5', employee: 'Pooja Reddy', avatar: 'https://i.pravatar.cc/150?img=5', date: 'May 15, 2024', type: 'Late Arrival', reason: 'Vehicle breakdown', status: 'Pending', time: '11:00 AM' },
    { id: '6', employee: 'Rohan Mehta', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', date: 'May 14, 2024', type: 'Early Exit', reason: 'Client meeting', status: 'Pending', time: '03:00 PM' },
    { id: '7', employee: 'Neha Patel', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', date: 'May 13, 2024', type: 'Late Arrival', reason: 'Overslept', status: 'Pending', time: '10:00 AM' },
  ];

  return (
    <div className="hrms-content">
      {/* Header and Tabs */}
      <div className="hrms-header" style={{ paddingBottom: '0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e2e8f0', width: '100%', justifyContent: 'flex-start' }}>
          <button 
            style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'pending' ? '2px solid #2952E3' : '2px solid transparent', color: activeTab === 'pending' ? '#2952E3' : '#64748b', fontWeight: activeTab === 'pending' ? '600' : '400', cursor: 'pointer' }}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests
          </button>
          <button 
            style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'approved' ? '2px solid #2952E3' : '2px solid transparent', color: activeTab === 'approved' ? '#2952E3' : '#64748b', fontWeight: activeTab === 'approved' ? '600' : '400', cursor: 'pointer' }}
            onClick={() => setActiveTab('approved')}
          >
            Approved Requests
          </button>
          <button 
            style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'rejected' ? '2px solid #2952E3' : '2px solid transparent', color: activeTab === 'rejected' ? '#2952E3' : '#64748b', fontWeight: activeTab === 'rejected' ? '600' : '400', cursor: 'pointer' }}
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '220px', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>May 1, 2024 - May 31, 2024</span>
              <CalendarIcon size={16} style={{ color: '#64748b' }} />
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', flex: 1, display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: 0 }}>
          <div className="hrms-card" style={{ padding: '0', overflow: 'hidden' }}>
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
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div className="hrms-user-info">
                          <img src={req.avatar} alt={req.employee} className="hrms-avatar" style={{width: '32px', height: '32px'}} />
                          <span className="hrms-font-medium hrms-text-primary">{req.employee}</span>
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
                          backgroundColor: '#fff7ed',
                          color: '#ea580c'
                        }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', color: '#3b82f6' }}>
                            <Eye size={16} />
                          </button>
                          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', color: '#3b82f6' }}>
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="hrms-flex-between" style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
              <span className="hrms-text-sm hrms-text-muted">
                Showing 1 to 7 of 25 entries
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }} disabled>&lt;</button>
                <button className="hrms-primary-btn" style={{ padding: '6px 12px', borderRadius: '4px' }}>1</button>
                <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>2</button>
                <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>3</button>
                <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>4</button>
                <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }}>&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
