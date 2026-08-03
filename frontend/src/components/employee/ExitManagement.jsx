import React from 'react';
import { CheckCircle2, Clock, FileText, AlertCircle, RefreshCw, Briefcase, FileCheck, DollarSign } from 'lucide-react';
import './employee-module.css';

const exits = [
  { id: 1, name: 'Meera Joshi', date: '05 Jun 2024', lastDate: '04 Jul 2024', reason: 'Personal', status: 'Completed', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702h' },
  { id: 2, name: 'Siddharth Jain', date: '15 May 2024', lastDate: '14 Jun 2024', reason: 'Better Opportunity', status: 'Completed', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702g' },
  { id: 3, name: 'Vikram Singh', date: '05 May 2024', lastDate: '04 Jun 2024', reason: 'Career Change', status: 'Completed', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702e' },
  { id: 4, name: 'Pooja Reddy', date: '10 May 2024', lastDate: '28 May 2024', reason: 'Relocation', status: 'In Progress', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702f' },
];

export default function ExitManagement() {
  return (
    <div className="hrms-content">
      <div className="hrms-header">
        <h1>Exit Management</h1>
      </div>

      <div className="hrms-grid-4 hrms-mb-6">
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Employees Resigned</span>
          <span className="hrms-stat-value hrms-text-primary">15</span>
          <span className="hrms-stat-trend hrms-text-muted">This Year</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Terminated</span>
          <span className="hrms-stat-value hrms-text-danger">3</span>
          <span className="hrms-stat-trend hrms-text-muted">This Year</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Retired</span>
          <span className="hrms-stat-value" style={{color: '#f59e0b'}}>2</span>
          <span className="hrms-stat-trend hrms-text-muted">This Year</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Pending Clearance</span>
          <span className="hrms-stat-value hrms-text-primary">4</span>
          <a href="#" className="hrms-text-primary hrms-text-sm hrms-font-medium hrms-mt-4">View pending</a>
        </div>
      </div>

      <div className="hrms-layout" style={{ gridTemplateColumns: '300px 1fr' }}>
        {/* Exit Process Overview Sidebar */}
        <div className="hrms-card" style={{ alignSelf: 'start' }}>
          <h2 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Exit Process Overview</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="hrms-flex-between">
              <div className="hrms-flex-start" style={{ gap: '12px' }}>
                <Clock size={16} className="hrms-text-muted" />
                <span className="hrms-text-sm hrms-font-medium">Notice Period</span>
              </div>
              <span className="hrms-badge hrms-badge-active">Completed</span>
            </div>
            
            <div className="hrms-flex-between">
              <div className="hrms-flex-start" style={{ gap: '12px' }}>
                <Briefcase size={16} className="hrms-text-muted" />
                <span className="hrms-text-sm hrms-font-medium">Exit Interview</span>
              </div>
              <span className="hrms-badge hrms-badge-active">Completed</span>
            </div>
            
            <div className="hrms-flex-between">
              <div className="hrms-flex-start" style={{ gap: '12px' }}>
                <CheckCircle2 size={16} className="hrms-text-muted" />
                <span className="hrms-text-sm hrms-font-medium">Clearance Checklist</span>
              </div>
              <span className="hrms-badge hrms-badge-pending">In Progress</span>
            </div>
            
            <div className="hrms-flex-between">
              <div className="hrms-flex-start" style={{ gap: '12px' }}>
                <RefreshCw size={16} className="hrms-text-muted" />
                <span className="hrms-text-sm hrms-font-medium">Asset Return</span>
              </div>
              <span className="hrms-badge hrms-badge-inactive">Pending</span>
            </div>
            
            <div className="hrms-flex-between">
              <div className="hrms-flex-start" style={{ gap: '12px' }}>
                <DollarSign size={16} className="hrms-text-muted" />
                <span className="hrms-text-sm hrms-font-medium">Final Settlement</span>
              </div>
              <span className="hrms-badge hrms-badge-inactive">Pending</span>
            </div>
            
            <div className="hrms-flex-between">
              <div className="hrms-flex-start" style={{ gap: '12px' }}>
                <FileText size={16} className="hrms-text-muted" />
                <span className="hrms-text-sm hrms-font-medium">Documents</span>
              </div>
              <span className="hrms-badge hrms-badge-inactive">Pending</span>
            </div>
          </div>
        </div>

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
                  <th>Last Working Day</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {exits.map((exit) => (
                  <tr key={exit.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div className="hrms-user-info">
                        <img src={exit.avatar} alt={exit.name} className="hrms-avatar" style={{width: '32px', height: '32px'}} />
                        <span className="hrms-font-medium" style={{color: '#0f172a'}}>{exit.name}</span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{exit.date}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{exit.lastDate}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{exit.reason}</td>
                    <td>
                      <span className={`hrms-badge ${exit.status === 'Completed' ? 'hrms-badge-active' : 'hrms-badge-pending'}`}>
                        {exit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center' }}>
            <button className="hrms-secondary-btn" style={{ border: 'none', backgroundColor: '#f8fafc' }}>
              View all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
