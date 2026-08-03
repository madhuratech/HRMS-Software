import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Check, ChevronRight } from 'lucide-react';
import './employee-module.css';

const steps = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Employment Info' },
  { id: 3, label: 'Contact Info' },
  { id: 4, label: 'Salary Info' },
  { id: 5, label: 'Documents' },
  { id: 6, label: 'Review' },
];

export default function AddEmployeeForm() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="hrms-content">
      <div className="hrms-header">
        <h1>Add Employee</h1>
      </div>

      <div className="hrms-card">
        {/* Step Indicator */}
        <div className="hrms-steps">
          {/* Progress Line */}
          <div style={{ position: 'absolute', top: '16px', left: '0', right: '0', height: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: '16px', left: '0', width: `${((activeStep - 1) / (steps.length - 1)) * 100}%`, height: '2px', backgroundColor: '#2952E3', zIndex: 0, transition: 'width 0.3s ease' }} />
          
          {steps.map((step) => (
            <div key={step.id} className={`hrms-step ${activeStep >= step.id ? 'active' : ''}`}>
              <div className="hrms-step-circle">
                {activeStep > step.id ? <Check size={16} /> : step.id}
              </div>
              <span className="hrms-step-label">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '48px' }}>
          <div>
            <h2 className="hrms-font-semibold hrms-mb-6">Personal Information</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="hrms-input-group">
                <label className="hrms-label">First Name *</label>
                <input type="text" className="hrms-input" placeholder="e.g. Aarav" />
              </div>
              <div className="hrms-input-group">
                <label className="hrms-label">Last Name *</label>
                <input type="text" className="hrms-input" placeholder="e.g. Sharma" />
              </div>
              
              <div className="hrms-input-group">
                <label className="hrms-label">Date of Birth *</label>
                <input type="date" className="hrms-input" />
              </div>
              <div className="hrms-input-group">
                <label className="hrms-label">Gender *</label>
                <select className="hrms-select">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="hrms-input-group">
                <label className="hrms-label">Marital Status *</label>
                <select className="hrms-select">
                  <option value="">Select Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                </select>
              </div>
              <div className="hrms-input-group">
                <label className="hrms-label">Blood Group</label>
                <select className="hrms-select">
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="O+">O+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Profile Photo Upload */}
          <div>
            <div style={{ 
              border: '1px dashed #cbd5e1', 
              borderRadius: '16px', 
              padding: '32px 24px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              height: '100%'
            }}>
              <h3 className="hrms-label hrms-mb-4" style={{ alignSelf: 'flex-start' }}>Profile Photo</h3>
              
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#e2e8f0', marginBottom: '24px', overflow: 'hidden' }}>
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              <button className="hrms-secondary-btn hrms-text-primary" style={{ border: 'none', backgroundColor: '#eff6ff', marginBottom: '8px' }}>
                <UploadCloud size={16} /> Upload Photo
              </button>
              <p className="hrms-text-xs hrms-text-muted">JPG, PNG. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hrms-flex-between" style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
          <button className="hrms-secondary-btn" style={{ border: 'none' }} onClick={() => navigate('/employees')}>Cancel</button>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="hrms-secondary-btn">Save Draft</button>
            <button className="hrms-primary-btn" onClick={() => setActiveStep(Math.min(6, activeStep + 1))}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
