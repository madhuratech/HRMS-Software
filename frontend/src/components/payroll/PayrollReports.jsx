import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Search, Filter, Download, LineChart, FileText, IndianRupee, PieChart as PieChartIcon } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function PayrollReports() {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/payroll/reports')
      .then(data => {
        setReportsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load payroll reports:", err);
        setLoading(false);
      });
  }, []);

  const totalPayrollFormatted = reportsData ? `₹ ${(reportsData.totalPayroll / 100000).toFixed(1)} L` : '₹ 0.0 L';
  const ytdGrossFormatted = reportsData ? `₹ ${(reportsData.ytdGross / 100000).toFixed(1)} L` : '₹ 0.0 L';
  const ytdDeductionsFormatted = reportsData ? `₹ ${(reportsData.ytdDeductions / 100000).toFixed(1)} L` : '₹ 0.0 L';
  const ytdNetFormatted = reportsData ? `₹ ${(reportsData.ytdNet / 100000).toFixed(1)} L` : '₹ 0.0 L';

  const kpiData = [
    { title: 'Total Payroll (Current)', value: totalPayrollFormatted, icon: <IndianRupee size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
    { title: 'Gross Salary YTD', value: ytdGrossFormatted, icon: <LineChart size={20} color="#10B981" />, bgColor: '#ECFDF5' },
    { title: 'Total Deductions YTD', value: ytdDeductionsFormatted, icon: <PieChartIcon size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
    { title: 'Net Salary Paid YTD', value: ytdNetFormatted, icon: <FileText size={20} color="#8B5CF6" />, bgColor: '#F5F3FF' },
  ];

  const areaData = [
    { month: 'Apr', Payroll: (reportsData?.totalPayroll || 100000) * 0.9 },
    { month: 'May', Payroll: (reportsData?.totalPayroll || 100000) * 0.95 },
    { month: 'Jun', Payroll: (reportsData?.totalPayroll || 100000) },
    { month: 'Jul', Payroll: (reportsData?.totalPayroll || 100000) * 1.02 },
    { month: 'Aug', Payroll: (reportsData?.totalPayroll || 100000) * 1.05 },
  ];

  const barData = reportsData?.departmentSalaries || [];

  const pieData = [
    { name: 'Basic Salary', value: 40, color: '#2952E3' },
    { name: 'Allowances', value: 30, color: '#10B981' },
    { name: 'Bonus', value: 15, color: '#F59E0B' },
    { name: 'Employer PF/ESI', value: 15, color: '#8B5CF6' },
  ];

  const tableData = [
    { id: 1, name: 'Monthly Payroll Register', type: 'Payroll Register', date: new Date().toLocaleDateString('en-GB'), by: 'HR Admin' },
    { id: 2, name: 'PF Remittance Report', type: 'Statutory', date: new Date().toLocaleDateString('en-GB'), by: 'System Auto' },
    { id: 3, name: 'TDS Deduction Summary', type: 'Tax Report', date: new Date().toLocaleDateString('en-GB'), by: 'Finance Dept' }
  ];
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Reports..."
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Filter size={16} /> Date Range
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            <Download size={16} /> Custom Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {kpiData.map((kpi, idx) => (
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

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Monthly Payroll Trend</h3>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2952E3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2952E3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dx={-10} tickFormatter={(val) => `${val / 10000000}Cr`} />
                <Tooltip />
                <Area type="monotone" dataKey="Payroll" stroke="#2952E3" fillOpacity={1} fill="url(#colorPayroll)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Department Cost Comparison</h3>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dx={-10} tickFormatter={(val) => `${val / 10000000}Cr`} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="Salary" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Payroll Cost Distribution</h3>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        {/* Main Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Generated Reports</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Report Name</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Report Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Generated Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Generated By</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} color="#94A3B8" />
                        {row.name}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#F1F5F9', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{row.type}</span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.date}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.by}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2952E3', fontSize: '13px', fontWeight: '600' }}>View</button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><Download size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Quick Reports</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Payroll Register', 'Salary Register', 'Bank Transfer Report', 'PF Report', 'ESI Report', 'Tax Report'].map((report, idx) => (
                <div key={idx} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', ':hover': { borderColor: '#2952E3', background: '#EFF6FF' } }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', fontWeight: '500' }}>
                    <FileText size={16} color="#94A3B8" />
                    {report}
                  </div>
                  <Download size={14} color="#94A3B8" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
