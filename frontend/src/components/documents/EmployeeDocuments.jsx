import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, Download, Upload, Eye, FileText, CheckCircle, Clock, AlertTriangle, XCircle, Filter, X } from 'lucide-react';
import { apiFetch, formatDate, getAuthToken } from '../../lib/api';
import { useToast } from '../ui/Toast';

export function EmployeeDocuments() {
  const { addToast } = useToast();
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docList, setDocList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ employees: [], departments: [] });
  const [selectedFile, setSelectedFile] = useState(null);
  const [dashboard, setDashboard] = useState({
    kpis: { empDocsCount: 0, compDocsCount: 0, policiesCount: 0, publishedPolicies: 0, templatesCount: 0, signaturesCount: 0 }
  });

  const [formData, setFormData] = useState({
    employee_id: '',
    document_type: 'Identity Proof',
    document_name: '',
    expiry_date: '',
    status: 'Pending'
  });

  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const metaRes = await apiFetch('/documents/meta');
      if (metaRes.success) setMeta(metaRes.data);

      let url = `/documents/employee?document_type=${selectedType}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const docRes = await apiFetch(url);
      if (docRes.success) setDocList(docRes.data || []);

      const dbRes = await apiFetch('/documents/dashboard');
      if (dbRes.success) setDashboard(dbRes.data);
    } catch (err) {
      addToast('Failed to load employee documents data', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedType, search, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.document_name || !selectedFile) {
      addToast('Please fill all required fields including file upload', 'error');
      return;
    }
    try {
      const data = new FormData();
      data.append('employee_id', formData.employee_id);
      data.append('document_type', formData.document_type);
      data.append('document_name', formData.document_name);
      if (formData.expiry_date) data.append('expiry_date', formData.expiry_date);
      data.append('status', formData.status);
      data.append('file', selectedFile);

      const response = await fetch('/app/documents/employee', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: data
      });
      const res = await response.json();
      if (res.success) {
        addToast('Document uploaded successfully', 'success');
        setShowUploadModal(false);
        setFormData({ employee_id: '', document_type: 'Identity Proof', document_name: '', expiry_date: '', status: 'Pending' });
        setSelectedFile(null);
        fetchData();
      } else {
        addToast(res.message || 'Failed to upload document', 'error');
      }
    } catch (err) {
      addToast('Error uploading file', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await apiFetch(`/documents/employee/${id}`, { method: 'DELETE' });
      if (res.success) {
        addToast('Document deleted successfully', 'success');
        fetchData();
      } else {
        addToast(res.message || 'Failed to delete document', 'error');
      }
    } catch (err) {
      addToast('Error connecting to server', 'error');
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>Loading Employee Documents...</div>;
  }

  const KpiCard = ({ label, value, pct, isPositive, iconBg, iconColor, icon: Icon }) => (
    <div style={{
      background: '#FFF',
      borderRadius: 14,
      border: '1px solid #E5E7EB',
      boxShadow: '0 2px 8px rgba(15,23,42,.04)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flex: '1 1 0',
      minWidth: 0,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} />
      </div>
      <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Employee Documents</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Track, verify and manage employee verification documents</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} style={{ height: 38, paddingLeft: 12, paddingRight: 12, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }} />
          </div>

          <button onClick={() => setShowUploadModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px',
            background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(41,82,227,0.25)',
          }}>
            <Upload size={16} /> Upload Document
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <KpiCard label="Total Employee Docs" value={dashboard.kpis.empDocsCount} iconBg="#EFF6FF" iconColor="#2563EB" icon={FileText} />
        <KpiCard label="Verified Documents" value={docList.filter(d => d.status === 'Verified').length} iconBg="#ECFDF5" iconColor="#16A34A" icon={CheckCircle} />
        <KpiCard label="Pending Verification" value={docList.filter(d => d.status === 'Pending').length} iconBg="#FEF3C7" iconColor="#D97706" icon={Clock} />
        <KpiCard label="Rejected/Expired" value={docList.filter(d => d.status === 'Rejected' || d.status === 'Expired').length} iconBg="#FEF2F2" iconColor="#DC2626" icon={XCircle} />
      </div>

      {/* Categories Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'all', label: 'All Documents' },
          { id: 'Identity Proof', label: 'Identity Proof' },
          { id: 'Address Proof', label: 'Address Proof' },
          { id: 'Educational', label: 'Educational' },
          { id: 'Experience', label: 'Experience' },
          { id: 'Other Documents', label: 'Other' }
        ].map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: selectedType === type.id ? '#2563EB' : '#FFF',
              color: selectedType === type.id ? '#FFF' : '#475569',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              whiteSpace: 'nowrap'
            }}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                {['Employee', 'Designation', 'Document Type', 'Document Name', 'Uploaded Date', 'Expiry Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docList.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 48 }}>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.employee_name}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.employee_role || 'Unassigned'}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.document_type}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#2563EB', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.document_name}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{formatDate(r.created_at)}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.expiry_date ? formatDate(r.expiry_date) : '-'}</td>
                  <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: r.status === 'Verified' ? '#ECFDF5' : r.status === 'Pending' ? '#FEF3C7' : '#FEF2F2',
                      color: r.status === 'Verified' ? '#059669' : r.status === 'Pending' ? '#D97706' : '#EF4444',
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {r.file && (
                        <>
                          <a href={`http://localhost:5000/${r.file}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#2563EB', fontSize: 12, fontWeight: 600 }}>
                            View
                          </a>
                          <a href={`http://localhost:5000/${r.file}`} download style={{ textDecoration: 'none', color: '#16A34A', fontSize: 12, fontWeight: 600 }}>
                            Download
                          </a>
                        </>
                      )}
                      <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4, fontSize: 12, fontWeight: 600 }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowUploadModal(false)} />
          <div className="modal-centered-content" style={{ width: '600px', maxWidth: '90vw', maxHeight: '90vh' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Upload Employee Document</h2>
                <p className="text-sm text-slate-500 mt-1">Upload a verification document and map it to an employee.</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Employee <span className="text-red-500">*</span></label>
                  <select required value={formData.employee_id} onChange={e => setFormData({ ...formData, employee_id: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm bg-white">
                    <option value="">Select Employee</option>
                    {meta.employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Document Type <span className="text-red-500">*</span></label>
                  <select required value={formData.document_type} onChange={e => setFormData({ ...formData, document_type: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm bg-white">
                    <option value="Identity Proof">Identity Proof</option>
                    <option value="Address Proof">Address Proof</option>
                    <option value="Educational">Educational Proof</option>
                    <option value="Experience">Experience Proof</option>
                    <option value="Other Documents">Other Documents</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Document Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.document_name} onChange={e => setFormData({ ...formData, document_name: e.target.value })} placeholder="e.g. Aadhaar Card" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Upload File <span className="text-red-500">*</span></label>
                  <input type="file" required onChange={e => setSelectedFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Expiry Date</label>
                  <input type="date" value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm bg-white">
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md">Upload Document</button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}

export default EmployeeDocuments;
