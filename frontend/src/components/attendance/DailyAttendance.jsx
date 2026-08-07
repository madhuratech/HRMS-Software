import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle2, XCircle, Clock, AlertCircle, MoreVertical, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

export default function DailyAttendance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [kpis, setKpis] = useState({
    totalEmployees: 0,
    present: 0,
    presentPct: '0.00%',
    absent: 0,
    absentPct: '0.00%',
    late: 0,
    latePct: '0.00%',
    leave: 0,
    leavePct: '0.00%'
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadDailyAttendance = () => {
    setLoading(true);
    fetch(`/api/attendance/daily?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.records) setAttendanceData(data.records);
        if (data.kpis) setKpis(data.kpis);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch daily attendance", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDailyAttendance();
  }, [selectedDate]);

  const filteredDocs = attendanceData.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="hrms-content">
      {/* Header and Toolbar */}
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px' }}>
        <div className="hrms-flex-start" style={{ flexWrap: 'nowrap', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '180px', justifyContent: 'space-between' }}>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ border: 'none', outline: 'none', color: '#475569', fontWeight: '500', fontSize: '14px', width: '100%', cursor: 'pointer' }}
            />
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
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#2952E3', lineHeight: '1' }}>{kpis.totalEmployees}</div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Present</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', lineHeight: '1' }}>{kpis.present}</div>
                <span style={{ fontSize: '11px', color: '#94a3b8', paddingBottom: '4px', fontWeight: '500' }}>{kpis.presentPct}</span>
              </div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Absent</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', lineHeight: '1' }}>{kpis.absent}</div>
                <span style={{ fontSize: '11px', color: '#94a3b8', paddingBottom: '4px', fontWeight: '500' }}>{kpis.absentPct}</span>
              </div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>Late</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', lineHeight: '1' }}>{kpis.late}</div>
                <span style={{ fontSize: '11px', color: '#94a3b8', paddingBottom: '4px', fontWeight: '500' }}>{kpis.latePct}</span>
              </div>
            </div>
            <div className="hrms-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>On Leave</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', lineHeight: '1' }}>{kpis.leave}</div>
                <span style={{ fontSize: '11px', color: '#94a3b8', paddingBottom: '4px', fontWeight: '500' }}>{kpis.leavePct}</span>
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
                    {loading ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Loading daily attendance records...</td>
                      </tr>
                    ) : filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>No records found.</td>
                      </tr>
                    ) : (
                      filteredDocs.map((emp) => (
                        <tr key={emp.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <div className="hrms-user-info">
                              <img src={emp.avatar} alt={emp.name} className="hrms-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="hrms-flex-between" style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
                <span className="hrms-text-sm hrms-text-muted">
                  Showing 1 to {filteredDocs.length} of {attendanceData.length} entries
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }} disabled>
                    &lt;
                  </button>
                  <button className="hrms-primary-btn" style={{ padding: '6px 12px', borderRadius: '4px' }}>1</button>
                  <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }} disabled>
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
