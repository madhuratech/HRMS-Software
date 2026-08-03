import React, { useState } from 'react';
import { Download, Search, DollarSign, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

import { PayslipModal } from './PayslipModal';
import { useToast } from '../ui/Toast';

const MOCK_PAYROLL = [
{ id: 1, name: 'John Doe', role: 'Branch Manager', basic: 5000, allowances: 1000, deductions: 200, netPay: 5800, status: 'PAID', date: '2026-01-30' },
{ id: 2, name: 'Alice Smith', role: 'Sales Manager', basic: 4000, allowances: 800, deductions: 150, netPay: 4650, status: 'PENDING', date: '2026-01-30' },
{ id: 3, name: 'Bob Johnson', role: 'Service Staff', basic: 3000, allowances: 500, deductions: 100, netPay: 3400, status: 'PAID', date: '2026-01-30' },
{ id: 4, name: 'Sarah Williams', role: 'Sales Manager', basic: 4200, allowances: 850, deductions: 180, netPay: 4870, status: 'PROCESSING', date: '2026-01-30' },
{ id: 5, name: 'Mike Brown', role: 'Service Staff', basic: 3100, allowances: 500, deductions: 120, netPay: 3480, status: 'PAID', date: '2026-01-30' }];


export function PayrollSheet() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const { addToast } = useToast();

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING':return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'PROCESSING':return 'bg-blue-100 text-blue-700 border-blue-200';
      default:return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':return <CheckCircle size={14} />;
      case 'PENDING':return <AlertCircle size={14} />;
      case 'PROCESSING':return <Clock size={14} />;
      default:return null;
    }
  };

  const filteredPayroll = MOCK_PAYROLL.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPayout = filteredPayroll.reduce((acc, curr) => acc + curr.netPay, 0);

  return (
    <div className="space-y-6">
      <PayslipModal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee} />
      
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="text-blue-600" /> Payroll Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage employee salaries and payments</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Calendar size={18} /> Jan 2026
          </button>
          <button
            onClick={() => addToast('Payroll sheet exported to CSV', 'success')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors shadow-sm">
            
            <Download size={18} /> Export Sheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Payout</p>
          <h3 className="text-3xl font-bold text-slate-800">${totalPayout.toLocaleString()}</h3>
          <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
            <TrendingUpIcon /> +2.5% from last month
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Pending Payments</p>
          <h3 className="text-3xl font-bold text-yellow-600">
            {filteredPayroll.filter((p) => p.status === 'PENDING').length}
          </h3>
          <p className="mt-2 text-xs text-slate-400">Employees waiting for payment</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Next Pay Date</p>
          <h3 className="text-3xl font-bold text-blue-600">Feb 28</h3>
          <p className="mt-2 text-xs text-slate-400">26 days remaining</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search employee..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
            
          </div>
          <select
            className="w-full md:w-auto px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}>
            
            <option value="ALL">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Basic</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Allowances</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Deductions</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Net Pay</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayroll.map((item) =>
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">
                    <button onClick={() => setSelectedEmployee(item)} className="hover:text-blue-600 hover:underline text-left">
                      {item.name}
                    </button>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{item.role}</td>
                  <td className="p-4 text-sm text-slate-600 text-right">${item.basic.toLocaleString()}</td>
                  <td className="p-4 text-sm text-green-600 text-right">+${item.allowances.toLocaleString()}</td>
                  <td className="p-4 text-sm text-red-600 text-right">-${item.deductions.toLocaleString()}</td>
                  <td className="p-4 font-bold text-slate-800 text-right">${item.netPay.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                    onClick={() => setSelectedEmployee(item)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    
                      View Slip
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}

function TrendingUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>);

}