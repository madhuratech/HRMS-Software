import React, { useState } from 'react';
import { Edit2, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Clock, FileText, Monitor, TrendingUp, Folder } from 'lucide-react';
import './employee-module.css';

const tabs = [
  'Overview', 'Employment', 'Salary', 'Attendance', 'Leave', 
  'Documents', 'Assets', 'Performance', 'Projects'
];

export default function EmployeeProfileContent() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="hrms-content">
      {/* Profile Header */}
      <div className="hrms-card hrms-mb-6" style={{ position: 'relative' }}>
        <button className="hrms-secondary-btn" style={{ position: 'absolute', top: '24px', right: '24px' }}>
          <Edit2 size={16} /> Edit Profile
        </button>

        <div className="hrms-flex-start" style={{ gap: '32px', marginBottom: '32px' }}>
          <img 
            src="https://i.pravatar.cc/150?u=a042581f4e29026024d" 
            alt="Aarav Sharma" 
            className="hrms-avatar hrms-avatar-lg"
          />
          <div>
            <div className="hrms-flex-start hrms-mb-4" style={{ gap: '12px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#0f172a', margin: 0 }}>Aarav Sharma</h1>
              <span className="hrms-badge hrms-badge-active">Active</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px' }}>
              <div>
                <p className="hrms-text-muted hrms-text-xs hrms-mb-4" style={{ marginBottom: '4px' }}>Employee ID</p>
                <p className="hrms-font-medium hrms-text-sm">EMP001</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs hrms-mb-4" style={{ marginBottom: '4px' }}>Designation</p>
                <p className="hrms-font-medium hrms-text-sm">UI/UX Designer</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs hrms-mb-4" style={{ marginBottom: '4px' }}>Department</p>
                <p className="hrms-font-medium hrms-text-sm">Design</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs hrms-mb-4" style={{ marginBottom: '4px' }}>Email</p>
                <p className="hrms-font-medium hrms-text-sm">aarav.sharma@company.com</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs hrms-mb-4" style={{ marginBottom: '4px' }}>Phone</p>
                <p className="hrms-font-medium hrms-text-sm">+91 98765 43210</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs hrms-mb-4" style={{ marginBottom: '4px' }}>Location</p>
                <p className="hrms-font-medium hrms-text-sm">Head Office, Bangalore</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="hrms-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          {tabs.map(tab => (
            <div 
              key={tab} 
              className={`hrms-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Personal Information */}
        <div className="hrms-card">
          <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Personal Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Date of Birth</p>
              <p className="hrms-font-medium hrms-text-sm">15 Aug 1995</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Gender</p>
              <p className="hrms-font-medium hrms-text-sm">Male</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Marital Status</p>
              <p className="hrms-font-medium hrms-text-sm">Single</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Nationality</p>
              <p className="hrms-font-medium hrms-text-sm">Indian</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Blood Group</p>
              <p className="hrms-font-medium hrms-text-sm">O+</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Languages Known</p>
              <p className="hrms-font-medium hrms-text-sm">English, Hindi</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="hrms-card">
          <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Contact Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="hrms-flex-start" style={{ alignItems: 'flex-start' }}>
              <Mail className="hrms-text-muted" size={18} style={{ marginTop: '2px' }} />
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Email</p>
                <p className="hrms-font-medium hrms-text-sm">aarav.sharma@company.com</p>
              </div>
            </div>
            <div className="hrms-flex-start" style={{ alignItems: 'flex-start' }}>
              <Phone className="hrms-text-muted" size={18} style={{ marginTop: '2px' }} />
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Phone</p>
                <p className="hrms-font-medium hrms-text-sm">+91 98765 43210</p>
              </div>
            </div>
            <div className="hrms-flex-start" style={{ alignItems: 'flex-start' }}>
              <MapPin className="hrms-text-muted" size={18} style={{ marginTop: '2px' }} />
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Current Address</p>
                <p className="hrms-font-medium hrms-text-sm" style={{ lineHeight: '1.5' }}>
                  123, MG Road,<br/>
                  Bangalore, Karnataka - 560001
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="hrms-card">
          <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Employment Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Joining Date</p>
              <p className="hrms-font-medium hrms-text-sm">12 Jan 2024</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Reporting To</p>
              <p className="hrms-font-medium hrms-text-sm hrms-text-primary">Rohan Mehta</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Employment Type</p>
              <p className="hrms-font-medium hrms-text-sm">Full Time</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Probation End</p>
              <p className="hrms-font-medium hrms-text-sm">12 Jul 2024</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact & Bank Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="hrms-card">
            <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Emergency Contact</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Name (Relation)</p>
                <p className="hrms-font-medium hrms-text-sm">Rajesh Sharma (Father)</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Phone</p>
                <p className="hrms-font-medium hrms-text-sm">+91 91234 56789</p>
              </div>
            </div>
          </div>
          
          <div className="hrms-card">
            <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Bank Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Bank Name</p>
                <p className="hrms-font-medium hrms-text-sm">HDFC Bank</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Account Number</p>
                <p className="hrms-font-medium hrms-text-sm">XXXX XXXX 1234</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
