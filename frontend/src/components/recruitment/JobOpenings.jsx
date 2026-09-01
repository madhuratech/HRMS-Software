import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight, X, 
  AlertTriangle, Users, Globe, ExternalLink, CheckCircle2, AlertCircle, 
  RefreshCw, Linkedin, Copy, Check, Settings, Key, ShieldCheck, Zap, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { canCreate, canEdit, canDelete, checkActionPermission } from '../../lib/permissions';

export default function JobOpenings() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    department: '',
    designation: '',
    type: 'Full Time',
    location: '',
    vacancies: '',
    experienceFrom: '0',
    experienceTo: '5',
    salaryFrom: '',
    salaryTo: '',
    hiringManager: '',
    requestedBy: '',
    openingDate: '',
    closingDate: '',
    description: '',
    skills: '',
    status: 'Open',
    priority: 'Medium',
    education: '',
    responsibilities: '',
    requirements: '',
    remarks: '',
    branch: '',
    company: ''
  });

  const [openings, setOpenings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [meta, setMeta] = useState({ departments: [], designations: [], branches: [], employees: [], companies: [] });

  // Modal States
  const [editingJobId, setEditingJobId] = useState(null);
  const [selectedJobForLinks, setSelectedJobForLinks] = useState(null);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [copiedLinkType, setCopiedLinkType] = useState(null);
  const [deleteConfirmJob, setDeleteConfirmJob] = useState(null);
  const [channelStatuses, setChannelStatuses] = useState({});
  const [publishSummary, setPublishSummary] = useState(null);
  const [isPublishingId, setIsPublishingId] = useState(null);
  const [selectedErrorDetails, setSelectedErrorDetails] = useState(null);

  // LinkedIn Settings & OAuth Modal
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInConfig, setLinkedInConfig] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [orgIdInput, setOrgIdInput] = useState('');
  const [isSavingToken, setIsSavingToken] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

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

  const fetchMeta = async () => {
    try {
      const res = await fetch('/app/requirements/meta/all', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = await res.json();
      if (data && data.departments) {
        setMeta(data);
      }
    } catch (e) {
      console.error('Error fetching metadata:', e);
    }
  };

  const fetchLinkedInStatus = async () => {
    try {
      const res = await fetch('/app/auth/linkedin/status');
      const data = await res.json();
      if (data.success) {
        setLinkedInConfig(data.data);
        if (data.data.orgId) setOrgIdInput(data.data.orgId);
      }
    } catch (e) {}
  };

  const fetchRequirements = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const query = new URLSearchParams({
        search,
        page,
        limit
      });
      if (selectedDept) query.append('department_id', selectedDept);
      if (selectedStatus) query.append('status', selectedStatus);

      const res = await fetch(`/app/requirements?${query}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const resData = await res.json();
      if (resData.success) {
        setOpenings(resData.data.requirements || []);
        setTotal(resData.data.total || 0);
      } else {
        setErrorMsg(resData.message || 'Failed to fetch requirements');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server connection error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchLinkedInStatus();
  }, []);

  useEffect(() => {
    fetchRequirements();
  }, [search, selectedDept, selectedStatus, page]);

  useEffect(() => {
    if (openings && openings.length > 0) {
      openings.forEach(op => {
        fetchChannelsForJob(op.id);
      });
    }
  }, [openings]);

  const resetForm = () => {
    setEditingJobId(null);
    setFormData({
      title: '', code: '', department: '', designation: '', type: 'Full Time', location: '',
      vacancies: '', experienceFrom: '0', experienceTo: '5', salaryFrom: '', salaryTo: '',
      hiringManager: '', requestedBy: '', openingDate: '', closingDate: '', description: '',
      skills: '', status: 'Open', priority: 'Medium', education: '', responsibilities: '',
      requirements: '', remarks: '', branch: '', company: ''
    });
  };

  const handleEditClick = (job) => {
    if (!checkActionPermission('job_openings', 'EDIT')) return;
    setEditingJobId(job.id);
    setFormData({
      title: job.job_title || '',
      code: job.requirement_code || '',
      department: job.department_id || '',
      designation: job.designation_id || '',
      type: job.employment_type || 'Full Time',
      location: job.location || '',
      vacancies: job.vacancies || '',
      experienceFrom: job.experience_from || '0',
      experienceTo: job.experience_to || '5',
      salaryFrom: job.salary_from || '',
      salaryTo: job.salary_to || '',
      hiringManager: job.hiring_manager || '',
      requestedBy: job.requested_by || '',
      openingDate: job.opening_date ? String(job.opening_date).split('T')[0] : '',
      closingDate: job.closing_date ? String(job.closing_date).split('T')[0] : '',
      description: job.job_description || '',
      skills: job.skills || '',
      status: job.status || 'Published',
      priority: job.priority || 'Medium',
      education: job.education || '',
      responsibilities: job.responsibilities || '',
      requirements: job.requirements || '',
      remarks: job.remarks || '',
      branch: job.branch_id || '',
      company: job.company_id || ''
    });
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingJobId) {
      if (!checkActionPermission('job_openings', 'EDIT')) return;
    } else {
      if (!checkActionPermission('job_openings', 'CREATE')) return;
    }

    if (!formData.title || !formData.department || !formData.designation) {
      alert('Please fill in required fields.');
      return;
    }
    setErrorMsg(null);

    const payload = {
      job_title: formData.title,
      department_id: parseInt(formData.department),
      designation_id: parseInt(formData.designation),
      employment_type: formData.type,
      vacancies: parseInt(formData.vacancies),
      priority: formData.priority,
      experience_from: parseInt(formData.experienceFrom) || 0,
      experience_to: parseInt(formData.experienceTo) || 0,
      salary_from: formData.salaryFrom ? parseFloat(formData.salaryFrom) : null,
      salary_to: formData.salaryTo ? parseFloat(formData.salaryTo) : null,
      location: formData.location,
      hiring_manager: formData.hiringManager ? parseInt(formData.hiringManager) : null,
      requested_by: formData.requestedBy ? parseInt(formData.requestedBy) : null,
      opening_date: formData.openingDate,
      closing_date: formData.closingDate,
      job_description: formData.description,
      skills: formData.skills,
      status: formData.status,
      education: formData.education || null,
      responsibilities: formData.responsibilities || null,
      requirements: formData.requirements || null,
      remarks: formData.remarks || null,
      company_id: formData.company ? parseInt(formData.company) : null,
      branch_id: formData.branch ? parseInt(formData.branch) : null
    };

    try {
      const url = editingJobId ? `/app/requirements/${editingJobId}` : '/app/requirements';
      const method = editingJobId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(editingJobId ? 'Job opening updated successfully!' : 'Job opening created successfully!');
        fetchRequirements();
        resetForm();
        setShowAddModal(false);
      } else {
        alert(data.message || 'Validation failed');
      }
    } catch (err) {
      alert(err.message || 'Failed to submit requirement');
    }
  };

  const handlePublishJob = async (jobId) => {
    if (!checkActionPermission('job_openings', 'EDIT')) return;
    setIsPublishingId(jobId);
    try {
      const res = await fetch(`/app/requirements/${jobId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || 'Unable to publish job. Please try again.');
        return;
      }

      const data = await res.json();
      if (data.success) {
        // Refresh from server only after receiving successful response
        await fetchRequirements();
        await fetchChannelsForJob(jobId);
        
        const currentJob = openings.find(o => o.id === jobId);
        setPublishSummary({
          jobId,
          job: currentJob,
          channels: data.channels
        });
      } else {
        alert(data.message || 'Unable to publish job. Please try again.');
      }
    } catch (err) {
      console.error('Publish network error:', err);
      alert('Unable to publish job. Please check your internet connection and try again.');
    } finally {
      setIsPublishingId(null);
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!checkActionPermission('job_openings', 'EDIT')) return;
    try {
      const res = await fetch(`/app/requirements/${jobId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert('Job status updated to Closed.');
        fetchRequirements();
      } else {
        alert(data.message || 'Failed to close job');
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  const getSlug = (title, id) => {
    const clean = String(title || 'job').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    return `${clean}-${id}`;
  };

  const getTrackedUrl = (job, source) => {
    if (!job) return '';
    const slug = getSlug(job.job_title, job.id);
    const baseUrl = `https://madhuratech.com/career/job/${slug}`;
    if (!source || source === 'CAREER_PAGE') return baseUrl;
    return `${baseUrl}?source=${source.toLowerCase()}`;
  };

  const handleDeleteJob = async (jobId) => {
    if (!checkActionPermission('job_openings', 'DELETE')) return;
    try {
      const res = await fetch(`/app/requirements/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert('Job opening deleted successfully and removed from active public channels.');
        setDeleteConfirmJob(null);
        fetchRequirements();
      } else {
        alert(data.message || 'Failed to delete job');
      }
    } catch (err) {
      alert('Error deleting job opening');
    }
  };

  const fetchChannelsForJob = async (jobId) => {
    try {
      const res = await fetch(`/app/requirements/${jobId}/publishing-channels`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setChannelStatuses(prev => ({ ...prev, [jobId]: data.channels }));
      }
    } catch (e) {}
  };

  const handleSaveLinkedInToken = async (e) => {
    e.preventDefault();
    setIsSavingToken(true);
    try {
      const res = await fetch('/app/auth/linkedin/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: tokenInput, orgId: orgIdInput })
      });
      const data = await res.json();
      if (data.success) {
        alert('LinkedIn credentials saved successfully!');
        fetchLinkedInStatus();
        setTokenInput('');
        setShowLinkedInModal(false);
      } else {
        alert(data.message || 'Failed to save credentials');
      }
    } catch (err) {
      alert('Error connecting to backend');
    } finally {
      setIsSavingToken(false);
    }
  };

  const copyToClipboard = (text, type) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedLinkType(type);
    setTimeout(() => setCopiedLinkType(null), 2200);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Published':
        return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
      case 'Open':
        return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' };
      case 'Draft':
        return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
      case 'Closed':
        return { bg: '#F1F5F9', color: '#64748B', border: '#CBD5E1' };
      case 'On Hold':
        return { bg: '#FAF5FF', color: '#9333EA', border: '#E9D5FF' };
      case 'Cancelled':
      case 'Rejected':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
      case 'Approved':
        return { bg: '#ECFDF5', color: '#10B981', border: '#A7F3D0' };
      default:
        return { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' };
    }
  };

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", -apple-system, sans-serif' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#0F172A' }}>Job Openings</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Manage requisitions and automatically publish organic posts to Madhura Technologies LinkedIn Company Page</p>
        </div>
        
        {/* Header Actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          
          {/* LinkedIn Integration Status & Settings button */}
          <button
            onClick={() => {
              fetchLinkedInStatus();
              setShowLinkedInModal(true);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#0F172A',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            title="Configure LinkedIn Integration & permissions"
          >
            <Linkedin size={17} color="#0A66C2" />
            <span>LinkedIn Integration</span>
            <span style={{ 
              display: 'inline-block',
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: (linkedInConfig?.hasToken) ? '#10B981' : '#F59E0B',
              boxShadow: (linkedInConfig?.hasToken) ? '0 0 6px rgba(16, 185, 129, 0.6)' : '0 0 6px rgba(245, 158, 11, 0.6)'
            }} />
          </button>

          {/* Create Opening */}
          <button
            disabled={!canCreate('job_openings')}
            onClick={() => {
              if (!checkActionPermission('job_openings', 'CREATE')) return;
              setShowAddModal(true);
            }}
            style={{ 
              padding: '10px 18px', 
              borderRadius: '10px', 
              border: 'none', 
              background: canCreate('job_openings') ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : '#94A3B8', 
              color: '#FFF', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: canCreate('job_openings') ? 'pointer' : 'not-allowed', 
              fontSize: '14px', 
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Plus size={16} /> Create Opening
          </button>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search job title..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
              />
            </div>
            <select 
              value={selectedDept} 
              onChange={e => setSelectedDept(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">All Departments</option>
              { (meta.departments || []).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select 
              value={selectedStatus} 
              onChange={e => setSelectedStatus(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="Published">Published</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading openings...</div>
        ) : errorMsg ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        ) : openings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No job openings found.</div>
        ) : (
          /* Table */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Job ID</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Job Title</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Department</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Location</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Type</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Vacancies</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Publishing Channels</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Overall Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {openings.map((row, index) => {
                  const statusStyle = getStatusBadgeStyle(row.status);
                  const channels = channelStatuses[row.id] || [];
                  const careerPageCh = channels.find(c => c.channel === 'CAREER_PAGE');
                  const linkedInCh = channels.find(c => c.channel === 'LINKEDIN');
                  const indeedCh = channels.find(c => c.channel === 'INDEED');

                  const isCpPublished = careerPageCh?.status === 'PUBLISHED' || row.status === 'Published';
                  const cpUrl = careerPageCh?.external_url || getTrackedUrl(row, 'CAREER_PAGE');
                  
                  const liStatus = (linkedInCh?.status || '').toUpperCase();
                  const liUrl = linkedInCh?.external_url;

                  const indeedStatus = indeedCh?.status || 'NOT_CONNECTED';
                  const indeedUrl = indeedCh?.external_url;

                  return (
                    <tr key={row.id} style={{ borderBottom: index === openings.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#2563EB', whiteSpace: 'nowrap' }}>{row.requirement_code}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#1E293B', whiteSpace: 'nowrap' }}>{row.job_title}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.department_name}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.location}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.employment_type}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#1E293B', whiteSpace: 'nowrap', textAlign: 'center' }}>{row.vacancies}</td>
                      
                      {/* Separate Publishing Channel Badges */}
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          
                          {/* 1. Website Channel Status */}
                          {isCpPublished ? (
                            <a
                              href={cpUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Website (Career Page): Published & Live"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                background: '#ECFDF5',
                                color: '#059669',
                                border: '1px solid #A7F3D0',
                                cursor: 'pointer'
                              }}
                            >
                              <Globe size={12} /> Website: Published <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span
                              title="Website: Draft (Not Published)"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: '#F1F5F9',
                                color: '#94A3B8',
                                border: '1px solid #E2E8F0'
                              }}
                            >
                              <Globe size={12} /> Website: Draft
                            </span>
                          )}

                          {/* 2. LinkedIn Company Page Post Status (PUBLISHED, PUBLISHING, FAILED, READY, AUTH_REQUIRED) */}
                          {liStatus === 'PUBLISHED' ? (
                            <a
                              href={liUrl || `https://www.linkedin.com/company/${linkedInConfig?.orgId || '109901015'}/`}
                              target="_blank"
                              rel="noreferrer"
                              title="LinkedIn: Published ✓ (Click to view post on company feed)"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                background: '#ECFDF5',
                                color: '#059669',
                                border: '1px solid #A7F3D0',
                                cursor: 'pointer'
                              }}
                            >
                              <Linkedin size={12} /> LinkedIn: Published ✓ <ExternalLink size={10} />
                            </a>
                          ) : liStatus === 'PUBLISHING' || isPublishingId === row.id ? (
                            <span
                              title="LinkedIn: Publishing in progress..."
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE'
                              }}
                            >
                              <RefreshCw size={11} className="animate-spin" /> LinkedIn: Publishing...
                            </span>
                          ) : liStatus === 'FAILED' ? (
                            <button
                              onClick={() => setSelectedErrorDetails({
                                channel: 'LinkedIn',
                                message: linkedInCh?.error_message || 'LinkedIn Company Page post failed.'
                              })}
                              title={`LinkedIn: Failed - Click to view error details:\n${linkedInCh?.error_message || ''}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                border: '1px solid #FECACA',
                                cursor: 'pointer'
                              }}
                            >
                              <Linkedin size={12} /> LinkedIn: Failed <Info size={11} />
                            </button>
                          ) : (!linkedInConfig?.hasToken) ? (
                            <button
                              onClick={() => {
                                fetchLinkedInStatus();
                                setShowLinkedInModal(true);
                              }}
                              title="LinkedIn organization posting permission (w_organization_social) is not authorized. Click to connect."
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: '#FFFBEB',
                                color: '#D97706',
                                border: '1px solid #FDE68A',
                                cursor: 'pointer'
                              }}
                            >
                              <Linkedin size={12} /> LinkedIn: Authorization Required
                            </button>
                          ) : (
                            <span
                              title="LinkedIn: Ready to automatically publish on Madhura Technologies company feed when Publish is clicked"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: '#EFF6FF',
                                color: '#0A66C2',
                                border: '1px solid #BFDBFE'
                              }}
                            >
                              <Linkedin size={12} /> LinkedIn: Ready
                            </span>
                          )}

                          {/* 3. Indeed Channel Status */}
                          {indeedStatus === 'PUBLISHED' && indeedUrl ? (
                            <a
                              href={indeedUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Indeed: Published"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                background: '#ECFDF5',
                                color: '#059669',
                                border: '1px solid #A7F3D0',
                                cursor: 'pointer'
                              }}
                            >
                              Indeed: Published <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span
                              title="Indeed API integration is not connected."
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: '#F1F5F9',
                                color: '#64748B',
                                border: '1px solid #CBD5E1',
                                cursor: 'help'
                              }}
                            >
                              Indeed: Not Connected
                            </span>
                          )}

                        </div>
                      </td>

                      {/* Overall Requisition Status */}
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          backgroundColor: statusStyle.bg, 
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`
                        }}>
                          {row.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          
                          {/* Edit Job Button */}
                          <button 
                            disabled={!canEdit('job_openings')}
                            onClick={() => handleEditClick(row)}
                            title="Edit Job Opening"
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#334155', fontSize: '12px', fontWeight: '500', cursor: canEdit('job_openings') ? 'pointer' : 'not-allowed' }}
                          >
                            Edit
                          </button>

                          {/* View Candidates */}
                          <button 
                            onClick={() => navigate(`/recruitment/candidates?job_title=${encodeURIComponent(row.job_title)}`)}
                            title="View Applicants"
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFF', color: '#2563EB', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Users size={14} /> Candidates
                          </button>

                          {/* Publish Job Button (Single Unified Backend Endpoint) */}
                          {row.status !== 'Published' && (
                            <button 
                              disabled={!canEdit('job_openings') || isPublishingId === row.id}
                              onClick={() => handlePublishJob(row.id)}
                              style={{ 
                                padding: '6px 10px', 
                                borderRadius: '6px', 
                                border: 'none', 
                                background: canEdit('job_openings') ? '#10B981' : '#94A3B8', 
                                color: '#FFF', 
                                fontSize: '12px', 
                                fontWeight: '600', 
                                cursor: canEdit('job_openings') ? 'pointer' : 'not-allowed',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {isPublishingId === row.id ? 'Publishing...' : 'Publish Job'}
                            </button>
                          )}

                          {/* Tracking Links Button */}
                          <button 
                            onClick={() => {
                              setSelectedJobForLinks(row);
                              setShowLinksModal(true);
                            }}
                            title="Application Tracking Links"
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#334155', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                          >
                            Copy Links
                          </button>

                          {/* Close Job Button */}
                          {row.status !== 'Closed' && (
                            <button 
                              disabled={!canEdit('job_openings')}
                              onClick={() => handleCloseJob(row.id)}
                              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontSize: '12px', fontWeight: '500', cursor: canEdit('job_openings') ? 'pointer' : 'not-allowed' }}
                            >
                              Close
                            </button>
                          )}

                          {/* Delete Job Button */}
                          <button 
                            disabled={!canDelete('job_openings')}
                            onClick={() => setDeleteConfirmJob(row)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontSize: '12px', fontWeight: '500', cursor: canDelete('job_openings') ? 'pointer' : 'not-allowed' }}
                          >
                            Delete
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button 
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: '#64748B', opacity: page <= 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#FFF', fontSize: '13px', fontWeight: '500' }}>
              {page}
            </button>
            <button 
              disabled={page * limit >= total}
              onClick={() => setPage(page + 1)}
              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: page * limit >= total ? 'not-allowed' : 'pointer', color: '#64748B', opacity: page * limit >= total ? 0.5 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* API Error Details Dialog */}
      {selectedErrorDetails && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setSelectedErrorDetails(null)} />
          <div className="modal-centered-content" style={{ width: '520px', maxWidth: '92vw', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 24px 48px rgba(15, 23, 42, 0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #FEE2E2', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={22} color="#DC2626" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#991B1B' }}>{selectedErrorDetails.channel} Publishing Error</h3>
              </div>
              <button onClick={() => setSelectedErrorDetails(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                The LinkedIn Posts API returned the following response when trying to automatically create the company post:
              </p>
              <div style={{ padding: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace', color: '#0F172A', wordBreak: 'break-word', lineHeight: '1.5' }}>
                {selectedErrorDetails.message}
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => {
                  setSelectedErrorDetails(null);
                  fetchLinkedInStatus();
                  setShowLinkedInModal(true);
                }}
                style={{ padding: '8px 16px', background: '#2563EB', color: '#FFF', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
              >
                Configure Integration
              </button>
              <button 
                onClick={() => setSelectedErrorDetails(null)} 
                style={{ padding: '8px 16px', background: '#F1F5F9', color: '#475569', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: '1px solid #CBD5E1', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Multi-Channel Publish Result Modal */}
      {publishSummary && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setPublishSummary(null)} />
          <div className="modal-centered-content" style={{ width: '640px', maxWidth: '94vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 24px 48px rgba(15, 23, 42, 0.2)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>Publishing Status Summary</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B', fontWeight: '500' }}>{publishSummary.job?.job_title || `Job ID: ${publishSummary.jobId}`}</p>
                </div>
              </div>
              <button onClick={() => setPublishSummary(null)} style={{ padding: '6px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* 1. Website (Career Page) Status */}
              <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #A7F3D0', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Globe size={22} color="#059669" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#064E3B' }}>Website (Career Page)</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>Published</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#047857', marginTop: '3px' }}>Live on Madhura Technologies Career Portal.</div>
                  </div>
                </div>
                {publishSummary.channels?.CAREER_PAGE?.externalUrl && (
                  <a
                    href={publishSummary.channels.CAREER_PAGE.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '8px 14px',
                      background: '#059669',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
                      flexShrink: 0
                    }}
                  >
                    View Page <ExternalLink size={13} />
                  </a>
                )}
              </div>

              {/* 2. LinkedIn Company Page Post Status */}
              {publishSummary.channels?.LINKEDIN?.status === 'PUBLISHED' ? (
                <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #A7F3D0', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Linkedin size={22} color="#0A66C2" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#064E3B' }}>LinkedIn</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>Published ✓</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#047857', marginTop: '3px' }}>Social media hiring announcement published to Madhura Technologies LinkedIn Page.</div>
                    </div>
                  </div>
                  {publishSummary.channels?.LINKEDIN?.externalUrl && (
                    <a
                      href={publishSummary.channels.LINKEDIN.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '8px 14px',
                        background: '#0A66C2',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(10, 102, 194, 0.3)',
                        flexShrink: 0
                      }}
                    >
                      View Post <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #FECACA', background: '#FEF2F2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Linkedin size={20} color="#DC2626" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#991B1B' }}>LinkedIn</span>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                            {publishSummary.channels?.LINKEDIN?.status || 'Failed'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '4px', lineHeight: '1.5' }}>
                          {publishSummary.channels?.LINKEDIN?.errorMessage || 'LinkedIn organization posting permission (w_organization_social) is not authorized.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #FECACA' }}>
                    <button
                      onClick={() => {
                        fetchLinkedInStatus();
                        setShowLinkedInModal(true);
                      }}
                      style={{
                        padding: '7px 14px',
                        background: '#1E293B',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Settings size={13} /> Configure LinkedIn Integration
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Indeed Channel Status */}
              <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#475569' }}>
                    IN
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>Indeed</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1' }}>
                        Not Connected
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                      Indeed API integration is not connected.
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedJobForLinks(publishSummary.job);
                    setShowLinksModal(true);
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  View Tracked Link
                </button>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button 
                onClick={() => setPublishSummary(null)} 
                style={{ padding: '10px 24px', background: '#0F172A', color: '#FFFFFF', borderRadius: '10px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}

      {/* LinkedIn Integration & Settings Modal */}
      {showLinkedInModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowLinkedInModal(false)} />
          <div className="modal-centered-content" style={{ width: '560px', maxWidth: '92vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 24px 48px rgba(15, 23, 42, 0.2)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A66C2' }}>
                  <Linkedin size={24} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>LinkedIn Integration</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>Authorize organization posting permission for Madhura Technologies Company Page.</p>
                </div>
              </div>
              <button onClick={() => setShowLinkedInModal(false)} style={{ padding: '6px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Status Diagnostic Card */}
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Connection Status:</span>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '700',
                    background: linkedInConfig?.hasToken ? '#ECFDF5' : '#FFFBEB',
                    color: linkedInConfig?.hasToken ? '#059669' : '#D97706',
                    border: `1px solid ${linkedInConfig?.hasToken ? '#A7F3D0' : '#FDE68A'}`
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: linkedInConfig?.hasToken ? '#10B981' : '#F59E0B' }} />
                    {linkedInConfig?.hasToken ? 'Connected & Configured' : 'Action Required / Not Connected'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span>Requested Permission:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#0F172A' }}>w_organization_social, openid, profile</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span>Organization ID:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0F172A' }}>{linkedInConfig?.orgId || '109901015'}</span>
                </div>

                {linkedInConfig?.tokenSnippet && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                    <span>Active Token:</span>
                    <span style={{ fontFamily: 'monospace', color: '#64748B' }}>{linkedInConfig.tokenSnippet}</span>
                  </div>
                )}
              </div>

              {/* PRIMARY CONNECT BUTTON (OAuth) */}
              <div style={{ padding: '18px', border: '1px solid #BFDBFE', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={16} color="#2563EB" /> 1-Click Connect with LinkedIn (Recommended)
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#1E40AF', lineHeight: '1.5' }}>
                    Authenticates and requests <code style={{ background: 'rgba(255,255,255,0.6)', padding: '2px 4px', borderRadius: '4px' }}>w_organization_social</code> permission to post to the Madhura Technologies company feed.
                  </p>
                </div>
                
                <div style={{ paddingTop: '4px' }}>
                  <a
                    href="http://localhost:5000/app/auth/linkedin/connect"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '14px 20px',
                      background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(10, 102, 194, 0.35)',
                      letterSpacing: '0.2px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <Linkedin size={20} />
                    <span>Connect with LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* MANUAL TOKEN ENTRY (Advanced) */}
              <form onSubmit={handleSaveLinkedInToken} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '14px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={15} color="#64748B" /> Enter Access Token Manually
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>LinkedIn Access Token</label>
                  <input
                    type="password"
                    placeholder="Paste access token here..."
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>LinkedIn Organization ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 109901015"
                    value={orgIdInput}
                    onChange={e => setOrgIdInput(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '4px' }}>
                  <button
                    type="submit"
                    disabled={isSavingToken || (!tokenInput && !orgIdInput)}
                    style={{
                      padding: '10px 18px',
                      background: '#1E293B',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: (isSavingToken || (!tokenInput && !orgIdInput)) ? 'not-allowed' : 'pointer',
                      opacity: (isSavingToken || (!tokenInput && !orgIdInput)) ? 0.6 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ShieldCheck size={14} /> {isSavingToken ? 'Saving...' : 'Save Credentials'}
                  </button>
                </div>
              </form>

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button 
                onClick={() => setShowLinkedInModal(false)} 
                style={{ padding: '10px 20px', background: '#F1F5F9', color: '#475569', borderRadius: '10px', fontSize: '13px', fontWeight: '600', border: '1px solid #CBD5E1', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Job Opening Modal */}
      {showAddModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowAddModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">{editingJobId ? 'Edit Job Opening' : 'Add Job Opening'}</h2>
                <p className="text-sm text-slate-500 mt-1">{editingJobId ? 'Update requisition details and publishing preferences.' : 'Configure a new requisition and publish opening.'}</p>
              </div>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Senior React Developer" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department <span className="text-red-500">*</span></label>
                  <select required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Select Department</option>
                    {meta.departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Designation <span className="text-red-500">*</span></label>
                  <select required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Select Designation</option>
                    {meta.designations.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Employment Type <span className="text-red-500">*</span></label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Job Location <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Bangalore / Remote" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Vacancies <span className="text-red-500">*</span></label>
                  <input type="number" required min="1" value={formData.vacancies} onChange={e => setFormData({ ...formData, vacancies: e.target.value })} placeholder="e.g. 3" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Experience From (Years) <span className="text-red-500">*</span></label>
                  <input type="number" required min="0" value={formData.experienceFrom} onChange={e => setFormData({ ...formData, experienceFrom: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Experience To (Years) <span className="text-red-500">*</span></label>
                  <input type="number" required min="0" value={formData.experienceTo} onChange={e => setFormData({ ...formData, experienceTo: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Salary From</label>
                  <input type="number" value={formData.salaryFrom} onChange={e => setFormData({ ...formData, salaryFrom: e.target.value })} placeholder="e.g. 500000" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Salary To</label>
                  <input type="number" value={formData.salaryTo} onChange={e => setFormData({ ...formData, salaryTo: e.target.value })} placeholder="e.g. 1000000" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hiring Manager</label>
                  <select value={formData.hiringManager} onChange={e => setFormData({ ...formData, hiringManager: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Select Hiring Manager</option>
                    {meta.employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Requested By</label>
                  <select value={formData.requestedBy} onChange={e => setFormData({ ...formData, requestedBy: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Select Requester</option>
                    {meta.employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Opening Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.openingDate} onChange={e => setFormData({ ...formData, openingDate: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Closing Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.closingDate} onChange={e => setFormData({ ...formData, closingDate: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority <span className="text-red-500">*</span></label>
                  <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Branch</label>
                  <select value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Select Branch</option>
                    {meta.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                  <select value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Select Company</option>
                    {meta.companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="Open">Open</option>
                    <option value="Published">Published</option>
                    <option value="Closed">Closed</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Job Description <span className="text-red-500">*</span></label>
                  <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Provide key responsibilities and expectations..." style={{ height: '100px' }} className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Skills Required</label>
                  <input type="text" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="e.g. React.js, Redux, TypeScript, Tailwind CSS" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md">{editingJobId ? 'Update Opening' : 'Save Job Opening'}</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Tracking Links Modal */}
      {showLinksModal && selectedJobForLinks && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowLinksModal(false)} />
          <div className="modal-centered-content" style={{ width: '650px', maxWidth: '90vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#0A1629]">Job Application Tracking Links</h2>
                <p className="text-xs text-slate-500 mt-1">Unique tracked URLs for job postings on external career portals.</p>
              </div>
              <button onClick={() => setShowLinksModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-1">LinkedIn Application Link</div>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={getTrackedUrl(selectedJobForLinks, 'LINKEDIN')} className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-600" />
                  <button 
                    onClick={() => copyToClipboard(getTrackedUrl(selectedJobForLinks, 'LINKEDIN'), 'linkedin')} 
                    className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold whitespace-nowrap hover:bg-blue-700"
                  >
                    {copiedLinkType === 'linkedin' ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-1">Indeed Application Link</div>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={getTrackedUrl(selectedJobForLinks, 'INDEED')} className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-600" />
                  <button 
                    onClick={() => copyToClipboard(getTrackedUrl(selectedJobForLinks, 'INDEED'), 'indeed')} 
                    className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold whitespace-nowrap hover:bg-blue-700"
                  >
                    {copiedLinkType === 'indeed' ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-1">Naukri Application Link</div>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={getTrackedUrl(selectedJobForLinks, 'NAUKRI')} className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-600" />
                  <button 
                    onClick={() => copyToClipboard(getTrackedUrl(selectedJobForLinks, 'naukri'), 'naukri')} 
                    className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold whitespace-nowrap hover:bg-blue-700"
                  >
                    {copiedLinkType === 'naukri' ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-1">Direct Madhura Career Page Link</div>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={getTrackedUrl(selectedJobForLinks, 'CAREER_PAGE')} className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-600" />
                  <button 
                    onClick={() => copyToClipboard(getTrackedUrl(selectedJobForLinks, 'direct'), 'direct')} 
                    className="px-3 py-2 bg-slate-800 text-white rounded text-xs font-semibold whitespace-nowrap hover:bg-slate-900"
                  >
                    {copiedLinkType === 'direct' ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end shrink-0">
              <button onClick={() => setShowLinksModal(false)} className="px-5 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">Done</button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmJob && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setDeleteConfirmJob(null)} />
          <div className="modal-centered-content" style={{ width: '480px', maxWidth: '90vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold">Delete Job Opening?</h3>
              </div>
              <button onClick={() => setDeleteConfirmJob(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-3 overflow-y-auto flex-1 min-h-0">
              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete <strong>{deleteConfirmJob.job_title}</strong>?
              </p>
              <p className="text-xs text-slate-500 bg-red-50 p-3 rounded-lg border border-red-100 text-red-700">
                This action will immediately remove the job from all active publishing channels (MadhuraTech Career Page, LinkedIn, Indeed). Historical candidate applications will remain intact.
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button onClick={() => setDeleteConfirmJob(null)} className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200">Cancel</button>
              <button onClick={() => handleDeleteJob(deleteConfirmJob.id)} className="px-5 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 shadow-md">Delete Job</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
