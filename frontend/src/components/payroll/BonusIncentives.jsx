import React, { useState, useEffect } from 'react';
import AppDropdown from '../ui/AppDropdown';
import { apiFetch } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { usePermissions } from '../../context/PermissionContext';
import { 
  Search, Plus, Gift, Clock, Award, Star, Loader2, AlertCircle, 
  CheckCircle2, XCircle, X, Check, ShieldCheck 
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BonusIncentives() {
  const { addToast } = useToast();
  const { canCreate, canEdit } = usePermissions();
  const [bonuses, setBonuses] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [bonusType, setBonusType] = useState('Performance Bonus');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [applicableMonth, setApplicableMonth] = useState(MONTHS[new Date().getMonth()]);
  const [applicableYear, setApplicableYear] = useState(new Date().getFullYear().toString());

  const loadData = async () => {
    setLoading(true);
    try {
      const [bonusesData, empData] = await Promise.all([
        apiFetch('/payroll/bonuses'),
        apiFetch('/employees?status=Active')
      ]);

      if (Array.isArray(bonusesData)) setBonuses(bonusesData);
      else setBonuses([]);

      if (Array.isArray(empData)) setActiveEmployees(empData);
      else if (empData && Array.isArray(empData.data)) setActiveEmployees(empData.data);
    } catch (err) {
      console.error("Failed to load bonuses:", err);
      addToast('Failed to load bonus & incentive records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBonus = async (e) => {
    e.preventDefault();
    if (!employeeId || !amount) {
      addToast('Please select an employee and specify the bonus amount', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        employee_id: employeeId,
        bonus_type: bonusType,
        amount: parseFloat(amount),
        reason: reason.trim(),
        applicable_month: applicableMonth,
        applicable_year: parseInt(applicableYear, 10)
      };

      const res = await apiFetch('/payroll/bonuses', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        addToast('Bonus record added and approved for payroll!', 'success');
        setShowModal(false);
        setAmount('');
        setReason('');
        loadData();
      } else {
        addToast(res.message || 'Failed to add bonus', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error creating bonus', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await apiFetch(`/payroll/bonuses/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res && res.success) {
        addToast(`Bonus marked as ${newStatus}`, 'success');
        loadData();
      } else {
        addToast(res.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      addToast('Error updating status', 'error');
    }
  };

  const totalBonusAmount = bonuses.reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);
  const pendingBonusAmount = bonuses.filter(b => b.status === 'Pending').reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);
  const approvedBonusAmount = bonuses.filter(b => b.status === 'Approved').reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);
  const processedBonusAmount = bonuses.filter(b => b.status === 'Processed').reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);

  const kpiData = [
    { title: 'Total Bonuses Granted', value: `₹ ${totalBonusAmount.toLocaleString('en-IN')}`, icon: <Gift size={20} color="#2563EB" />, bgColor: '#EFF6FF' },
    { title: 'Approved for Payroll', value: `₹ ${approvedBonusAmount.toLocaleString('en-IN')}`, icon: <Award size={20} color="#10B981" />, bgColor: '#ECFDF5' },
    { title: 'Disbursed in Payslips', value: `₹ ${processedBonusAmount.toLocaleString('en-IN')}`, icon: <ShieldCheck size={20} color="#8B5CF6" />, bgColor: '#F5F3FF' },
    { title: 'Pending Approval', value: `₹ ${pendingBonusAmount.toLocaleString('en-IN')}`, icon: <Clock size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
  ];

  const filteredBonuses = bonuses.filter(b => {
    const q = search.toLowerCase();
    const name = (b.employeeName || '').toLowerCase();
    const type = (b.type || b.bonus_type || '').toLowerCase();
    const code = (b.emp_code || '').toLowerCase();
    return !search.trim() || name.includes(q) || type.includes(q) || code.includes(q);
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
          <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', color: '#1E293B' }}>Bonuses & Incentives</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Manage performance incentives, festival rewards, and auto-link to payroll generation</p>
        </div>
        {canCreate('payroll', 'bonus_incentives') && (
          <button
            onClick={() => {
              setEmployeeId(activeEmployees[0]?.id || '');
              setShowModal(true);
            }}
            style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
          >
            <Plus size={16} /> Add Bonus / Incentive
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
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employee or bonus type..."
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '13px', color: '#334155' }}
            />
          </div>
        </div>

        {/* Table Content */}
        <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', boxSizing: 'border-box' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              <Loader2 className="animate-spin text-blue-600" size={28} style={{ margin: '0 auto 8px' }} />
              <span>Loading bonus records...</span>
            </div>
          ) : filteredBonuses.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
              <AlertCircle size={28} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>No bonus or incentive records found</div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Click "Add Bonus / Incentive" to reward an employee.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Employee</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Department</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Reward Type</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Amount</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Applicable Period</th>
                  <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'center' }}>Payroll Status</th>
                  {canEdit('payroll', 'bonus_incentives') && (
                    <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748B', textAlign: 'right' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredBonuses.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                      {row.employeeName}
                      <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: '500' }}>{row.emp_code}</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>{row.department || 'General'}</td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>{row.bonus_type || row.type}</td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: '#10B981' }}>
                      ₹ {parseFloat(row.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>
                      {row.applicable_month ? `${row.applicable_month} ${row.applicable_year || ''}` : row.date || 'Immediate'}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: row.status === 'Processed' ? '#EFF6FF' : row.status === 'Approved' ? '#ECFDF5' : '#FFFBEB',
                        color: row.status === 'Processed' ? '#2563EB' : row.status === 'Approved' ? '#059669' : '#D97706',
                        border: row.status === 'Processed' ? '1px solid #BFDBFE' : row.status === 'Approved' ? '1px solid #A7F3D0' : '1px solid #FDE68A'
                      }}>
                        {row.status === 'Processed' ? '✓ Processed in Payroll' : row.status}
                      </span>
                    </td>
                    {canEdit('payroll', 'bonus_incentives') && (
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {row.status !== 'Processed' && (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {row.status !== 'Approved' && (
                              <button
                                onClick={() => handleUpdateStatus(row.id, 'Approved')}
                                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #A7F3D0', background: '#ECFDF5', color: '#059669', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                              >
                                <Check size={12} /> Approve
                              </button>
                            )}
                            {row.status !== 'Rejected' && (
                              <button
                                onClick={() => handleUpdateStatus(row.id, 'Rejected')}
                                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                              >
                                <X size={12} /> Reject
                              </button>
                            )}
                          </div>
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

      {/* Modal: Add Bonus */}
      {showModal && canCreate('payroll', 'bonus_incentives') && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '520px', maxWidth: '95vw', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Gift size={18} color="#2563EB" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>Add Bonus / Incentive</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleCreateBonus} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
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
                    Reward Type <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <AppDropdown
                value={bonusType}
                onChange={v => setBonusType(v)}
                options={[{value:'Performance Bonus',label:'Performance Bonus'},{value:'Festival Bonus',label:'Festival Bonus'},{value:'Sales Incentive',label:'Sales Incentive'},{value:'Retention Reward',label:'Retention Reward'},{value:'Spot Award',label:'Spot Award'}]}
                size="sm"
              />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Amount (₹) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Applicable Payroll Month
                  </label>
                  <AppDropdown value={applicableMonth} options={[{value:'m',label:'m'}, ...(MONTHS || [])]} size="sm" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Year
                  </label>
                  <AppDropdown
                value={applicableYear}
                onChange={v => setApplicableYear(v)}
                options={[{value:'2025',label:'2025'},{value:'2026',label:'2026'},{value:'2027',label:'2027'}]}
                size="sm"
              />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Reason / Description
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Exceptional Q3 sales performance achievement"
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
                  Add & Approve
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
