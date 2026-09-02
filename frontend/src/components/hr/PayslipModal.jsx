import React from 'react';
import { Download, Printer, X, Mail, Phone, MapPin } from 'lucide-react';
import { getAuthToken } from '../../lib/api';

export function PayslipModal({ isOpen, onClose, employee }) {
  if (!isOpen || !employee) return null;

  // Real values directly from the database record
  const basic = Number(employee.basic || 0);
  const hra = Number(employee.hra || 0);
  const allowances = Number(employee.allowances || 0);
  const bonus = Number(employee.bonus || 0);
  const otherEarnings = Number(employee.other_earnings || 0);
  const grossEarnings = Number(employee.gross_salary || (basic + hra + allowances + bonus + otherEarnings));

  // Deductions from database
  const pf = Number(employee.pf || 0);
  const esi = Number(employee.esi || 0);
  const tax = Number(employee.tax || 0);
  const lopAmount = Number(employee.lop_amount || 0);
  const otherDeductions = Number(employee.other_deductions || 0);
  const totalDeductions = Number(employee.total_deductions || (pf + esi + tax + lopAmount + otherDeductions));

  const netPay = Number(employee.net_salary || (grossEarnings - totalDeductions));

  // Format currency in INR
  const fmt = (amount) => `₹ ${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const companyName = employee.company?.company_name || 'Madhura Technologies';
  const companyAddress = employee.company?.head_office_address || 'Tamil Nadu, India';
  const companyEmail = employee.company?.official_email || 'hr@madhuratech.com';
  const companyPhone = employee.company?.phone_number || '+91 9876543210';

  const empCode = employee.emp_code || (employee.employee_id ? `EMP${employee.employee_id}` : `EMP${employee.id}`);

  const handleDownload = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/app/payroll/${employee.id}/download-pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Payslip_${empCode}_${employee.month}_${employee.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl animate-in zoom-in-95 my-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl sticky top-0 z-10">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            Payslip Preview
            <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 border border-green-200">
              {employee.month} {employee.year}
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()} 
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Print Payslip"
            >
              <Printer size={18} />
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download size={16} /> Download PDF
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-2">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Payslip Content */}
        <div className="p-8 bg-white" id="payslip-content">
          {/* Company Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                MT
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{companyName}</h1>
                <div className="text-xs text-slate-500 space-y-1 mt-1">
                  <p className="flex items-center gap-1"><MapPin size={10} /> {companyAddress}</p>
                  <p className="flex items-center gap-1"><Phone size={10} /> {companyPhone}</p>
                  <p className="flex items-center gap-1"><Mail size={10} /> {companyEmail}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Salary Payslip</h2>
              <p className="text-sm text-blue-600 font-bold mt-1">{employee.month} {employee.year}</p>
              <p className="text-xs text-slate-500 font-medium">Status: {employee.status || 'Generated'}</p>
            </div>
          </div>

          {/* Employee Details Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Employee Name</span>
                <span className="text-sm font-bold text-slate-900">{employee.employee_name || employee.name}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Employee ID</span>
                <span className="text-sm font-medium text-slate-700">{empCode}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Designation</span>
                <span className="text-sm font-medium text-slate-700">{employee.designation || employee.role || 'Staff'}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Department</span>
                <span className="text-sm font-medium text-slate-700">{employee.department || 'General'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Payment Mode</span>
                <span className="text-sm font-medium text-slate-700">{employee.payment_mode || 'Bank Transfer'}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Loss of Pay (LOP)</span>
                <span className="text-sm font-bold text-slate-900">{employee.lop_days || 0} Day(s)</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Date of Joining</span>
                <span className="text-sm font-medium text-slate-700">
                  {employee.join_date ? new Date(employee.join_date).toLocaleDateString('en-GB') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Disbursement Date</span>
                <span className="text-sm font-medium text-slate-700">
                  {employee.payment_date ? new Date(employee.payment_date).toLocaleDateString('en-GB') : 'Pending Disbursement'}
                </span>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
            <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-300">
              <div className="p-3 font-bold text-slate-700 uppercase text-xs border-r border-slate-300">Earnings</div>
              <div className="p-3 font-bold text-slate-700 uppercase text-xs">Deductions</div>
            </div>
            
            <div className="grid grid-cols-2">
              {/* Earnings Column */}
              <div className="border-r border-slate-300">
                <div className="divide-y divide-slate-100">
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Basic Salary</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(basic)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(hra)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Special & Other Allowances</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(allowances)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Performance Bonus</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(bonus)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Other Earnings</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(otherEarnings)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div>
                <div className="divide-y divide-slate-100">
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Provident Fund (PF - 12%)</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(pf)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Employee State Insurance (ESI)</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(esi)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Statutory Tax / PT / TDS</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(tax)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Loss of Pay (LOP)</span>
                    <span className="text-sm font-medium text-red-600">{fmt(lopAmount)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Other Deductions / Loan EMI</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(otherDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Totals Row */}
            <div className="grid grid-cols-2 bg-slate-50 border-t border-slate-300">
              <div className="p-3 border-r border-slate-300 flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Total Earnings (A)</span>
                <span className="font-bold text-slate-900 text-sm">{fmt(grossEarnings)}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Total Deductions (B)</span>
                <span className="font-bold text-red-600 text-sm">- {fmt(totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay & Summary */}
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
            <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Annual Cost to Company (CTC)</span>
              <span className="text-xl font-bold text-slate-700">{fmt(grossEarnings * 12)} / Year</span>
            </div>
            <div className="flex-1 bg-green-50 p-4 rounded-lg border border-green-100 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-green-700 uppercase block mb-1">Net Pay Payable (A - B)</span>
                <span className="text-2xl font-bold text-green-800">{fmt(netPay)}</span>
              </div>
              <div className="text-xs text-green-700 font-bold bg-green-100 px-3 py-1.5 rounded-full">
                {employee.payment_mode || 'Bank Transfer'}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-slate-200 pt-6 text-center">
            <p className="text-xs text-slate-400 italic">This is a system-generated payslip generated by Madhura HRMS and does not require a physical signature.</p>
            <p className="text-xs text-slate-400 mt-1">{companyName} | Confidential Salary Document</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PayslipModal;