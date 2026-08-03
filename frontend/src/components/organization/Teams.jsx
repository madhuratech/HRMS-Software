import React, { useState, useMemo } from 'react';
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
  Calendar,
  Briefcase,
  Layers,
  Code,
  Megaphone,
  Monitor,
  Heart,
  Zap
} from 'lucide-react';

const INITIAL_TEAMS = [
  { id: 1, name: 'Frontend Squad', code: 'TM-FE', department: 'Technology', teamLead: 'David Kumar', members: 12, createdDate: '01 Jan 2026', status: 'Active', description: 'Responsible for all user-facing web and mobile applications.' },
  { id: 2, name: 'Backend Services', code: 'TM-BE', department: 'Technology', teamLead: 'Suresh Reddy', members: 15, createdDate: '02 Jan 2026', status: 'Active', description: 'Handles core APIs, databases, and business logic.' },
  { id: 3, name: 'DevOps & Cloud', code: 'TM-OPS', department: 'Technology', teamLead: 'Anil Sharma', members: 8, createdDate: '03 Jan 2026', status: 'Active', description: 'Manages infrastructure, CI/CD, and system reliability.' },
  { id: 4, name: 'QA Engineers', code: 'TM-QA', department: 'Technology', teamLead: 'Priya Sharma', members: 10, createdDate: '04 Jan 2026', status: 'Active', description: 'Ensures software quality through manual and automated testing.' },
  { id: 5, name: 'Product Design', code: 'TM-DES', department: 'Design', teamLead: 'John Peter', members: 7, createdDate: '05 Jan 2026', status: 'Active', description: 'Creates UI/UX designs, prototypes, and user research.' },
  { id: 6, name: 'Enterprise Sales', code: 'TM-ENT', department: 'Sales', teamLead: 'Ramesh Kumar', members: 14, createdDate: '06 Jan 2026', status: 'Active', description: 'Focuses on large enterprise clients and strategic accounts.' },
  { id: 7, name: 'SMB Sales', code: 'TM-SMB', department: 'Sales', teamLead: 'Amit Verma', members: 18, createdDate: '07 Jan 2026', status: 'Active', description: 'Handles small and medium business accounts.' },
  { id: 8, name: 'Digital Marketing', code: 'TM-DIG', department: 'Marketing', teamLead: 'Rahul Singh', members: 9, createdDate: '08 Jan 2026', status: 'Active', description: 'Runs online campaigns, SEO, and social media.' },
  { id: 9, name: 'Content Strategy', code: 'TM-CON', department: 'Marketing', teamLead: 'Soumya Das', members: 5, createdDate: '09 Jan 2026', status: 'Active', description: 'Develops content for blogs, whitepapers, and marketing collateral.' },
  { id: 10, name: 'Talent Acquisition', code: 'TM-REC', department: 'Human Resources', teamLead: 'Sarah Johnson', members: 6, createdDate: '10 Jan 2026', status: 'Active', description: 'Manages recruitment, interviewing, and onboarding.' },
  { id: 11, name: 'Employee Relations', code: 'TM-ER', department: 'Human Resources', teamLead: 'Deepak Joshi', members: 4, createdDate: '11 Jan 2026', status: 'Active', description: 'Handles employee engagement, disputes, and welfare.' },
  { id: 12, name: 'Financial Planning', code: 'TM-FP', department: 'Finance', teamLead: 'Michael Lee', members: 5, createdDate: '12 Jan 2026', status: 'Active', description: 'Focuses on budgeting, forecasting, and financial analysis.' },
  { id: 13, name: 'Accounting & Payroll', code: 'TM-ACC', department: 'Finance', teamLead: 'Priya Nair', members: 6, createdDate: '13 Jan 2026', status: 'Active', description: 'Manages ledger, accounts payable/receivable, and payroll.' },
  { id: 14, name: 'Customer Support L1', code: 'TM-L1', department: 'Support', teamLead: 'Karthik Raja', members: 20, createdDate: '14 Jan 2026', status: 'Active', description: 'First-line support for customer inquiries and issues.' },
  { id: 15, name: 'Customer Support L2', code: 'TM-L2', department: 'Support', teamLead: 'Rajesh Kumar', members: 12, createdDate: '15 Jan 2026', status: 'Inactive', description: 'Advanced technical support and escalations.' },
  { id: 16, name: 'Executive Strategy', code: 'TM-EXEC', department: 'Management', teamLead: 'David Kumar', members: 5, createdDate: '16 Jan 2026', status: 'Active', description: 'Top management team focused on company strategy.' }
];

const DEPARTMENTS = ['Management', 'Technology', 'Human Resources', 'Finance', 'Sales', 'Marketing', 'Design', 'Support'];

