import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Plus, MoreVertical, Star, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useToast } from '../ui/Toast';

export default function Candidates() {
  const { addToast } = useToast();
  const [candidatesData, setCandidatesData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Pagination & Search & Filter States
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  
  const [search, setSearch] = useState('');
  const [filterJob, setFilterJob] = useState('All Job Openings');
  const [filterStage, setFilterStage] = useState('All Stages');
  const [filterLocation, setFilterLocation] = useState('All Locations');

  const [resumeFile, setResumeFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: 'Male',
    dob: '',
    department: '',
    job: '',
    resume: '',
    experience: '',
    currentCompany: '',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: '',
    skills: '',
    address: '',
    status: 'Applied'
  });

  const getAuthToken = () => {
    const auth = localStorage.getItem('hrms_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        return parsed.token || 'mock_jwt_token';
      } catch (e) {
        return 'mock_jwt_token';
      }
    }
    return 'mock_jwt_token';
  };

  // Fetch departments metadata
  const fetchMeta = async () => {
    try {
      const res = await fetch('http://localhost:5000/app/requirements/meta/all', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = await res.json();
      if (data && data.departments) {
        setDepartments(data.departments);
      }
    } catch (err) {
      console.error('Failed to fetch metadata:', err);
    }
  };

  // Fetch candidates list from backend
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/app/candidates?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (filterStage && filterStage !== 'All Stages') {
        url += `&status=${encodeURIComponent(filterStage)}`;
      }
      // Note: we can map filterJob if it is not 'All Job Openings' as a search constraint
      if (filterJob && filterJob !== 'All Job Openings') {
        url += `&search=${encodeURIComponent(filterJob)}`;
      }
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setCandidatesData(resData.data.candidates || []);
        setTotal(resData.data.total || 0);
      } else {
        addToast(resData.message || 'Failed to load candidates', 'error');
      }
    } catch (err) {
      addToast('Error connecting to backend server', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStage, filterJob, addToast]);

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchPageOneAndReload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterJob, filterStage, filterLocation]);

  useEffect(() => {
    fetchCandidates();
  }, [page, fetchCandidates]);

  const fetchPageOneAndReload = () => {
    if (page === 1) {
      fetchCandidates();
    } else {
      setPage(1);
    }
  };

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Applied': return { bg: '#EFF6FF', text: '#2952E3' };
      case 'Screening': return { bg: '#F5F3FF', text: '#8B5CF6' };
      case 'Interview Scheduled': return { bg: '#FFFBEB', text: '#F59E0B' };
      case 'Interview Completed': return { bg: '#FFFBEB', text: '#F59E0B' };
      case 'Selected': return { bg: '#ECFDF5', text: '#10B981' };
      case 'Rejected': return { bg: '#FEF2F2', text: '#EF4444' };
      case 'On Hold': return { bg: '#F1F5F9', text: '#64748B' };
      case 'Hired': return { bg: '#ECFDF5', text: '#10B981' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center', justifyContent: 'center' }}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} color={i < rating ? '#F59E0B' : '#E2E8F0'} fill={i < rating ? '#F59E0B' : 'none'} />
        ))}
      </div>
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile || !formData.department || !formData.job) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    if (!resumeFile) {
      addToast('Resume upload is required.', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    // Validate mobile format
    const phoneRegex = /^\+?[0-9\s\-]{7,20}$/;
    if (!phoneRegex.test(formData.mobile.trim())) {
      addToast('Please enter a valid mobile number.', 'error');
      return;
    }

    // Validate resume file type
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExtension = resumeFile.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      addToast('Only PDF, DOC, and DOCX files are allowed for resume.', 'error');
      return;
    }

    // Validate size limit (5MB)
    if (resumeFile.size > 5 * 1024 * 1024) {
      addToast('Resume size must not exceed 5MB.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('candidate_name', formData.name.trim());
      data.append('email', formData.email.trim());
      data.append('mobile_number', formData.mobile.trim());
      data.append('gender', formData.gender);
      data.append('department_id', formData.department);
      data.append('job_position', formData.job.trim());
      data.append('resume', resumeFile);
      if (formData.dob) data.append('date_of_birth', formData.dob);
      if (formData.experience) data.append('experience', formData.experience.trim());
      if (formData.currentCompany) data.append('current_company', formData.currentCompany.trim());
      if (formData.currentSalary) data.append('current_salary', formData.currentSalary.trim());
      if (formData.expectedSalary) data.append('expected_salary', formData.expectedSalary.trim());
      if (formData.noticePeriod) data.append('notice_period', formData.noticePeriod.trim());
      if (formData.skills) data.append('skills', formData.skills.trim());
      if (formData.address) data.append('address', formData.address.trim());
      data.append('status', formData.status);

      const res = await fetch('http://localhost:5000/app/candidates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: data
      });

      const resData = await res.json();
      if (resData.success) {
        addToast('Candidate profile registered successfully!', 'success');
        setShowAddModal(false);
        // Reset form
        setFormData({
          name: '', email: '', mobile: '', gender: 'Male', dob: '', department: '', job: '',
          resume: '', experience: '', currentCompany: '', currentSalary: '', expectedSalary: '',
          noticePeriod: '', skills: '', address: '', status: 'Applied'
        });
        setResumeFile(null);
        fetchCandidates();
      } else {
        addToast(resData.message || 'Failed to save candidate profile', 'error');
      }
    } catch (err) {
      addToast('Error connecting to backend server', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Candidates</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Manage and track candidates in the pipeline</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          <Plus size={16} /> Add Candidate
        </button>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search candidate name or email..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
              />
            </div>
            <select 
              value={filterJob}
              onChange={e => setFilterJob(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All Job Openings">All Job Openings</option>
              <option value="Senior React Developer">Senior React Developer</option>
              <option value="HR Executive">HR Executive</option>
              <option value="Backend Developer">Backend Developer</option>
            </select>
            <select 
              value={filterStage}
              onChange={e => setFilterStage(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All Stages">All Stages</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Interview Completed">Interview Completed</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="On Hold">On Hold</option>
              <option value="Hired">Hired</option>
            </select>
            <select 
              value={filterLocation}
              onChange={e => setFilterLocation(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All Locations">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Coimbatore">Coimbatore</option>
            </select>
          </div>
          <div>
            <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading candidates...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Candidate</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Job Title</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Stage</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Experience</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Applied On</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Rating</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidatesData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No candidates found</td>
                  </tr>
                ) : (
                  candidatesData.map((row, index) => {
                    const initials = row.candidate_name ? row.candidate_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CD';
                    const appliedDate = row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '-';
                    return (
                      <tr key={row.id} style={{ borderBottom: index === candidatesData.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{row.candidate_name}</div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>{row.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.job_position}</td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontSize: '12px', 
                            fontWeight: '600', 
                            backgroundColor: getStageColor(row.status).bg, 
                            color: getStageColor(row.status).text 
                          }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.experience || '-'}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{appliedDate}</td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          {renderStars(5)}
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><MoreVertical size={18} /></button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
            Showing {total === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button 
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: '#64748B' }}
            >
              <ChevronLeft size={16} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i + 1}
                onClick={() => setPage(i + 1)}
                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: page === i + 1 ? '#2952E3' : '#FFF', border: page === i + 1 ? 'none' : '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: page === i + 1 ? '#FFF' : '#64748B', fontSize: '13px', fontWeight: '500' }}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: '#64748B' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Add Candidate Modal (1100px Standard) */}
      {showAddModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowAddModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw', maxHeight: '90vh' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Add Candidate</h2>
                <p className="text-sm text-slate-500 mt-1">Register a new job applicant profile into recruitment pipeline.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Candidate Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Rahul Sharma" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="e.g. rahul.sharma@email.com" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number <span className="text-red-500">*</span></label>
                  <input type="tel" required value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} placeholder="e.g. +91 98765 43210" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                  <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department Applied For <span className="text-red-500">*</span></label>
                  <select required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Job Position <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.job} onChange={e => setFormData({ ...formData, job: e.target.value })} placeholder="e.g. Senior React Developer" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Resume Upload <span className="text-red-500">*</span></label>
                  <input 
                    type="file" 
                    required 
                    onChange={e => {
                      const file = e.target.files?.[0];
                      setResumeFile(file);
                      setFormData({ ...formData, resume: file ? file.name : '' });
                    }} 
                    className="w-full h-12 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white cursor-pointer" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Experience</label>
                  <input type="text" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} placeholder="e.g. 4 Years" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Company</label>
                  <input type="text" value={formData.currentCompany} onChange={e => setFormData({ ...formData, currentCompany: e.target.value })} placeholder="e.g. Acme Tech Solutions" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Salary</label>
                  <input type="text" value={formData.currentSalary} onChange={e => setFormData({ ...formData, currentSalary: e.target.value })} placeholder="e.g. ₹ 10 LPA" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Salary</label>
                  <input type="text" value={formData.expectedSalary} onChange={e => setFormData({ ...formData, expectedSalary: e.target.value })} placeholder="e.g. ₹ 15 LPA" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notice Period</label>
                  <input type="text" value={formData.noticePeriod} onChange={e => setFormData({ ...formData, noticePeriod: e.target.value })} placeholder="e.g. 30 Days" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Interview Completed">Interview Completed</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Hired">Hired</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Skills</label>
                  <input type="text" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="e.g. React.js, Node.js, JavaScript, CSS3" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                  <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Enter residential address..." style={{ height: '80px' }} className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Candidate'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
