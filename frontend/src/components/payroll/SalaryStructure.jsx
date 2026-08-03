import React, { useState } from 'react';
import { Plus, Edit2, Eye, Building2, CheckCircle2, Wallet, Users, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';

const kpiDataInit = [
  { title: 'Total Structures', value: 12, icon: <Building2 size={24} color="#2952E3" />, bgColor: '#EFF6FF', suffix: '' },
  { title: 'Active Structures', value: 8, icon: <CheckCircle2 size={24} color="#2952E3" />, bgColor: '#EFF6FF', suffix: '' },
  { title: 'Average CTC (LPA)', value: 8.5, icon: <Wallet size={24} color="#8B5CF6" />, bgColor: '#F5F3FF', suffix: 'L' },
  { title: 'Employees Mapped', value: 245, icon: <Users size={24} color="#2952E3" />, bgColor: '#EFF6FF', suffix: '' },
];

const tableDataInit = [
  { id: 1, name: 'Default Structure', code: 'STR-001', freq: 'Monthly', amount: 85000, date: '2024-04-01', employees: 156, status: 'Active' },
  { id: 2, name: 'Manager Structure', code: 'STR-002', freq: 'Monthly', amount: 145000, date: '2024-04-01', employees: 45, status: 'Active' },
  { id: 3, name: 'Sales Structure', code: 'STR-003', freq: 'Monthly', amount: 65000, date: '2024-05-01', employees: 28, status: 'Active' },
  { id: 4, name: 'Intern Structure', code: 'STR-004', freq: 'Monthly', amount: 15000, date: '2024-06-01', employees: 10, status: 'Inactive' },
  { id: 5, name: 'Executive Structure', code: 'STR-005', freq: 'Monthly', amount: 210000, date: '2024-07-01', employees: 20, status: 'Active' },
  { id: 6, name: 'Hourly Structure', code: 'STR-006', freq: 'Hourly', amount: 800, date: '2024-07-01', employees: 12, status: 'Inactive' },
];

export default function SalaryStructure() {
  const [structures, setStructures] = useState(tableDataInit);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [freq, setFreq] = useState('Monthly');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Active');
  
  // Salary breakdown inputs
  const [basic, setBasic] = useState('');
  const [hra, setHra] = useState('');
  const [special, setSpecial] = useState('');
  const [pf, setPf] = useState('');
  const [tax, setTax] = useState('');

  // Auto-calculate Gross / Total
  const calculatedTotal = (Number(basic) || 0) + (Number(hra) || 0) + (Number(special) || 0) - (Number(pf) || 0) - (Number(tax) || 0);

  const handleOpenModal = () => {
    // Reset form fields
    setName('');
    setCode(`STR-0${structures.length + 1}`);
    setFreq('Monthly');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('Active');
    setBasic('');
    setHra('');
    setSpecial('');
    setPf('');
    setTax('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !code) {
      alert("Please fill in structure name and code.");
      return;
    }

    const newStructure = {
      id: structures.length + 1,
      name,
      code,
      freq,
      amount: freq === 'Hourly' ? calculatedTotal : calculatedTotal || 30000, // fallback if zero
      date: date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Aug 2026',
      employees: 0,
      status
    };

    setStructures([newStructure, ...structures]);
    setIsModalOpen(false);

    // Show toast
    setToastMessage(`Salary structure "${name}" added successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Re-calculate KPIs
  const totalCount = structures.length;
  const activeCount = structures.filter(s => s.status === 'Active').length;
  
  // Calculate average CTC of monthly structures
  const monthlyStructures = structures.filter(s => s.freq === 'Monthly');
  const avgMonthly = monthlyStructures.reduce((acc, curr) => acc + curr.amount, 0) / (monthlyStructures.length || 1);
  const avgCTCVal = ((avgMonthly * 12) / 100000).toFixed(1);

  const kpis = [
    { title: 'Total Structures', value: totalCount, icon: <Building2 size={24} color="#2952E3" />, bgColor: '#EFF6FF', suffix: '' },
    { title: 'Active Structures', value: activeCount, icon: <CheckCircle2 size={24} color="#2952E3" />, bgColor: '#EFF6FF', suffix: '' },
    { title: 'Average CTC (LPA)', value: `₹ ${avgCTCVal}`, icon: <Wallet size={24} color="#8B5CF6" />, bgColor: '#F5F3FF', suffix: 'L' },
    { title: 'Employees Mapped', value: structures.reduce((acc, curr) => acc + curr.employees, 0), icon: <Users size={24} color="#2952E3" />, bgColor: '#EFF6FF', suffix: '' },
  ];

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0', background: '#F8FAFC', minHeight: '100%', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 1000, background: '#10B981', color: '#FFF', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'slideIn 0.3s ease' }}>
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: '600', fontSize: '14px' }}>{toastMessage}</span>
        </div>
      )}

      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Salary Structure</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Manage and configure salary structures</p>
        </div>
        <button 
          onClick={handleOpenModal}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'background 0.2s' }}>
          <Plus size={16} /> Add Structure
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: kpi.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '8px' }}>{kpi.title}</div>
              <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700' }}>
                {kpi.value}{kpi.suffix}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Structure Name</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Structure Code</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Monthly Salary</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Pay Frequency</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Effective From</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Employees</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {structures.map((row, index) => (
                <tr key={row.id} style={{ borderBottom: index === structures.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                  <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '600', color: '#334155', whiteSpace: 'nowrap' }}>{row.name}</td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.code}</td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '600', color: '#1E293B', whiteSpace: 'nowrap' }}>
                    {row.freq === 'Hourly' ? `₹ ${row.amount}/hr` : `₹ ${row.amount.toLocaleString('en-IN')}`}
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.freq}</td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.date}</td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.employees}</td>
                  <td style={{ padding: '20px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      backgroundColor: row.status === 'Active' ? '#ECFDF5' : '#FEF2F2', 
                      color: row.status === 'Active' ? '#10B981' : '#EF4444' 
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <button style={{ background: '#EFF6FF', border: 'none', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', color: '#2952E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={14} /></button>
                      <button style={{ background: '#EFF6FF', border: 'none', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', color: '#2952E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
          Showing 1 to {structures.length} of {structures.length} entries
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', color: '#64748B' }}>
            <ChevronLeft size={18} />
          </button>
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2952E3', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#FFF', fontSize: '14px', fontWeight: '500' }}>
            1
          </button>
          <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', color: '#64748B' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Modal Backdrop & Add Structure Form */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#FFF', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', transform: 'scale(1)', transition: 'all 0.3s ease' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>Add New Salary Structure</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>Create a custom pay structure with defined earnings and deductions</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
              
              {/* Row 1: General Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Structure Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Executive, Designer, Intern" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Structure Code *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. STR-007" 
                    value={code} 
                    onChange={e => setCode(e.target.value)}
                    required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Row 2: Frequency & Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Pay Frequency</label>
                  <select 
                    value={freq} 
                    onChange={e => setFreq(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '14px', outline: 'none' }}>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Effective From</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Row 3: Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Status</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" checked={status === 'Active'} onChange={() => setStatus('Active')} style={{ accentColor: '#2952E3' }} /> Active
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                    <input type="radio" checked={status === 'Inactive'} onChange={() => setStatus('Inactive')} style={{ accentColor: '#2952E3' }} /> Inactive
                  </label>
                </div>
              </div>

              {/* Section: Salary Components */}
              <div style={{ marginTop: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#334155' }}>Salary Break-down / Monthly Components</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Earnings column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#059669', borderBottom: '1px solid #E6F4EA', paddingBottom: '4px' }}>EARNINGS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', color: '#64748B' }}>Basic Pay (₹)</label>
                      <input type="number" placeholder="0" value={basic} onChange={e => setBasic(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', color: '#64748B' }}>House Rent Allowance (HRA) (₹)</label>
                      <input type="number" placeholder="0" value={hra} onChange={e => setHra(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', color: '#64748B' }}>Special Allowance (₹)</label>
                      <input type="number" placeholder="0" value={special} onChange={e => setSpecial(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }} />
                    </div>
                  </div>

                  {/* Deductions column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#DC2626', borderBottom: '1px solid #FCE8E6', paddingBottom: '4px' }}>DEDUCTIONS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', color: '#64748B' }}>Provident Fund (PF) (₹)</label>
                      <input type="number" placeholder="0" value={pf} onChange={e => setPf(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', color: '#64748B' }}>Professional Tax (₹)</label>
                      <input type="number" placeholder="0" value={tax} onChange={e => setTax(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Calculation Banner */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0', marginTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Calculated Net Pay:</span>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B', marginTop: '2px' }}>
                    ₹ {calculatedTotal.toLocaleString('en-IN')}
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#94a3b8' }}> / {freq === 'Hourly' ? 'hr' : 'month'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '11px', color: '#64748B' }}>
                  <AlertCircle size={14} /> Auto-calculates as you type
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  Save Structure
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