const emptyForm = { name: '', code: '', department: '', teamLead: '', members: '', status: 'Active', description: '' };

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
  const idx = name.length % styles.length;
  return styles[idx];
};

const CustomSelect = ({ label, required, value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <button type="button" onClick={() => setOpen(!open)} className="w-full h-12 flex items-center justify-between px-4 border border-slate-200 rounded-xl text-sm bg-white hover:border-slate-300 transition-colors">
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>{value || placeholder}</span>
        <ChevronRight size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 ${value === opt ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


export const Teams = () => {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const itemsPerPage = 8;

  const statistics = useMemo(() => ({
    total: teams.length,
    active: teams.filter(t => t.status === 'Active').length,
    members: teams.reduce((sum, t) => sum + (parseInt(t.members) || 0), 0),
    leads: new Set(teams.map(t => t.teamLead).filter(Boolean)).size
  }), [teams]);

  const filteredData = useMemo(() => {
    return teams.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchDept = deptFilter === 'All' || t.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [teams, searchTerm, statusFilter, deptFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = () => { setFormData(emptyForm); setShowAddModal(true); };
  const handleSaveAdd = () => {
    if (!formData.name || !formData.code) return;
    setTeams(prev => [...prev, { ...formData, id: Date.now(), createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }]);
    setShowAddModal(false);
  };
  const handleOpenEdit = (item) => { setSelectedItem(item); setFormData({ name: item.name, code: item.code, department: item.department, teamLead: item.teamLead, members: item.members, status: item.status, description: item.description }); setShowEditModal(true); };
  const handleSaveEdit = () => {
    if (!formData.name || !formData.code) return;
    setTeams(prev => prev.map(t => t.id === selectedItem.id ? { ...t, ...formData } : t));
    setShowEditModal(false);
  };
  const handleOpenView = (item) => { setSelectedItem(item); setShowViewModal(true); };
  const handleOpenDelete = (item) => { setSelectedItem(item); setShowDeleteModal(true); };
  const handleConfirmDelete = () => { setTeams(prev => prev.filter(t => t.id !== selectedItem.id)); setShowDeleteModal(false); };

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
              <CustomSelect label="Department" required value={formData.department} onChange={v => setFormData({ ...formData, department: v })} options={DEPARTMENTS} placeholder="Select department" />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Team Lead</label>
                <input type="text" value={formData.teamLead} onChange={e => setFormData({ ...formData, teamLead: e.target.value })} placeholder="Enter team lead name" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Team Members</label>
                <input type="number" value={formData.members} onChange={e => setFormData({ ...formData, members: e.target.value })} placeholder="Enter number of members" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div className="pt-0">
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
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
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
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
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Users size={24} className="text-slate-400" /></div>
            <h3 className="text-lg font-semibold text-slate-700">No Teams Found</h3>
            <p className="text-sm text-slate-500 mt-1">Create your first team.</p>
            <button onClick={handleAdd} className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"><Plus size={16} /> Add Team</button>
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
                    <td className="py-4 px-4 text-slate-600 text-sm">{item.department}</td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">
                      {item.teamLead ? (
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{item.teamLead.charAt(0)}</div><span className="font-medium text-slate-700">{item.teamLead}</span></div>
                      ) : <span className="text-slate-400 italic">Not Assigned</span>}
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1.5"><Users size={16} className="text-slate-400" /><span>{item.members}</span></div>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} teams</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors"><ChevronLeft size={18} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (<button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>{page}</button>))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}

      {renderFormModal('Add Team', 'Create a new team.', showAddModal, () => setShowAddModal(false), handleSaveAdd, 'Save Team')}
      {renderFormModal('Edit Team', 'Update team information.', showEditModal, () => setShowEditModal(false), handleSaveEdit, 'Update Team')}
      {showViewModal && selectedItem && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowViewModal(false)} />
          <div className="modal-centered-content modal-centered-content-view">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Team Details</h2>
                <p className="text-sm text-slate-500 mt-0.5">View team information.</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                {[
                  ['Team Name', selectedItem.name],
                  ['Team Code', selectedItem.code],
                  ['Department', selectedItem.department],
                  ['Team Lead', selectedItem.teamLead || '—'],
                  ['Members', selectedItem.members],
                  ['Status', selectedItem.status],
                  ['Created Date', selectedItem.createdDate]
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
                    {label === 'Status' ? (
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={value === 'Active' ? { backgroundColor: '#ECFDF5', color: '#047857' } : { backgroundColor: '#F3F4F6', color: '#4B5563' }}
                      >
                        {value}
                      </span>
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

      {showDeleteModal && selectedItem && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowDeleteModal(false)} />
          <div className="modal-centered-content modal-centered-content-delete">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-[#0A1629]">Delete Team?</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete "{selectedItem.name}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
