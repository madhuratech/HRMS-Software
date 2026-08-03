import React, { useState } from 'react';
import { Search, Filter, Download, Plus, MoreVertical, Layers, TrendingUp, TrendingDown, Landmark, X, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const tableDataInit = [
  { id: 1, name: 'Basic Salary', type: 'Earning', taxable: 'Yes', formula: '40% of CTC', freq: 'Monthly', status: 'Active' },
  { id: 2, name: 'House Rent Allowance (HRA)', type: 'Earning', taxable: 'Partial', formula: '50% of Basic', freq: 'Monthly', status: 'Active' },
  { id: 3, name: 'Special Allowance', type: 'Earning', taxable: 'Yes', formula: 'Fixed Amount', freq: 'Monthly', status: 'Active' },
  { id: 4, name: 'Provident Fund (Employee)', type: 'Deduction', taxable: 'No', formula: '12% of Basic', freq: 'Monthly', status: 'Active' },
  { id: 5, name: 'Professional Tax', type: 'Deduction', taxable: 'No', formula: 'Slab Based', freq: 'Monthly', status: 'Active' },
  { id: 6, name: 'TDS', type: 'Deduction', taxable: 'No', formula: 'Tax Slab', freq: 'Monthly', status: 'Active' },
  { id: 7, name: 'Annual Bonus', type: 'Earning', taxable: 'Yes', formula: 'Performance Based', freq: 'Yearly', status: 'Active' },
];

export default function SalaryComponents() {
  const [components, setComponents] = useState(tableDataInit);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Earning');
  const [taxable, setTaxable] = useState('Yes');
  const [formula, setFormula] = useState('');
  const [freq, setFreq] = useState('Monthly');
  const [status, setStatus] = useState('Active');

  const handleOpenModal = () => {
    setName('');
    setType('Earning');
    setTaxable('Yes');
    setFormula('');
    setFreq('Monthly');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !formula) {
      alert("Please fill in component name and formula.");
      return;
    }

    const newComponent = {
      id: components.length + 1,
      name,
      type,
      taxable,
      formula,
      freq,
      status
    };

    setComponents([newComponent, ...components]);
    setIsModalOpen(false);

    // Show toast
    setToastMessage(`Salary component "${name}" added successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Recalculate KPI numbers
  const totalCount = components.length;
  const earningsCount = components.filter(c => c.type === 'Earning').length;
  const deductionsCount = components.filter(c => c.type === 'Deduction').length;
  const contributionsCount = components.filter(c => c.type === 'Contribution').length;

  const kpis = [
    { title: 'Total Components', value: totalCount, icon: <Layers size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
    { title: 'Earnings', value: earningsCount, icon: <TrendingUp size={20} color="#10B981" />, bgColor: '#ECFDF5' },
    { title: 'Deductions', value: deductionsCount, icon: <TrendingDown size={20} color="#EF4444" />, bgColor: '#FEF2F2' },
    { title: 'Employer Contributions', value: contributionsCount, icon: <Landmark size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
  ];

  // Recalculate Pie Chart distribution data
  const pieData = [
    { name: 'Earnings', value: earningsCount || 1, color: '#10B981' },
    { name: 'Deductions', value: deductionsCount || 0, color: '#EF4444' },
    { name: 'Contributions', value: contributionsCount || 0, color: '#F59E0B' },
  ];

  // Filter & Search Logic
  const filteredComponents = components.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || c.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 1000, background: '#10B981', color: '#FFF', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: '600', fontSize: '14px' }}>{toastMessage}</span>
        </div>
      )}

      {/* Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Components..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '14px', fontWeight: '500', color: '#334155', cursor: 'pointer', outline: 'none' }}>
              <option value="All">All Types</option>
              <option value="Earning">Earnings</option>
              <option value="Deduction">Deductions</option>
              <option value="Contribution">Contributions</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Download size={16} /> Export
          </button>
          <button 
            onClick={handleOpenModal}
            style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <Plus size={16} /> Add Component
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: kpi.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '4px' }}>{kpi.title}</div>
              <div style={{ fontSize: '24px', color: '#1E293B', fontWeight: '700' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>

        {/* Main Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', height: '100%' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Salary Components</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Component Name</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Taxable</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Formula / Amount</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Frequency</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComponents.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>{row.name}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: row.type === 'Earning' ? '#ECFDF5' : row.type === 'Deduction' ? '#FEF2F2' : '#FFFBEB',
                        color: row.type === 'Earning' ? '#10B981' : row.type === 'Deduction' ? '#EF4444' : '#D97706'
                      }}>
                        {row.type}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.taxable}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.formula}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.freq}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: row.status === 'Active' ? '#ECFDF5' : '#FEF2F2',
                        color: row.status === 'Active' ? '#10B981' : '#EF4444'
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><MoreVertical size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '60%' }}>
          <div style={{ ...cardStyle, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Component Distribution</h3>
            <div style={{ width: '100%', flex: 1, minHeight: '150px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
              {pieData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal Backdrop & Add Component Form */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#FFF', borderRadius: '16px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>Add Salary Component</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>Add a new earning, deduction, or contribution component</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
              
              {/* Component Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Component Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Travel Allowance, LTA, Gratuity" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  required
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              {/* Component Type & Taxable */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Component Type</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '14px' }}>
                    <option value="Earning">Earning</option>
                    <option value="Deduction">Deduction</option>
                    <option value="Contribution">Employer Contribution</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Taxable Status</label>
                  <select 
                    value={taxable} 
                    onChange={e => setTaxable(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '14px' }}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>

              {/* Formula & Frequency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Formula / Flat Amount *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 10% of Basic, Fixed, slab-based" 
                    value={formula} 
                    onChange={e => setFormula(e.target.value)}
                    required
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Pay Frequency</label>
                  <select 
                    value={freq} 
                    onChange={e => setFreq(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '14px' }}>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              {/* Status */}
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
                  Save Component
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

