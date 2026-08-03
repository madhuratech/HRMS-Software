import React from 'react';
import { MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import './employee-module.css';

const promotions = [
  { id: 1, employee: 'Rohan Mehta', currentPosition: 'Sales Executive', newPosition: 'Sales Manager', date: '25 Dec 2023', increment: '20%', approvedBy: 'Vikram Singh', status: 'Approved', avatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d' },
  { id: 2, employee: 'Priya Nair', currentPosition: 'Senior Accountant', newPosition: 'Accountant', date: '11 Oct 2023', increment: '15%', approvedBy: 'Vikram Singh', status: 'Approved', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d' },
  { id: 3, employee: 'Karan Verma', currentPosition: 'Software Engineer', newPosition: 'Senior Engineer', date: '02 Mar 2024', increment: '18%', approvedBy: 'Vikram Singh', status: 'Approved', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
  { id: 4, employee: 'Anjali Desai', currentPosition: 'Marketing Executive', newPosition: 'Sr. Marketing Exec.', date: '15 Apr 2024', increment: '15%', approvedBy: 'Vikram Singh', status: 'Pending', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d' },
  { id: 5, employee: 'Siddharth Jain', currentPosition: 'Financial Analyst', newPosition: 'Sr. Financial Analyst', date: '05 Jun 2024', increment: '20%', approvedBy: 'Vikram Singh', status: 'Pending', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702g' },
];

export default function PromotionsContent() {
  return (
    <div className="hrms-content">
      <div className="hrms-header">
        <h1>Promotions</h1>
      </div>

      <div className="hrms-grid-4 hrms-mb-6">
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Total Promotions</span>
          <span className="hrms-stat-value hrms-text-primary">24</span>
          <span className="hrms-stat-trend hrms-text-muted">All Time</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Pending approval</span>
          <span className="hrms-stat-value hrms-text-primary">3</span>
          <a href="#" className="hrms-text-primary hrms-text-sm hrms-font-medium hrms-mt-4">View pending</a>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">This Month</span>
          <span className="hrms-stat-value" style={{color: '#10b981'}}>2</span>
          <span className="hrms-stat-trend hrms-text-success">+100%</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Avg. Salary Increase</span>
          <span className="hrms-stat-value hrms-text-primary">18%</span>
          <span className="hrms-stat-trend hrms-text-muted">All Time</span>
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
                <th>Promotion Date</th>
                <th>Salary Increment</th>
                <th>Approved By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr key={promo.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div className="hrms-user-info">
                      <img src={promo.avatar} alt={promo.employee} className="hrms-avatar" style={{width: '32px', height: '32px'}} />
                      <span className="hrms-font-medium" style={{color: '#0f172a'}}>{promo.employee}</span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{promo.currentPosition}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{promo.newPosition}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{promo.date}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{promo.increment}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{promo.approvedBy}</td>
                  <td>
                    <span className={`hrms-badge ${promo.status === 'Approved' ? 'hrms-badge-active' : 'hrms-badge-pending'}`}>
                      {promo.status}
                    </span>
                  </td>
                  <td>
                    <button style={{background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'}}>
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
            Showing 1 to 5 of 24 entries
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }} disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="hrms-primary-btn" style={{ padding: '6px 12px', borderRadius: '4px' }}>1</button>
            <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>2</button>
            <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>3</button>
            <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>4</button>
            <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>5</button>
            <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
