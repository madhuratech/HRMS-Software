import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { useToast } from '../ui/Toast';
import EmployeeAvatar from './EmployeeAvatar';
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
  const { addToast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    bloodGroup: '',
    branch: '',
    department: '',
    designation: '',
    teamName: '',
    managerName: '',
    joinDate: new Date().toISOString().split('T')[0],
    employmentType: 'Full-time',
    email: '',
    phone: '',
    address: '',
    salary: '60000',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    emergencyContact: '',
    photo: ''
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Photo must be under 2MB', 'error');
        return;
      }
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Lookup data for dropdowns
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/app/employees/lookup/designations')
      .then(res => res.json()).then(data => { if (Array.isArray(data)) { setDesignations(data); if (data.length > 0 && !formData.designation) setFormData(prev => ({...prev, designation: data[0].role_name})); } }).catch(() => {});
    fetch('http://localhost:3000/app/employees/lookup/departments')
      .then(res => res.json()).then(data => { if (Array.isArray(data)) { setDepartments(data); if (data.length > 0 && !formData.department) setFormData(prev => ({...prev, department: data[0].dept_name})); } }).catch(() => {});
    fetch('http://localhost:3000/app/employees/lookup/branches')
      .then(res => res.json()).then(data => { if (Array.isArray(data)) { setBranches(data); if (data.length > 0 && !formData.branch) setFormData(prev => ({...prev, branch: data[0].branch_name})); } }).catch(() => {});
    fetch('http://localhost:3000/app/employees/lookup/teams')
      .then(res => res.json()).then(data => { if (Array.isArray(data)) { setTeams(data); if (data.length > 0 && !formData.teamName) setFormData(prev => ({...prev, teamName: data[0].name})); } }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (activeStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.dob || !formData.gender) {
        addToast("Please fill all required personal fields (*)", "error");
        return;
      }
    }
    if (activeStep === 3) {
      if (!formData.email || !formData.phone) {
        addToast("Please fill email and phone number (*)", "error");
        return;
      }
    }
    setActiveStep(Math.min(6, activeStep + 1));
  };

  const handleSubmit = () => {
    const payload = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      joinDate: formData.joinDate,
      gender: formData.gender,
      employmentType: formData.employmentType,
      salary: parseFloat(formData.salary) || 0,
      address: formData.address,
      emergencyContact: formData.emergencyContact,
      bankDetails: JSON.stringify({ bankName: formData.bankName, accountNumber: formData.accountNumber, ifscCode: formData.ifscCode }),
      branch: formData.branch,
      department: formData.department,
      designation: formData.designation,
      managerName: formData.managerName,
      teamName: formData.teamName
    };

    fetch("http://localhost:3000/app/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to create employee");
      return res.json();
    })
    .then(() => {
      addToast("Employee created successfully!", "success");
      navigate("/employees/list");
    })
    .catch(err => {
      console.error(err);
      addToast("Failed to save employee to database", "error");
    });
  };

  return (
    <div className="hrms-content">
      <div className="hrms-header">
        <h1>Add Employee</h1>
      </div>

      <div className="hrms-card">
        {/* Step Indicator */}
        <div className="hrms-steps">
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

        {/* Step Rendering */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '48px' }}>
          <div>
            {activeStep === 1 && (
              <>
                <h2 className="hrms-font-semibold hrms-mb-6">Personal Information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="hrms-input-group">
                    <label className="hrms-label">First Name *</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="hrms-input" placeholder="e.g. Aarav" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Last Name *</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="hrms-input" placeholder="e.g. Sharma" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Date of Birth *</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="hrms-input" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Gender *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="hrms-select">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Marital Status</label>
                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="hrms-select">
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </select>
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Blood Group</label>
                    <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="hrms-input" placeholder="e.g. O+" />
                  </div>
                </div>
              </>
            )}

            {activeStep === 2 && (
              <>
                <h2 className="hrms-font-semibold hrms-mb-6">Employment Information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Department</label>
                    <select name="department" value={formData.department} onChange={handleChange} className="hrms-select">
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.dept_name}>{d.dept_name}</option>)}
                    </select>
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Designation</label>
                    <select name="designation" value={formData.designation} onChange={handleChange} className="hrms-select">
                      <option value="">Select Designation</option>
                      {designations.map(d => <option key={d.id} value={d.role_name}>{d.role_name}</option>)}
                    </select>
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Branch</label>
                    <select name="branch" value={formData.branch} onChange={handleChange} className="hrms-select">
                      <option value="">Select Branch</option>
                      {branches.map(b => <option key={b.id} value={b.branch_name}>{b.branch_name}</option>)}
                    </select>
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Team</label>
                    <select name="teamName" value={formData.teamName} onChange={handleChange} className="hrms-select">
                      <option value="">Select Team</option>
                      {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Reporting Manager</label>
                    <input type="text" name="managerName" value={formData.managerName} onChange={handleChange} className="hrms-input" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Joining Date</label>
                    <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className="hrms-input" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Employment Type</label>
                    <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="hrms-select">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeStep === 3 && (
              <>
                <h2 className="hrms-font-semibold hrms-mb-6">Contact & Address Info</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="hrms-input" placeholder="e.g. name@company.com" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Phone *</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="hrms-input" placeholder="e.g. +91 99999 99999" />
                  </div>
                  <div className="hrms-input-group" style={{ gridColumn: 'span 2' }}>
                    <label className="hrms-label">Complete Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} className="hrms-input" rows="3" placeholder="Street, City, State..." style={{ height: 'auto', resize: 'vertical' }} />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Emergency Contact Name/Number</label>
                    <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="hrms-input" placeholder="e.g. Parent - +91 98888 88888" />
                  </div>
                </div>
              </>
            )}

            {activeStep === 4 && (
              <>
                <h2 className="hrms-font-semibold hrms-mb-6">Salary & Banking Info</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Monthly Gross Salary (INR)</label>
                    <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="hrms-input" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Bank Name</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="hrms-input" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Account Number</label>
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="hrms-input" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">IFSC Code</label>
                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="hrms-input" />
                  </div>
                </div>
              </>
            )}

            {activeStep === 5 && (
              <>
                <h2 className="hrms-font-semibold hrms-mb-6">Documents Upload</h2>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                  <UploadCloud size={32} className="hrms-text-muted" style={{ margin: '0 auto 16px' }} />
                  <p className="hrms-text-sm hrms-font-medium hrms-mb-2">Drag and drop employee records here</p>
                  <p className="hrms-text-xs hrms-text-muted">PAN, Aadhaar, Passport, Contract agreements (Max 5MB each)</p>
                  <button className="hrms-secondary-btn hrms-mt-4" style={{ margin: '16px auto 0' }}>Select Files</button>
                </div>
              </>
            )}

            {activeStep === 6 && (
              <>
                <h2 className="hrms-font-semibold hrms-mb-6">Review & Submit</h2>
                <div className="hrms-card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p className="hrms-mb-2"><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p className="hrms-mb-2"><strong>Role/Designation:</strong> {formData.designation}</p>
                  <p className="hrms-mb-2"><strong>Department:</strong> {formData.department}</p>
                  <p className="hrms-mb-2"><strong>Email:</strong> {formData.email}</p>
                  <p className="hrms-mb-2"><strong>Branch:</strong> {formData.branch}</p>
                  <p className="hrms-mb-2"><strong>Salary:</strong> INR {formData.salary}</p>
                </div>
              </>
            )}
          </div>
          
          {/* Profile Photo upload placeholder */}
          <div>
            <div style={{ 
              padding: '24px', 
              borderLeft: '1px solid #f1f5f9', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              height: '100%'
            }}>
              <h3 className="hrms-label hrms-mb-4" style={{ alignSelf: 'flex-start' }}>Profile Photo</h3>
              
              <div style={{ marginBottom: '24px' }}>
                <EmployeeAvatar 
                  name={`${formData.firstName} ${formData.lastName}`.trim() || 'New Employee'}
                  photoUrl={photoPreview || formData.photo} 
                  size={120} 
                />
              </div>
              
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoChange}
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
              />
              
              <button 
                className="hrms-secondary-btn hrms-text-primary" 
                style={{ border: 'none', backgroundColor: '#eff6ff', marginBottom: '8px' }}
                onClick={() => photoInputRef.current?.click()}
              >
                <UploadCloud size={16} /> Upload Photo
              </button>
              <p className="hrms-text-xs hrms-text-muted">JPG, PNG. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hrms-flex-between" style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
          <div>
            {activeStep > 1 && (
              <button className="hrms-secondary-btn" onClick={() => setActiveStep(activeStep - 1)}>
                <ChevronLeft size={16} /> Previous
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="hrms-secondary-btn" style={{ border: 'none' }} onClick={() => navigate('/employees/list')}>Cancel</button>
            {activeStep < 6 ? (
              <button className="hrms-primary-btn" onClick={handleNext}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button className="hrms-primary-btn" onClick={handleSubmit}>
                Save Employee
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
