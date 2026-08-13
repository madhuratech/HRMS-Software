import React, { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { useToast } from '../ui/Toast';
import {
  Building2,
  Users,
  Download,
  CheckCircle2,
  UserCheck,
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
  Mail,
  Phone,
  MapPin,
  GitBranch,
  Briefcase,
  Code,
  Palette,
  Megaphone,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Calendar
} from 'lucide-react';

const INITIAL_DEPARTMENTS = [];
const MOCK_EMPLOYEES = [];

const emptyForm = { name: '', code: '', headName: '', headAvatar: '', headRole: '', parentDepartment: '', email: '', phone: '', description: '', status: 'Active' };

const getDeptStyles = (deptName) => {
  switch (deptName) {
    case 'Human Resources':
      return {
        IconComp: Users,
        bg: '#EEF2FF',
        color: '#2563EB'
      };
    case 'Finance':
      return {
        IconComp: DollarSign,
        bg: '#ECFDF5',
        color: '#10B981'
      };
    case 'Development':
      return {
        IconComp: Code,
        bg: '#F5F3FF',
        color: '#8B5CF6'
      };
    case 'Quality Assurance':
      return {
        IconComp: ShieldCheck,
        bg: '#FFF7ED',
        color: '#F97316'
      };
    case 'UI/UX Design':
      return {
        IconComp: Palette,
        bg: '#FFF1F2',
        color: '#F43F5E'
      };
    case 'Marketing':
      return {
        IconComp: Megaphone,
        bg: '#ECFEFF',
        color: '#0891B2'
      };
    case 'Sales':
      return {
        IconComp: TrendingUp,
        bg: '#F0F9FF',
        color: '#0284C7'
      };
    default:
      return {
        IconComp: Building2,
        bg: '#F8FAFC',
        color: '#64748B'
      };
  }
};

function CustomSelect({ label, value, options, placeholder, error, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="form-group-field">
      <label className="form-field-label">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`form-field-input flex items-center justify-between text-left w-full ${error ? 'border-red-500' : ''}`}
        >
          <span className={value ? 'text-slate-800' : 'text-slate-400'}>
            {value || placeholder || 'Select Option'}
          </span>
          <span className="text-slate-400 text-xs">▼</span>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${value === opt ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}

export function Departments() {
  const { addToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/organization/departments');
      if (Array.isArray(data)) {
        setDepartments(data);
      }
    } catch (e) {
      console.error("Failed to load departments:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDepartments();
    apiFetch('/employees?status=Active')
      .then(data => {
        if (Array.isArray(data)) setEmployeesList(data);
      })
      .catch(err => console.error("Failed to load employees:", err));
  }, []);

  const isAnyModalOpen = isAddEditModalOpen || isViewModalOpen || isDeleteModalOpen;

  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (isAnyModalOpen) {
      if (mainEl) mainEl.style.overflow = 'hidden';
    } else {
      if (mainEl) mainEl.style.overflow = '';
    }
    return () => {
      if (mainEl) mainEl.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsAddEditModalOpen(false);
        setIsViewModalOpen(false);
        setIsDeleteModalOpen(false);
      }
    };
    if (isAnyModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAnyModalOpen]);

  // Statistics
  const statistics = useMemo(() => {
    const total = departments.length;
    const active = departments.filter(d => d.status === 'Active').length;
    const employees = departments.reduce((acc, d) => acc + (Number(d.employees) || 0), 0);
    const heads = new Set(departments.map(d => d.headName).filter(Boolean)).size;

    return { total, active, employees, heads };
  }, [departments]);

  // Filters & Search
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      const matchSearch = (dept.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (dept.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (dept.headName || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || dept.status === statusFilter;
      const matchBranch = branchFilter === 'All' || dept.branch === branchFilter;

      return matchSearch && matchStatus && matchBranch;
    });
  }, [departments, search, statusFilter, branchFilter]);

  // Pagination
  const pageSize = 7;
  const totalPages = Math.ceil(filteredDepartments.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDepartments.slice(start, start + pageSize);
  }, [filteredDepartments, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOpenAddModal = () => {
    setFormData(emptyForm);
    setFormErrors({});
    setSelectedDept(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setFormData({
      name: dept.name,
      code: dept.code,
      headName: dept.headName,
      branch: dept.branch,
      parentDepartment: dept.parentDepartment || '',
      email: dept.email || '',
      phone: dept.phone || '',
      extension: dept.extension || '',
      location: dept.location || '',
      status: dept.status,
      description: dept.description || ''
    });
    setFormErrors({});
    setSelectedDept(dept);
    setIsAddEditModalOpen(true);
  };

  const handleOpenViewModal = (dept) => {
    setSelectedDept(dept);
    setIsViewModalOpen(true);
  };

  const handleOpenDeleteModal = (dept) => {
    setSelectedDept(dept);
    setIsDeleteModalOpen(true);
  };

  const handleFormChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSaveDepartment = async () => {
    const errors = {};
    if (!formData.name || !formData.name.trim()) errors.name = 'Department Name is required';
    if (!formData.code || !formData.code.trim()) errors.code = 'Department Code is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (selectedDept) {
        // Edit mode
        await apiFetch(`/organization/departments/${selectedDept.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        addToast('Department updated successfully!', 'success');
      } else {
        // Add mode
        await apiFetch('/organization/departments', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        addToast('Department created successfully!', 'success');
      }
      await loadDepartments();
      setIsAddEditModalOpen(false);
    } catch (err) {
      console.error("Error saving department:", err);
      addToast('Failed to save department', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedDept) {
      try {
        await apiFetch(`/organization/departments/${selectedDept.id}`, {
          method: 'DELETE'
        });
        await loadDepartments();
      } catch (err) {
        console.error("Error deleting department:", err);
      }
    }
    setIsDeleteModalOpen(false);
  };

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(departments, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'departments.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 relative min-h-full pb-12">

      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all company departments and department heads.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 bg-white"
          >
            <Download size={16} /> Export
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add Department
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-16 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EEF2FF', color: '#2563EB' }}>
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 leading-tight">Total Departments</p>
            <p className="text-[28px] font-bold text-[#0a1629] mt-1 leading-none">{statistics.total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-16 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 leading-tight">Active Departments</p>
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
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 leading-tight">Department Heads</p>
            <p className="text-[28px] font-bold text-[#0a1629] mt-1 leading-none">{statistics.heads}</p>
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
              placeholder="Search Department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            </select>
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
              setSearch('');
              setStatusFilter('All');
              setBranchFilter('All');
            }}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredDepartments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
          <span className="text-5xl mb-4">🏢</span>
          <h3 className="text-lg font-bold text-slate-800">No Departments Found</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">Create your first department to get started.</p>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add Department
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[480px]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200">
                  <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467]">Department</th>
                  <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Code</th>
                  <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Department Head</th>
                  <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Employees</th>
                  <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Created Date</th>
                  <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Status</th>
                  <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((dept) => (
                  <tr key={dept.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const styles = getDeptStyles(dept.name);
                          const IconComp = styles.IconComp;
                          return (
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: styles.bg, color: styles.color }}>
                              <IconComp size={18} />
                            </div>
                          );
                        })()}
                        <span className="font-semibold text-[#101828] text-sm">{dept.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">{dept.code}</td>
                    <td className="py-4 px-4">
                      {dept.headName ? (
                        <div className="flex items-center gap-3">
                          <img src={dept.headAvatar} alt={dept.headName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" style={{ minWidth: '32px', minHeight: '32px' }} />
                          <div>
                            <p className="text-sm font-semibold text-[#101828] leading-none whitespace-nowrap">{dept.headName}</p>
                            <p className="text-xs text-slate-400 mt-1 leading-none whitespace-nowrap">{dept.headRole}</p>
                          </div>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Users size={16} className="text-slate-400" />
                        <span>{dept.employees}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-slate-400" />
                        <span>{dept.createdDate || '12 Jan 2026'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={
                          dept.status === 'Active'
                            ? { backgroundColor: '#ECFDF5', color: '#047857' }
                            : { backgroundColor: '#F3F4F6', color: '#4B5563' }
                        }
                      >
                        {dept.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-left">
                      <div className="flex items-center justify-start gap-2">
                        <button
                          onClick={() => handleOpenViewModal(dept)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(dept)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(dept)}
                          className="p-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredDepartments.length)} of {filteredDepartments.length} departments
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${page === currentPage ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Add / Edit Department Modal */}
      {isAddEditModalOpen && (
        <>
          <div className="modal-backdrop-blur" />
          <div className="modal-centered-content">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedDept ? 'Edit Department' : 'Add Department'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedDept ? 'Modify department details.' : 'Create a new department.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 form-grid-2col">
              <div className="form-group-field">
                <label className="form-field-label">Department Name *</label>
                <input
                  type="text"
                  className={`form-field-input ${formErrors.name ? 'border-red-500' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                />
                {formErrors.name && <span className="text-xs text-red-500 mt-1">{formErrors.name}</span>}
              </div>

              <div className="form-group-field">
                <label className="form-field-label">Department Code *</label>
                <input
                  type="text"
                  className={`form-field-input ${formErrors.code ? 'border-red-500' : ''}`}
                  value={formData.code}
                  onChange={(e) => handleFormChange('code', e.target.value)}
                />
                {formErrors.code && <span className="text-xs text-red-500 mt-1">{formErrors.code}</span>}
              </div>

              <CustomSelect
                label="Department Head"
                value={formData.headName || 'Unassigned'}
                placeholder="Select Employee"
                options={['Unassigned', ...employeesList.map(emp => emp.name)]}
                error={formErrors.headName}
                onChange={(val) => handleFormChange('headName', val === 'Unassigned' ? '' : val)}
              />

              <CustomSelect
                label="Parent Department"
                value={formData.parentDepartment}
                placeholder="Select Parent Department"
                options={['None', ...departments.filter(d => !selectedDept || d.id !== selectedDept.id).map(d => d.name)]}
                onChange={(val) => handleFormChange('parentDepartment', val === 'None' ? '' : val)}
              />

              <div className="form-group-field">
                <label className="form-field-label">Department Email</label>
                <input
                  type="email"
                  className="form-field-input"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                />
              </div>

              <div className="form-group-field">
                <label className="form-field-label">Department Phone</label>
                <input
                  type="text"
                  className="form-field-input"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                />
              </div>

              <div className="form-group-field">
                <label className="form-field-label">Status</label>
                <div className="form-toggle-wrapper">
                  <span className="text-sm text-slate-500">Toggle Status</span>
                  <label className="form-toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.status === 'Active'}
                      onChange={(e) => handleFormChange('status', e.target.checked ? 'Active' : 'Inactive')}
                    />
                    <span className="form-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-xl">
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDepartment}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Save Department
              </button>
            </div>
          </div>
        </>
      )}

      {/* View Department Details Modal */}
      {isViewModalOpen && selectedDept && (
        <>
          <div className="modal-backdrop-blur" />
          <div className="modal-centered-content modal-centered-content-view">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{selectedDept.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedDept.code}</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 font-medium">Department Name</p>
                  <p className="text-slate-800 font-semibold mt-1">{selectedDept.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Department Code</p>
                  <p className="text-slate-800 font-semibold font-mono mt-1">{selectedDept.code}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Department Head</p>
                  <div className="flex items-center gap-2 mt-1">
                    <img src={selectedDept.headAvatar} alt={selectedDept.headName} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <p className="text-slate-800 font-semibold leading-tight">{selectedDept.headName}</p>
                      <p className="text-xs text-slate-400">{selectedDept.headRole}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Branch</p>
                  <p className="text-slate-800 font-semibold mt-1">{selectedDept.branch}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Parent Department</p>
                  <p className="text-slate-800 font-semibold mt-1">{selectedDept.parentDepartment || 'None'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Employee Count</p>
                  <p className="text-slate-800 font-semibold mt-1 flex items-center gap-1.5">
                    <Users size={14} className="text-slate-400" />
                    {selectedDept.employees} Employees
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Department Email</p>
                  <p className="text-slate-800 font-semibold mt-1">{selectedDept.email || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Phone</p>
                  <p className="text-slate-800 font-semibold mt-1">
                    {selectedDept.phone || '—'} {selectedDept.extension && `(Ext: ${selectedDept.extension})`}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Location</p>
                  <p className="text-slate-800 font-semibold mt-1">{selectedDept.location || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${selectedDept.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {selectedDept.status}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Created Date</p>
                  <p className="text-slate-800 font-semibold mt-1">{selectedDept.createdDate}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Updated Date</p>
                  <p className="text-slate-800 font-semibold mt-1">{selectedDept.updatedDate || '—'}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-slate-400 font-medium text-sm">Description</p>
                <p className="text-slate-600 text-sm mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {selectedDept.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center rounded-b-xl">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedDept && (
        <>
          <div className="modal-backdrop-blur" />
          <div className="modal-centered-content modal-centered-content-delete">
            <span className="text-4xl mb-4">⚠️</span>
            <h3 className="text-lg font-bold text-slate-800">Delete Department?</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete the department <strong>{selectedDept.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
