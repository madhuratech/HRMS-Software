import React, { useState } from 'react';
import { 
  Search, Filter, Upload, Download, Eye, CheckCircle, 
  RefreshCw, Trash2, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import './employee-module.css';

const documents = [
  { id: 1, employee: 'Aarav Sharma', type: 'Aadhar Card', name: 'Aadhar_1234.pdf', issueDate: '12 Jan 2024', expiryDate: '-', status: 'Verified', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
  { id: 2, employee: 'Neha Patel', type: 'PAN Card', name: 'PAN_5678.pdf', issueDate: '15 Feb 2024', expiryDate: '-', status: 'Verified', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 3, employee: 'Rohan Mehta', type: 'Passport', name: 'Passport_3389.pdf', issueDate: '25 Dec 2023', expiryDate: '19 Dec 2033', status: 'Verified', avatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d' },
  { id: 4, employee: 'Priya Nair', type: 'Experience Letter', name: 'Experience_Letter.pdf', issueDate: '11 Oct 2023', expiryDate: '-', status: 'Pending', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d' },
  { id: 5, employee: 'Karan Verma', type: 'Education Certificate', name: 'BTech_Certificate.pdf', issueDate: '02 Mar 2024', expiryDate: '-', status: 'Verified', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
];

export default function EmployeeDocuments() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="hrms-content">
      <div className="hrms-header">
        <h1>Employee Documents</h1>
      </div>

      <div className="hrms-grid-4 hrms-mb-6">
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Total Documents</span>
          <span className="hrms-stat-value hrms-text-primary">342</span>
          <span className="hrms-stat-trend hrms-text-muted">All Time</span>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Pending Verification</span>
          <span className="hrms-stat-value hrms-text-warning">24</span>
          <a href="#" className="hrms-text-primary hrms-text-sm hrms-font-medium hrms-mt-4">View pending</a>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Expired Documents</span>
          <span className="hrms-stat-value hrms-text-danger">18</span>
          <a href="#" className="hrms-text-primary hrms-text-sm hrms-font-medium hrms-mt-4">View expired</a>
        </div>
        <div className="hrms-card hrms-stat-card">
          <span className="hrms-stat-title">Uploaded Today</span>
          <span className="hrms-stat-value hrms-text-primary">6</span>
          <a href="#" className="hrms-text-primary hrms-text-sm hrms-font-medium hrms-mt-4">View today</a>
        </div>
      </div>

      <div className="hrms-card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="hrms-flex-between" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div className="hrms-flex-start" style={{ gap: '16px' }}>
            <div className="hrms-search-input" style={{ width: '250px' }}>
              <Search className="hrms-search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search Document..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="hrms-select" style={{ width: '150px' }}>
              <option value="">All Types</option>
              <option value="id">Identity</option>
              <option value="education">Education</option>
              <option value="experience">Experience</option>
            </select>
            <select className="hrms-select" style={{ width: '150px' }}>
              <option value="">All Departments</option>
              <option value="design">Design</option>
              <option value="hr">HR</option>
              <option value="engineering">Engineering</option>
            </select>
          </div>
          <div className="hrms-flex-start" style={{ gap: '16px' }}>
            <button className="hrms-primary-btn"><Upload size={16} /> Upload Document</button>
            <button className="hrms-secondary-btn"><Download size={16} /> Export</button>
          </div>
        </div>

        <div className="hrms-table-container">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Document Type</th>
                <th>Document Name</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div className="hrms-user-info">
                      <img src={doc.avatar} alt={doc.employee} className="hrms-avatar" style={{width: '32px', height: '32px'}} />
                      <span className="hrms-font-medium" style={{color: '#0f172a'}}>{doc.employee}</span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{doc.type}</td>
                  <td>
                    <div className="hrms-flex-start" style={{ gap: '8px' }}>
                      <FileText size={16} className="hrms-text-muted" />
                      <span style={{ whiteSpace: 'nowrap' }}>{doc.name}</span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{doc.issueDate}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{doc.expiryDate}</td>
                  <td>
                    <span className={`hrms-badge ${doc.status === 'Verified' ? 'hrms-badge-active' : 'hrms-badge-pending'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button title="Preview" style={{background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'}}><Eye size={16} /></button>
                      <button title="Download" style={{background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'}}><Download size={16} /></button>
                      {doc.status !== 'Verified' && (
                        <button title="Verify" style={{background: 'none', border: 'none', cursor: 'pointer', color: '#10b981'}}><CheckCircle size={16} /></button>
                      )}
                      <button title="Replace" style={{background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6'}}><RefreshCw size={16} /></button>
                      <button title="Delete" style={{background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444'}}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="hrms-flex-between" style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
          <span className="hrms-text-sm hrms-text-muted">
            Showing 1 to 5 of 342 entries
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
            <span className="hrms-text-muted">...</span>
            <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>69</button>
            <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
