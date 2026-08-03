import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Download, Upload, MoreVertical, 
  ChevronLeft, ChevronRight, CheckSquare, Square
} from 'lucide-react';
import './employee-module.css';

const employees = [
  { id: 'EMP001', name: 'Aarav Sharma', department: 'Design', designation: 'UI/UX Designer', branch: 'Head Office', joinDate: '12 Jan 2024', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
  { id: 'EMP002', name: 'Neha Patel', department: 'Human Resources', designation: 'HR Executive', branch: 'Head Office', joinDate: '15 Feb 2024', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 'EMP003', name: 'Rohan Mehta', department: 'Sales', designation: 'Sales Manager', branch: 'Mumbai', joinDate: '25 Dec 2023', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d' },
  { id: 'EMP004', name: 'Priya Nair', department: 'Finance', designation: 'Accountant', branch: 'Head Office', joinDate: '02 Mar 2024', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d' },
  { id: 'EMP005', name: 'Karan Verma', department: 'IT', designation: 'Software Engineer', branch: 'Bangalore', joinDate: '10 Jan 2024', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
  { id: 'EMP006', name: 'Anjali Desai', department: 'Marketing', designation: 'Marketing Executive', branch: 'Pune', joinDate: '15 Apr 2024', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d' },
  { id: 'EMP007', name: 'Vikram Singh', department: 'IT', designation: 'Software Engineer', branch: 'Bangalore', joinDate: '21 Apr 2024', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702e' },
  { id: 'EMP008', name: 'Pooja Reddy', department: 'Human Resources', designation: 'HR Executive', branch: 'Hyderabad', joinDate: '28 May 2024', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702f' },
  { id: 'EMP009', name: 'Siddharth Jain', department: 'Finance', designation: 'Financial Analyst', branch: 'Mumbai', joinDate: '17 Jun 2024', status: 'Inactive', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702g' },
  { id: 'EMP010', name: 'Meera Joshi', department: 'IT', designation: 'QA Engineer', branch: 'Bangalore', joinDate: '05 Jul 2024', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702h' },
];

export default function EmployeeListContent() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);

  return (
    <div className="hrms-content">
      {/* Header */}
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px' }}>
        <div className="hrms-flex-start" style={{ flexWrap: 'nowrap', flexShrink: 0 }}>
          <div className="hrms-search-bar" style={{ marginBottom: 0 }}>
            <div className="hrms-search-input" style={{ width: '300px' }}>
              <Search className="hrms-search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search employee..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button className="hrms-secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><Filter size={16} /> Filters</button>
          <button className="hrms-secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><CheckSquare size={16} /> Bulk Actions</button>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
          <button className="hrms-secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><Upload size={16} /> Import</button>
          <button className="hrms-primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><Download size={16} /> Export List</button>
        </div>
      </div>

      <div className="hrms-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="hrms-table-container">
          <table className="hrms-table">
            <thead>
              <tr>
                <th style={{ width: '40px', paddingRight: 0 }}>
                  <div style={{ cursor: 'pointer', color: selectedAll ? '#2952E3' : '#cbd5e1' }} onClick={() => setSelectedAll(!selectedAll)}>
                    {selectedAll ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                </th>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Joining Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ paddingRight: 0 }}>
                    <div style={{ cursor: 'pointer', color: selectedAll ? '#2952E3' : '#cbd5e1' }}>
                      {selectedAll ? <CheckSquare size={18} /> : <Square size={18} />}
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div className="hrms-user-info" style={{cursor: 'pointer'}} onClick={() => navigate('/employees/profile')}>
                      <img src={emp.avatar} alt={emp.name} className="hrms-avatar" style={{width: '32px', height: '32px'}} />
                      <span className="hrms-font-medium hrms-text-primary">{emp.name}</span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}><span className="hrms-text-muted">{emp.id}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{emp.department}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{emp.designation}</td>
                  <td>{emp.branch}</td>
                  <td>
                    <span className={`hrms-badge ${emp.status === 'Active' ? 'hrms-badge-active' : 'hrms-badge-inactive'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>{emp.joinDate}</td>
                  <td>
                    <button onClick={() => navigate('/employees/profile')} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'}}>
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
            Showing 1 to 10 of 245 entries
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }} disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="hrms-primary-btn" style={{ padding: '6px 12px', borderRadius: '4px' }}>1</button>
            <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>2</button>
            <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>3</button>
            <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>4</button>
            <span className="hrms-text-muted">...</span>
            <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>25</button>
            <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
