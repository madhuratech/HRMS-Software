import React, { useState, useEffect, useRef } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Check, ChevronRight, ChevronLeft, Plus, Trash2, Building, Calendar, DollarSign, MapPin, Briefcase, Award, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useToast } from '../ui/Toast';
import EmployeeAvatar from './EmployeeAvatar';
import './employee-module.css';
import { apiFetch } from '../../lib/api';

const steps = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Employment Info' },
  { id: 3, label: 'Previous Experience' },
  { id: 4, label: 'Contact Info' },
  { id: 5, label: 'Salary Info' },
  { id: 6, label: 'Documents' },
  { id: 7, label: 'Review' },
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
    experience: '',
    shiftType: '',
    email: '',
    phone: '',
    address: '',
    salary: '60000',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    emergencyContact: '',
    password: 'Employee@2026',
    photo: ''
  });

  // Previous Experience States
  const [experienceType, setExperienceType] = useState('Experienced');
  const [totalExpYears, setTotalExpYears] = useState(0);
  const [totalExpMonths, setTotalExpMonths] = useState(0);
  const [relevantExpYears, setRelevantExpYears] = useState(0);
  const [relevantExpMonths, setRelevantExpMonths] = useState(0);
  const [previousExperiences, setPreviousExperiences] = useState([]);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const photoInputRef = useRef(null);

  const [emailStatus, setEmailStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken'
  const [emailError, setEmailError] = useState(null);

  // Real-time Email Duplicate Check
  useEffect(() => {
    if (!formData.email || !formData.email.trim()) {
      setEmailStatus('idle');
      setEmailError(null);
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(cleanEmail)) {
      setEmailStatus('taken');
      setEmailError('Invalid email format');
      return;
    }

    setEmailStatus('checking');
    setEmailError(null);

    const timer = setTimeout(() => {
      apiFetch(`/employees/check-email?email=${encodeURIComponent(cleanEmail)}`)
        .then(data => {
          if (data && data.available === false) {
            setEmailStatus('taken');
            setEmailError(data.message || 'This email is already registered. Please use another company email.');
          } else {
            setEmailStatus('available');
            setEmailError(null);
          }
        })
        .catch(() => {
          setEmailStatus('idle');
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.email]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Photo must be under 2MB', 'error');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Lookup data for dropdowns
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    apiFetch('/employees/lookup/designations')
      .then(data => { if (Array.isArray(data)) { setDesignations(data); if (data.length > 0 && !formData.designation) setFormData(prev => ({ ...prev, designation: data[0].role_name })); } }).catch(() => { });
    apiFetch('/employees/lookup/departments')
      .then(data => { if (Array.isArray(data)) { setDepartments(data); if (data.length > 0 && !formData.department) setFormData(prev => ({ ...prev, department: data[0].dept_name })); } }).catch(() => { });
    apiFetch('/employees/lookup/branches')
      .then(data => { if (Array.isArray(data)) { setBranches(data); if (data.length > 0 && !formData.branch) setFormData(prev => ({ ...prev, branch: data[0].branch_name })); } }).catch(() => { });
    apiFetch('/employees/lookup/teams')
      .then(data => { if (Array.isArray(data)) { setTeams(data); if (data.length > 0 && !formData.teamName) setFormData(prev => ({ ...prev, teamName: data[0].name })); } }).catch(() => { });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setDropdownField = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  // Previous Experience Helpers
  const handleAddPreviousExperience = () => {
    setPreviousExperiences(prev => [
      ...prev,
      {
        id: Date.now(),
        company_name: '',
        designation: '',
        department: '',
        employment_type: 'Full-time',
        start_date: '',
        end_date: '',
        total_years: 0,
        total_months: 0,
        relevant_years: 0,
        relevant_months: 0,
        company_location: '',
        nature_of_work: '',
        leaving_reason: '',
        last_drawn_ctc: '',
        currency: 'INR'
      }
    ]);
  };

  const handleUpdateExperienceItem = (id, field, value) => {
    setPreviousExperiences(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };

      // Auto calculate duration in years and months if dates changed
      if (field === 'start_date' || field === 'end_date') {
        const sDate = field === 'start_date' ? value : item.start_date;
        const eDate = field === 'end_date' ? value : item.end_date;
        if (sDate && eDate) {
          const s = new Date(sDate);
          const e = new Date(eDate);
          if (e >= s) {
            let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
            const yrs = Math.floor(months / 12);
            const mos = months % 12;
            updated.total_years = yrs;
            updated.total_months = mos;
            if (!updated.relevant_years && !updated.relevant_months) {
              updated.relevant_years = yrs;
              updated.relevant_months = mos;
            }
          }
        }
      }
      return updated;
    }));
  };

  const handleRemoveExperienceItem = (id) => {
    setPreviousExperiences(prev => prev.filter(item => item.id !== id));
  };

  // Auto-update summary string and form experience
  useEffect(() => {
    if (experienceType === 'Fresher') {
      setFormData(prev => ({ ...prev, experience: 'Fresher' }));
    } else {
      if (previousExperiences.length > 0) {
        // Calculate cumulative duration
        let totalMonthsCount = 0;
        let relMonthsCount = 0;
        previousExperiences.forEach(exp => {
          totalMonthsCount += ((parseInt(exp.total_years, 10) || 0) * 12) + (parseInt(exp.total_months, 10) || 0);
          relMonthsCount += ((parseInt(exp.relevant_years, 10) || 0) * 12) + (parseInt(exp.relevant_months, 10) || 0);
        });
        const computedTotYrs = Math.floor(totalMonthsCount / 12);
        const computedTotMos = totalMonthsCount % 12;
        const computedRelYrs = Math.floor(relMonthsCount / 12);
        const computedRelMos = relMonthsCount % 12;

        setTotalExpYears(computedTotYrs);
        setTotalExpMonths(computedTotMos);
        setRelevantExpYears(computedRelYrs);
        setRelevantExpMonths(computedRelMos);

        const expString = computedTotMos > 0
          ? `${computedTotYrs} Years ${computedTotMos} Months`
          : `${computedTotYrs} Years`;
        setFormData(prev => ({ ...prev, experience: expString }));
      } else {
        const expString = totalExpMonths > 0
          ? `${totalExpYears} Years ${totalExpMonths} Months`
          : `${totalExpYears} Years`;
        setFormData(prev => ({ ...prev, experience: expString }));
      }
    }
  }, [experienceType, previousExperiences, totalExpYears, totalExpMonths]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pass }));
    addToast('New password generated!', 'info');
  };

  const handleNext = () => {
    if (activeStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.dob || !formData.gender) {
        addToast("Please fill all required personal fields (*)", "error");
        return;
      }
    }
    if (activeStep === 2) {
      if (!formData.shiftType || !formData.shiftType.trim()) {
        addToast("Shift Type is required.", "error");
        return;
      }
    }
    if (activeStep === 3) {
      // Validate Previous Experience Step
      if (experienceType === 'Experienced' && previousExperiences.length > 0) {
        for (let i = 0; i < previousExperiences.length; i++) {
          const item = previousExperiences[i];
          if (!item.company_name || !item.company_name.trim()) {
            addToast(`Please enter Company Name for previous experience #${i + 1}`, "error");
            return;
          }
          if (!item.designation || !item.designation.trim()) {
            addToast(`Please enter Designation for previous experience #${i + 1}`, "error");
            return;
          }
          if (item.start_date && item.end_date) {
            if (new Date(item.start_date) > new Date(item.end_date)) {
              addToast(`End Date cannot be before Start Date for ${item.company_name}`, "error");
              return;
            }
          }
        }
      }
    }
    if (activeStep === 4) {
      if (!formData.email || !formData.email.trim() || !formData.phone) {
        addToast("Please fill email and phone number (*)", "error");
        return;
      }
      if (!formData.password || formData.password.trim().length < 4) {
        addToast("Please provide a valid login password", "error");
        return;
      }
      if (emailStatus === 'taken' || emailError) {
        addToast("This email is already registered. Please use another company email.", "error");
        return;
      }
    }
    setActiveStep(Math.min(7, activeStep + 1));
  };

  const handleSubmit = async () => {
    if (!formData.shiftType || !formData.shiftType.trim()) {
      addToast("Shift Type is required.", "error");
      setActiveStep(2);
      return;
    }

    if (emailStatus === 'taken' || emailError) {
      addToast("This email is already registered. Please use another company email.", "error");
      setActiveStep(4);
      return;
    }

    const payload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      dob: formData.dob,
      joinDate: formData.joinDate,
      gender: formData.gender,
      employmentType: formData.employmentType,
      experience: experienceType === 'Fresher' ? 'Fresher' : (formData.experience || `${totalExpYears} Years ${totalExpMonths} Months`),
      experience_type: experienceType,
      total_experience_years: experienceType === 'Fresher' ? 0 : totalExpYears,
      total_experience_months: experienceType === 'Fresher' ? 0 : totalExpMonths,
      relevant_experience_years: experienceType === 'Fresher' ? 0 : relevantExpYears,
      relevant_experience_months: experienceType === 'Fresher' ? 0 : relevantExpMonths,
      previous_experiences: experienceType === 'Fresher' ? [] : previousExperiences.filter(exp => exp.company_name && exp.company_name.trim()),
      shiftType: formData.shiftType,
      salary: parseFloat(formData.salary) || 0,
      address: formData.address,
      emergencyContact: formData.emergencyContact,
      bankDetails: JSON.stringify({ bankName: formData.bankName, accountNumber: formData.accountNumber, ifscCode: formData.ifscCode }),
      branch: formData.branch,
      department: formData.department,
      designation: formData.designation,
      managerName: formData.managerName,
      teamName: formData.teamName,
      password: formData.password || 'Employee@2026'
    };

    try {
      const resData = await apiFetch('/employees', {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!resData || resData.message === "Employee creation failed" || resData.error) {
        throw new Error(resData?.message || resData?.error || "Failed to create employee");
      }

      const newEmpId = resData.id;

      // Upload profile photo if selected by user
      if (photoFile && newEmpId) {
        const photoData = new FormData();
        photoData.append('photo', photoFile);
        await apiFetch(`/employees/${newEmpId}/photo`, {
          method: 'POST',
          body: photoData
        });
      }

      addToast(resData.message || "Employee created successfully with previous experience profile.", "success");
      navigate("/employees/list");
    } catch (err) {
      console.error(err);
      const errMsg = err?.message || "Failed to save employee to database";
      if (errMsg.toLowerCase().includes("registered") || errMsg.toLowerCase().includes("duplicate") || errMsg.toLowerCase().includes("already exists")) {
        setEmailStatus('taken');
        setEmailError("This email is already registered. Please use another company email.");
        setActiveStep(4);
        addToast("This email is already registered. Please use another company email.", "error");
      } else {
        addToast(errMsg, "error");
      }
    }
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
            {/* STEP 1: PERSONAL INFO */}
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
                    <AppDropdown value={formData.gender} onChange={(val) => setDropdownField('gender', val)} options={[{value:'',label:'Select Gender'},{value:'Male',label:'Male'},{value:'Female',label:'Female'},{value:'Other',label:'Other'}]} size="sm" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Marital Status</label>
                    <AppDropdown value={formData.maritalStatus} onChange={(val) => setDropdownField('maritalStatus', val)} options={[{value:'',label:'Select Status'},{value:'Single',label:'Single'},{value:'Married',label:'Married'}]} size="sm" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Blood Group</label>
                    <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="hrms-input" placeholder="e.g. O+" />
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: EMPLOYMENT INFO */}
            {activeStep === 2 && (
              <>
                <h2 className="hrms-font-semibold hrms-mb-6">Employment Information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Department</label>
                    <AppDropdown value={formData.department} onChange={(val) => setDropdownField('department', val)} options={[{value:'',label:'Select Department'}, ...(departments || [])]} size="sm" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Designation</label>
                    <AppDropdown value={formData.designation} onChange={(val) => setDropdownField('designation', val)} options={[{value:'',label:'Select Designation'}, ...(designations || [])]} size="sm" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Employee Shift Type *</label>
                    <AppDropdown
                      value={formData.shiftType}
                      onChange={(val) => setDropdownField('shiftType', val)}
                      placeholder="Select Shift Type"
                      options={[
                        { value: '', label: 'Select Shift Type' },
                        { value: 'Regular Shift', label: 'Regular Shift' },
                        { value: 'Rotational Shift', label: 'Rotational Shift' },
                        { value: 'Contract Shift', label: 'Contract Shift' }
                      ]}
                      size="sm"
                    />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Employment Type</label>
                    <AppDropdown value={formData.employmentType} onChange={(val) => setDropdownField('employmentType', val)} options={[{value:'Full-time',label:'Full-time'},{value:'Part-time',label:'Part-time'},{value:'Contract',label:'Contract'}]} size="sm" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Branch</label>
                    <AppDropdown value={formData.branch} onChange={(val) => setDropdownField('branch', val)} options={[{value:'',label:'Select Branch'}, ...(branches || [])]} size="sm" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Team</label>
                    <AppDropdown value={formData.teamName} onChange={(val) => setDropdownField('teamName', val)} options={[{value:'',label:'Select Team'}, ...(teams || [])]} size="sm" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Reporting Manager</label>
                    <input type="text" name="managerName" value={formData.managerName} onChange={handleChange} className="hrms-input" placeholder="e.g. John Doe" />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Joining Date</label>
                    <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className="hrms-input" />
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: PREVIOUS EXPERIENCE */}
            {activeStep === 3 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 className="hrms-font-semibold" style={{ margin: '0 0 4px 0' }}>Previous Experience & History</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                      Configure previous employment records that will be preserved in the employee profile.
                    </p>
                  </div>

                  {/* Experience Type Toggle */}
                  <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setExperienceType('Experienced')}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: experienceType === 'Experienced' ? '#2563EB' : 'transparent',
                        color: experienceType === 'Experienced' ? '#FFFFFF' : '#64748B',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Experienced
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExperienceType('Fresher');
                        setPreviousExperiences([]);
                        setTotalExpYears(0);
                        setTotalExpMonths(0);
                        setRelevantExpYears(0);
                        setRelevantExpMonths(0);
                      }}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: experienceType === 'Fresher' ? '#7E22CE' : 'transparent',
                        color: experienceType === 'Fresher' ? '#FFFFFF' : '#64748B',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Fresher
                    </button>
                  </div>
                </div>

                {experienceType === 'Fresher' ? (
                  <div style={{
                    padding: '32px',
                    borderRadius: '16px',
                    background: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    textAlign: 'center',
                    marginBottom: '24px'
                  }}>
                    <Award size={40} color="#7E22CE" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#581C87' }}>Fresher Candidate</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6B21A8', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                      This employee has no previous corporate employment history. Their profile will be recorded as Fresher with 0 previous experience.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Experience Summary Metric Inputs */}
                    <div style={{
                      padding: '20px',
                      borderRadius: '14px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      marginBottom: '24px'
                    }}>
                      <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>Experience Summary</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <label className="hrms-label" style={{ marginBottom: '6px' }}>Total Previous Experience</label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="number"
                                min="0"
                                max="50"
                                value={totalExpYears}
                                onChange={e => setTotalExpYears(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                className="hrms-input"
                                placeholder="Years"
                              />
                              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Yrs</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="number"
                                min="0"
                                max="11"
                                value={totalExpMonths}
                                onChange={e => setTotalExpMonths(Math.min(11, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                                className="hrms-input"
                                placeholder="Months"
                              />
                              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Mos</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="hrms-label" style={{ marginBottom: '6px' }}>Relevant Experience</label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="number"
                                min="0"
                                max="50"
                                value={relevantExpYears}
                                onChange={e => setRelevantExpYears(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                className="hrms-input"
                                placeholder="Years"
                              />
                              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Yrs</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="number"
                                min="0"
                                max="11"
                                value={relevantExpMonths}
                                onChange={e => setRelevantExpMonths(Math.min(11, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                                className="hrms-input"
                                placeholder="Months"
                              />
                              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Mos</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Previous Employment History Cards */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>
                        Previous Companies & History ({previousExperiences.length})
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddPreviousExperience}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 14px', borderRadius: '8px',
                          border: 'none', background: '#2563EB',
                          color: '#FFFFFF', fontSize: '13px', fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={15} /> Add Previous Company
                      </button>
                    </div>

                    {previousExperiences.length === 0 ? (
                      <div style={{
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px dashed #CBD5E1',
                        textAlign: 'center',
                        color: '#64748B',
                        background: '#FAFAFA'
                      }}>
                        <Building size={28} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
                        <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '500' }}>No previous company records added yet.</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                          Click "Add Previous Company" above to add previous employment history for reference.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {previousExperiences.map((exp, idx) => (
                          <div
                            key={exp.id || idx}
                            style={{
                              padding: '20px',
                              borderRadius: '14px',
                              border: '1px solid #E2E8F0',
                              background: '#FFFFFF',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                                  {idx + 1}
                                </span>
                                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>
                                  {exp.company_name || `Company #${idx + 1}`}
                                </h5>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveExperienceItem(exp.id)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '4px',
                                  border: 'none', background: 'none',
                                  color: '#EF4444', fontSize: '12px', fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} /> Remove
                              </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div className="hrms-input-group">
                                <label className="hrms-label">Company Name *</label>
                                <input
                                  type="text"
                                  value={exp.company_name}
                                  onChange={e => handleUpdateExperienceItem(exp.id, 'company_name', e.target.value)}
                                  className="hrms-input"
                                  placeholder="e.g. Infosys Ltd"
                                />
                              </div>

                              <div className="hrms-input-group">
                                <label className="hrms-label">Designation / Role *</label>
                                <input
                                  type="text"
                                  value={exp.designation}
                                  onChange={e => handleUpdateExperienceItem(exp.id, 'designation', e.target.value)}
                                  className="hrms-input"
                                  placeholder="e.g. Senior Software Engineer"
                                />
                              </div>

                              <div className="hrms-input-group">
                                <label className="hrms-label">Employment Type</label>
                                <AppDropdown
                                  value={exp.employment_type || 'Full-time'}
                                  onChange={v => handleUpdateExperienceItem(exp.id, 'employment_type', v)}
                                  options={[
                                    { value: 'Full-time', label: 'Full-time' },
                                    { value: 'Part-time', label: 'Part-time' },
                                    { value: 'Contract', label: 'Contract' },
                                    { value: 'Internship', label: 'Internship' }
                                  ]}
                                  size="sm"
                                />
                              </div>

                              <div className="hrms-input-group">
                                <label className="hrms-label">Company Location</label>
                                <input
                                  type="text"
                                  value={exp.company_location}
                                  onChange={e => handleUpdateExperienceItem(exp.id, 'company_location', e.target.value)}
                                  className="hrms-input"
                                  placeholder="e.g. Bangalore, India"
                                />
                              </div>

                              <div className="hrms-input-group">
                                <label className="hrms-label">Start Date</label>
                                <input
                                  type="date"
                                  value={exp.start_date}
                                  onChange={e => handleUpdateExperienceItem(exp.id, 'start_date', e.target.value)}
                                  className="hrms-input"
                                />
                              </div>

                              <div className="hrms-input-group">
                                <label className="hrms-label">End Date</label>
                                <input
                                  type="date"
                                  value={exp.end_date}
                                  onChange={e => handleUpdateExperienceItem(exp.id, 'end_date', e.target.value)}
                                  className="hrms-input"
                                />
                              </div>

                              <div className="hrms-input-group">
                                <label className="hrms-label">Last Drawn CTC (INR)</label>
                                <input
                                  type="text"
                                  value={exp.last_drawn_ctc}
                                  onChange={e => handleUpdateExperienceItem(exp.id, 'last_drawn_ctc', e.target.value)}
                                  className="hrms-input"
                                  placeholder="e.g. 850000"
                                />
                              </div>

                              <div className="hrms-input-group">
                                <label className="hrms-label">Reason for Leaving</label>
                                <input
                                  type="text"
                                  value={exp.leaving_reason}
                                  onChange={e => handleUpdateExperienceItem(exp.id, 'leaving_reason', e.target.value)}
                                  className="hrms-input"
                                  placeholder="e.g. Career Growth"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* STEP 4: CONTACT & LOGIN CREDENTIALS */}
            {activeStep === 4 && (
              <>
                <h2 className="hrms-font-semibold hrms-mb-6">Contact & Login Credentials</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Login Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="hrms-input"
                      style={{
                        borderColor: emailStatus === 'taken' ? '#ef4444' : emailStatus === 'available' ? '#10b981' : undefined
                      }}
                      placeholder="e.g. name@company.com"
                    />
                    {emailStatus === 'checking' && (
                      <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Checking email availability...
                      </span>
                    )}
                    {emailStatus === 'available' && (
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                        ✓ Email available
                      </span>
                    )}
                    {emailStatus === 'taken' && (
                      <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                        ✕ {emailError || "This email is already registered. Please use another company email."}
                      </span>
                    )}
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Phone *</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="hrms-input" placeholder="e.g. +91 99999 99999" />
                  </div>
                  <div className="hrms-input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="hrms-label" style={{ margin: 0 }}>Login Password *</label>
                      <button type="button" onClick={generatePassword} style={{ fontSize: '11px', color: '#2563EB', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>⚡ Auto Generate</button>
                    </div>
                    <input type="text" name="password" value={formData.password} onChange={handleChange} className="hrms-input" placeholder="Set login password..." />
                  </div>
                  <div className="hrms-input-group">
                    <label className="hrms-label">Emergency Contact Name/Number</label>
                    <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="hrms-input" placeholder="e.g. Parent - +91 98888 88888" />
                  </div>
                  <div className="hrms-input-group" style={{ gridColumn: 'span 2' }}>
                    <label className="hrms-label">Complete Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} className="hrms-input" rows="2" placeholder="Street, City, State..." style={{ height: 'auto', resize: 'vertical' }} />
                  </div>
                </div>
              </>
            )}

            {/* STEP 5: SALARY INFO */}
            {activeStep === 5 && (
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

            {/* STEP 6: DOCUMENTS */}
            {activeStep === 6 && (
              <>
                <h2 className="hrms-font-semibold hrms-mb-6">Documents Upload</h2>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                  <UploadCloud size={32} className="hrms-text-muted" style={{ margin: '0 auto 16px' }} />
                  <p className="hrms-text-sm hrms-font-medium hrms-mb-2">Drag and drop employee records here</p>
                  <p className="hrms-text-xs hrms-text-muted">PAN, Aadhaar, Passport, Contract agreements, Previous Relieving Letters (Max 5MB each)</p>
                  <button type="button" className="hrms-secondary-btn hrms-mt-4" style={{ margin: '16px auto 0' }}>Select Files</button>
                </div>
              </>
            )}

            {/* STEP 7: REVIEW */}
            {activeStep === 7 && (
              <>
                <h2 className="hrms-font-semibold hrms-mb-6">Review & Submit</h2>
                <div className="hrms-card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p className="hrms-mb-2"><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                      <p className="hrms-mb-2"><strong>Role/Designation:</strong> {formData.designation}</p>
                      <p className="hrms-mb-2"><strong>Department:</strong> {formData.department}</p>
                      <p className="hrms-mb-2"><strong>Shift Type:</strong> {formData.shiftType || '—'}</p>
                      <p className="hrms-mb-2"><strong>Email:</strong> {formData.email}</p>
                      <p className="hrms-mb-2"><strong>Branch:</strong> {formData.branch}</p>
                    </div>
                    <div>
                      <p className="hrms-mb-2"><strong>Experience Type:</strong> <span style={{ fontWeight: '700', color: experienceType === 'Fresher' ? '#7E22CE' : '#15803D' }}>{experienceType}</span></p>
                      <p className="hrms-mb-2"><strong>Total Previous Experience:</strong> {experienceType === 'Fresher' ? '0 Yrs' : `${totalExpYears} Yrs ${totalExpMonths} Mos`}</p>
                      <p className="hrms-mb-2"><strong>Relevant Experience:</strong> {experienceType === 'Fresher' ? '0 Yrs' : `${relevantExpYears} Yrs ${relevantExpMonths} Mos`}</p>
                      <p className="hrms-mb-2"><strong>Previous Companies:</strong> {previousExperiences.length} company record(s)</p>
                      <p className="hrms-mb-2"><strong>Salary:</strong> INR {formData.salary}</p>
                      <p className="hrms-mb-2"><strong>Employment Type:</strong> {formData.employmentType}</p>
                    </div>
                  </div>

                  {previousExperiences.length > 0 && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                      <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Previous Companies List:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {previousExperiences.map((item, i) => (
                          <div key={i} style={{ fontSize: '12px', color: '#475569', background: '#FFFFFF', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                            <strong>{item.company_name}</strong> — {item.designation} ({item.total_years}y {item.total_months}m)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                type="button"
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
              <button type="button" className="hrms-secondary-btn" onClick={() => setActiveStep(activeStep - 1)}>
                <ChevronLeft size={16} /> Previous
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button type="button" className="hrms-secondary-btn" style={{ border: 'none' }} onClick={() => navigate('/employees/list')}>Cancel</button>
            {activeStep < 7 ? (
              <button type="button" className="hrms-primary-btn" onClick={handleNext}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" className="hrms-primary-btn" onClick={handleSubmit}>
                Save Employee
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
