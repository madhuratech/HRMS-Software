import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Download, Plus, Mail, Phone,
  MoreVertical, Calendar, UserPlus, Zap
} from 'lucide-react';
import './employee-module.css';

const employees = [
  { id: 'EMP001', name: 'Aarav Sharma', department: 'Design', designation: 'UI/UX Designer', email: 'aarav.sharma@company.com', phone: '+91 98765 43210', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
  { id: 'EMP002', name: 'Neha Patel', department: 'Human Resources', designation: 'HR Executive', email: 'neha.patel@company.com', phone: '+91 87654 32109', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 'EMP003', name: 'Rohan Mehta', department: 'Sales', designation: 'Sales Manager', email: 'rohan.mehta@company.com', phone: '+91 76543 21098', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d' },
  { id: 'EMP004', name: 'Priya Nair', department: 'Finance', designation: 'Accountant', email: 'priya.nair@company.com', phone: '+91 65432 10987', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d' },
  { id: 'EMP005', name: 'Karan Verma', department: 'IT', designation: 'Software Engineer', email: 'karan.verma@company.com', phone: '+91 54321 09876', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
  { id: 'EMP006', name: 'Anjali Desai', department: 'Marketing', designation: 'Marketing Executive', email: 'anjali.desai@company.com', phone: '+91 43210 98765', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d' },
];

export default function EmployeeDirectory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="hrms-content">
      {/* Header and Toolbar */}
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px' }}>
        <div className="hrms-flex-start" style={{ flexWrap: 'nowrap', flexShrink: 0 }}>
          <div className="hrms-search-bar" style={{ marginBottom: 0 }}>
            <div className="hrms-search-input" style={{ width: '250px' }}>
              <Search className="hrms-search-icon" size={18} />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select className="hrms-select">
            <option value="">Department</option>
            <option value="design">Design</option>
            <option value="hr">Human Resources</option>
            <option value="sales">Sales</option>
          </select>
          <select className="hrms-select">
            <option value="">Designation</option>
            <option value="manager">Manager</option>
            <option value="executive">Executive</option>
          </select>
          <select className="hrms-select">
            <option value="">Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
          <button className="hrms-secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Download size={16} /> Export</button>
          <button className="hrms-primary-btn " style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', width: '150px' }} onClick={() => navigate('/employees/add')}><Plus size={10} /> Add Employee</button>
        </div>
      </div>

      <div className="hrms-layout">
        {/* Main Content Area */}
        <div>
          {/* Analytics Cards */}
          <div className="hrms-grid-4">
            <div className="hrms-card hrms-stat-card">
              <span className="hrms-stat-title">Total Employees</span>
              <span className="hrms-stat-value">245</span>
              <span className="hrms-stat-trend hrms-text-success">+12 this month</span>
            </div>
            <div className="hrms-card hrms-stat-card">
              <span className="hrms-stat-title">Active Employees</span>
              <span className="hrms-stat-value hrms-text-primary">212</span>
              <span className="hrms-stat-trend hrms-text-success">86.53%</span>
            </div>
            <div className="hrms-card hrms-stat-card">
              <span className="hrms-stat-title">New Joiners</span>
              <span className="hrms-stat-value" style={{ color: '#0ea5e9' }}>18</span>
              <span className="hrms-stat-trend hrms-text-success">+5 this month</span>
            </div>
            <div className="hrms-card hrms-stat-card">
              <span className="hrms-stat-title">Departments</span>
              <span className="hrms-stat-value" style={{ color: '#8b5cf6' }}>24</span>
              <a href="#" className="hrms-text-primary hrms-text-sm hrms-font-medium" style={{ marginTop: '4px' }}>View all</a>
            </div>
          </div>

          <h2 className="hrms-font-semibold hrms-mb-4" style={{ fontSize: '18px' }}>All Employees</h2>

          {/* Employee Grid */}
          <div className="hrms-employee-grid">
            {employees.map(emp => (
              <div key={emp.id} className="hrms-card" style={{ padding: '20px' }}>
                <div className="hrms-flex-between hrms-mb-4">
                  <div className="hrms-user-info">
                    <img src={emp.avatar} alt={emp.name} className="hrms-avatar" />
                    <div className="hrms-user-details">
                      <h4>{emp.name}</h4>
                      <p>{emp.id}</p>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="hrms-mb-4">
                  <p className="hrms-text-sm hrms-font-medium">{emp.department}</p>
                  <p className="hrms-text-xs hrms-text-muted">{emp.designation}</p>
                </div>

                <div className="hrms-mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="hrms-flex-start" style={{ gap: '8px', color: '#64748b' }}>
                    <Mail size={14} />
                    <span className="hrms-text-xs">{emp.email}</span>
                  </div>
                  <div className="hrms-flex-start" style={{ gap: '8px', color: '#64748b' }}>
                    <Phone size={14} />
                    <span className="hrms-text-xs">{emp.phone}</span>
                  </div>
                </div>

                <div className="hrms-flex-between" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <span className={`hrms-badge ${emp.status === 'Active' ? 'hrms-badge-active' : 'hrms-badge-inactive'}`}>
                    {emp.status}
                  </span>
                  <button className="hrms-secondary-btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => navigate('/employees/profile')}>
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="hrms-card">
            <h3 className="hrms-font-semibold hrms-mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} className="hrms-text-primary" /> Birthday Today
            </h3>
            <div className="hrms-user-info hrms-mb-4">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" className="hrms-avatar" />
              <div className="hrms-user-details">
                <h4>Aarav Sharma</h4>
                <p>UI/UX Designer</p>
              </div>
            </div>
            <div className="hrms-user-info">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" className="hrms-avatar" />
              <div className="hrms-user-details">
                <h4>Neha Patel</h4>
                <p>HR Executive</p>
              </div>
            </div>
            <button className="hrms-secondary-btn" style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}>
              View all
            </button>
          </div>

          <div className="hrms-card">
            <h3 className="hrms-font-semibold hrms-mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} className="hrms-text-success" /> New Joiners
            </h3>
            <div className="hrms-user-info hrms-mb-4">
              <img src="https://i.pravatar.cc/150?u=a04258a2462d826712d" className="hrms-avatar" />
              <div className="hrms-user-details">
                <h4>Vikram Singh</h4>
                <p>Software Engineer</p>
              </div>
            </div>
            <div className="hrms-user-info">
              <img src="https://i.pravatar.cc/150?u=a048581f4e29026701d" className="hrms-avatar" />
              <div className="hrms-user-details">
                <h4>Pooja Reddy</h4>
                <p>HR Executive</p>
              </div>
            </div>
          </div>

          <div className="hrms-card">
            <h3 className="hrms-font-semibold hrms-mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} className="hrms-text-warning" /> Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => navigate('/employees/add')} className="hrms-text-primary hrms-text-sm hrms-font-medium" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                <Plus size={16} /> Add Employee
              </button>
              <a href="#" className="hrms-text-primary hrms-text-sm hrms-font-medium" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={16} /> Import Employees
              </a>
              <a href="#" className="hrms-text-primary hrms-text-sm hrms-font-medium" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} /> Bulk Email
              </a>
              <a href="#" className="hrms-text-primary hrms-text-sm hrms-font-medium" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MoreVertical size={16} /> Organization Chart
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
