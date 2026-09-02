import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { 
  Search, Plus, Layers, TrendingUp, TrendingDown, Landmark, 
  Edit2, Trash2, X, CheckCircle2, AlertCircle, Loader2, DollarSign, Percent, ShieldCheck
} from 'lucide-react';

export default function SalaryComponents() {
  const { addToast } = useToast();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Earning'); // 'Earning' | 'Deduction' | 'Contribution'
  const [calcType, setCalcType] = useState('fixed'); // 'fixed' | 'percentage' | 'formula'
  const [percentageValue, setPercentageValue] = useState(0);
  const [percentageBasis, setPercentageBasis] = useState('basic'); // 'basic' | 'gross'
  const [defaultAmount, setDefaultAmount] = useState(0);
  const [taxable, setTaxable] = useState('Yes');
  const [isStatutory, setIsStatutory] = useState(false);
  const [status, setStatus] = useState('Active');

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/payroll/components');
      if (Array.isArray(data)) setComponents(data);
      else setComponents([]);
    } catch (err) {
      console.error("Failed to load components:", err);
      addToast('Failed to load salary components', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setName('');
    setType('Earning');
    setCalcType('fixed');
    setPercentageValue(0);
    setPercentageBasis('basic');
    setDefaultAmount(0);
    setTaxable('Yes');
    setIsStatutory(false);
    setStatus('Active');
    setShowModal(true);
  };

  const openEditModal = (comp) => {
    setModalMode('edit');
    setEditingId(comp.id);
    setName(comp.name || '');
    setType(comp.type || 'Earning');
    setCalcType(comp.calc_type || 'fixed');
    setPercentageValue(comp.percentage_value || 0);
    setPercentageBasis(comp.percentage_basis || 'basic');
    setDefaultAmount(comp.default_amount || 0);
    setTaxable(comp.taxable || 'Yes');
    setIsStatutory(Boolean(comp.is_statutory));
    setStatus(comp.status || 'Active');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Component name is required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        calc_type: calcType,
        percentage_value: parseFloat(percentageValue) || 0,
        percentage_basis: percentageBasis,
        default_amount: parseFloat(defaultAmount) || 0,
        taxable,
        is_statutory: isStatutory ? 1 : 0,
        status
      };

      if (modalMode === 'create') {
        const res = await apiFetch('/payroll/components', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          addToast('Salary component created successfully', 'success');
          setShowModal(false);
          fetchComponents();
        } else {
          addToast(res.message || 'Failed to create component', 'error');
        }
      } else {
        const res = await apiFetch(`/payroll/components/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          addToast('Salary component updated successfully', 'success');
          setShowModal(false);
          fetchComponents();
        } else {
          addToast(res.message || 'Failed to update component', 'error');
        }
      }
    } catch (err) {
      addToast(err.message || 'Error saving component', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this salary component?')) return;
    try {
      const res = await apiFetch(`/payroll/components/${id}`, { method: 'DELETE' });
      if (res && res.success) {
        addToast('Component deleted successfully', 'success');
        fetchComponents();
      } else {
        addToast(res.message || 'Failed to delete component', 'error');
      }
    } catch (err) {
      addToast('Error deleting component', 'error');
    }
  };

  const filteredComponents = components.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch = !search.trim() || (c.name && c.name.toLowerCase().includes(q));
    const matchesType = typeFilter === 'All' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalComp = components.length;
  const earningsCount = components.filter(c => c.type === 'Earning').length;
  const deductionsCount = components.filter(c => c.type === 'Deduction').length;
  const statutoryCount = components.filter(c => c.is_statutory).length;

  const kpiData = [
    { title: 'Total Components', value: String(totalComp), icon: <Layers size={20} color="#2563EB" />, bgColor: '#EFF6FF' },
    { title: 'Earnings Types', value: String(earningsCount), icon: <TrendingUp size={20} color="#10B981" />, bgColor: '#ECFDF5' },
    { title: 'Deductions Types', value: String(deductionsCount), icon: <TrendingDown size={20} color="#EF4444" />, bgColor: '#FEF2F2' },
    { title: 'Statutory Rules', value: String(statutoryCount), icon: <ShieldCheck size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', color: '#1E293B' }}>Salary Components</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Configure fixed and percentage-based earnings and deduction rules</p>
        </div>
        <button
          onClick={openCreateModal}
          style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
        >
          <Plus size={16} /> Add Component
        </button>
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

      {/* Main Table Container */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        
        {/* Table Toolbar */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search component name..."
                style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '13px', color: '#334155', boxSizing: 'border-box' }}
              />
            </div>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '13px', color: '#334155', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All Types</option>
              <option value="Earning">Earnings</option>
              <option value="Deduction">Deductions</option>
              <option value="Contribution">Contributions</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', boxSizing: 'border-box' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              <Loader2 className="animate-spin text-blue-600" size={28} style={{ margin: '0 auto 8px' }} />
              <span>Loading salary components...</span>
            </div>
          ) : filteredComponents.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
              <AlertCircle size={28} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>No salary components configured</div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Click "Add Component" to create your first earning or deduction rule.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Component Name</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Type</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Calculation Mode</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Configured Value</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Taxable</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComponents.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {row.name}
                        {row.is_statutory ? (
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                            Statutory
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: row.type === 'Earning' ? '#ECFDF5' : row.type === 'Deduction' ? '#FEF2F2' : '#FFFBEB',
                        color: row.type === 'Earning' ? '#059669' : row.type === 'Deduction' ? '#DC2626' : '#D97706'
                      }}>
                        {row.type}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', textTransform: 'capitalize' }}>
                      {row.calc_type === 'percentage' ? `Percentage of ${row.percentage_basis || 'Basic'}` : row.calc_type || 'Fixed Amount'}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                      {row.calc_type === 'percentage' 
                        ? `${row.percentage_value || 0}% of ${row.percentage_basis || 'Basic'}`
                        : `₹ ${parseFloat(row.default_amount || 0).toLocaleString('en-IN')}`
                      }
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>{row.taxable || 'Yes'}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: row.status === 'Active' ? '#ECFDF5' : '#F1F5F9',
                        color: row.status === 'Active' ? '#059669' : '#64748B',
                        border: row.status === 'Active' ? '1px solid #A7F3D0' : '1px solid #E2E8F0'
                      }}>
                        {row.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(row)}
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', color: '#2563EB', cursor: 'pointer' }}
                          title="Edit Component"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer' }}
                          title="Delete Component"
                        >
                          <Trash2 size={13} />
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

      {/* Modal: Create / Edit Component */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '520px', maxWidth: '95vw', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>
                {modalMode === 'create' ? 'Add Salary Component' : 'Edit Salary Component'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Component Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Basic Salary, Conveyance Allowance, Special Bonus"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Type <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
                  >
                    <option value="Earning">Earning</option>
                    <option value="Deduction">Deduction</option>
                    <option value="Contribution">Contribution</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Calculation Mode <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={calcType}
                    onChange={e => setCalcType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
                  >
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="formula">Formula / Balance Remainder</option>
                  </select>
                </div>
              </div>

              {calcType === 'percentage' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Percentage Value (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={percentageValue}
                      onChange={e => setPercentageValue(e.target.value)}
                      placeholder="e.g. 50, 40, 12"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Calculated On
                    </label>
                    <select
                      value={percentageBasis}
                      onChange={e => setPercentageBasis(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
                    >
                      <option value="basic">Basic Salary</option>
                      <option value="gross">Gross / Base Salary</option>
                    </select>
                  </div>
                </div>
              )}

              {calcType === 'fixed' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Default Fixed Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={defaultAmount}
                    onChange={e => setDefaultAmount(e.target.value)}
                    placeholder="e.g. 200, 1500"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Taxable Under IT
                  </label>
                  <select
                    value={taxable}
                    onChange={e => setTaxable(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="statutoryCheck"
                    checked={isStatutory}
                    onChange={e => setIsStatutory(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="statutoryCheck" style={{ fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                    Statutory Component (PF/ESI/PT)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  {modalMode === 'create' ? 'Create Component' : 'Save Changes'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
