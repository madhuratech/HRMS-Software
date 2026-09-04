import React, { useState, useEffect, useCallback } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { Search, Eye, Download, FileText, CheckCircle, Clock, AlertCircle, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { useToast } from '../ui/Toast';
import { hasPermission } from '../../lib/permissions';

export default function DocumentVerification() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('Pending Verification');
  const [verificationsList, setVerificationsList] = useState([]);
  const [newJoiners, setNewJoiners] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All Departments');

  // KPI Dashboard Stats
  const [kpiData, setKpiData] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    completed: 0,
    total: 0,
    chartData: [
      { name: 'Verified', value: 0, color: '#10B981' },
      { name: 'Pending', value: 0, color: '#F59E0B' },
      { name: 'Rejected', value: 0, color: '#EF4444' }
    ]
  });

  // Modal form states
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [formJoinerId, setFormJoinerId] = useState('');
  const [formFiles, setFormFiles] = useState({});
  const [formStatus, setFormStatus] = useState('Pending');

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
      const headers = { 'Authorization': `Bearer ${getAuthToken()}` };
      
      // Fetch departments
      const deptRes = await fetch('/app/requirements/meta/all', { headers });
      const deptData = await deptRes.json();
      if (deptData && deptData.departments) {
        setDepartments(deptData.departments);
      }

      // Fetch active new joiners
      const joinersRes = await fetch('/app/joiners?limit=1000', { headers });
      const joinersData = await joinersRes.json();
      if (joinersData.success && joinersData.data) {
        setNewJoiners(joinersData.data.joiners || []);
      }
    } catch (err) {
      console.error('Failed to load verification metadata:', err);
    }
  };

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch('/app/verifications/stats', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setKpiData(resData.data);
      }
    } catch (err) {
      console.error('Failed to fetch verification stats:', err);
    }
  }, []);

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      let mappedStatus = 'Pending';
      if (activeTab === 'Verified Documents') mappedStatus = 'Verified';
      if (activeTab === 'Rejected Documents') mappedStatus = 'Rejected';
      if (activeTab === 'Completed Verification') mappedStatus = 'Completed';

      let url = `/app/verifications?page=${page}&limit=${limit}&status=${mappedStatus}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (filterDept && filterDept !== 'All Departments') {
        url += `&department_id=${encodeURIComponent(filterDept)}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setVerificationsList(resData.data.verifications || []);
        setTotal(resData.data.total || 0);
      } else {
        addToast(resData.message || 'Failed to fetch document verifications', 'error');
      }
    } catch (err) {
      addToast('Error connecting to backend server', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterDept, activeTab, addToast]);

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filterDept, activeTab]);

  useEffect(() => {
    fetchVerifications();
    fetchDashboardStats();
  }, [page, fetchVerifications, fetchDashboardStats]);

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Verified': return { bg: '#ECFDF5', text: '#10B981', border: '#A7F3D0' };
      case 'Completed': return { bg: '#EFF6FF', text: '#2952E3', border: '#BFDBFE' };
      case 'Pending': return { bg: '#FFFBEB', text: '#F59E0B', border: '#FDE68A' };
      case 'Rejected': return { bg: '#FEF2F2', text: '#EF4444', border: '#FECACA' };
      default: return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
    }
  };

  const handleOpenEdit = (verifyRecord) => {
    setSelectedVerification(verifyRecord);
    setFormJoinerId(verifyRecord.new_joiner_id);
    setFormStatus(verifyRecord.status);
    setFormFiles({});
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setSelectedVerification(null);
    setFormJoinerId('');
    setFormStatus('Pending');
    setFormFiles({});
    setShowModal(true);
  };

  const handleFileChange = (field, file) => {
    if (file) {
      // Size check (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        addToast('File size must be under 10MB.', 'error');
        return;
      }
      setFormFiles(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formJoinerId) {
      addToast('Please select a New Joiner.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('new_joiner_id', formJoinerId);
      data.append('status', formStatus);

      // Append selected files
      Object.keys(formFiles).forEach(key => {
        data.append(key, formFiles[key]);
      });

      const url = selectedVerification 
        ? `/app/verifications/${selectedVerification.id}`
        : '/app/verifications';
      
      const method = selectedVerification ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: data
      });
      const resData = await res.json();
      if (resData.success) {
        addToast('Verification record saved successfully!', 'success');
        setShowModal(false);
        fetchVerifications();
        fetchDashboardStats();
      } else {
        addToast(resData.message || 'Failed to save verification details', 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteVerification = async (verifyId) => {
    if (!window.confirm('Are you sure you want to complete this document verification? This will automatically generate a new Employee record.')) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`/app/verifications/${verifyId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const resData = await res.json();
      if (resData.success) {
        addToast('Verification completed and Employee generated successfully!', 'success');
        setShowModal(false);
        fetchVerifications();
        fetchDashboardStats();
      } else {
        addToast(resData.message || 'Failed to complete verification', 'error');
      }
    } catch (err) {
      addToast('Connection error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  // Selected Joiner Auto Population Info
  const activeJoiner = newJoiners.find(j => j.id === parseInt(formJoinerId));

  const docTypesList = [
    { name: 'Aadhaar Card', key: 'aadhaar_card' },
    { name: 'PAN Card', key: 'pan_card' },
    { name: 'Resume', key: 'resume' },
    { name: 'Passport', key: 'passport' },
    { name: 'Degree Certificate', key: 'degree_certificate' },
    { name: 'Experience Certificate', key: 'experience_certificate' },
    { name: 'Relieving Letter', key: 'relieving_letter' },
    { name: 'Photo', key: 'photo' },
    { name: 'Bank Passbook', key: 'bank_passbook' },
    { name: 'Driving License', key: 'driving_license' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif', paddingBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Document Verification</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Verify and track employee documents</p>
        </div>
        {hasPermission('onboarding', 'document_verification', 'create') && (
          <button onClick={handleOpenAdd} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <Plus size={18} /> Initiate Verification
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #E2E8F0', paddingBottom: '0' }}>
        {['Pending Verification', 'Verified Documents', 'Rejected Documents', 'Completed Verification'].map((tab) => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              paddingBottom: '12px', 
              fontSize: '14px', 
              fontWeight: activeTab === tab ? '600' : '500', 
              color: activeTab === tab ? '#2952E3' : '#64748B', 
              borderBottom: activeTab === tab ? '2px solid #2952E3' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px'
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Main Left Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <AppDropdown
                value={filterDept}
                onChange={v => setFilterDept(v)}
                options={[{value:'All Departments',label:'All Departments'}]}
                size="sm"
              />
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search employee..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading verifications...</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Employee</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Designation</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Submitted On</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificationsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No documents in this category</td>
                      </tr>
                    ) : (
                      verificationsList.map((row, index) => {
                        const submitDate = row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '-';
                        return (
                          <tr key={row.id} style={{ borderBottom: index === verificationsList.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                                  {row.employee_name ? row.employee_name.split(' ').map(n => n[0]).join('') : 'IP'}
                                </div>
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{row.employee_name}</div>
                                  <div style={{ fontSize: '11px', color: '#64748B' }}>{row.department_name}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{row.designation}</td>
                            <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{submitDate}</td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                              <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontSize: '11px', 
                                fontWeight: '600', 
                                backgroundColor: getStatusStyle(row.status).bg, 
                                color: getStatusStyle(row.status).text,
                                border: `1px solid ${getStatusStyle(row.status).border}`
                              }}>
                                {row.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                <button onClick={() => handleOpenEdit(row)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2952E3', fontWeight: '600', fontSize: '12px' }}>
                                  Review Documents
                                </button>
                              </div>
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
        </div>

        {/* Right Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Verification Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '120px', height: '120px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={kpiData.chartData} innerRadius={40} outerRadius={55} paddingAngle={2} dataKey="value" cx="50%" cy="50%" stroke="none">
                      {kpiData.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label value={kpiData.total} position="center" fill="#1E293B" style={{ fontSize: '24px', fontWeight: '700' }} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '70%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px', color: '#64748B' }}>Total</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '24px' }}>
                {kpiData.chartData.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '500' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }}></div>
                      {item.name}
                    </div>
                    <div style={{ fontWeight: '600', color: '#1E293B' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={20} color="#EF4444" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Pending Verifications</div>
                <div style={{ fontSize: '18px', color: '#1E293B', fontWeight: '700' }}>{kpiData.pending}</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Verification Review Modal (1100px Standard) */}
      {showModal && (selectedVerification ? hasPermission('onboarding', 'document_verification', 'edit') : hasPermission('onboarding', 'document_verification', 'create')) && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw', maxHeight: '90vh' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">
                  {selectedVerification ? 'Review Onboarding Documents' : 'Initiate Onboarding Verification'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">Manage and evaluate document uploads for this onboarding joiner.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Joiner <span className="text-red-500">*</span></label>
                  {selectedVerification ? (
                    <input type="text" readOnly value={selectedVerification.employee_name} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none" />
                  ) : (
                    <AppDropdown
                value={formJoinerId}
                onChange={v => setFormJoinerId(v)}
                options={[{value:'',label:'Select Onboarding Joiner'}]}
                size="sm"
              />
                  )}
                </div>

                {activeJoiner && (
                  <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                    <div><strong>Department:</strong> {activeJoiner.department_name}</div>
                    <div><strong>Designation:</strong> {activeJoiner.designation}</div>
                    <div><strong>Joining Date:</strong> {new Date(activeJoiner.joining_date).toLocaleDateString()}</div>
                    <div><strong>Reporting Manager:</strong> {activeJoiner.reporting_manager}</div>
                  </div>
                )}

                <div className="col-span-1 sm:col-span-2">
                  <h4 className="text-sm font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">Document Upload Files</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {docTypesList.map(doc => {
                      const existingPath = selectedVerification ? selectedVerification[doc.key] : null;
                      return (
                        <div key={doc.key} className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col gap-2">
                          <label className="text-xs font-semibold text-slate-700">{doc.name}</label>
                          {existingPath ? (
                            <div className="flex items-center justify-between gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                              <span className="text-xs text-blue-700 truncate max-w-[150px]">{existingPath.split('/').pop()}</span>
                              <a 
                                href={`${existingPath}`}
                                target="_blank" 
                                rel="noreferrer"
                                className="text-xs text-[#2952E3] font-bold hover:underline"
                              >
                                View File
                              </a>
                            </div>
                          ) : (
                            <input 
                              type="file" 
                              onChange={e => handleFileChange(doc.key, e.target.files?.[0])}
                              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Overall Verification Status</label>
                  <AppDropdown
                value={formStatus}
                onChange={v => setFormStatus(v)}
                options={[{value:'Pending',label:'Pending'},{value:'Verified',label:'Verified'},{value:'Rejected',label:'Rejected'}]}
                size="sm"
              />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200 shrink-0">
                <div>
                  {selectedVerification && selectedVerification.status !== 'Completed' && (
                    <button 
                      type="button" 
                      onClick={() => handleCompleteVerification(selectedVerification.id)}
                      className="px-6 h-12 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50"
                    >
                      Complete Verification
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-8 h-12 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}
