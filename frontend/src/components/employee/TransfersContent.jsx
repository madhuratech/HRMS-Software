import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import './employee-module.css';

export default function TransfersContent() {
  return (
    <div className="hrms-content">
      <div className="hrms-header">
        <h1>Transfers</h1>
      </div>

      <div className="hrms-grid-4 hrms-mb-6">
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Total Transfers</span>
          <span className="hrms-stat-value hrms-text-primary">16</span>
          <span className="hrms-stat-trend hrms-text-muted">All Time</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Internal Transfers</span>
          <span className="hrms-stat-value hrms-text-primary">10</span>
          <span className="hrms-stat-trend hrms-text-muted">This Year</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Branch Transfers</span>
          <span className="hrms-stat-value hrms-text-primary">4</span>
          <span className="hrms-stat-trend hrms-text-muted">This Year</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Pending Transfers</span>
          <span className="hrms-stat-value hrms-text-primary">2</span>
          <a href="#" className="hrms-text-primary hrms-text-sm hrms-font-medium hrms-mt-4">View pending</a>
        </div>
      </div>

      <div className="hrms-layout">
        {/* Recent Transfers Timeline */}
        <div className="hrms-card">
          <h2 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Recent Transfers</h2>
          
          <div className="hrms-timeline">
            <div className="hrms-timeline-item">
              <div className="hrms-timeline-dot"></div>
              <div className="hrms-timeline-content" style={{ backgroundColor: 'transparent', padding: '0 0 0 16px' }}>
                <div className="hrms-flex-between hrms-mb-4">
                  <div className="hrms-user-info">
                    <img src="https://i.pravatar.cc/150?u=a04258a2462d826712d" alt="Rohan Mehta" className="hrms-avatar" style={{width: '32px', height: '32px'}} />
                    <span className="hrms-font-medium hrms-text-sm" style={{color: '#0f172a'}}>Rohan Mehta</span>
                  </div>
                  <span className="hrms-text-xs hrms-text-muted">20 Apr 2024</span>
                </div>
                <p className="hrms-text-sm hrms-text-muted hrms-mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Sales <ArrowRight size={14} /> Marketing
                </p>
                <p className="hrms-text-sm hrms-text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Mumbai <ArrowRight size={14} /> Delhi
                </p>
              </div>
            </div>

            <div className="hrms-timeline-item">
              <div className="hrms-timeline-dot" style={{ backgroundColor: '#cbd5e1', border: '4px solid #fff' }}></div>
              <div className="hrms-timeline-content" style={{ backgroundColor: 'transparent', padding: '0 0 0 16px' }}>
                <div className="hrms-flex-between hrms-mb-4">
                  <div className="hrms-user-info">
                    <img src="https://i.pravatar.cc/150?u=a04258114e29026702d" alt="Karan Verma" className="hrms-avatar" style={{width: '32px', height: '32px'}} />
                    <span className="hrms-font-medium hrms-text-sm" style={{color: '#0f172a'}}>Karan Verma</span>
                  </div>
                  <span className="hrms-text-xs hrms-text-muted">15 Mar 2024</span>
                </div>
                <p className="hrms-text-sm hrms-text-muted hrms-mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  IT <ArrowRight size={14} /> Product
                </p>
                <p className="hrms-text-sm hrms-text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Bangalore <ArrowRight size={14} /> Bangalore
                </p>
              </div>
            </div>

            <div className="hrms-timeline-item" style={{ marginBottom: 0 }}>
              <div className="hrms-timeline-dot" style={{ backgroundColor: '#cbd5e1', border: '4px solid #fff' }}></div>
              <div className="hrms-timeline-content" style={{ backgroundColor: 'transparent', padding: '0 0 0 16px' }}>
                <div className="hrms-flex-between hrms-mb-4">
                  <div className="hrms-user-info">
                    <img src="https://i.pravatar.cc/150?u=a048581f4e29026701d" alt="Priya Nair" className="hrms-avatar" style={{width: '32px', height: '32px'}} />
                    <span className="hrms-font-medium hrms-text-sm" style={{color: '#0f172a'}}>Priya Nair</span>
                  </div>
                  <span className="hrms-text-xs hrms-text-muted">01 Feb 2024</span>
                </div>
                <p className="hrms-text-sm hrms-text-muted hrms-mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Finance <ArrowRight size={14} /> Accounts
                </p>
                <p className="hrms-text-sm hrms-text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Head Office <ArrowRight size={14} /> Head Office
                </p>
              </div>
            </div>
            
            <button className="hrms-secondary-btn" style={{ width: '100%', marginTop: '24px', justifyContent: 'center', border: 'none', backgroundColor: '#f8fafc' }}>
              View all
            </button>
          </div>
        </div>

        {/* Transfer Details Card */}
        <div className="hrms-card" style={{ alignSelf: 'start' }}>
          <h2 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Transfer Details</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px 24px', alignItems: 'center' }}>
            <span className="hrms-text-sm hrms-text-muted">Employee</span>
            <div className="hrms-user-info">
              <img src="https://i.pravatar.cc/150?u=a04258a2462d826712d" alt="Rohan Mehta" className="hrms-avatar" style={{width: '40px', height: '40px'}} />
              <div>
                <span className="hrms-font-medium hrms-text-sm" style={{color: '#0f172a', display: 'block'}}>Rohan Mehta</span>
                <span className="hrms-text-xs hrms-text-muted">EMP003</span>
              </div>
            </div>

            <div className="hrms-mt-4" style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#f1f5f9' }}></div>

            <span className="hrms-text-sm hrms-text-muted">From Department</span>
            <span className="hrms-text-sm hrms-font-medium">Sales</span>

            <span className="hrms-text-sm hrms-text-muted">To Department</span>
            <span className="hrms-text-sm hrms-font-medium">Marketing</span>

            <div className="hrms-mt-4" style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#f1f5f9' }}></div>

            <span className="hrms-text-sm hrms-text-muted">From Location</span>
            <span className="hrms-text-sm hrms-font-medium">Mumbai</span>

            <span className="hrms-text-sm hrms-text-muted">To Location</span>
            <span className="hrms-text-sm hrms-font-medium">Delhi</span>

            <div className="hrms-mt-4" style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#f1f5f9' }}></div>

            <span className="hrms-text-sm hrms-text-muted">Reason</span>
            <span className="hrms-text-sm hrms-font-medium">Career Growth</span>

            <span className="hrms-text-sm hrms-text-muted">Transfer Date</span>
            <span className="hrms-text-sm hrms-font-medium">20 Apr 2024</span>

            <span className="hrms-text-sm hrms-text-muted">Approved By</span>
            <span className="hrms-text-sm hrms-font-medium">Vikram Singh</span>

            <span className="hrms-text-sm hrms-text-muted">Status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="hrms-badge hrms-badge-active">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
