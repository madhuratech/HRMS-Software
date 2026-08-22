import React from 'react';
import { Search, Check, X, Eye, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

const approvalData = [
  { id: 'EMP001', name: 'Priya Nair', dept: 'Design', type: 'CL', duration: '2 Days', applied: '18 May 2024', manager: 'Rahul Kapoor', priority: 'Normal', status: 'Pending' },
  { id: 'EMP042', name: 'Rohan Mehta', dept: 'Engineering', type: 'SL', duration: '1 Day', applied: '17 May 2024', manager: 'Rahul Kapoor', priority: 'High', status: 'Pending' },
  { id: 'EMP023', name: 'Neha Patel', dept: 'HR', type: 'PL', duration: '3 Days', applied: '10 May 2024', manager: 'Anita Desai', priority: 'Normal', status: 'Approved' },
  { id: 'EMP015', name: 'Aarav Sharma', dept: 'Design', type: 'EL', duration: '5 Days', applied: '01 May 2024', manager: 'Rahul Kapoor', priority: 'Normal', status: 'Pending' },
  { id: 'EMP088', name: 'Karan Verma', dept: 'Marketing', type: 'SL', duration: '1 Day', applied: '07 May 2024', manager: 'Sneha Rao', priority: 'High', status: 'Rejected' },
];

export default function LeaveApproval() {
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
    border: '1px solid #E5E7EB',
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#ecfdf5', color: '#10b981' };
      case 'Pending': return { bg: '#fffbeb', color: '#f59e0b' };
      case 'Rejected': return { bg: '#fef2f2', color: '#ef4444' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const getPriorityStyle = (priority) => {
    return priority === 'High' ? { color: '#ef4444', bg: '#fef2f2' } : { color: '#64748b', bg: '#f1f5f9' };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      
      {/* Content */}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        {[
          { title: 'Pending Approval', value: '12', icon: <Clock size={20} color="#F59E0B" />, bg: '#FFFBEB' },
          { title: 'Approved Today', value: '4', icon: <CheckCircle size={20} color="#10B981" />, bg: '#ECFDF5' },
          { title: 'Rejected', value: '2', icon: <XCircle size={20} color="#EF4444" />, bg: '#FEF2F2' },
          { title: 'Escalated Requests', value: '1', icon: <AlertCircle size={20} color="#8B5CF6" />, bg: '#F5F3FF' }
        ].map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>{kpi.title}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{kpi.value}</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Main Table Area */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <select style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#475569', minWidth: '160px' }}>
                <option>All Departments</option>
                <option>Design</option>
                <option>Engineering</option>
              </select>
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                <input type="text" placeholder="Search employee..." style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                <tr>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Employee</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Leave Type</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Duration</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Applied On</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Priority</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvalData.map((app, idx) => {
                  const pStyle = getPriorityStyle(app.priority);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=f1f5f9&color=64748b`} alt={app.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{app.name}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{app.dept}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>{app.type}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>{app.duration}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>{app.applied}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', backgroundColor: pStyle.bg, color: pStyle.color }}>
                          {app.priority}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button style={{ background: '#ecfdf5', border: 'none', cursor: 'pointer', color: '#10b981', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Approve"><Check size={16} /></button>
                          <button style={{ background: '#fef2f2', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Reject"><X size={16} /></button>
                          <button style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="View Details"><Eye size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Showing 1 to 5 of 12 entries</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button style={{ padding: '6px', border: '1px solid #E5E7EB', background: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={16} color="#64748b" /></button>
              <button style={{ padding: '6px 12px', border: 'none', background: '#2952E3', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>1</button>
              <button style={{ padding: '6px', border: '1px solid #E5E7EB', background: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={16} color="#64748b" /></button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Approval Statistics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                  <span>Approval Rate</span>
                  <span style={{ fontWeight: '600' }}>85%</span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                  <span>SLA Met</span>
                  <span style={{ fontWeight: '600' }}>92%</span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '92%', height: '100%', background: '#2952E3', borderRadius: '3px' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Pending Manager Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Rahul Kapoor</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b', background: '#fffbeb', padding: '2px 8px', borderRadius: '12px' }}>3 Pending</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Anita Desai</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b', background: '#fffbeb', padding: '2px 8px', borderRadius: '12px' }}>1 Pending</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
