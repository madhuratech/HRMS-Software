import React, { useState } from 'react';
import { Search, Filter, Download, Upload, CheckCircle2, XCircle, Clock, AlertCircle, MoreVertical, Calendar as CalendarIcon, MapPin, Users, Briefcase, ChevronDown } from 'lucide-react';

export default function DailyAttendance() {
  const [searchTerm, setSearchTerm] = useState('');

  const attendanceData = [
    { id: 'EMP001', name: 'Aarav Sharma', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', department: 'Design', checkIn: '09:05 AM', checkOut: '06:15 PM', status: 'Present', workingHours: '09h 10m' },
    { id: 'EMP002', name: 'Neha Patel', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', department: 'HR', checkIn: '08:55 AM', checkOut: '06:05 PM', status: 'Present', workingHours: '09h 05m' },
    { id: 'EMP003', name: 'Rohan Mehta', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', department: 'Sales', checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'Present', workingHours: '09h 05m' },
    { id: 'EMP004', name: 'Priya Nair', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d', department: 'Finance', checkIn: '09:45 AM', checkOut: '06:30 PM', status: 'Late', workingHours: '08h 45m' },
    { id: 'EMP005', name: 'Karan Verma', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026703d', department: 'Development', checkIn: '09:10 AM', checkOut: '06:00 PM', status: 'Present', workingHours: '08h 50m' },
    { id: 'EMP006', name: 'Anjali Desai', avatar: 'https://i.pravatar.cc/150?img=32', department: 'Marketing', checkIn: '--', checkOut: '--', status: 'Absent', workingHours: '00h 00m' },
    { id: 'EMP007', name: 'Vikram Singh', avatar: 'https://i.pravatar.cc/150?img=11', department: 'Operations', checkIn: '09:02 AM', checkOut: '06:10 PM', status: 'Present', workingHours: '09h 08m' },
    { id: 'EMP008', name: 'Pooja Reddy', avatar: 'https://i.pravatar.cc/150?img=5', department: 'HR', checkIn: '--', checkOut: '--', status: 'On Leave', workingHours: '00h 00m' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present': return 'hrms-badge-active';
      case 'Absent': return 'hrms-badge-danger';
      case 'Late': return 'hrms-badge-warning';
      case 'On Leave': return 'hrms-badge-pending';
      default: return 'hrms-badge-inactive';
    }
  };

  return (
    <div className="hrms-content">
      {/* Header and Toolbar */}
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px' }}>
        <div className="hrms-flex-start" style={{ flexWrap: 'nowrap', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '180px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>May 20, 2024</span>
            <CalendarIcon size={16} style={{ color: '#64748b' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '180px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Departments</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '180px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Locations</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '150px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Status</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Filter size={16} /> Filter
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
          <button style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '8px 24px', color: '#2952E3', fontWeight: '500', cursor: 'pointer' }}>Import</button>
          <button style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '8px 24px', color: '#2952E3', fontWeight: '500', cursor: 'pointer' }}>Export</button>
        </div>
      </div>

      <div style={{ width: '100%', flex: 1, display: 'flex' }}>
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: 0 }}>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '24px' }}>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Total Employees</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#2952E3', lineHeight: '1' }}>245</div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Present</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', lineHeight: '1' }}>198</div>
                <span style={{ fontSize: '11px', color: '#94a3b8', paddingBottom: '4px', fontWeight: '500' }}>80.82%</span>
              </div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Absent</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', lineHeight: '1' }}>28</div>
                <span style={{ fontSize: '11px', color: '#94a3b8', paddingBottom: '4px', fontWeight: '500' }}>11.43%</span>
              </div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Late</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', lineHeight: '1' }}>12</div>
                <span style={{ fontSize: '11px', color: '#94a3b8', paddingBottom: '4px', fontWeight: '500' }}>4.90%</span>
              </div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>On Leave</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', lineHeight: '1' }}>7</div>
                <span style={{ fontSize: '11px', color: '#94a3b8', paddingBottom: '4px', fontWeight: '500' }}>2.86%</span>
              </div>
            </div>
          </div>

          {/* Search Bar and Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 16px', width: '320px' }}>
              <Search size={18} style={{ color: '#94a3b8', marginRight: '12px' }} />
              <input 
                type="text" 
                placeholder="Search employee..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#334155' }}
              />
            </div>

            <div className="hrms-card" style={{ padding: '0', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="hrms-table-container">
                <table className="hrms-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Employee ID</th>
                      <th>Department</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Working Hours</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((emp) => (
                      <tr key={emp.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div className="hrms-user-info">
                            <img src={emp.avatar} alt={emp.name} className="hrms-avatar" style={{ width: '32px', height: '32px' }} />
                            <span className="hrms-font-medium hrms-text-primary">{emp.name}</span>
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}><span className="hrms-text-muted">{emp.id}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{emp.department}</td>
                        <td style={{ whiteSpace: 'nowrap' }} className="hrms-font-medium">{emp.checkIn}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{emp.checkOut}</td>
                        <td>
                        <span style={{
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          fontWeight: '600',
                          backgroundColor: emp.status === 'On Leave' ? '#f3e8ff' : emp.status === 'Late' ? '#fef3c7' : emp.status === 'Absent' ? '#fee2e2' : '#dcfce7',
                          color: emp.status === 'On Leave' ? '#9333ea' : emp.status === 'Late' ? '#d97706' : emp.status === 'Absent' ? '#dc2626' : '#16a34a'
                        }}>
                          {emp.status}
                        </span>
                      </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{emp.workingHours}</td>
                        <td>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <MoreVertical size={18} />
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
                  Showing 1 to 8 of 245 entries
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }} disabled>
                    &lt;
                  </button>
                  <button className="hrms-primary-btn" style={{ padding: '6px 12px', borderRadius: '4px' }}>1</button>
                  <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>2</button>
                  <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>3</button>
                  <span className="hrms-text-muted">...</span>
                  <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>23</button>
                  <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }}>
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
