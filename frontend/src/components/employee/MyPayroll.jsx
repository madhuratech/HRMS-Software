import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Eye, Download, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export function MyPayroll() {
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [userName, setUserName] = useState('Dhilipan P');
  const [empId, setEmpId] = useState('EMP0015');

  useEffect(() => {
    const auth = localStorage.getItem('hrms_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed.user && parsed.user.name) setUserName(parsed.user.name);
        if (parsed.user && parsed.user.emp_id) setEmpId(parsed.user.emp_id);
      } catch (e) {}
    }

    const fetchPayrollData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/payroll');
        if (res && res.success && Array.isArray(res.data)) {
          const formatted = res.data.map((p, idx) => ({
            id: p.id || `PAY-${idx + 1}`,
            month: p.month || p.payroll_period || 'July 2026',
            basic: p.basic_salary ? `₹${Number(p.basic_salary).toLocaleString()}` : '₹30,000',
            hra: p.hra ? `₹${Number(p.hra).toLocaleString()}` : '₹12,000',
            allowances: p.allowances ? `₹${Number(p.allowances).toLocaleString()}` : '₹6,800',
            deductions: p.deductions ? `₹${Number(p.deductions).toLocaleString()}` : '₹3,000',
            net: p.net_salary ? `₹${Number(p.net_salary).toLocaleString()}` : '₹45,800',
            status: p.status || 'Paid',
            date: p.processed_date || '01 Aug 2026'
          }));
          setPayslips(formatted);
        } else {
          setPayslips([]);
        }
      } catch (err) {
        console.error("Failed to load payroll database records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, []);

  const filtered = selectedMonth === 'All Months' 
    ? payslips 
    : payslips.filter(p => p.month === selectedMonth);

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
    border: '1px solid #E5E7EB'
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm font-semibold text-slate-600">Loading payroll records...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="space-y-6">

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        borderRadius: '16px',
        padding: '24px 32px',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px -5px rgba(37,99,235,0.25)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>My Salary & Payslips</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#DBEAFE' }}>
            Private Payroll Record • {userName} ({empId})
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          padding: '8px 16px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={16} /> Confidential
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div style={cardStyle}>
          <span className="text-xs font-semibold text-slate-400 block mb-1">Current Monthly Salary</span>
          <strong className="text-2xl font-extrabold text-blue-600">
            {payslips.length > 0 ? payslips[0].net : '₹ 45,800'}
          </strong>
          <span className="text-[11px] text-slate-500 block mt-2">Net Pay (Disbursed via Bank Transfer)</span>
        </div>

        <div style={cardStyle}>
          <span className="text-xs font-semibold text-slate-400 block mb-1">Annual CTC</span>
          <strong className="text-2xl font-extrabold text-slate-800">₹ 6,00,000</strong>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-2">Active Structure 2026</span>
        </div>

        <div style={cardStyle}>
          <span className="text-xs font-semibold text-slate-400 block mb-1">Bank Details</span>
          <strong className="text-sm font-bold text-slate-800 block">HDFC Bank • ****4829</strong>
          <span className="text-[11px] text-slate-500 block mt-1">IFSC: HDFC0001234</span>
        </div>
      </div>

      {/* Payslip History Table */}
      <div style={cardStyle}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payslip History</h3>
            <p className="text-xs text-slate-500">View and download your monthly salary statements</p>
          </div>
          <div className="w-48">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white outline-none cursor-pointer"
            >
              <option>All Months</option>
              {payslips.map(p => <option key={p.id}>{p.month}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs">
            <AlertCircle size={24} className="mx-auto mb-2 text-slate-300" />
            No payroll records found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Basic</th>
                  <th className="py-3 px-4">HRA</th>
                  <th className="py-3 px-4">Allowances</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Salary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.month}</td>
                    <td className="py-3 px-4 text-slate-600">{row.basic}</td>
                    <td className="py-3 px-4 text-slate-600">{row.hra}</td>
                    <td className="py-3 px-4 text-slate-600">{row.allowances}</td>
                    <td className="py-3 px-4 text-rose-600 font-semibold">{row.deductions}</td>
                    <td className="py-3 px-4 font-extrabold text-blue-600">{row.net}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg transition-colors inline-flex items-center gap-1 text-[11px]">
                        <Download size={13} /> Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default MyPayroll;
