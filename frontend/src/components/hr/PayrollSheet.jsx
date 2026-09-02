import React, { useState, useEffect } from 'react';
import { Download, Search, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { PayslipModal } from './PayslipModal';
import { useToast } from '../ui/Toast';
import { apiFetch, getAuthToken } from '../../lib/api';

export function PayrollSheet() {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/payroll');
        if (res && res.success && Array.isArray(res.data)) {
          setPayrollData(res.data);
        } else if (Array.isArray(res)) {
          setPayrollData(res);
        } else {
          setPayrollData([]);
        }
      } catch (err) {
        console.error("Failed to load payroll sheet data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, []);

  const getStatusColor = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
      case 'APPROVED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'GENERATED':
      case 'PROCESSING': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'PAID': return <CheckCircle size={14} />;
      case 'APPROVED': return <CheckCircle size={14} />;
      case 'GENERATED':
      case 'PROCESSING': return <Clock size={14} />;
      case 'DRAFT': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  const filteredPayroll = payrollData.filter((item) => {
    const name = (item.employee_name || item.name || '').toLowerCase();
    const code = (item.emp_code || item.employee_id || '').toString().toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || String(item.status).toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPayout = filteredPayroll.reduce((acc, curr) => acc + Number(curr.net_salary || curr.netPay || 0), 0);

  const handleDownloadPdf = async (record) => {
    try {
      addToast('Downloading payslip PDF...', 'info');
      const token = getAuthToken();
      const res = await fetch(`/app/payroll/${record.id}/download-pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip_${record.emp_code || record.employee_id}_${record.month}_${record.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast('Downloaded successfully', 'success');
    } catch (e) {
      addToast('Download failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PayslipModal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee} 
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="text-blue-600" /> Payroll Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage employee salaries, disbursements, and payslips</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium">
            <Calendar size={18} /> Real Database Records
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Net Payout</p>
          <h3 className="text-3xl font-bold text-slate-800">₹ {totalPayout.toLocaleString('en-IN')}</h3>
          <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
            Calculated across {filteredPayroll.length} records
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Pending Payments</p>
          <h3 className="text-3xl font-bold text-yellow-600">
            {filteredPayroll.filter((p) => String(p.status).toUpperCase() !== 'PAID').length}
          </h3>
          <p className="mt-2 text-xs text-slate-400">Generated / Approved awaiting disbursement</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Disbursed Records</p>
          <h3 className="text-3xl font-bold text-blue-600">
            {filteredPayroll.filter((p) => String(p.status).toUpperCase() === 'PAID').length}
          </h3>
          <p className="mt-2 text-xs text-slate-400">Paid via bank transfer</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {['ALL', 'GENERATED', 'APPROVED', 'PAID'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={28} />
              <span>Loading payroll records...</span>
            </div>
          ) : filteredPayroll.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No payroll records found in the database.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Basic</th>
                  <th className="p-4">Allowances</th>
                  <th className="p-4">Deductions</th>
                  <th className="p-4">Net Salary</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPayroll.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-800">
                      <div>{item.employee_name || item.name}</div>
                      <div className="text-xs text-slate-400">{item.emp_code || `EMP${item.employee_id}`} • {item.designation || item.role || 'Staff'}</div>
                    </td>
                    <td className="p-4 text-slate-600">{item.month} {item.year}</td>
                    <td className="p-4 text-slate-600">₹ {Number(item.basic || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-slate-600">₹ {Number((item.allowances || 0) + (item.hra || 0)).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-red-600 font-medium">- ₹ {Number(item.total_deductions || item.deductions || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4 font-bold text-slate-900">₹ {Number(item.net_salary || item.netPay || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status || 'Generated'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedEmployee(item)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg text-xs hover:bg-blue-100 transition-colors"
                      >
                        View Payslip
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(item)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center"
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default PayrollSheet;