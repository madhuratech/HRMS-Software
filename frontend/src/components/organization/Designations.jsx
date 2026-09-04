import React, { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import AppDropdown from '../ui/AppDropdown';
import {
  Award,
  Users,
  Download,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Grid,
  RotateCw,
  Eye,
  Edit2,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Briefcase,
  Shield,
  Code,
  TrendingUp,
  Star,
  Target,
  Zap,
  Layers
} from 'lucide-react';

const INITIAL_DESIGNATIONS = [];

const DEPARTMENTS = ['Management', 'Technology', 'Human Resources', 'Finance', 'Sales', 'Marketing', 'Design', 'Support'];
const GRADES = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

const emptyForm = {
  name: '', code: '', department: '', reportsTo: '', grade: '', level: '', status: 'Active', description: ''
};

const getDesigStyles = (name) => {
  const map = {
    'Chief Executive Officer': { IconComp: Star, bg: '#EEF2FF', color: '#2563EB' },
    'Chief Technology Officer': { IconComp: Code, bg: '#F0FDF4', color: '#16A34A' },
    'Human Resources Manager': { IconComp: Users, bg: '#FFF7ED', color: '#EA580C' },
    'Finance Manager': { IconComp: TrendingUp, bg: '#FDF2F8', color: '#DB2777' },
    'Senior Developer': { IconComp: Zap, bg: '#FEF3C7', color: '#D97706' },
    'UI/UX Designer': { IconComp: Target, bg: '#F5F3FF', color: '#7C3AED' },
    'Sales Manager': { IconComp: Briefcase, bg: '#ECFDF5', color: '#059669' },
    'Marketing Executive': { IconComp: TrendingUp, bg: '#FFF1F2', color: '#E11D48' },
  };
  return map[name] || { IconComp: Award, bg: '#F1F5F9', color: '#475569' };
};



export const Designations = () => {
  const [designations, setDesignations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const itemsPerPage = 8;

  const loadDesignations = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/organization/designations');
      if (Array.isArray(data)) {
        setDesignations(data);
      }
    } catch (e) {
      console.error("Failed to load designations:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDesignations();
  }, []);

  const statistics = useMemo(() => ({
    total: designations.length,
    active: designations.filter(d => d.status === 'Active').length,
    employees: designations.reduce((sum, d) => sum + (Number(d.employees) || 0), 0),
    levels: new Set(designations.map(d => d.level)).size
  }), [designations]);

  const filteredData = useMemo(() => {
    return designations.filter(d => {
      const matchSearch = (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (d.code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchDept = deptFilter === 'All' || d.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [designations, searchTerm, statusFilter, deptFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = () => { setFormData(emptyForm); setShowAddModal(true); };
  const handleSaveAdd = async () => {
    if (!formData.name || !formData.code) return;
    try {
      await apiFetch('/organization/designations', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      await loadDesignations();
    } catch (err) {
      console.error("Error creating designation:", err);
    }
    setShowAddModal(false);
  };
  const handleOpenEdit = (item) => { setSelectedItem(item); setFormData({ name: item.name, code: item.code, department: item.department, reportsTo: item.reportsTo, grade: item.grade, level: item.level, status: item.status, description: item.description }); setShowEditModal(true); };
  const handleSaveEdit = async () => {
    if (!formData.name || !formData.code) return;
    try {
      await apiFetch(`/organization/designations/${selectedItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      await loadDesignations();
    } catch (err) {
      console.error("Error updating designation:", err);
    }
    setShowEditModal(false);
  };
  const handleOpenView = (item) => { setSelectedItem(item); setShowViewModal(true); };
  const handleOpenDelete = (item) => { setSelectedItem(item); setShowDeleteModal(true); };
  const handleConfirmDelete = async () => {
    if (selectedItem) {
      try {
        await apiFetch(`/organization/designations/${selectedItem.id}`, {
          method: 'DELETE'
        });
        await loadDesignations();
      } catch (err) {
        console.error("Error deleting designation:", err);
      }
    }
    setShowDeleteModal(false);
  };

  const renderFormModal = (title, subtitle, show, onClose, onSave, saveLabel) => {
    if (!show) return null;
    return (
      <>
        <div className="modal-backdrop-blur" onClick={onClose} />
        <div className="modal-centered-content">
          <div className="p-8 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xl font-bold text-[#0A1629]">{title}</h2>
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={20} className="text-slate-400" /></button>
          </div>
          <div className="p-8 overflow-y-auto flex-1 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Designation Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter designation name" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Designation Code <span className="text-red-500">*</span></label>
                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="Enter designation code" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Department <span className="text-red-500">*</span></label>
                <AppDropdown
                  value={formData.department}
                  onChange={v => setFormData({ ...formData, department: v })}
                  options={DEPARTMENTS}
                  placeholder="Select Department"
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Reports To</label>
                <AppDropdown
                  value={formData.reportsTo}
                  onChange={v => setFormData({ ...formData, reportsTo: v })}
                  options={['CEO', 'CTO', 'HR Manager', 'Finance Manager', 'Direct Manager', 'None']}
                  placeholder="Select Manager / Lead"
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Grade</label>
                <AppDropdown
                  value={formData.grade}
                  onChange={v => setFormData({ ...formData, grade: v })}
                  options={GRADES}
                  placeholder="Select Grade"
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Level</label>
                <AppDropdown
                  value={formData.level}
                  onChange={v => setFormData({ ...formData, level: v })}
                  options={['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive', 'Director']}
                  placeholder="Select Level"
                  size="sm"
                />
              </div>
              <div className="col-span-1 sm:col-span-2 pt-3">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Status <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="status" checked={formData.status === 'Active'} onChange={() => setFormData({ ...formData, status: 'Active' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
                    <span className="text-sm font-semibold text-slate-700">Active</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="status" checked={formData.status === 'Inactive'} onChange={() => setFormData({ ...formData, status: 'Inactive' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
                    <span className="text-sm font-semibold text-slate-700">Inactive</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 p-8 border-t border-slate-200 shrink-0">
            <button onClick={onClose} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={onSave} className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md">{saveLabel}</button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1629]">Designations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all company designations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export
          </button>
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Add Designation
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-16 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EEF2FF', color: '#2563EB' }}>
            <Award size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 leading-tight">Total Designations</p>
            <p className="text-[28px] font-bold text-[#0a1629] mt-1 leading-none">{statistics.total}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-16 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 leading-tight">Active Designations</p>
            <p className="text-[28px] font-bold text-[#0a1629] mt-1 leading-none">{statistics.active}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-16 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
            <Users size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 leading-tight">Employees Assigned</p>
            <p className="text-[28px] font-bold text-[#0a1629] mt-1 leading-none">{statistics.employees}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-16 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFF7ED', color: '#F97316' }}>
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 leading-tight">Inactive Designations</p>
            <p className="text-[28px] font-bold text-[#0a1629] mt-1 leading-none">{statistics.inactive}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search Designation..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <div style={{ minWidth: 150 }}>
              <AppDropdown
                value={statusFilter}
                onChange={v => { setStatusFilter(v || 'All'); setCurrentPage(1); }}
                options={['All', 'Active', 'Inactive']}
                placeholder="Status: All"
                size="sm"
              />
            </div>
            <div style={{ minWidth: 180 }}>
              <AppDropdown
                value={deptFilter}
                onChange={v => { setDeptFilter(v || 'All'); setCurrentPage(1); }}
                options={['All', ...DEPARTMENTS]}
                placeholder="Department: All"
                size="sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium">
            <Filter size={16} /> Filters
          </button>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
            <Grid size={16} />
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
              setDeptFilter('All');
              setCurrentPage(1);
            }}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-x-auto">
        {paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No Designations Found</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">Create your first designation.</p>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm mb-4"
            >
              <Plus size={16} /> Add Designation
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Designation</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Code</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467]">Department</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Employees</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Created Date</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Status</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => {
                const styles = getDesigStyles(item.name);
                const IconComp = styles.IconComp;
                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: styles.bg, color: styles.color }}><IconComp size={18} /></div>
                        <span className="font-semibold text-[#101828] text-sm">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">{item.code}</td>
                    <td className="py-4 px-4 text-slate-600 text-sm">{item.department}</td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1.5"><Users size={16} className="text-slate-400" /><span>{item.employees}</span></div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400" /><span>{item.createdDate}</span></div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={item.status === 'Active' ? { backgroundColor: '#ECFDF5', color: '#047857' } : { backgroundColor: '#F3F4F6', color: '#4B5563' }}>{item.status}</span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-left">
                      <div className="flex items-center justify-start gap-2">
                        <button onClick={() => handleOpenView(item)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><Eye size={16} /></button>
                        <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleOpenDelete(item)} className="p-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} designations</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors"><ChevronLeft size={18} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {renderFormModal('Add Designation', 'Create a new designation for your organization.', showAddModal, () => setShowAddModal(false), handleSaveAdd, 'Save Designation')}

      {/* Edit Modal */}
      {renderFormModal('Edit Designation', 'Update designation information.', showEditModal, () => setShowEditModal(false), handleSaveEdit, 'Update Designation')}

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowViewModal(false)} />
          <div className="modal-centered-content modal-centered-content-view">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Designation Details</h2>
                <p className="text-sm text-slate-500 mt-0.5">View designation information.</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                {[
                  ['Designation Name', selectedItem.name],
                  ['Designation Code', selectedItem.code],
                  ['Department', selectedItem.department],
                  ['Reports To', selectedItem.reportsTo || '—'],
                  ['Grade', selectedItem.grade || '—'],
                  ['Employees', selectedItem.employees],
                  ['Status', selectedItem.status],
                  ['Created Date', selectedItem.createdDate]
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
                    {label === 'Status' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={value === 'Active' ? { backgroundColor: '#ECFDF5', color: '#047857' } : { backgroundColor: '#F3F4F6', color: '#4B5563' }}>{value}</span>
                    ) : (
                      <p className="text-sm font-semibold text-[#0A1629]">{value}</p>
                    )}
                  </div>
                ))}
              </div>
              {selectedItem.description && (
                <div className="mt-4 bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-slate-400 mb-1">Description</p>
                  <p className="text-sm text-slate-600">{selectedItem.description}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedItem && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowDeleteModal(false)} />
          <div className="modal-centered-content modal-centered-content-delete">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-600" /></div>
            <h3 className="text-lg font-bold text-[#0A1629]">Delete Designation?</h3>
            <p className="text-sm text-slate-500 mt-2">Are you sure you want to delete "{selectedItem.name}"? This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
