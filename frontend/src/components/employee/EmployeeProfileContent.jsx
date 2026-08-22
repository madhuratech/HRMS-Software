import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Clock, FileText, Monitor, TrendingUp, Folder, User, Camera, Trash2 } from 'lucide-react';
import { useToast } from '../ui/Toast';
import EmployeeAvatar from './EmployeeAvatar';
import './employee-module.css';
import { apiFetch, getAuthToken } from '../../lib/api';

const tabs = [
  'Overview', 'Employment', 'Salary', 'Attendance', 'Leave', 
  'Documents', 'Performance'
];

export default function EmployeeProfileContent() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const authRaw = localStorage.getItem('hrms_auth');
  let userRole = 'SUPER_ADMIN';
  let authUserId = '11';
  if (authRaw) {
    try {
      const parsed = JSON.parse(authRaw);
      const userObj = parsed.user || parsed;
      if (parsed.role) userRole = parsed.role;
      if (userObj && userObj.id) authUserId = String(userObj.id);
    } catch(e) {}
  }
  const isEmployeeRole = userRole === 'EMPLOYEE';
  const isTeamLeaderRole = userRole === 'TEAM_LEADER' || userRole === 'Team Leader';

  const [activeTab, setActiveTab] = useState('Overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [profileError, setProfileError] = useState(null);
  const [noTeamAssigned, setNoTeamAssigned] = useState(false);
  const [teamName, setTeamName] = useState(null);

  // Lookup data for dropdowns
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [teams, setTeams] = useState([]);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    employmentType: '',
    salary: '',
    address: '',
    emergencyContact: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    department: '',
    designation: '',
    managerName: '',
    teamName: ''
  });

  const [currentEmpId, setCurrentEmpId] = useState(() => {
    if (isTeamLeaderRole || isEmployeeRole) return authUserId;
    return localStorage.getItem('selectedEmployeeId') || '1';
  });
  const [allEmployees, setAllEmployees] = useState([]);
  const photoInputRef = useRef(null);

  const handleEmployeeSelect = (newId) => {
    localStorage.setItem('selectedEmployeeId', newId);
    setCurrentEmpId(newId);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('Photo must be under 2MB', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('photo', file);
    fetch(`/app/employees/${currentEmpId}/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    })
    .then(res => { if (!res.ok) throw new Error('Upload failed'); return res.json(); })
    .then(() => {
      addToast('Profile photo updated!', 'success');
      loadProfile();
    })
    .catch(() => addToast('Failed to upload photo', 'error'));
    e.target.value = '';
  };

  const handlePhotoRemove = () => {
    apiFetch(`/employees/${currentEmpId}/photo`, { method: 'DELETE' })
    .then(() => {
      addToast('Photo removed', 'success');
      loadProfile();
    })
    .catch(() => addToast('Failed to remove photo', 'error'));
  };

  const loadProfile = () => {
    setLoading(true);
    setProfileError(null);
    apiFetch(`/employees/${currentEmpId}/profile`)
      .then(data => {
        if (data && data.error) {
          setProfileError(data.error);
          setProfile(null);
        } else {
          setProfile(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setProfileError("Access Denied: You are only authorized to view profiles of your own team members.");
        setProfile(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isTeamLeaderRole) {
      apiFetch('/employees/team-members')
        .then(res => {
          if (res && res.noTeamAssigned) {
            setNoTeamAssigned(true);
            setAllEmployees(res.members || []);
          } else if (res && Array.isArray(res.members)) {
            setNoTeamAssigned(false);
            setTeamName(res.teamName);
            setAllEmployees(res.members);
          } else if (Array.isArray(res)) {
            setAllEmployees(res);
          }
        })
        .catch(err => console.error("Error fetching team members:", err));
    } else {
      apiFetch('/employees')
        .then(data => {
          if (Array.isArray(data)) setAllEmployees(data);
        })
        .catch(err => console.error("Error fetching all employees:", err));
    }
  }, [isTeamLeaderRole]);

  // Fetch profile on mount and when selected employee changes
  useEffect(() => {
    loadProfile();

    // Fetch documents
    apiFetch(`/employees/${currentEmpId}/documents`)
      .then(data => {
        if (Array.isArray(data)) {
          setDocuments(data);
        } else {
          setDocuments([]);
        }
      })
      .catch(err => console.error("Error loading docs:", err));

    // Fetch lookup data for dropdowns
    apiFetch('/employees/lookup/designations')
      .then(data => Array.isArray(data) && setDesignations(data)).catch(() => {});
    apiFetch('/employees/lookup/departments')
      .then(data => Array.isArray(data) && setDepartments(data)).catch(() => {});
    apiFetch('/employees/lookup/branches')
      .then(data => Array.isArray(data) && setBranches(data)).catch(() => {});
    apiFetch('/employees/lookup/teams')
      .then(data => Array.isArray(data) && setTeams(data)).catch(() => {});
  }, [currentEmpId]);

  if (loading) {
    return (
      <div className="hrms-content" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="hrms-text-muted hrms-mt-4">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="hrms-content" style={{ textAlign: 'center', padding: '40px' }}>
        <p className="hrms-text-muted">Employee profile not found.</p>
        <button className="hrms-primary-btn hrms-mt-4" onClick={() => navigate('/employees')}>Back to Directory</button>
      </div>
    );
  }

  // Parse bank details
  let bank = { bankName: '—', accountNumber: '—', ifscCode: '—' };
  try {
    if (profile.bankDetails) {
      bank = JSON.parse(profile.bankDetails);
    }
  } catch (e) {
    bank.accountNumber = profile.bankDetails;
  }

  // Mask bank account number
  const rawAcc = bank.accountNumber || "";
  const maskedAcc = rawAcc.length > 4 
    ? rawAcc.slice(-4).padStart(rawAcc.length, "*") 
    : rawAcc;

  const handleEditClick = () => {
    setEditForm({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
      gender: profile.gender || '',
      employmentType: profile.employmentType || 'Full-time',
      salary: profile.salary || '0',
      address: profile.address || '',
      emergencyContact: profile.emergencyContact || '',
      bankName: bank.bankName || '',
      accountNumber: bank.accountNumber || '',
      ifscCode: bank.ifscCode || '',
      branch: profile.branchName || 'Downtown',
      department: profile.deptName || 'Engineering',
      designation: profile.roleName || 'Software Engineer',
      managerName: profile.managerName || 'Super Admin',
      teamName: profile.teamName || 'Backend Team'
    });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      dob: editForm.dob,
      gender: editForm.gender,
      employmentType: editForm.employmentType,
      salary: parseFloat(editForm.salary) || 0,
      address: editForm.address,
      emergencyContact: editForm.emergencyContact,
      bankDetails: JSON.stringify({ bankName: editForm.bankName, accountNumber: editForm.accountNumber, ifscCode: editForm.ifscCode }),
      branch: editForm.branch,
      department: editForm.department,
      designation: editForm.designation,
      managerName: editForm.managerName,
      teamName: editForm.teamName
    };

    apiFetch(`/employees/${currentEmpId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    })
    .then(() => {
      addToast("Profile updated successfully!", "success");
      setIsEditing(false);
      loadProfile();
    })
    .catch(err => {
      console.error(err);
      addToast("Failed to update profile", "error");
    });
  };

  const isViewingTeamMember = isTeamLeaderRole && String(currentEmpId) !== String(authUserId);
  const hideEditButton = isEmployeeRole || isViewingTeamMember;
  const filteredTabs = (isEmployeeRole || isViewingTeamMember)
    ? tabs.filter(t => t !== 'Salary')
    : tabs;

  if (profileError) {
    return (
      <div className="hrms-content">
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 shadow-sm">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <User size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Profile Access Restricted</h3>
            <p className="text-xs text-rose-700 font-semibold mt-1">{profileError}</p>
          </div>
          <button
            onClick={() => {
              localStorage.setItem('selectedEmployeeId', authUserId);
              setCurrentEmpId(authUserId);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            Return to My Profile
          </button>
        </div>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="hrms-content flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hrms-content">
      {/* Profile Header */}
      <div className="hrms-card hrms-mb-6" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isEmployeeRole && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px',
              padding: '6px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <User size={16} color="#475569" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
                {isTeamLeaderRole ? 'My Team Profiles:' : 'Select Employee:'}
              </span>
              <select
                value={currentEmpId}
                onChange={(e) => handleEmployeeSelect(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0F172A',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {noTeamAssigned && (
                  <option value={authUserId}>My Profile (No Team Assigned)</option>
                )}
                {!noTeamAssigned && allEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({`EMP${String(emp.id).padStart(4, '0')}`}){String(emp.id) === String(authUserId) ? ' (Me)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!hideEditButton && (
            <button className="hrms-secondary-btn" onClick={handleEditClick}>
              <Edit2 size={16} /> Edit Profile
            </button>
          )}
        </div>

        <div className="hrms-flex-start" style={{ gap: '32px', marginBottom: '32px' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <EmployeeAvatar
              name={profile.name}
              photoUrl={profile.profilePhoto}
              size={120}
              className="hrms-avatar hrms-avatar-lg"
            />
            <input
              type="file"
              ref={photoInputRef}
              onChange={handlePhotoUpload}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
            />
            <div style={{
              position: 'absolute', bottom: '2px', right: '2px',
              display: 'flex', gap: '4px'
            }}>
              <button
                onClick={() => photoInputRef.current?.click()}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: '#2952E3', color: '#fff', border: '2px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  padding: 0
                }}
                title="Change photo"
              >
                <Camera size={14} />
              </button>
              {profile.profilePhoto && (
                <button
                  onClick={handlePhotoRemove}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: '#ef4444', color: '#fff', border: '2px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    padding: 0
                  }}
                  title="Remove photo"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          <div>
            <div className="hrms-flex-start hrms-mb-4" style={{ gap: '12px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#0f172a', margin: 0 }}>{profile.name}</h1>
              <span className="hrms-badge hrms-badge-active">{profile.status || 'Active'}</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px' }}>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Employee ID</p>
                <p className="hrms-font-medium hrms-text-sm">EMP00{profile.id}</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Designation</p>
                <p className="hrms-font-medium hrms-text-sm">{profile.roleName || 'Staff'}</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Department</p>
                <p className="hrms-font-medium hrms-text-sm">{profile.deptName || 'General'}</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Email</p>
                <p className="hrms-font-medium hrms-text-sm">{profile.email}</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Phone</p>
                <p className="hrms-font-medium hrms-text-sm">{profile.phone || '—'}</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Branch</p>
                <p className="hrms-font-medium hrms-text-sm">{profile.branchName || 'Head Office'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="hrms-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          {filteredTabs.map(tab => (
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

      {/* Content Area depends on ActiveTab */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Personal Information */}
          <div className="hrms-card">
            <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Date of Birth</p>
                <p className="hrms-font-medium hrms-text-sm">{profile.dob ? new Date(profile.dob).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Gender</p>
                <p className="hrms-font-medium hrms-text-sm">{profile.gender || '—'}</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Employment Type</p>
                <p className="hrms-font-medium hrms-text-sm">{profile.employmentType || 'Full-time'}</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Emergency Contact</p>
                <p className="hrms-font-medium hrms-text-sm">{profile.emergencyContact || '—'}</p>
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
                  <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Email Address</p>
                  <p className="hrms-font-medium hrms-text-sm">{profile.email}</p>
                </div>
              </div>
              <div className="hrms-flex-start" style={{ alignItems: 'flex-start' }}>
                <Phone className="hrms-text-muted" size={18} style={{ marginTop: '2px' }} />
                <div>
                  <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Phone Number</p>
                  <p className="hrms-font-medium hrms-text-sm">{profile.phone || '—'}</p>
                </div>
              </div>
              <div className="hrms-flex-start" style={{ alignItems: 'flex-start' }}>
                <MapPin className="hrms-text-muted" size={18} style={{ marginTop: '2px' }} />
                <div>
                  <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Address</p>
                  <p className="hrms-font-medium hrms-text-sm" style={{ whiteSpace: 'pre-line' }}>{profile.address || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Employment' && (
        <div className="hrms-card">
          <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Employment Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Joining Date</p>
              <p className="hrms-font-medium hrms-text-sm">{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Reporting Manager</p>
              <p className="hrms-font-medium hrms-text-sm hrms-text-primary">{profile.managerName || 'None'}</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Department</p>
              <p className="hrms-font-medium hrms-text-sm">{profile.deptName}</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Designation</p>
              <p className="hrms-font-medium hrms-text-sm">{profile.roleName}</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Team</p>
              <p className="hrms-font-medium hrms-text-sm">{profile.teamName || '—'}</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Employment Type</p>
              <p className="hrms-font-medium hrms-text-sm">{profile.employmentType}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Salary' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="hrms-card">
            <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Compensation Details</h3>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Monthly Gross CTC</p>
              <p className="hrms-font-semibold" style={{ fontSize: '20px', color: '#10b981' }}>INR {profile.salary ? parseFloat(profile.salary).toLocaleString() : '0'}</p>
            </div>
          </div>
          <div className="hrms-card">
            <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Bank Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Bank Name</p>
                <p className="hrms-font-medium hrms-text-sm">{bank.bankName}</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Account Number</p>
                <p className="hrms-font-medium hrms-text-sm">{maskedAcc}</p>
              </div>
              <div>
                <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>IFSC Code</p>
                <p className="hrms-font-medium hrms-text-sm">{bank.ifscCode}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Attendance' && (
        <div className="hrms-card">
          <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Attendance Performance (Current Month)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
              <p className="hrms-text-muted hrms-text-xs">Present</p>
              <p className="hrms-font-semibold hrms-text-success" style={{ fontSize: '24px' }}>{profile.attendanceSummary?.present}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
              <p className="hrms-text-muted hrms-text-xs">Absent</p>
              <p className="hrms-font-semibold hrms-text-danger" style={{ fontSize: '24px' }}>{profile.attendanceSummary?.absent}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fffbeb', borderRadius: '8px' }}>
              <p className="hrms-text-muted hrms-text-xs">Late Arrivals</p>
              <p className="hrms-font-semibold" style={{ fontSize: '24px', color: '#d97706' }}>{profile.attendanceSummary?.late}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <p className="hrms-text-muted hrms-text-xs">Half Day</p>
              <p className="hrms-font-semibold hrms-text-primary" style={{ fontSize: '24px' }}>{profile.attendanceSummary?.halfDay}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Leave' && (
        <div className="hrms-card">
          <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Leave Balances</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <p className="hrms-text-muted hrms-text-xs">Total Leave Allocated</p>
              <p className="hrms-font-semibold" style={{ fontSize: '24px' }}>{profile.leaveSummary?.total} Days</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
              <p className="hrms-text-muted hrms-text-xs">Leave Taken</p>
              <p className="hrms-font-semibold hrms-text-primary" style={{ fontSize: '24px' }}>{profile.leaveSummary?.taken} Days</p>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
              <p className="hrms-text-muted hrms-text-xs">Remaining Balance</p>
              <p className="hrms-font-semibold hrms-text-success" style={{ fontSize: '24px' }}>{profile.leaveSummary?.remaining} Days</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Documents' && (
        <div className="hrms-card">
          <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Employee Documents</h3>
          {documents.length === 0 ? (
            <p className="hrms-text-sm hrms-text-muted">No documents uploaded for this employee yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {documents.map(doc => (
                <div key={doc.id} className="hrms-flex-between" style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div className="hrms-flex-start" style={{ gap: '12px' }}>
                    <FileText size={20} className="hrms-text-muted" />
                    <div>
                      <p className="hrms-text-sm hrms-font-medium">{doc.file_name}</p>
                      <p className="hrms-text-xs hrms-text-muted">{doc.doc_type} • Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a href={doc.file_path.startsWith('http') ? doc.file_path : `http://localhost:3000${doc.file_path}`} target="_blank" rel="noreferrer" download className="hrms-text-primary hrms-text-xs hrms-font-semibold hover:underline">Download</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Performance' && (
        <div className="hrms-card">
          <h3 className="hrms-font-semibold hrms-mb-6" style={{ fontSize: '16px' }}>Performance Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Overall Rating</p>
              <p className="hrms-font-semibold hrms-text-primary" style={{ fontSize: '20px' }}>{profile.performanceSummary?.rating}</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Last Appraisal Period</p>
              <p className="hrms-font-medium hrms-text-sm">{profile.performanceSummary?.lastReview}</p>
            </div>
            <div>
              <p className="hrms-text-muted hrms-text-xs" style={{ marginBottom: '4px' }}>Status</p>
              <span className="hrms-badge hrms-badge-active" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>{profile.performanceSummary?.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="hrms-modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '24px'
        }}>
          <div className="hrms-card" style={{
            width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto',
            border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 className="hrms-font-semibold hrms-mb-6">Edit Employee Profile</h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="hrms-input-group">
                  <label className="hrms-label">Full Name *</label>
                  <input type="text" className="hrms-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Email *</label>
                  <input type="email" className="hrms-input" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required />
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Phone *</label>
                  <input type="text" className="hrms-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} required />
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Date of Birth</label>
                  <input type="date" className="hrms-input" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} />
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Gender</label>
                  <select className="hrms-select" value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Employment Type</label>
                  <select className="hrms-select" value={editForm.employmentType} onChange={e => setEditForm({...editForm, employmentType: e.target.value})}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Monthly Gross Salary (INR)</label>
                  <input type="number" className="hrms-input" value={editForm.salary} onChange={e => setEditForm({...editForm, salary: e.target.value})} />
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Emergency Contact</label>
                  <input type="text" className="hrms-input" value={editForm.emergencyContact} onChange={e => setEditForm({...editForm, emergencyContact: e.target.value})} />
                </div>
                <div className="hrms-input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="hrms-label">Address</label>
                  <textarea className="hrms-input" rows="2" style={{ height: 'auto', resize: 'vertical' }} value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                </div>
                
                <div style={{ gridColumn: 'span 2', fontWeight: '600', fontSize: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', color: '#1e293b' }}>
                  Bank Account Details
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Bank Name</label>
                  <input type="text" className="hrms-input" value={editForm.bankName} onChange={e => setEditForm({...editForm, bankName: e.target.value})} />
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Account Number</label>
                  <input type="text" className="hrms-input" value={editForm.accountNumber} onChange={e => setEditForm({...editForm, accountNumber: e.target.value})} />
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">IFSC Code</label>
                  <input type="text" className="hrms-input" value={editForm.ifscCode} onChange={e => setEditForm({...editForm, ifscCode: e.target.value})} />
                </div>

                <div style={{ gridColumn: 'span 2', fontWeight: '600', fontSize: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', color: '#1e293b' }}>
                  Job Assignment Details
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Branch</label>
                  <select className="hrms-select" value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})}>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b.id} value={b.branch_name}>{b.branch_name}</option>)}
                    {editForm.branch && !branches.find(b => b.branch_name === editForm.branch) && <option value={editForm.branch}>{editForm.branch}</option>}
                  </select>
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Department</label>
                  <select className="hrms-select" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.dept_name}>{d.dept_name}</option>)}
                    {editForm.department && !departments.find(d => d.dept_name === editForm.department) && <option value={editForm.department}>{editForm.department}</option>}
                  </select>
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Designation</label>
                  <select className="hrms-select" value={editForm.designation} onChange={e => setEditForm({...editForm, designation: e.target.value})}>
                    <option value="">Select Designation</option>
                    {designations.map(d => <option key={d.id} value={d.role_name}>{d.role_name}</option>)}
                    {editForm.designation && !designations.find(d => d.role_name === editForm.designation) && <option value={editForm.designation}>{editForm.designation}</option>}
                  </select>
                </div>
                <div className="hrms-input-group">
                  <label className="hrms-label">Team</label>
                  <select className="hrms-select" value={editForm.teamName} onChange={e => setEditForm({...editForm, teamName: e.target.value})}>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    {editForm.teamName && !teams.find(t => t.name === editForm.teamName) && <option value={editForm.teamName}>{editForm.teamName}</option>}
                  </select>
                </div>
                <div className="hrms-input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="hrms-label">Manager Name</label>
                  <input type="text" className="hrms-input" value={editForm.managerName} onChange={e => setEditForm({...editForm, managerName: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button type="button" className="hrms-secondary-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="hrms-primary-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
