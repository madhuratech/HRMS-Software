import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight, X, AlertTriangle, Users } from 'lucide-react';
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
  }, []);

  useEffect(() => {
    fetchRequirements();
  }, [search, selectedDept, selectedStatus, page]);

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
    try {
      const res = await fetch(`/app/requirements/${jobId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert('Job published successfully to Madhura Technologies Career Page!');
        fetchRequirements();
      } else {
        alert(data.message || 'Failed to publish job');
      }
    } catch (err) {
      alert('Error connecting to backend server');
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

  const handleRetryChannel = async (jobId, channel) => {
    try {
      const res = await fetch(`/app/requirements/${jobId}/retry-publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ channel })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Retry for ${channel}: ${data.result?.status}`);
        fetchChannelsForJob(jobId);
      } else {
        alert(data.message || 'Failed to retry channel');
      }
    } catch (err) {
      alert('Error retrying channel');
    }
  };

  const copyToClipboard = (text, type) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedLinkType(type);
    setTimeout(() => setCopiedLinkType(null), 2000);
  };

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Job Openings</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Manage and track all job openings</p>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
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
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
          <div>
            <button
              disabled={!canCreate('job_openings')}
              onClick={() => {
                if (!checkActionPermission('job_openings', 'CREATE')) return;
                setShowAddModal(true);
              }}
              style={{ 
                padding: '10px 16px', 
                borderRadius: '8px', 
                border: 'none', 
                background: canCreate('job_openings') ? '#2952E3' : '#94A3B8', 
                color: '#FFF', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                cursor: canCreate('job_openings') ? 'pointer' : 'not-allowed', 
                fontSize: '14px', 
                fontWeight: '500' 
              }}
            >
              <Plus size={16} /> Create Opening
            </button>
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
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Job ID</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Job Title</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Department</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Location</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Vacancies</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Posted Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {openings.map((row, index) => (
                  <tr key={row.id} style={{ borderBottom: index === openings.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#2952E3', whiteSpace: 'nowrap' }}>{row.requirement_code}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#1E293B', whiteSpace: 'nowrap' }}>{row.job_title}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.department_name}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.location}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.employment_type}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#1E293B', whiteSpace: 'nowrap', textAlign: 'center' }}>{row.vacancies}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {new Date(row.opening_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        backgroundColor: (row.status === 'Published' || row.status === 'Open' || row.status === 'Approved') ? '#ECFDF5' : (row.status === 'Draft' ? '#FFFBEB' : '#FEF2F2'), 
                        color: (row.status === 'Published' || row.status === 'Open' || row.status === 'Approved') ? '#10B981' : (row.status === 'Draft' ? '#D97706' : '#EF4444') 
                      }}>
                        {row.status === 'Open' ? 'Published' : row.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        
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

                        {/* Publish Job Button */}
                        {row.status !== 'Published' && row.status !== 'Open' && (
                          <button 
                            disabled={!canEdit('job_openings')}
                            onClick={() => handlePublishJob(row.id)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: canEdit('job_openings') ? '#10B981' : '#94A3B8', color: '#FFF', fontSize: '12px', fontWeight: '600', cursor: canEdit('job_openings') ? 'pointer' : 'not-allowed' }}
                          >
                            Publish Job
                          </button>
                        )}

                        {/* Tracking Links Button */}
                        <button 
                          onClick={() => {
                            setSelectedJobForLinks(row);
                            setShowLinksModal(true);
                          }}
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
                ))}
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
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2952E3', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#FFF', fontSize: '13px', fontWeight: '500' }}>
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

      {/* Add Job Opening Modal */}
      {showAddModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowAddModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw', maxHeight: '90vh' }}>
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
          <div className="modal-centered-content" style={{ width: '650px', maxWidth: '90vw' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0A1629]">Job Application Tracking Links</h2>
                <p className="text-xs text-slate-500 mt-1">Unique tracked URLs for job postings on external career portals.</p>
              </div>
              <button onClick={() => setShowLinksModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
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
                    onClick={() => copyToClipboard(getTrackedUrl(selectedJobForLinks, 'NAUKRI'), 'naukri')} 
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
            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button onClick={() => setShowLinksModal(false)} className="px-5 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">Done</button>
            </div>
          </div>
        </>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmJob && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setDeleteConfirmJob(null)} />
          <div className="modal-centered-content" style={{ width: '480px', maxWidth: '90vw' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold">Delete Job Opening?</h3>
              </div>
              <button onClick={() => setDeleteConfirmJob(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete <strong>{deleteConfirmJob.job_title}</strong>?
              </p>
              <p className="text-xs text-slate-500 bg-red-50 p-3 rounded-lg border border-red-100 text-red-700">
                This action will immediately remove the job from all active publishing channels (MadhuraTech Career Page, LinkedIn, Indeed). Historical candidate applications will remain intact.
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmJob(null)} className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200">Cancel</button>
              <button onClick={() => handleDeleteJob(deleteConfirmJob.id)} className="px-5 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 shadow-md">Delete Job</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
