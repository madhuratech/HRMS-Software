import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Download, FileText, CheckCircle, Clock, FolderPlus, X } from 'lucide-react';
import { apiFetch, formatDate } from '../../lib/api';
import { useToast } from '../ui/Toast';

export function Templates() {
  const { addToast } = useToast();
  const [selectedCat, setSelectedCat] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [templatesList, setTemplatesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    kpis: { empDocsCount: 0, compDocsCount: 0, policiesCount: 0, publishedPolicies: 0, templatesCount: 0, signaturesCount: 0 }
  });

  const [formData, setFormData] = useState({
    template_name: '',
    category: 'Offer Letters',
    content: '',
    status: 'Active'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/documents/templates?category=${selectedCat}&`;
      const res = await apiFetch(url);
      if (res.success) setTemplatesList(res.data || []);

      const dbRes = await apiFetch('/documents/dashboard');
      if (dbRes.success) setDashboard(dbRes.data);
    } catch (err) {
      addToast('Failed to load document templates', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCat, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.template_name) {
      addToast('Please enter template name', 'error');
      return;
    }
    try {
      const res = await apiFetch('/documents/templates', {
        method: 'POST',
        body: JSON.stringify({
          template_name: formData.template_name,
          category: formData.category,
          content: formData.content,
          status: formData.status
        })
      });
      if (res.success) {
        addToast('Template saved successfully', 'success');
        setShowAddModal(false);
        setFormData({ template_name: '', category: 'Offer Letters', content: '', status: 'Active' });
        fetchData();
      } else {
        addToast(res.message || 'Failed to save template', 'error');
      }
    } catch (err) {
      addToast('Error connecting to server', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      const res = await apiFetch(`/documents/templates/${id}`, { method: 'DELETE' });
      if (res.success) {
        addToast('Template deleted successfully', 'success');
        fetchData();
      } else {
        addToast(res.message || 'Failed to delete template', 'error');
      }
    } catch (err) {
      addToast('Error connecting to server', 'error');
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>Loading Templates...</div>;
  }

  const KpiCard = ({ label, value, iconBg, iconColor, icon: Icon }) => (
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
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Templates</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Create and manage document templates and categories</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setShowAddModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px',
            background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(41,82,227,0.25)',
          }}>
            <Plus size={16} /> Create Template
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Total Templates" value={dashboard.kpis.templatesCount} iconBg="#EFF6FF" iconColor="#2563EB" icon={FileText} />
        <KpiCard label="Active Templates" value={templatesList.filter(t => t.status === 'Active').length} iconBg="#ECFDF5" iconColor="#059669" icon={CheckCircle} />
        <KpiCard label="Draft Templates" value={templatesList.filter(t => t.status === 'Draft').length} iconBg="#FEF3C7" iconColor="#D97706" icon={Clock} />
        <KpiCard label="Corporate Categories" value="5" iconBg="#EFF6FF" iconColor="#2563EB" icon={FileText} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        
        {/* Left Panel: Template Categories */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 16, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { id: 'all', label: 'All Templates' },
              { id: 'HR Letters', label: 'HR Letters' },
              { id: 'Offer Letters', label: 'Offer Letters' },
              { id: 'Contracts', label: 'Contracts' },
              { id: 'Certificates', label: 'Certificates' }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: selectedCat === c.id ? 600 : 500,
                  background: selectedCat === c.id ? '#EFF6FF' : 'transparent',
                  color: selectedCat === c.id ? '#2563EB' : '#4B5563',
                  border: 'none', cursor: 'pointer',
                }}
              >
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center Main Table */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Templates List</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                  {['Template Name', 'Category', 'Created At', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {templatesList.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 48 }}>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.template_name}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#2563EB', whiteSpace: 'nowrap' }}>{r.category}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{formatDate(r.created_at)}</td>
                    <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: r.status === 'Active' ? '#ECFDF5' : '#FEF3C7',
                        color: r.status === 'Active' ? '#059669' : '#D97706',
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4, fontSize: 12, fontWeight: 600 }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Create Template Modal */}
      {showAddModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowAddModal(false)} />
          <div className="modal-centered-content" style={{ width: '650px', maxWidth: '90vw', maxHeight: '90vh' }}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Create Document Template</h2>
                <p className="text-sm text-slate-500 mt-1">Design a reusable template for official correspondence.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Template Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.template_name} onChange={e => setFormData({ ...formData, template_name: e.target.value })} placeholder="e.g. Appointment Letter Template" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category <span className="text-red-500">*</span></label>
                  <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm bg-white">
                    <option value="Offer Letters">Offer Letters</option>
                    <option value="HR Letters">HR Letters</option>
                    <option value="Contracts">Contracts</option>
                    <option value="Certificates">Certificates</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Template Body Content</label>
                  <textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Type HTML or markdown content here..." style={{ height: '140px' }} className="w-full p-4 border border-slate-200 rounded-xl text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm bg-white">
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md">Create Template</button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}

export default Templates;
