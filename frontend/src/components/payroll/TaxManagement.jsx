import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { apiFetch } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { usePermissions } from '../../context/PermissionContext';
import { 
  Search, Plus, ShieldCheck, Scale, FileCheck, Landmark, 
  Loader2, AlertCircle, CheckCircle2, X, Check 
} from 'lucide-react';

export default function TaxManagement() {
  const { addToast } = useToast();
  const { canCreate, canEdit } = usePermissions();
  const [taxes, setTaxes] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [taxRegime, setTaxRegime] = useState('New Regime');
  const [sec80c, setSec80c] = useState('');
  const [sec80d, setSec80d] = useState('');
  const [hraExemption, setHraExemption] = useState('');
  const [financialYear, setFinancialYear] = useState('2026-27');

  const loadData = async () => {
    setLoading(true);
    try {
      const [taxesData, empData] = await Promise.all([
        apiFetch('/payroll/taxes'),
        apiFetch('/employees?status=Active')
      ]);

      if (Array.isArray(taxesData)) setTaxes(taxesData);
      else setTaxes([]);

      if (Array.isArray(empData)) setActiveEmployees(empData);
      else if (empData && Array.isArray(empData.data)) setActiveEmployees(empData.data);
    } catch (err) {
      console.error("Failed to load taxes:", err);
      addToast('Failed to load tax declarations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTax = async (e) => {
    e.preventDefault();
    if (!employeeId) {
      addToast('Please select an employee', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        employee_id: employeeId,
        tax_regime: taxRegime,
        section_80c: parseFloat(sec80c) || 0,
        section_80d: parseFloat(sec80d) || 0,
        hra_exemption: parseFloat(hraExemption) || 0,
        financial_year: financialYear
      };

      const res = await apiFetch('/payroll/taxes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        addToast('Tax declaration submitted successfully!', 'success');
        setShowModal(false);
        loadData();
      } else {
        addToast(res.message || 'Failed to submit tax declaration', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error saving declaration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyTax = async (id) => {
    try {
      const res = await apiFetch(`/payroll/taxes/${id}/verify`, { method: 'PUT' });
      if (res && res.success) {
        addToast('Tax declaration verified!', 'success');
        loadData();
      } else {
        addToast(res.message || 'Failed to verify declaration', 'error');
      }
    } catch (err) {
      addToast('Error verifying declaration', 'error');
    }
  };

  const totalDeclarations = taxes.length;
  const verifiedCount = taxes.filter(t => t.status === 'Verified').length;
  const pendingCount = taxes.filter(t => t.status !== 'Verified').length;
  const newRegimeCount = taxes.filter(t => (t.tax_regime || '').toLowerCase().includes('new')).length;

  const kpiData = [
    { title: 'Tax Declarations', value: String(totalDeclarations), icon: <FileCheck size={20} color="#2563EB" />, bgColor: '#EFF6FF' },
    { title: 'Verified Profiles', value: String(verifiedCount), icon: <ShieldCheck size={20} color="#10B981" />, bgColor: '#ECFDF5' },
    { title: 'New Regime Opted', value: String(newRegimeCount), icon: <Scale size={20} color="#8B5CF6" />, bgColor: '#F5F3FF' },
    { title: 'Pending Review', value: String(pendingCount), icon: <Landmark size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
  ];

  const filteredTaxes = taxes.filter(t => {
    const q = search.toLowerCase();
    const name = (t.employee_name || '').toLowerCase();
    const code = (t.emp_code || '').toLowerCase();
    const regime = (t.tax_regime || '').toLowerCase();
    return !search.trim() || name.includes(q) || code.includes(q) || regime.includes(q);
  });

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
          <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', color: '#1E293B' }}>Tax Management & IT Declarations</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Income tax regime selections, Chapter VI-A deductions, and TDS calculation rules</p>
        </div>
        {canCreate('payroll', 'tax_management') && (
          <button
            onClick={() => {
              setEmployeeId(activeEmployees[0]?.id || '');
              setShowModal(true);
            }}
            style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
          >
            <Plus size={16} /> New Tax Declaration
          </button>
        )}
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
          <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employee or tax regime..."
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '13px', color: '#334155', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Table Content */}
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', boxSizing: 'border-box' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              <Loader2 className="animate-spin text-blue-600" size={28} style={{ margin: '0 auto 8px' }} />
              <span>Loading tax declarations...</span>
            </div>
          ) : filteredTaxes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
              <AlertCircle size={28} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>No tax declarations submitted</div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Click "New Tax Declaration" to register an IT declaration.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Employee</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Financial Year</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Selected Regime</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>80C Declared</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>80D Health</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>HRA Exemption</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'center' }}>Verification Status</th>
                  {canEdit('payroll', 'tax_management') && (
                    <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'right' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredTaxes.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                      {row.employee_name}
                      <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: '500' }}>{row.emp_code}</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>{row.financial_year || '2026-27'}</td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#2563EB' }}>{row.tax_regime || 'New Regime'}</td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                      ₹ {parseFloat(row.section_80c || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>
                      ₹ {parseFloat(row.section_80d || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>
                      ₹ {parseFloat(row.hra_exemption || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: row.status === 'Verified' ? '#ECFDF5' : '#FFFBEB',
                        color: row.status === 'Verified' ? '#059669' : '#D97706',
                        border: row.status === 'Verified' ? '1px solid #A7F3D0' : '1px solid #FDE68A'
                      }}>
                        {row.status || 'Declared'}
                      </span>
                    </td>
                    {canEdit('payroll', 'tax_management') && (
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {row.status !== 'Verified' && (
                          <button
                            onClick={() => handleVerifyTax(row.id)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #A7F3D0', background: '#ECFDF5', color: '#059669', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            <Check size={12} /> Verify
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Add Tax Declaration */}
      {showModal && canCreate('payroll', 'tax_management') && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '520px', maxWidth: '95vw', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} color="#2563EB" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>Submit Tax Declaration</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleCreateTax} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Select Employee <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <AppDropdown
                value={employeeId}
                onChange={v => setEmployeeId(v)}
                options={[{value:'',label:'-- Choose Employee --'}]}
                size="sm"
              />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tax Regime <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <AppDropdown
                value={taxRegime}
                onChange={v => setTaxRegime(v)}
                options={[{value:'New Regime',label:'New Tax Regime'},{value:'Old Regime',label:'Old Tax Regime'}]}
                size="sm"
              />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Financial Year
                  </label>
                  <AppDropdown
                value={financialYear}
                onChange={v => setFinancialYear(v)}
                options={[{value:'2026-27',label:'2026-27'},{value:'2025-26',label:'2025-26'}]}
                size="sm"
              />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Section 80C Declared (₹)
                  </label>
                  <input
                    type="number"
                    value={sec80c}
                    onChange={e => setSec80c(e.target.value)}
                    placeholder="e.g. 150000"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Section 80D Health (₹)
                  </label>
                  <input
                    type="number"
                    value={sec80d}
                    onChange={e => setSec80d(e.target.value)}
                    placeholder="e.g. 25000"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  HRA Exemption / Rent Paid Declared (₹)
                </label>
                <input
                  type="number"
                  value={hraExemption}
                  onChange={e => setHraExemption(e.target.value)}
                  placeholder="e.g. 60000"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
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
                  Submit Declaration
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
