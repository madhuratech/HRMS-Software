import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { 
  Search, Plus, CreditCard, PiggyBank, CalendarClock, HandCoins, 
  Loader2, AlertCircle, CheckCircle2, X, Check, Clock 
} from 'lucide-react';

export default function LoansAdvances() {
  const { addToast } = useToast();
  const [loans, setLoans] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [type, setType] = useState('Personal Loan');
  const [amount, setAmount] = useState('');
  const [tenure, setTenure] = useState('10');
  const [emi, setEmi] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loansData, empData] = await Promise.all([
        apiFetch('/payroll/loans'),
        apiFetch('/employees?status=Active')
      ]);

      if (Array.isArray(loansData)) setLoans(loansData);
      else setLoans([]);

      if (Array.isArray(empData)) setActiveEmployees(empData);
      else if (empData && Array.isArray(empData.data)) setActiveEmployees(empData.data);
    } catch (err) {
      console.error("Failed to load loans:", err);
      addToast('Failed to load loans and advances', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAmountOrTenureChange = (newAmount, newTenure) => {
    const a = parseFloat(newAmount) || 0;
    const t = parseInt(newTenure, 10) || 1;
    if (a > 0 && t > 0) {
      setEmi(Math.round(a / t));
    }
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    if (!employeeId || !amount) {
      addToast('Please select an employee and specify the loan amount', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        employee_id: employeeId,
        type,
        amount: parseFloat(amount),
        tenure_months: parseInt(tenure, 10) || 12,
        emi: parseFloat(emi) || (parseFloat(amount) / (parseInt(tenure, 10) || 12)),
        start_date: startDate
      };

      const res = await apiFetch('/payroll/loans', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        addToast('Loan / Salary Advance created and activated!', 'success');
        setShowModal(false);
        setAmount('');
        setEmi('');
        loadData();
      } else {
        addToast(res.message || 'Failed to create loan', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error creating loan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await apiFetch(`/payroll/loans/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res && res.success) {
        addToast(`Loan status updated to ${newStatus}`, 'success');
        loadData();
      } else {
        addToast(res.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      addToast('Error updating status', 'error');
    }
  };

  const totalDisbursed = loans.reduce((acc, l) => acc + (parseFloat(l.amount) || 0), 0);
  const totalRemaining = loans.filter(l => l.status === 'Active').reduce((acc, l) => {
    const rem = l.remaining_amount !== null && l.remaining_amount !== undefined ? parseFloat(l.remaining_amount) : parseFloat(l.amount);
    return acc + rem;
  }, 0);
  const totalMonthlyEmi = loans.filter(l => l.status === 'Active').reduce((acc, l) => acc + (parseFloat(l.emi) || 0), 0);
  const activeCount = loans.filter(l => l.status === 'Active').length;

  const kpiData = [
    { title: 'Active Loans', value: String(activeCount), icon: <CreditCard size={20} color="#2563EB" />, bgColor: '#EFF6FF' },
    { title: 'Total Disbursed', value: `₹ ${totalDisbursed.toLocaleString('en-IN')}`, icon: <PiggyBank size={20} color="#10B981" />, bgColor: '#ECFDF5' },
    { title: 'Monthly EMI Recovery', value: `₹ ${totalMonthlyEmi.toLocaleString('en-IN')}`, icon: <CalendarClock size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
    { title: 'Outstanding Balance', value: `₹ ${totalRemaining.toLocaleString('en-IN')}`, icon: <HandCoins size={20} color="#8B5CF6" />, bgColor: '#F5F3FF' },
  ];

  const filteredLoans = loans.filter(l => {
    const q = search.toLowerCase();
    const name = (l.employee_name || '').toLowerCase();
    const code = (l.emp_code || '').toLowerCase();
    const t = (l.type || '').toLowerCase();
    return !search.trim() || name.includes(q) || code.includes(q) || t.includes(q);
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
          <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', color: '#1E293B' }}>Loans & Salary Advances</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Employee loan disbursements, remaining balance tracking, and automated payroll EMI deductions</p>
        </div>
        <button
          onClick={() => {
            setEmployeeId(activeEmployees[0]?.id || '');
            setAmount('');
            setTenure('12');
            setEmi('');
            setShowModal(true);
          }}
          style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
        >
          <Plus size={16} /> New Loan / Advance
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
          <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employee or loan type..."
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '13px', color: '#334155', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Table Content */}
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', boxSizing: 'border-box' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              <Loader2 className="animate-spin text-blue-600" size={28} style={{ margin: '0 auto 8px' }} />
              <span>Loading loans and advances...</span>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
              <AlertCircle size={28} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>No loan records found</div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Click "New Loan / Advance" to create an employee loan.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Employee</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Department</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Loan Type</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Principal Amount</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Monthly EMI</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Remaining Balance</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((row) => {
                  const rem = row.remaining_amount !== null && row.remaining_amount !== undefined ? parseFloat(row.remaining_amount) : parseFloat(row.amount);
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                        {row.employee_name}
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: '500' }}>{row.emp_code}</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>{row.department || 'General'}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>{row.type}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                        ₹ {parseFloat(row.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: '#2563EB' }}>
                        ₹ {parseFloat(row.emi || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: rem <= 0 ? '#10B981' : '#DC2626' }}>
                        ₹ {rem.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: row.status === 'Active' ? '#ECFDF5' : row.status === 'Closed' ? '#F1F5F9' : '#FFFBEB',
                          color: row.status === 'Active' ? '#059669' : row.status === 'Closed' ? '#64748B' : '#D97706',
                          border: row.status === 'Active' ? '1px solid #A7F3D0' : row.status === 'Closed' ? '1px solid #CBD5E1' : '1px solid #FDE68A'
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {row.status !== 'Closed' && (
                            <button
                              onClick={() => handleUpdateStatus(row.id, row.status === 'Active' ? 'Paused' : 'Active')}
                              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', color: '#475569', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              {row.status === 'Active' ? 'Pause' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: New Loan / Advance */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '520px', maxWidth: '95vw', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={18} color="#2563EB" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>Create Employee Loan / Advance</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Select Employee <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  required
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
                >
                  <option value="">-- Choose Employee --</option>
                  {activeEmployees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.employee_id || `EMP${e.id}`}) • {e.department || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Loan / Advance Type <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
                  >
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Salary Advance">Salary Advance</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Emergency Medical Advance">Emergency Medical Advance</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Principal Amount (₹) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => {
                      setAmount(e.target.value);
                      handleAmountOrTenureChange(e.target.value, tenure);
                    }}
                    placeholder="e.g. 50000"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tenure (Months)
                  </label>
                  <input
                    type="number"
                    value={tenure}
                    onChange={e => {
                      setTenure(e.target.value);
                      handleAmountOrTenureChange(amount, e.target.value);
                    }}
                    placeholder="e.g. 10"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Monthly EMI Deduction (₹)
                  </label>
                  <input
                    type="number"
                    value={emi}
                    onChange={e => setEmi(e.target.value)}
                    placeholder="e.g. 5000"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Deduction Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
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
                  Activate Loan
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
