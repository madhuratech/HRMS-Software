import React from 'react';
import './employee-module.css';

export default function EmploymentHistory() {
  return (
    <div className="hrms-content">
      <div className="hrms-header">
        <h1>Employment History</h1>
      </div>

      <div className="hrms-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="hrms-font-semibold hrms-mb-8">Employees &gt; EMP001</h2>

        <div className="hrms-timeline">
          {/* Current Role */}
          <div className="hrms-timeline-item">
            <div className="hrms-timeline-dot"></div>
            <div className="hrms-timeline-content">
              <div className="hrms-flex-between hrms-mb-4">
                <span className="hrms-text-sm hrms-text-muted">12 Jan 2024 - Present</span>
                <span className="hrms-badge hrms-badge-active" style={{ backgroundColor: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0' }}>Current</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>UI/UX Designer</h3>
              <p className="hrms-text-sm hrms-text-muted" style={{ marginBottom: '16px' }}>Design Department | Head Office</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p className="hrms-text-sm"><span className="hrms-text-muted">Reporting To:</span> <span className="hrms-font-medium">Rohan Mehta</span></p>
                <p className="hrms-text-sm"><span className="hrms-text-muted">Salary:</span> <span className="hrms-font-medium">₹8,00,000 PA</span></p>
              </div>
            </div>
          </div>

          {/* Previous Role 1 */}
          <div className="hrms-timeline-item">
            <div className="hrms-timeline-dot" style={{ backgroundColor: '#cbd5e1', border: '4px solid #fff' }}></div>
            <div className="hrms-timeline-content" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
              <div className="hrms-mb-4">
                <span className="hrms-text-sm hrms-text-muted">01 Jul 2023 - 11 Jan 2024</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Junior UI/UX Designer</h3>
              <p className="hrms-text-sm hrms-text-muted" style={{ marginBottom: '16px' }}>Design Department | Head Office</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p className="hrms-text-sm"><span className="hrms-text-muted">Reporting To:</span> <span className="hrms-font-medium">Rohan Mehta</span></p>
                <p className="hrms-text-sm"><span className="hrms-text-muted">Salary:</span> <span className="hrms-font-medium">₹4,20,000 PA</span></p>
              </div>
            </div>
          </div>

          {/* Previous Role 2 */}
          <div className="hrms-timeline-item">
            <div className="hrms-timeline-dot" style={{ backgroundColor: '#cbd5e1', border: '4px solid #fff' }}></div>
            <div className="hrms-timeline-content" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
              <div className="hrms-mb-4">
                <span className="hrms-text-sm hrms-text-muted">15 Jan 2023 - 30 Jun 2023</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>UI/UX Intern</h3>
              <p className="hrms-text-sm hrms-text-muted" style={{ marginBottom: '16px' }}>Design Department | Head Office</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p className="hrms-text-sm"><span className="hrms-text-muted">Reporting To:</span> <span className="hrms-font-medium">Rohan Mehta</span></p>
                <p className="hrms-text-sm"><span className="hrms-text-muted">Stipend:</span> <span className="hrms-font-medium">₹15,000 / Month</span></p>
              </div>
            </div>
          </div>

          {/* Previous Role 3 */}
          <div className="hrms-timeline-item" style={{ marginBottom: 0 }}>
            <div className="hrms-timeline-dot" style={{ backgroundColor: '#cbd5e1', border: '4px solid #fff' }}></div>
            <div className="hrms-timeline-content" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
              <div className="hrms-mb-4">
                <span className="hrms-text-sm hrms-text-muted">01 Aug 2022 - 14 Jan 2023</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Trainee Designer</h3>
              <p className="hrms-text-sm hrms-text-muted" style={{ marginBottom: '16px' }}>Design Department | Head Office</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p className="hrms-text-sm"><span className="hrms-text-muted">Reporting To:</span> <span className="hrms-font-medium">Rohan Mehta</span></p>
                <p className="hrms-text-sm"><span className="hrms-text-muted">Stipend:</span> <span className="hrms-font-medium">₹10,000 / Month</span></p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
