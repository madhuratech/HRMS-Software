import React, { useState, useEffect, useCallback } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { Search, Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { canCreate, canEdit, checkActionPermission } from '../../lib/permissions';

export default function OfferLetters() {
  const { addToast } = useToast();
  const [offersList, setOffersList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All Departments');
  const [filterStatus, setFilterStatus] = useState('All Status');

  const [formData, setFormData] = useState({
    candidate: '',
    job: '',
    department: '',
    salaryOffered: '',
    joiningDate: '',
    reportingManager: '',
    employmentType: 'Full-time',
    offerExpiryDate: '',
    notes: '',
    status: 'Pending'
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
      console.error('Failed to load metadata:', err);
    }
  };

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/app/offers?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (filterStatus && filterStatus !== 'All Status') {
        url += `&status=${encodeURIComponent(filterStatus)}`;
      }
      if (filterDept && filterDept !== 'All Departments') {
        url += `&department_id=${encodeURIComponent(filterDept)}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setOffersList(resData.data.offers || []);
        setTotal(resData.data.total || 0);
      } else {
        addToast(resData.message || 'Failed to fetch offer letters', 'error');
      }
    } catch (err) {
      addToast('Error connecting to backend server', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterDept, filterStatus, addToast]);

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filterDept, filterStatus]);

  useEffect(() => {
    fetchOffers();
  }, [page, fetchOffers]);

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Accepted': return { bg: '#ECFDF5', text: '#10B981' };
      case 'Pending': return { bg: '#FFFBEB', text: '#F59E0B' };
      case 'Rejected': return { bg: '#FEF2F2', text: '#EF4444' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!checkActionPermission('offer_letters', 'CREATE')) return;
    if (!formData.candidate || !formData.job || !formData.department || !formData.salaryOffered || !formData.joiningDate || !formData.reportingManager || !formData.offerExpiryDate) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        candidate_name: formData.candidate.trim(),
        job_position: formData.job.trim(),
        department_id: parseInt(formData.department),
        salary_offered: formData.salaryOffered.trim(),
        joining_date: formData.joiningDate,
        reporting_manager: formData.reportingManager.trim(),
        employment_type: formData.employmentType,
        offer_expiry_date: formData.offerExpiryDate,
        notes: formData.notes.trim(),
        status: formData.status
      };

      const res = await fetch('/app/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        addToast('Offer letter generated successfully!', 'success');
        setShowAddModal(false);
        setFormData({
          candidate: '', job: '', department: '', salaryOffered: '', joiningDate: '',
          reportingManager: '', employmentType: 'Full-time', offerExpiryDate: '', notes: '', status: 'Pending'
        });
        fetchOffers();
      } else {
        addToast(resData.message || 'Failed to create offer letter', 'error');
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
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Offer Letters</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Manage and track offer letters</p>
        </div>
        <button
          disabled={!canCreate('offer_letters')}
          onClick={() => {
            if (!checkActionPermission('offer_letters', 'CREATE')) return;
            setShowAddModal(true);
          }}
          style={{ 
            padding: '10px 16px', 
            borderRadius: '8px', 
            border: 'none', 
            background: canCreate('offer_letters') ? '#2952E3' : '#94A3B8', 
            color: '#FFF', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: canCreate('offer_letters') ? 'pointer' : 'not-allowed', 
            fontSize: '14px', 
            fontWeight: '500' 
          }}
        >
          <Plus size={16} /> Create Offer
        </button>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <AppDropdown
                value={filterDept}
                onChange={v => setFilterDept(v)}
                options={[{value:'All Departments',label:'All Departments'}]}
                size="sm"
              />
            <AppDropdown
                value={filterStatus}
                onChange={v => setFilterStatus(v)}
                options={[{value:'All Status',label:'All Status'},{value:'Accepted',label:'Accepted'},{value:'Pending',label:'Pending'},{value:'Rejected',label:'Rejected'}]}
                size="sm"
              />
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search candidate..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
              />
            </div>
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
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading offer letters...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Candidate</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Job Title</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Offer Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>CTC</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Joining Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offersList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No offer letters found</td>
                  </tr>
                ) : (
                  offersList.map((row, index) => {
                    const offerDate = row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '-';
                    const joinDate = row.joining_date ? new Date(row.joining_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '-';
                    return (
                      <tr key={row.id} style={{ borderBottom: index === offersList.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#334155', whiteSpace: 'nowrap' }}>{row.candidate_name}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.job_position}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{offerDate}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#1E293B', whiteSpace: 'nowrap' }}>
                          {row.salary_offered.startsWith('₹') ? row.salary_offered : `₹${row.salary_offered}`}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{joinDate}</td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontSize: '12px', 
                            fontWeight: '600', 
                            backgroundColor: getStatusStyle(row.status).bg, 
                            color: getStatusStyle(row.status).text 
                          }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2952E3', display: 'inline-flex', alignItems: 'center' }}>
                            <MoreHorizontal size={18} />
                          </button>
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

      {/* Create Offer Letter Modal (1100px Standard) */}
      {showAddModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowAddModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw', maxHeight: '90vh' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Create Offer Letter</h2>
                <p className="text-sm text-slate-500 mt-1">Generate a formal employment offer letter for a candidate.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Candidate <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.candidate} onChange={e => setFormData({ ...formData, candidate: e.target.value })} placeholder="e.g. Rahul Sharma" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Job Position <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.job} onChange={e => setFormData({ ...formData, job: e.target.value })} placeholder="e.g. Senior React Developer" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department <span className="text-red-500">*</span></label>
                  <AppDropdown
                value={formData.department}
                onChange={v => setFormData({ ...formData, department: v })}
                options={[{value:'',label:'Select Department'}]}
                size="sm"
              />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Salary Offered <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.salaryOffered} onChange={e => setFormData({ ...formData, salaryOffered: e.target.value })} placeholder="e.g. ₹ 18,00,000" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Joining Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reporting Manager <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.reportingManager} onChange={e => setFormData({ ...formData, reportingManager: e.target.value })} placeholder="e.g. Aarav Mehta" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Employment Type <span className="text-red-500">*</span></label>
                  <AppDropdown
                value={formData.employmentType}
                onChange={v => setFormData({ ...formData, employmentType: v })}
                options={[{value:'Full-time',label:'Full-time'},{value:'Part-time',label:'Part-time'},{value:'Contract',label:'Contract'}]}
                size="sm"
              />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Offer Expiry Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.offerExpiryDate} onChange={e => setFormData({ ...formData, offerExpiryDate: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <AppDropdown
                value={formData.status}
                onChange={v => setFormData({ ...formData, status: v })}
                options={[{value:'Pending',label:'Pending'},{value:'Accepted',label:'Accepted'},{value:'Rejected',label:'Rejected'}]}
                size="sm"
              />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional offer terms, relocation allowance or special terms..." style={{ height: '90px' }} className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
                  {submitting ? 'Generating...' : 'Generate Offer Letter'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
