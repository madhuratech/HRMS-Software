import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { apiFetch } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { 
  Plus, Edit2, Trash2, Eye, Building2, CheckCircle2, Wallet, Users, 
  ChevronLeft, ChevronRight, Loader2, X, UserCheck, AlertCircle, ArrowRight 
} from 'lucide-react';
import { hasPermission } from '../../lib/permissions';

export default function SalaryStructure() {
  const { addToast } = useToast();
  const [structures, setStructures] = useState([]);
  const [availableComponents, setAvailableComponents] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create Form State
  const [structName, setStructName] = useState('');
  const [structCode, setStructCode] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [totalCtc, setTotalCtc] = useState('');
  const [selectedComponents, setSelectedComponents] = useState([]);

  // Edit Form State
  const [editingStructure, setEditingStructure] = useState(null);
  const [editStructName, setEditStructName] = useState('');
  const [editStructCode, setEditStructCode] = useState('');
  const [editFrequency, setEditFrequency] = useState('Monthly');
  const [editTotalCtc, setEditTotalCtc] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editComponents, setEditComponents] = useState([]);

  // Delete State
  const [deletingStructure, setDeletingStructure] = useState(null);

  // Assign Form State
  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignStructId, setAssignStructId] = useState('');
  const [customGross, setCustomGross] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [structData, compData, empData] = await Promise.all([
        apiFetch('/payroll/structures'),
        apiFetch('/payroll/components'),
        apiFetch('/employees?status=Active')
      ]);

      if (Array.isArray(structData)) setStructures(structData);
      else setStructures([]);

      if (Array.isArray(compData)) setAvailableComponents(compData);
      else setAvailableComponents([]);

      if (Array.isArray(empData)) setActiveEmployees(empData);
      else if (empData && Array.isArray(empData.data)) setActiveEmployees(empData.data);
    } catch (err) {
      console.error("Failed to load structures data:", err);
      addToast('Failed to load salary structure records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const openCreateModal = () => {
    setStructName('');
    setStructCode('');
    setFrequency('Monthly');
    setTotalCtc('');
    // Preselect active components
    setSelectedComponents(availableComponents.map(c => ({
      component_id: c.id,
      component_name: c.name,
      component_type: c.type,
      calc_type: c.calc_type || 'percentage',
      value: c.percentage_value || c.default_amount || 0,
      percentage_basis: c.percentage_basis || 'basic',
      enabled: true
    })));
    setShowCreateModal(true);
  };

  const openEditModal = async (structure) => {
    setEditingStructure(structure);
    setEditStructName(structure.name || '');
    setEditStructCode(structure.code || '');
    setEditFrequency(structure.frequency || 'Monthly');
    setEditTotalCtc(structure.total_ctc || '');
    setEditStatus(structure.status || 'Active');

    try {
      const res = await apiFetch(`/payroll/structures/${structure.id}`);
      const structDetail = res?.data || res;
      const assignedComps = structDetail?.components || [];

      const mapped = availableComponents.map(c => {
        const existing = assignedComps.find(ac => ac.component_id === c.id);
        return {
          component_id: c.id,
          component_name: c.name,
          component_type: c.type,
          calc_type: existing ? existing.calc_type : (c.calc_type || 'percentage'),
          value: existing ? (existing.value || 0) : (c.percentage_value || c.default_amount || 0),
          percentage_basis: existing ? existing.percentage_basis : (c.percentage_basis || 'basic'),
          enabled: !!existing
        };
      });
      setEditComponents(mapped);
    } catch (err) {
      setEditComponents(availableComponents.map(c => ({
        component_id: c.id,
        component_name: c.name,
        component_type: c.type,
        calc_type: c.calc_type || 'percentage',
        value: c.percentage_value || c.default_amount || 0,
        percentage_basis: c.percentage_basis || 'basic',
        enabled: true
      })));
    }
    setShowEditModal(true);
  };

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    if (!structName.trim()) {
      addToast('Structure name is required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const enabledComps = selectedComponents.filter(c => c.enabled);
      const payload = {
        name: structName.trim(),
        code: structCode.trim() || `STR-${Date.now().toString().slice(-4)}`,
        frequency,
        total_ctc: parseFloat(totalCtc) || 0,
        status: 'Active',
        components: enabledComps
      };

      const res = await apiFetch('/payroll/structures', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        addToast('Salary structure created successfully', 'success');
        setShowCreateModal(false);
        loadAllData();
      } else {
        addToast(res.message || 'Failed to create structure', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error creating structure', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStructure = async (e) => {
    e.preventDefault();
    if (!editStructName.trim()) {
      addToast('Structure name is required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const enabledComps = editComponents.filter(c => c.enabled);
      const payload = {
        name: editStructName.trim(),
        code: editStructCode.trim() || `STR-${Date.now().toString().slice(-4)}`,
        frequency: editFrequency,
        total_ctc: parseFloat(editTotalCtc) || 0,
        status: editStatus,
        components: enabledComps
      };

      const res = await apiFetch(`/payroll/structures/${editingStructure.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        addToast('Salary structure updated successfully', 'success');
        setShowEditModal(false);
        setEditingStructure(null);
        loadAllData();
      } else {
        addToast(res.message || 'Failed to update structure', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error updating structure', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (structure) => {
    setDeletingStructure(structure);
    setShowDeleteModal(true);
  };

  const handleDeleteStructure = async () => {
    if (!deletingStructure) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/payroll/structures/${deletingStructure.id}`, {
        method: 'DELETE'
      });
      if (res && res.success) {
        addToast('Salary structure deleted successfully', 'success');
        setShowDeleteModal(false);
        setDeletingStructure(null);
        loadAllData();
      } else {
        addToast(res.message || 'Failed to delete structure', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error deleting structure', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignStructure = async (e) => {
    e.preventDefault();
    if (!assignEmpId || !assignStructId) {
      addToast('Please select both an employee and a salary structure', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        employee_id: assignEmpId,
        structure_id: assignStructId,
        effective_from: effectiveFrom || null,
        custom_gross: customGross ? parseFloat(customGross) : null
      };

      const res = await apiFetch('/payroll/structures/assign', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        addToast('Salary structure assigned to employee successfully!', 'success');
        setShowAssignModal(false);
        loadAllData();
      } else {
        addToast(res.message || 'Failed to assign structure', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error assigning structure', 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalStructures = structures.length;
  const activeStructures = structures.filter(s => s.status === 'Active').length;
  const totalEmployeesMapped = structures.reduce((acc, curr) => acc + (Number(curr.employees) || 0), 0);
  const totalAmount = structures.reduce((acc, curr) => acc + (Number(curr.total_ctc) || 0), 0);
  const avgCtc = totalStructures > 0 ? (totalAmount / totalStructures) : 0;
  const avgCtcFormatted = avgCtc > 0 ? `₹ ${(avgCtc / 100000).toFixed(1)}L` : '₹ 0';

  const kpiData = [
    { title: 'Total Structures', value: String(totalStructures), icon: <Building2 size={24} color="#2563EB" />, bgColor: '#EFF6FF' },
    { title: 'Active Structures', value: String(activeStructures), icon: <CheckCircle2 size={24} color="#10B981" />, bgColor: '#ECFDF5' },
    { title: 'Average CTC', value: avgCtcFormatted, icon: <Wallet size={24} color="#8B5CF6" />, bgColor: '#F5F3FF' },
    { title: 'Employees Mapped', value: String(totalEmployeesMapped), icon: <Users size={24} color="#2563EB" />, bgColor: '#EFF6FF' },
  ];

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '20px 24px',
    boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
    border: '1px solid #F1F5F9',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0', background: '#F8FAFC', minHeight: '100%', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>

      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', color: '#1E293B' }}>Salary Structures</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Create organizational compensation plans and assign structures to employees</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {hasPermission('payroll', 'salary_structure', 'create') && (
            <>
              <button
                onClick={() => {
                  setAssignEmpId('');
                  setAssignStructId(structures[0]?.id || '');
                  setCustomGross('');
                  setShowAssignModal(true);
                }}
                style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                <UserCheck size={16} /> Assign to Employee
              </button>
              <button
                onClick={openCreateModal}
                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
              >
                <Plus size={16} /> Add Structure
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        {kpiData.map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: kpi.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kpi.title}</div>
              <div style={{ fontSize: '20px', color: '#1E293B', fontWeight: '800' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', boxSizing: 'border-box' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              <Loader2 className="animate-spin text-blue-600" size={28} style={{ margin: '0 auto 8px' }} />
              <span>Loading salary structures...</span>
            </div>
          ) : structures.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
              <AlertCircle size={28} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>No salary structures found in database</div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Click "Add Structure" to create your first compensation template.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Structure Name</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Code</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Base Monthly CTC</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Frequency</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Active Employees</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {structures.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{row.name}</td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569' }}>{row.code || `STR-${row.id}`}</td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: '#2563EB' }}>
                      ₹ {Number(row.total_ctc || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569' }}>{row.frequency || 'Monthly'}</td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#10B981', fontWeight: '700' }}>
                      {row.employees || 0} Employee(s)
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: row.status === 'Active' ? '#ECFDF5' : '#FEF2F2',
                        color: row.status === 'Active' ? '#10B981' : '#EF4444',
                        border: row.status === 'Active' ? '1px solid #A7F3D0' : '1px solid #FECACA'
                      }}>
                        {row.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(row)}
                          title="Edit Structure"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #BFDBFE',
                            background: '#EFF6FF',
                            color: '#2563EB',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(row)}
                          title="Delete Structure"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #FECACA',
                            background: '#FEF2F2',
                            color: '#EF4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal 1: Create Salary Structure */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '640px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>Create Salary Structure</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleCreateStructure} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Structure Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={structName}
                    onChange={e => setStructName(e.target.value)}
                    placeholder="e.g. Senior Software Engineer Band 4"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Structure Code
                  </label>
                  <input
                    type="text"
                    value={structCode}
                    onChange={e => setStructCode(e.target.value)}
                    placeholder="e.g. ENG-SDE-3"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Monthly Base CTC (₹) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={totalCtc}
                    onChange={e => setTotalCtc(e.target.value)}
                    placeholder="50000"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Pay Frequency
                  </label>
                  <AppDropdown
                value={frequency}
                onChange={v => setFrequency(v)}
                options={[{value:'Monthly',label:'Monthly'},{value:'Bi-Weekly',label:'Bi-Weekly'},{value:'Annual',label:'Annual'}]}
                size="sm"
              />
                </div>
              </div>

              {/* Components Selection Table */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Attach Salary Components to Structure
                </label>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', width: '40px' }}>Include</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Component</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Calculation Mode</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', width: '120px' }}>Value / %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedComponents.map((comp, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={comp.enabled}
                              onChange={e => {
                                const copy = [...selectedComponents];
                                copy[idx].enabled = e.target.checked;
                                setSelectedComponents(copy);
                              }}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: '600' }}>{comp.component_name}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ color: comp.component_type === 'Earning' ? '#059669' : '#DC2626', fontWeight: '600' }}>
                              {comp.component_type}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#64748B', textTransform: 'capitalize' }}>
                            {comp.calc_type}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <input
                              type="number"
                              disabled={!comp.enabled}
                              value={comp.value}
                              onChange={e => {
                                const copy = [...selectedComponents];
                                copy[idx].value = parseFloat(e.target.value) || 0;
                                setSelectedComponents(copy);
                              }}
                              style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFF', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFF', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Save Salary Structure
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal 2: Assign Structure to Employee */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '500px', maxWidth: '95vw', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={18} color="#2563EB" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>Assign Salary Structure</h3>
              </div>
              <button onClick={() => setShowAssignModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleAssignStructure} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Select Employee <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <AppDropdown
                value={assignEmpId}
                onChange={v => {
                    setAssignEmpId(v);
                    const selected = activeEmployees.find(emp => String(emp.id) === v);
                    if (selected && selected.salary) {
                      setCustomGross(selected.salary);
                    }
                  }}
                options={[{value:'',label:'-- Choose Active Employee --'}]}
                size="sm"
              />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Select Salary Structure <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <AppDropdown
                value={assignStructId}
                onChange={v => setAssignStructId(v)}
                options={[{value:'',label:'-- Choose Salary Structure --'}]}
                size="sm"
              />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Custom Monthly Gross Override (₹)
                </label>
                <input
                  type="number"
                  value={customGross}
                  onChange={e => setCustomGross(e.target.value)}
                  placeholder="Optional override for employee"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Effective From Date
                </label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={e => setEffectiveFrom(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFF', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFF', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Assign Structure
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal 3: Edit Salary Structure */}
      {showEditModal && editingStructure && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '640px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit2 size={18} color="#2563EB" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>Edit Salary Structure</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleUpdateStructure} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Structure Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editStructName}
                    onChange={e => setEditStructName(e.target.value)}
                    placeholder="e.g. Executive Senior Level"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Structure Code
                  </label>
                  <input
                    type="text"
                    value={editStructCode}
                    onChange={e => setEditStructCode(e.target.value)}
                    placeholder="STR-001"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Base Monthly CTC (₹)
                  </label>
                  <input
                    type="number"
                    value={editTotalCtc}
                    onChange={e => setEditTotalCtc(e.target.value)}
                    placeholder="50000"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Pay Frequency
                  </label>
                  <AppDropdown
                value={editFrequency}
                onChange={v => setEditFrequency(v)}
                options={[{value:'Monthly',label:'Monthly'},{value:'Bi-Weekly',label:'Bi-Weekly'},{value:'Annual',label:'Annual'}]}
                size="sm"
              />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Status
                  </label>
                  <AppDropdown
                value={editStatus}
                onChange={v => setEditStatus(v)}
                options={[{value:'Active',label:'Active'},{value:'Inactive',label:'Inactive'}]}
                size="sm"
              />
                </div>
              </div>

              {/* Components Selection Table */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Attached Salary Components
                </label>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', width: '40px' }}>Include</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Component</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Calculation Mode</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', width: '120px' }}>Value / %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editComponents.map((comp, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={comp.enabled}
                              onChange={e => {
                                const copy = [...editComponents];
                                copy[idx].enabled = e.target.checked;
                                setEditComponents(copy);
                              }}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: '600' }}>{comp.component_name}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ color: comp.component_type === 'Earning' ? '#059669' : '#DC2626', fontWeight: '600' }}>
                              {comp.component_type}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#64748B', textTransform: 'capitalize' }}>
                            {comp.calc_type}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <input
                              type="number"
                              disabled={!comp.enabled}
                              value={comp.value}
                              onChange={e => {
                                const copy = [...editComponents];
                                copy[idx].value = parseFloat(e.target.value) || 0;
                                setEditComponents(copy);
                              }}
                              style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFF', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFF', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Update Salary Structure
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal 4: Delete Confirmation */}
      {showDeleteModal && deletingStructure && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '440px', maxWidth: '95vw', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={26} />
            </div>
            
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>Delete Salary Structure</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong style={{ color: '#1E293B' }}>"{deletingStructure.name}"</strong> ({deletingStructure.code})? Any mapped employees will be unassigned.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingStructure(null);
                }}
                style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFF', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStructure}
                disabled={saving}
                style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#EF4444', color: '#FFF', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
