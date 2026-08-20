import React, { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import {
  Users,
  UserCheck,
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
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Layers,
  Code,
  Megaphone,
  Monitor,
  Heart,
  Zap
} from 'lucide-react';

const emptyForm = {
  name: '',
  code: '',
  department: '',
  departmentId: null,
  teamLead: '',
  teamLeadId: null,
  teamMemberIds: [],
  teamMemberNames: [],
  members: 0,
  status: 'Active',
  description: ''
};

const getTeamStyles = (name) => {
  const styles = [
    { IconComp: Monitor, bg: '#EEF2FF', color: '#2563EB' },
    { IconComp: Layers, bg: '#F0FDF4', color: '#16A34A' },
    { IconComp: Zap, bg: '#FFF7ED', color: '#EA580C' },
    { IconComp: Briefcase, bg: '#F5F3FF', color: '#7C3AED' },
    { IconComp: Heart, bg: '#FDF2F8', color: '#DB2777' },
    { IconComp: Megaphone, bg: '#FEF3C7', color: '#D97706' },
    { IconComp: Users, bg: '#ECFDF5', color: '#059669' },
    { IconComp: Code, bg: '#FFF1F2', color: '#E11D48' }
  ];
  const idx = (name || '').length % styles.length;
  return styles[idx];
};

const CustomSelect = ({ label, required, value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <button type="button" onClick={() => setOpen(!open)} className="w-full h-12 flex items-center justify-between px-4 border border-slate-200 rounded-xl text-sm bg-white hover:border-slate-300 transition-colors">
        <span className={value ? 'text-slate-900 font-medium' : 'text-slate-400'}>{value || placeholder}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${value === opt ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700'}`}>
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* Searchable Single-Select for Team Lead (Only Eligible Team Leaders) */
function TeamLeadSelect({ value, selectedId, onChange, employees, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Filter ONLY employees whose role/designation indicates leadership (Team Leader, Lead, Manager, Head, etc.)
  const eligibleLeads = useMemo(() => {
    const activeEmps = employees.filter(emp => emp.status === 'Active');
    const leadsOnly = activeEmps.filter(emp => {
      const role = (emp.role_name || emp.designation || emp.jobTitle || '').toLowerCase().trim();
      return (
        role.includes('leader') ||
        role.includes('lead') ||
        role.includes('manager') ||
        role.includes('head') ||
        role.includes('admin') ||
        role.includes('director') ||
        role.includes('supervisor') ||
        role.includes('chief')
      );
    });
    return leadsOnly.length > 0 ? leadsOnly : activeEmps;
  }, [employees]);

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return eligibleLeads;
    const q = search.toLowerCase();
    return eligibleLeads.filter(emp => {
      const empIdCode = `emp00${emp.id}`.toLowerCase();
      const empName = (emp.name || '').toLowerCase();
      const empRole = (emp.role_name || emp.designation || '').toLowerCase();
      return empName.includes(q) || empRole.includes(q) || empIdCode.includes(q) || String(emp.id).includes(q);
    });
  }, [eligibleLeads, search]);

  const selectedEmp = useMemo(() => {
    if (selectedId) return employees.find(e => e.id === selectedId);
    if (value) return employees.find(e => e.name?.toLowerCase() === value.toLowerCase());
    return null;
  }, [selectedId, value, employees]);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-slate-700 mb-2">Team Lead</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 flex items-center justify-between px-4 border border-slate-200 rounded-xl text-sm bg-white hover:border-slate-300 transition-colors text-left"
      >
        {selectedEmp ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
              {selectedEmp.name ? selectedEmp.name[0].toUpperCase() : '👤'}
            </div>
            <span className="text-slate-900 font-semibold truncate">{selectedEmp.name}</span>
          </div>
        ) : value ? (
          <span className="text-slate-900 font-semibold">{value}</span>
        ) : (
          <span className="text-slate-400">Search team lead...</span>
        )}
        <ChevronDown size={16} className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-72 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-slate-100 bg-slate-50">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3.5 text-slate-400 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-56 p-1">
              {loading ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">Loading team leaders...</div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">No team leaders found</div>
              ) : (
                filteredLeads.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      onChange(emp);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                      (selectedId === emp.id || value === emp.name) ? 'bg-blue-50/70 border border-blue-100' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {emp.name ? emp.name[0].toUpperCase() : '👤'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{emp.name}</p>
                      <p className="text-xs text-blue-600 font-medium truncate">{emp.role_name || emp.designation || 'Team Leader'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* Searchable Multi-Select for Team Members */
function TeamMembersSelect({ selectedDepartment, selectedMemberIds, onChange, employees, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const departmentEmployees = useMemo(() => {
    const activeEmps = employees.filter(emp => emp.status === 'Active');
    if (!selectedDepartment) return activeEmps;
    
    const deptNorm = selectedDepartment.toLowerCase().trim();
    const matched = activeEmps.filter(emp => {
      const empDept = (emp.dept_name || emp.department || emp.department_name || '').toLowerCase().trim();
      return empDept === deptNorm;
    });

    return matched.length > 0 ? matched : activeEmps;
  }, [employees, selectedDepartment]);

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return departmentEmployees;
    const q = search.toLowerCase();
    return departmentEmployees.filter(emp => {
      const empIdCode = `emp00${emp.id}`.toLowerCase();
      const empName = (emp.name || '').toLowerCase();
      const empRole = (emp.role_name || emp.designation || '').toLowerCase();
      return empName.includes(q) || empRole.includes(q) || empIdCode.includes(q) || String(emp.id).includes(q);
    });
  }, [departmentEmployees, search]);

  const selectedMemberEmps = useMemo(() => {
    return employees.filter(e => (selectedMemberIds || []).includes(e.id));
  }, [employees, selectedMemberIds]);

  const toggleMember = (empId) => {
    let nextIds;
    if (selectedMemberIds.includes(empId)) {
      nextIds = selectedMemberIds.filter(id => id !== empId);
    } else {
      nextIds = [...selectedMemberIds, empId];
    }
    const selectedEmps = employees.filter(e => nextIds.includes(e.id));
    onChange(nextIds, selectedEmps);
  };

  const removeMember = (empId) => {
    const nextIds = selectedMemberIds.filter(id => id !== empId);
    const selectedEmps = employees.filter(e => nextIds.includes(e.id));
    onChange(nextIds, selectedEmps);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-slate-700">Team Members</label>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          {(selectedMemberIds || []).length} {(selectedMemberIds || []).length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {/* Selected Chips */}
      {selectedMemberEmps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto p-1 border border-slate-100 rounded-lg bg-slate-50/50">
          {selectedMemberEmps.map((emp) => (
            <span
              key={emp.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200 text-blue-700 text-xs font-medium rounded-lg shadow-sm"
            >
              <span>{emp.name}</span>
              <button
                type="button"
                onClick={() => removeMember(emp.id)}
                className="hover:bg-blue-100 rounded p-0.5 transition-colors text-blue-500 hover:text-blue-800"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 flex items-center justify-between px-4 border border-slate-200 rounded-xl text-sm bg-white hover:border-slate-300 transition-colors text-left"
      >
        <span className="text-slate-400">
          {(selectedMemberIds || []).length === 0
            ? 'Select team members...'
            : `${(selectedMemberIds || []).length} team members selected`}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 bottom-full mb-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 max-h-64 flex flex-col">
            <div className="p-2 border-b border-slate-100 bg-slate-50">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3.5 text-slate-400 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-56 p-1">
              {loading ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">Loading department employees...</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  No active employees found
                </div>
              ) : (
                filteredEmployees.map((emp) => {
                  const isChecked = (selectedMemberIds || []).includes(emp.id);
                  return (
                    <label
                      key={emp.id}
                      className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                        isChecked ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMember(emp.id)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                        {emp.name ? emp.name[0].toUpperCase() : '👤'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{emp.name}</p>
                        <p className="text-xs text-slate-400 truncate">{emp.role_name || emp.designation || 'Employee'} • {emp.dept_name || emp.department || 'General'}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export const Teams = () => {
  const [teams, setTeams] = useState([]);
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
  const [departmentsList, setDepartmentsList] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const itemsPerPage = 8;

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/organization/teams');
      if (Array.isArray(data)) {
        setTeams(data);
      }
      const depts = await apiFetch('/organization/departments');
      if (Array.isArray(depts)) {
        setAllDepartments(depts);
        setDepartmentsList(depts.map(d => d.name || d.dept_name));
      }
    } catch (e) {
      console.error("Failed to load teams:", e);
    }
    setLoading(false);
  };

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const emps = await apiFetch('/employees?status=Active');
      if (Array.isArray(emps)) {
        setAllEmployees(emps);
      }
    } catch (e) {
      console.error("Failed to load employees:", e);
    }
    setLoadingEmployees(false);
  };

  useEffect(() => {
    loadTeams();
    loadEmployees();
  }, []);

  const departmentOptions = useMemo(() => {
    const list = new Set([...departmentsList, ...teams.map(t => t.department).filter(Boolean)]);
    if (list.size === 0) return ['Technology', 'Sales', 'Human Resources', 'Marketing'];
    return Array.from(list);
  }, [departmentsList, teams]);

  const statistics = useMemo(() => ({
    total: teams.length,
    active: teams.filter(t => t.status === 'Active').length,
    members: teams.reduce((sum, t) => sum + (parseInt(t.members) || 0), 0),
    leads: new Set(teams.map(t => t.teamLead).filter(Boolean)).size
  }), [teams]);

  const filteredData = useMemo(() => {
    return teams.filter(t => {
      const matchSearch = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchDept = deptFilter === 'All' || t.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [teams, searchTerm, statusFilter, deptFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDepartmentChange = (newDept) => {
    const deptObj = allDepartments.find(d => (d.name || d.dept_name) === newDept);
    const deptNorm = (newDept || '').toLowerCase().trim();

    const validMemberEmps = allEmployees.filter(emp => {
      const isSelected = (formData.teamMemberIds || []).includes(emp.id);
      const empDept = (emp.dept_name || emp.department || emp.department_name || '').toLowerCase().trim();
      return isSelected && emp.status === 'Active' && (empDept === deptNorm || !newDept);
    });
    const validIds = validMemberEmps.map(e => e.id);

    setFormData(prev => ({
      ...prev,
      department: newDept,
      departmentId: deptObj ? deptObj.id : prev.departmentId,
      teamMemberIds: validIds,
      teamMemberNames: validMemberEmps.map(e => e.name),
      members: validIds.length
    }));
  };

  const handleAdd = () => {
    setFormData(emptyForm);
    setShowAddModal(true);
  };

  const handleSaveAdd = async () => {
    if (!formData.name || !formData.code || !formData.department) return;
    try {
      await apiFetch('/organization/teams', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          department: formData.department,
          departmentId: formData.departmentId,
          teamLead: formData.teamLead,
          teamLeadId: formData.teamLeadId,
          members: (formData.teamMemberIds || []).length || (parseInt(formData.members) || 1),
          teamMemberIds: formData.teamMemberIds,
          status: formData.status,
          description: formData.description
        })
      });
      await loadTeams();
    } catch (err) {
      console.error("Error creating team:", err);
    }
    setShowAddModal(false);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);

    const leadEmp = allEmployees.find(e => e.name?.toLowerCase() === item.teamLead?.toLowerCase());
    const deptNorm = (item.department || '').toLowerCase().trim();
    const deptEmps = allEmployees.filter(e => (e.dept_name || e.department || e.department_name || '').toLowerCase().trim() === deptNorm);
    const initialMemberIds = deptEmps.map(e => e.id);

    setFormData({
      name: item.name || '',
      code: item.code || '',
      department: item.department || '',
      departmentId: null,
      teamLead: item.teamLead || '',
      teamLeadId: leadEmp ? leadEmp.id : null,
      teamMemberIds: initialMemberIds,
      teamMemberNames: deptEmps.map(e => e.name),
      members: item.members || initialMemberIds.length,
      status: item.status || 'Active',
      description: item.description || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!formData.name || !formData.code || !formData.department) return;
    try {
      await apiFetch(`/organization/teams/${selectedItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          department: formData.department,
          departmentId: formData.departmentId,
          teamLead: formData.teamLead,
          teamLeadId: formData.teamLeadId,
          members: (formData.teamMemberIds || []).length || (parseInt(formData.members) || 1),
          teamMemberIds: formData.teamMemberIds,
          status: formData.status,
          description: formData.description
        })
      });
      await loadTeams();
    } catch (err) {
      console.error("Error updating team:", err);
    }
    setShowEditModal(false);
  };

  const handleOpenView = (item) => { setSelectedItem(item); setShowViewModal(true); };
  const handleOpenDelete = (item) => { setSelectedItem(item); setShowDeleteModal(true); };
  const handleConfirmDelete = async () => {
    if (selectedItem) {
      try {
        await apiFetch(`/organization/teams/${selectedItem.id}`, {
          method: 'DELETE'
        });
        await loadTeams();
      } catch (err) {
        console.error("Error deleting team:", err);
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Team Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter team name" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Team Code <span className="text-red-500">*</span></label>
                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="Enter team code" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>

              {/* Department Dropdown */}
              <CustomSelect
                label="Department"
                required
                value={formData.department}
                onChange={handleDepartmentChange}
                options={departmentOptions}
                placeholder="Select department"
              />

              {/* Dynamic Searchable Team Lead Selection */}
              <TeamLeadSelect
                value={formData.teamLead}
                selectedId={formData.teamLeadId}
                employees={allEmployees}
                loading={loadingEmployees}
                onChange={(selectedEmp) => {
                  setFormData(prev => ({
                    ...prev,
                    teamLead: selectedEmp ? selectedEmp.name : '',
                    teamLeadId: selectedEmp ? selectedEmp.id : null
                  }));
                }}
              />

              {/* Dynamic Multi-Select Team Members Selection */}
              <div className="sm:col-span-2">
                <TeamMembersSelect
                  selectedDepartment={formData.department}
                  selectedMemberIds={formData.teamMemberIds || []}
                  employees={allEmployees}
                  loading={loadingEmployees}
                  onChange={(nextIds, selectedEmps) => {
                    setFormData(prev => ({
                      ...prev,
                      teamMemberIds: nextIds,
                      teamMemberNames: selectedEmps.map(e => e.name),
                      members: nextIds.length
                    }));
                  }}
                />
              </div>

              <div className="pt-0 sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Status <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="teamStatus" checked={formData.status === 'Active'} onChange={() => setFormData({ ...formData, status: 'Active' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
                    <span className="text-sm font-semibold text-slate-700">Active</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="teamStatus" checked={formData.status === 'Inactive'} onChange={() => setFormData({ ...formData, status: 'Inactive' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
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
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#0A1629]">Teams</h1><p className="text-sm text-slate-500 mt-1">Manage all company teams and squads.</p></div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"><Download size={16} /> Export</button>
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"><Plus size={16} /> Add Team</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Teams', value: statistics.total, icon: Users, bg: '#EEF2FF', color: '#2563EB' },
          { label: 'Active Teams', value: statistics.active, icon: CheckCircle2, bg: '#ECFDF5', color: '#10B981' },
          { label: 'Team Members', value: statistics.members, icon: Users, bg: '#F5F3FF', color: '#8B5CF6' },
          { label: 'Team Leads', value: statistics.leads, icon: UserCheck, bg: '#FFF7ED', color: '#F97316' }
        ].map((card) => (
          <div key={card.label} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-16 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: card.bg, color: card.color }}><card.icon size={22} /></div>
            <div><p className="text-[13px] font-semibold text-slate-500 leading-tight">{card.label}</p><p className="text-[28px] font-bold text-[#0a1629] mt-1 leading-none">{card.value}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <input
              type="text"
              placeholder="Search Team..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">Department: All</option>
              {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
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

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-x-auto">
        {paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No Teams Found</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">Create your first team.</p>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm mb-4"
            >
              <Plus size={16} /> Add Team
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Team</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Code</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467]">Department</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Team Lead</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Members</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Created Date</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Status</th>
                <th className="text-left py-4 px-4 text-[13px] font-semibold text-[#475467] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => {
                const styles = getTeamStyles(item.name);
                const IconComp = styles.IconComp;
                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: styles.bg, color: styles.color }}><IconComp size={18} /></div>
                        <span className="font-semibold text-[#101828] text-sm whitespace-nowrap">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">{item.code}</td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">{item.department}</td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">{item.teamLead || 'Unassigned'}</td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        {item.members || 0} Members
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">{item.createdDate || '12 Jan 2026'}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenView(item)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><Eye size={16} /></button>
                        <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleOpenDelete(item)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {paginatedData.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"><ChevronLeft size={16} /></button>
              <span className="font-semibold text-slate-700">{currentPage} / {totalPages || 1}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {renderFormModal('Add Team', 'Create a new team and assign members.', showAddModal, () => setShowAddModal(false), handleSaveAdd, 'Save Team')}
      {renderFormModal('Edit Team', 'Update team details and member assignments.', showEditModal, () => setShowEditModal(false), handleSaveEdit, 'Update Team')}

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowViewModal(false)} />
          <div className="modal-centered-content">
            <div className="p-8 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">{selectedItem.name}</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedItem.code} • {selectedItem.department}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div><p className="text-slate-400 font-medium">Team Lead</p><p className="text-slate-800 font-semibold mt-1">{selectedItem.teamLead || 'Unassigned'}</p></div>
                <div><p className="text-slate-400 font-medium">Department</p><p className="text-slate-800 font-semibold mt-1">{selectedItem.department}</p></div>
                <div><p className="text-slate-400 font-medium">Member Count</p><p className="text-slate-800 font-semibold mt-1">{selectedItem.members} Members</p></div>
                <div><p className="text-slate-400 font-medium">Status</p><p className="text-slate-800 font-semibold mt-1">{selectedItem.status}</p></div>
              </div>
              {selectedItem.description && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-slate-400 font-medium text-sm">Description</p>
                  <p className="text-slate-600 text-sm mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedItem.description}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end p-8 border-t border-slate-200 shrink-0">
              <button onClick={() => setShowViewModal(false)} className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors">Close</button>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedItem && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowDeleteModal(false)} />
          <div className="modal-centered-content max-w-md p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
            <h3 className="text-lg font-bold text-slate-800">Delete Team?</h3>
            <p className="text-sm text-slate-500 mt-2">Are you sure you want to delete <strong>{selectedItem.name}</strong>? This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setShowDeleteModal(false)} className="px-6 h-11 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-6 h-11 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
