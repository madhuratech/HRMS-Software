import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Eye, CheckCircle2, XCircle, Calendar, FileText, UserCheck, Briefcase, Mail, Phone, MapPin, AlertCircle, X, ChevronLeft, ChevronRight, Star, Send, ShieldAlert } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { useNavigate } from 'react-router-dom';
import { canEdit, checkActionPermission } from '../../lib/permissions';

export default function CandidateScreening() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter & Search & Pagination
  const [search, setSearch] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Selected Candidate for Review Panel
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Evaluation Form State
  const [evalData, setEvalData] = useState({
    skillsMatch: 85,
    experienceMatch: 'High',
    qualificationMatch: 'Met',
    overallScore: 88,
    recruiterNotes: ''
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

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${getAuthToken()}` };
      const res = await fetch(`/app/candidates?limit=100`, { headers });
      const data = await res.json();
      if (data.success && data.data && data.data.candidates) {
        setCandidates(data.data.candidates);
        setTotal(data.data.candidates.length);
      } else {
        addToast(data.message || 'Failed to fetch candidate screening data', 'error');
      }
    } catch (err) {
      addToast('Error fetching screening candidates', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchMeta = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${getAuthToken()}` };
      const res = await fetch('/app/requirements/meta/all', { headers });
      const data = await res.json();
      if (data) {
        setDepartments(data.departments || []);
      }
      const jobsRes = await fetch('/app/requirements?limit=100', { headers });
      const jobsData = await jobsRes.json();
      if (jobsData.success && jobsData.data && jobsData.data.requirements) {
        setJobs(jobsData.data.requirements);
      }
    } catch (e) {
      console.error('Error fetching meta for screening:', e);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchMeta();
  }, [fetchCandidates]);

  // Derived Candidate Statistics
  const pendingCount = candidates.filter(c => ['Applied', 'Pending', 'Under Review'].includes(c.status)).length;
  const shortlistedCount = candidates.filter(c => c.status === 'Shortlisted').length;
  const rejectedCount = candidates.filter(c => c.status === 'Rejected').length;
  const interviewCount = candidates.filter(c => ['Interview Scheduled', 'Interview', 'Selected'].includes(c.status)).length;

  // Filtered & Sorted Candidates Table
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = search === '' || 
      (c.candidate_name && c.candidate_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    const matchesJob = filterJob === '' || String(c.job_position || '').toLowerCase() === filterJob.toLowerCase();
    const matchesDept = filterDept === '' || String(c.department_id) === String(filterDept);
    const matchesStatus = filterStatus === '' || c.status === filterStatus;
    return matchesSearch && matchesJob && matchesDept && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now());
    if (sortBy === 'oldest') return new Date(a.created_at || Date.now()) - new Date(b.created_at || Date.now());
    return 0;
  });

  const paginatedCandidates = filteredCandidates.slice((page - 1) * limit, page * limit);

  // Update Candidate Status in Backend
  const handleUpdateCandidateStatus = async (candidateId, newStatus, reason = '') => {
    if (!checkActionPermission('screening', 'EDIT')) return;
    setSubmitting(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      };
      const payload = {
        status: newStatus,
        remarks: reason || evalData.recruiterNotes || `Status updated to ${newStatus}`
      };
      const res = await fetch(`/app/candidates/${candidateId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Candidate status updated to ${newStatus}`, 'success');
        fetchCandidates();
        setShowReviewModal(false);
        setShowRejectModal(false);
        setRejectionReason('');
      } else {
        addToast(data.message || 'Failed to update candidate status', 'error');
      }
    } catch (err) {
      addToast('Failed to connect to server', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShortlist = () => {
    if (!selectedCandidate) return;
    handleUpdateCandidateStatus(selectedCandidate.id, 'Shortlisted');
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    if (!rejectionReason.trim()) {
      addToast('Please provide a reason for rejection.', 'error');
      return;
    }
    handleUpdateCandidateStatus(selectedCandidate.id, 'Rejected', rejectionReason);
  };

  const handleMoveToInterview = () => {
    if (!selectedCandidate) return;
    if (selectedCandidate.status === 'Rejected') {
      addToast('Rejected candidates cannot be moved to the interview stage.', 'error');
      return;
    }
    if (selectedCandidate.status !== 'Shortlisted') {
      addToast('Candidate must be Shortlisted before moving to interview stage.', 'warning');
      return;
    }
    handleUpdateCandidateStatus(selectedCandidate.id, 'Interview Scheduled');
    navigate('/recruitment/interviews');
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Shortlisted':
        return { background: '#EFF6FF', color: '#2952E3', border: '1px solid #BFDBFE' };
      case 'Rejected':
        return { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' };
      case 'Interview Scheduled':
      case 'Interview':
        return { background: '#F5F3FF', color: '#8B5CF6', border: '1px solid #DDD6FE' };
      case 'Under Review':
        return { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' };
      default: // Applied / Pending
        return { background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' };
    }
  };

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #F1F5F9',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif', background: '#F8FAFC', paddingBottom: '32px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Candidate Screening</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Review and evaluate candidates before moving them to the interview stage.</p>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={20} color="#D97706" />
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Pending Screening</div>
          </div>
          <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700' }}>{pendingCount}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} color="#2952E3" />
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Shortlisted</div>
          </div>
          <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700' }}>{shortlistedCount}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={20} color="#EF4444" />
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Rejected</div>
          </div>
          <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700' }}>{rejectedCount}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={20} color="#8B5CF6" />
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Moved to Interview</div>
          </div>
          <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700' }}>{interviewCount}</div>
        </div>
      </div>

      {/* Main Candidate Table Container */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        
        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search candidate name or email..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '13px' }}
              />
            </div>

            <select 
              value={filterJob} 
              onChange={e => setFilterJob(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '13px', color: '#334155', outline: 'none' }}
            >
              <option value="">All Job Openings</option>
              {jobs.map(j => (
                <option key={j.id} value={j.job_title}>{j.job_title}</option>
              ))}
            </select>

            <select 
              value={filterDept} 
              onChange={e => setFilterDept(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '13px', color: '#334155', outline: 'none' }}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '13px', color: '#334155', outline: 'none' }}
            >
              <option value="">All Statuses</option>
              <option value="Applied">Applied / Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
            </select>
          </div>

          <div>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '13px', color: '#334155', outline: 'none' }}
            >
              <option value="newest">Sort by: Application Date (Newest)</option>
              <option value="oldest">Sort by: Application Date (Oldest)</option>
            </select>
          </div>
        </div>

        {/* Screening Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading screening candidates...</div>
          ) : paginatedCandidates.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No candidates found matching the screening criteria.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Candidate Name</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Applied Job</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Experience</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Skills Match</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Resume</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Applied Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Screening Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCandidates.map((c, index) => {
                  const statusStyle = getStatusBadgeStyle(c.status);
                  const appliedDate = c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recent';
                  return (
                    <tr 
                      key={c.id} 
                      onClick={() => {
                        setSelectedCandidate(c);
                        setShowReviewModal(true);
                      }}
                      style={{ borderBottom: index === paginatedCandidates.length - 1 ? 'none' : '1px solid #F8FAFC', cursor: 'pointer', transition: 'background 0.15s' }}
                      className="hover:bg-slate-50/80"
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF', color: '#2952E3', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {c.candidate_name ? c.candidate_name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{c.candidate_name}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{c.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#334155', fontWeight: '500' }}>
                        {c.job_position || 'General Applicant'}
                      </td>

                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>
                        {c.experience || '0-1 Years'}
                      </td>

                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: '#F1F5F9', overflow: 'hidden' }}>
                            <div style={{ width: '85%', height: '100%', background: '#2952E3', borderRadius: '3px' }}></div>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#2952E3' }}>85%</span>
                        </div>
                      </td>

                      <td style={{ padding: '16px 24px' }} onClick={e => e.stopPropagation()}>
                        {c.resume ? (
                          <a href={c.resume} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '500' }}>
                            <FileText size={14} /> View Resume
                          </a>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}>No Resume</span>
                        )}
                      </td>

                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748B' }}>
                        {appliedDate}
                      </td>

                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', ...statusStyle }}>
                          {c.status || 'Applied'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 24px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedCandidate(c);
                            setShowReviewModal(true);
                          }}
                          style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', color: '#1E293B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Review & Evaluate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            Showing {filteredCandidates.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, filteredCandidates.length)} of {filteredCandidates.length} entries
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button 
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} color="#64748B" />
            </button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2952E3', border: 'none', borderRadius: '6px', color: '#FFF', fontSize: '13px', fontWeight: '600' }}>
              {page}
            </button>
            <button 
              disabled={page * limit >= filteredCandidates.length}
              onClick={() => setPage(page + 1)}
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: page * limit >= filteredCandidates.length ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={16} color="#64748B" />
            </button>
          </div>
        </div>

      </div>

      {/* Detailed Candidate Screening Panel / Modal */}
      {showReviewModal && selectedCandidate && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowReviewModal(false)} />
          <div className="modal-centered-content" style={{ width: '900px', maxWidth: '95vw', maxHeight: '90vh' }}>
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Candidate Screening Evaluation</h2>
                <p className="text-sm text-slate-500 mt-1">Review candidate details, evaluation scores, and record screening decisions.</p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Profile Card Header */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 font-bold text-xl flex items-center justify-center">
                    {selectedCandidate.candidate_name ? selectedCandidate.candidate_name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{selectedCandidate.candidate_name}</h3>
                    <p className="text-sm text-slate-500">{selectedCandidate.job_position} • {selectedCandidate.experience || '0-1 Years'}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span>✉️ {selectedCandidate.email}</span>
                      <span>📞 {selectedCandidate.mobile_number}</span>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={getStatusBadgeStyle(selectedCandidate.status)}>
                  {selectedCandidate.status || 'Applied'}
                </span>
              </div>

              {/* Information & Resume Section */}
              <div className="grid grid-cols-2 gap-6">
                
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Candidate Overview</h4>
                  <div className="text-xs space-y-2 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Company:</span>
                      <span className="font-semibold">{selectedCandidate.current_company || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Salary:</span>
                      <span className="font-semibold">{selectedCandidate.current_salary || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expected Salary:</span>
                      <span className="font-semibold">{selectedCandidate.expected_salary || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Notice Period:</span>
                      <span className="font-semibold">{selectedCandidate.notice_period || 'Immediate'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Skills & Resume</h4>
                  <div className="text-xs space-y-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block mb-1">Key Skills:</span>
                      <span className="font-semibold text-slate-800">{selectedCandidate.skills || 'React, JavaScript, HTML, CSS'}</span>
                    </div>
                    <div className="pt-2">
                      {selectedCandidate.resume ? (
                        <a href={selectedCandidate.resume} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg text-xs hover:bg-blue-100 inline-flex items-center gap-2">
                          <FileText size={14} /> Download Attached Resume
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No resume attached</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Evaluation Scores Section */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-800">Recruiter Screening Evaluation</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Skills Match Score (%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={evalData.skillsMatch}
                      onChange={e => setEvalData({ ...evalData, skillsMatch: parseInt(e.target.value) || 0 })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Match</label>
                    <select 
                      value={evalData.experienceMatch}
                      onChange={e => setEvalData({ ...evalData, experienceMatch: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="High">High Match</option>
                      <option value="Medium">Medium Match</option>
                      <option value="Low">Low Match</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification Match</label>
                    <select 
                      value={evalData.qualificationMatch}
                      onChange={e => setEvalData({ ...evalData, qualificationMatch: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Exceeded">Exceeded Expectations</option>
                      <option value="Met">Met Qualifications</option>
                      <option value="Partial">Partial Match</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Recruiter Notes / Feedback</label>
                  <textarea 
                    rows={3} 
                    value={evalData.recruiterNotes}
                    onChange={e => setEvalData({ ...evalData, recruiterNotes: e.target.value })}
                    placeholder="Enter screening assessment notes and recommendations..."
                    className="w-full p-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

            </div>

            {/* Decision Buttons Footer */}
            <div className="p-6 border-t border-slate-200 flex items-center justify-between shrink-0 bg-slate-50 rounded-b-2xl">
              <button 
                type="button" 
                onClick={() => setShowReviewModal(false)}
                className="px-5 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-300 transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-3">
                
                {/* Reject Button */}
                <button
                  type="button"
                  disabled={!canEdit('screening')}
                  onClick={() => {
                    if (!checkActionPermission('screening', 'EDIT')) return;
                    setShowRejectModal(true);
                  }}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors ${canEdit('screening') ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                  <XCircle size={15} /> Reject Candidate
                </button>

                {/* Shortlist Button */}
                <button
                  type="button"
                  disabled={!canEdit('screening')}
                  onClick={() => {
                    if (!checkActionPermission('screening', 'EDIT')) return;
                    handleShortlist();
                  }}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors ${canEdit('screening') ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                  <CheckCircle2 size={15} /> Shortlist Candidate
                </button>

                {/* Move to Interview Button */}
                <button
                  type="button"
                  disabled={!canEdit('screening')}
                  onClick={() => {
                    if (!checkActionPermission('screening', 'EDIT')) return;
                    handleMoveToInterview();
                  }}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors ${canEdit('screening') ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                  <UserCheck size={15} /> Move to Interview
                </button>

              </div>
            </div>

          </div>
        </>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && selectedCandidate && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowRejectModal(false)} />
          <div className="modal-centered-content" style={{ width: '450px' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Reject Candidate</h3>
              <button onClick={() => setShowRejectModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Please enter a reason for rejecting <strong className="text-slate-800">{selectedCandidate.candidate_name}</strong>.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={3} 
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. Lack of required technical experience in React..."
                  className="w-full p-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg text-xs hover:bg-red-700"
                >
                  {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}
