import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Plus, MoreVertical, Star, ChevronLeft, ChevronRight, X, Eye, Edit3, Trash2, Calendar, FileText, CheckCircle2, UserCheck, Briefcase, Mail, Phone, MapPin, DollarSign, Clock, Send, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { useToast } from '../ui/Toast';

export default function Candidates() {
  const { addToast } = useToast();
  const [candidatesData, setCandidatesData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Modals & Menu States
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

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
    name: '', email: '', mobile: '', gender: 'Male', dob: '', department: '', job: '',
    resume: '', experience: '', currentCompany: '', currentSalary: '', expectedSalary: '',
    noticePeriod: '', skills: '', address: '', status: 'Applied'
  });

  // Edit Candidate Form Data
  const [editFormData, setEditFormData] = useState({});

  // Schedule Interview Form Data
  const [interviewData, setInterviewData] = useState({
    interview_date: '', interview_time: '10:00', round_type: 'Technical Round 1',
    interviewer_name: 'Dhilipan', location: 'Google Meet / Online'
  });

  // Offer Letter Form Data
  const [offerData, setOfferData] = useState({
    offered_salary: '', joining_date: '', designation: '', department_id: ''
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeMenuId && !e.target.closest('.candidate-action-menu')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  // Fetch departments metadata
  const fetchMeta = async () => {
    try {
      const res = await fetch('/app/requirements/meta/all', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
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
      let url = `/app/candidates?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (filterStage && filterStage !== 'All Stages') url += `&status=${encodeURIComponent(filterStage)}`;
      if (filterJob && filterJob !== 'All Job Openings') url += `&search=${encodeURIComponent(filterJob)}`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
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

  useEffect(() => { fetchMeta(); }, []);
  useEffect(() => { fetchPageOneAndReload(); }, [search, filterJob, filterStage, filterLocation]);
  useEffect(() => { fetchCandidates(); }, [page, fetchCandidates]);

  const fetchPageOneAndReload = () => {
    if (page === 1) fetchCandidates();
    else setPage(1);
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Applied': return { bg: '#EFF6FF', text: '#2952E3' };
      case 'Shortlisted': return { bg: '#F0F9FF', text: '#0284C7' };
      case 'Interview Scheduled': return { bg: '#FFFBEB', text: '#D97706' };
      case 'Interview Completed': return { bg: '#FEF3C7', text: '#B45309' };
      case 'Selected': return { bg: '#ECFDF5', text: '#059669' };
      case 'Rejected': return { bg: '#FEF2F2', text: '#DC2626' };
      case 'On Hold': return { bg: '#F1F5F9', text: '#475569' };
      case 'Hired': return { bg: '#ECFDF5', text: '#10B981' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const renderStars = (rating) => (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center', justifyContent: 'center' }}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} color={i < rating ? '#F59E0B' : '#E2E8F0'} fill={i < rating ? '#F59E0B' : 'none'} />
      ))}
    </div>
  );

  // Status Action Handler
  const handleUpdateStatus = async (candidateId, newStatus) => {
    setActiveMenuId(null);
    try {
      const res = await fetch(`/app/candidates/${candidateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ status: newStatus, is_update: true })
      });
      const resData = await res.json();
      if (resData.success) {
        addToast(`Candidate stage moved to "${newStatus}"`, 'success');
        fetchCandidates();
      } else {
        addToast(resData.message || 'Failed to update candidate stage', 'error');
      }
    } catch (err) {
      addToast('Error updating candidate stage', 'error');
    }
  };

  // Convert Candidate to Onboarding / Hire Handler
  const handleHireCandidate = async (candidate) => {
    setActiveMenuId(null);
    try {
      // 1. Update candidate stage to Hired
      await fetch(`/app/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ status: 'Hired', is_update: true })
      });

      // 2. Add to New Joiners / Onboarding
      await fetch('/app/joiners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({
          employee_name: candidate.candidate_name,
          department_id: candidate.department_id || 3,
          designation: candidate.job_position || 'Developer',
          joining_date: new Date().toISOString().split('T')[0],
          reporting_manager: 'HR Manager',
          checklist: 'HR & Admin Checklist',
          status: 'In Progress'
        })
      });

      addToast(`Candidate ${candidate.candidate_name} hired and moved to Onboarding!`, 'success');
      fetchCandidates();
    } catch (err) {
      addToast('Error adding candidate to Onboarding', 'error');
    }
  };

  // Delete Candidate Handler
  const handleDeleteCandidate = async (candidateId, candidateName) => {
    setActiveMenuId(null);
    if (!window.confirm(`Are you sure you want to delete candidate "${candidateName}"?`)) return;

    try {
      const res = await fetch(`/app/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const resData = await res.json();
      if (resData.success) {
        addToast(`Candidate "${candidateName}" deleted successfully`, 'success');
        fetchCandidates();
      } else {
        addToast(resData.message || 'Failed to delete candidate', 'error');
      }
    } catch (err) {
      addToast('Error deleting candidate', 'error');
    }
  };

  // Submit Candidate Edit Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/app/candidates/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(editFormData)
      });
      const resData = await res.json();
      if (resData.success) {
        addToast('Candidate details updated successfully!', 'success');
        setShowEditModal(false);
        fetchCandidates();
      } else {
        addToast(resData.message || 'Failed to update candidate', 'error');
      }
    } catch (err) {
      addToast('Error updating candidate', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Schedule Interview Form
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !interviewData.interview_date) {
      addToast('Please select a valid interview date', 'error');
      return;
    }

    try {
      const payload = {
        candidate_id: selectedCandidate.id,
        interviewer_id: 1,
        interview_round: interviewData.round_type || 'Technical Round',
        interview_mode: interviewData.interview_mode || 'Online',
        interview_date: interviewData.interview_date,
        interview_time: interviewData.interview_time ? (interviewData.interview_time.length === 5 ? `${interviewData.interview_time}:00` : interviewData.interview_time) : '11:20:00',
        location: interviewData.location || 'Online / Google Meet',
        meeting_link: interviewData.meeting_link || 'https://meet.google.com/interview',
        status: 'Scheduled'
      };

      const res = await fetch('/app/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        addToast(`Interview scheduled for ${selectedCandidate?.candidate_name} on ${interviewData.interview_date} and added to Interview Schedule!`, 'success');
        setShowScheduleModal(false);
        await handleUpdateStatus(selectedCandidate?.id, 'Interview Scheduled');
      } else {
        addToast(resData.message || 'Failed to schedule interview', 'error');
      }
    } catch (err) {
      addToast('Error saving interview schedule', 'error');
    }
  };

  // Submit Send Offer Letter Form
  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    addToast(`Offer letter issued for ${selectedCandidate?.candidate_name}!`, 'success');
    setShowOfferModal(false);
    handleUpdateStatus(selectedCandidate?.id, 'Selected');
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

      const res = await fetch('/app/candidates', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        body: data
      });

      const resData = await res.json();
      if (resData.success) {
        addToast('Candidate profile registered successfully!', 'success');
        setShowAddModal(false);
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

      <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: 0, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}>
        
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
              <option value="Full Stack Developer">Full Stack Developer</option>
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

        {/* Table Container */}
        <div style={{ overflowX: 'auto', minHeight: '380px', paddingBottom: '40px' }}>
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
                    const isMenuOpen = activeMenuId === row.id;

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
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.experience ? `${row.experience} Yrs` : '-'}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{appliedDate}</td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          {renderStars(5)}
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center', position: 'relative' }} className="candidate-action-menu">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : row.id);
                            }}
                            style={{
                              background: isMenuOpen ? '#F1F5F9' : 'none',
                              border: 'none', borderRadius: '6px', padding: '6px',
                              cursor: 'pointer', color: '#64748B', transition: 'all 0.15s ease'
                            }}
                            title="Actions"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* Action Dropdown Menu - Smart Positioned */}
                          {isMenuOpen && (
                            <div style={{
                              position: 'absolute', right: '24px',
                              ...(index === 0 ? { top: '44px', bottom: 'auto' } : { bottom: '44px', top: 'auto' }),
                              zIndex: 1000,
                              background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0',
                              boxShadow: '0 12px 28px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.05)',
                              width: '230px', padding: '8px', textAlign: 'left', maxHeight: '340px', overflowY: 'auto'
                            }}>
                              <div style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>
                                Candidate Actions
                              </div>

                              <button
                                onClick={() => { setSelectedCandidate(row); setShowViewModal(true); setActiveMenuId(null); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', fontSize: '13px', color: '#334155', fontWeight: '500', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                className="hover:bg-slate-50"
                              >
                                <Eye size={15} color="#2563EB" /> View Profile & Details
                              </button>

                              <button
                                onClick={() => { setSelectedCandidate(row); setEditFormData(row); setShowEditModal(true); setActiveMenuId(null); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', fontSize: '13px', color: '#334155', fontWeight: '500', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                className="hover:bg-slate-50"
                              >
                                <Edit3 size={15} color="#8B5CF6" /> Edit Candidate Info
                              </button>

                              <button
                                onClick={() => { setSelectedCandidate(row); setShowScheduleModal(true); setActiveMenuId(null); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', fontSize: '13px', color: '#334155', fontWeight: '500', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                className="hover:bg-slate-50"
                              >
                                <Calendar size={15} color="#D97706" /> Schedule Interview
                              </button>

                              <button
                                onClick={() => { setSelectedCandidate(row); setShowOfferModal(true); setActiveMenuId(null); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', fontSize: '13px', color: '#334155', fontWeight: '500', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                className="hover:bg-slate-50"
                              >
                                <Send size={15} color="#059669" /> Issue Offer Letter
                              </button>

                              <button
                                onClick={() => handleHireCandidate(row)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', fontSize: '13px', color: '#059669', fontWeight: '600', background: '#ECFDF5', border: 'none', borderRadius: '6px', cursor: 'pointer', margin: '4px 0' }}
                              >
                                <UserCheck size={15} color="#059669" /> Hire & Move to Onboarding
                              </button>

                              <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

                              <div style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>
                                Move Stage
                              </div>

                              {['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Hired', 'On Hold', 'Rejected'].map(stg => (
                                <button
                                  key={stg}
                                  onClick={() => handleUpdateStatus(row.id, stg)}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                    padding: '6px 10px', fontSize: '12px', color: row.status === stg ? '#2563EB' : '#475569',
                                    fontWeight: row.status === stg ? '700' : '500',
                                    background: row.status === stg ? '#EFF6FF' : 'none', border: 'none', borderRadius: '6px', cursor: 'pointer'
                                  }}
                                  className="hover:bg-slate-50"
                                >
                                  <CheckCircle2 size={13} color={row.status === stg ? '#2563EB' : '#94A3B8'} /> {stg}
                                </button>
                              ))}

                              <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

                              <button
                                onClick={() => handleDeleteCandidate(row.id, row.candidate_name)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                  padding: '8px 10px', fontSize: '13px', color: '#EF4444', fontWeight: '500',
                                  background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer'
                                }}
                                className="hover:bg-red-50"
                              >
                                <Trash2 size={15} color="#EF4444" /> Delete Candidate
                              </button>
                            </div>
                          )}
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

      {/* Candidate Details Modal */}
      {showViewModal && selectedCandidate && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowViewModal(false)} />
          <div className="modal-centered-content" style={{ width: '700px', maxWidth: '90vw' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>
                  {selectedCandidate.candidate_name ? selectedCandidate.candidate_name.substring(0, 2).toUpperCase() : 'CD'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0A1629]">{selectedCandidate.candidate_name}</h2>
                  <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: getStageColor(selectedCandidate.status).bg, color: getStageColor(selectedCandidate.status).text }}>
                    {selectedCandidate.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: '75vh' }}>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">JOB POSITION</span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5"><Briefcase size={14} color="#2563EB" /> {selectedCandidate.job_position}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">EXPERIENCE</span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5"><Clock size={14} color="#2563EB" /> {selectedCandidate.experience ? `${selectedCandidate.experience} Years` : 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">EMAIL ADDRESS</span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5"><Mail size={14} color="#2563EB" /> {selectedCandidate.email}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">MOBILE NUMBER</span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5"><Phone size={14} color="#2563EB" /> {selectedCandidate.mobile_number || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">CURRENT COMPANY</span>
                  <span className="text-sm font-medium text-slate-800 mt-1 block">{selectedCandidate.current_company || '-'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">NOTICE PERIOD</span>
                  <span className="text-sm font-medium text-slate-800 mt-1 block">{selectedCandidate.notice_period || '-'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">CURRENT SALARY</span>
                  <span className="text-sm font-medium text-slate-800 mt-1 block">{selectedCandidate.current_salary || '-'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">EXPECTED SALARY</span>
                  <span className="text-sm font-medium text-slate-800 mt-1 block">{selectedCandidate.expected_salary || '-'}</span>
                </div>
              </div>

              {selectedCandidate.skills && (
                <div>
                  <span className="text-xs text-slate-500 font-semibold block mb-1.5">SKILLS & COMPETENCIES</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.skills.split(',').map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCandidate.resume && (
                <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block">ATTACHED RESUME</span>
                    <span className="text-sm font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                      <FileText size={15} color="#2563EB" /> Resume Document
                    </span>
                  </div>
                  <a
                    href={selectedCandidate.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Download size={14} /> Download Resume
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => handleDeleteCandidate(selectedCandidate.id, selectedCandidate.candidate_name)}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete Candidate
              </button>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Candidate Modal */}
      {showEditModal && selectedCandidate && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowEditModal(false)} />
          <div className="modal-centered-content" style={{ width: '800px', maxWidth: '90vw' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Edit Candidate Profile</h2>
                <p className="text-sm text-slate-500 mt-1">Update information for {selectedCandidate.candidate_name}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: '75vh' }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Name</label>
                  <input type="text" value={editFormData.candidate_name || ''} onChange={e => setEditFormData({ ...editFormData, candidate_name: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input type="email" value={editFormData.email || ''} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input type="text" value={editFormData.mobile_number || ''} onChange={e => setEditFormData({ ...editFormData, mobile_number: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Position</label>
                  <input type="text" value={editFormData.job_position || ''} onChange={e => setEditFormData({ ...editFormData, job_position: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience</label>
                  <input type="text" value={editFormData.experience || ''} onChange={e => setEditFormData({ ...editFormData, experience: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Period</label>
                  <input type="text" value={editFormData.notice_period || ''} onChange={e => setEditFormData({ ...editFormData, notice_period: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 h-11 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-7 h-11 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && selectedCandidate && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowScheduleModal(false)} />
          <div className="modal-centered-content" style={{ width: '550px', maxWidth: '90vw' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0A1629]">Schedule Interview</h2>
                <p className="text-xs text-slate-500 mt-0.5">Setup interview round for {selectedCandidate.candidate_name}</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Date *</label>
                <input type="date" required value={interviewData.interview_date} onChange={e => setInterviewData({ ...interviewData, interview_date: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time *</label>
                  <input type="time" required value={interviewData.interview_time} onChange={e => setInterviewData({ ...interviewData, interview_time: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Round Type *</label>
                  <select value={interviewData.round_type || 'Technical Round'} onChange={e => setInterviewData({ ...interviewData, round_type: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white">
                    <option value="Technical Round">Technical Round</option>
                    <option value="HR Round">HR Round</option>
                    <option value="Manager Round">Manager Round</option>
                    <option value="Final Round">Final Round</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Mode *</label>
                  <select value={interviewData.interview_mode || 'Online'} onChange={e => setInterviewData({ ...interviewData, interview_mode: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white">
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Telephonic">Telephonic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Meeting Link</label>
                  <input type="text" placeholder="e.g. Google Meet / Room 302" value={interviewData.location || ''} onChange={e => setInterviewData({ ...interviewData, location: e.target.value, meeting_link: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-6 h-11 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-6 h-11 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md">Confirm Schedule</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Offer Letter Modal */}
      {showOfferModal && selectedCandidate && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowOfferModal(false)} />
          <div className="modal-centered-content" style={{ width: '550px', maxWidth: '90vw' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0A1629]">Issue Offer Letter</h2>
                <p className="text-xs text-slate-500 mt-0.5">Generate formal offer for {selectedCandidate.candidate_name}</p>
              </div>
              <button onClick={() => setShowOfferModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleOfferSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Offered Designation</label>
                <input type="text" defaultValue={selectedCandidate.job_position} onChange={e => setOfferData({ ...offerData, designation: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Offered Salary (CTC)</label>
                <input type="text" placeholder="e.g. ₹ 12,00,000 Per Annum" onChange={e => setOfferData({ ...offerData, offered_salary: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Joining Date</label>
                <input type="date" required onChange={e => setOfferData({ ...offerData, joining_date: e.target.value })} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <button type="button" onClick={() => setShowOfferModal(false)} className="px-6 h-11 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-6 h-11 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-md">Issue Offer Letter</button>
              </div>
            </form>
          </div>
        </>
      )}

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
