import React from 'react';
import { Download, Printer, X, Mail, Phone, MapPin } from 'lucide-react';







export function PayslipModal({ isOpen, onClose, employee }) {
  if (!isOpen || !employee) return null;

  // Calculate salary breakdown based on Basic + Allowances
  // This is mock logic to distribute the totals into specific components
  const basic = employee.basic;
  const hra = Math.round(basic * 0.4);
  const conveyance = 1600;
  const medical = 1250;
  const specialAllowance = employee.allowances - hra - conveyance - medical;
  const grossEarnings = basic + hra + conveyance + medical + (specialAllowance > 0 ? specialAllowance : 0) + 500; // Adding mock bonus/overtime

  // Deductions
  const pf = Math.round(basic * 0.12);
  const esi = Math.round(grossEarnings * 0.0075);
  const pt = 200;
  const tds = Math.round(grossEarnings * 0.05); // Mock TDS
  const totalDeductions = pf + esi + pt + tds + 50; // +50 other

  const netPay = grossEarnings - totalDeductions;

  // Format currency
  const fmt = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl animate-in zoom-in-95 my-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl sticky top-0 z-10">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            Payslip Preview
            <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 border border-green-200">
              {employee.month || 'January 2026'}
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Printer size={18} />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
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
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                BM
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">HAWKEYE NEST Corp.</h1>
                <div className="text-xs text-slate-500 space-y-1 mt-1">
                  <p className="flex items-center gap-1"><MapPin size={10} /> 123 Business Avenue, Tech Park, NY 10001</p>
                  <p className="flex items-center gap-1"><Phone size={10} /> +1 (555) 123-4567</p>
                  <p className="flex items-center gap-1"><Mail size={10} /> hr@hawkeye.com</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Payslip</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">For the month of {employee.month || 'January 2026'}</p>
            </div>
          </div>

          {/* Employee Details Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Employee Name</span>
                <span className="text-sm font-bold text-slate-900">{employee.name}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Employee ID</span>
                <span className="text-sm font-medium text-slate-700">EMP-{String(employee.id).padStart(3, '0')}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Designation</span>
                <span className="text-sm font-medium text-slate-700">{employee.role}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Department</span>
                <span className="text-sm font-medium text-slate-700">Operations</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Bank Account</span>
                <span className="text-sm font-medium text-slate-700">XXXX-XXXX-4589</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">PAN Number</span>
                <span className="text-sm font-medium text-slate-700">ABCDE1234F</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">UAN</span>
                <span className="text-sm font-medium text-slate-700">100900200300</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Working Days</span>
                <span className="text-sm font-bold text-slate-900">22 / 24</span>
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
                    <span className="text-sm text-slate-600">Conveyance Allowance</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(conveyance)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Medical Allowance</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(medical)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Special Allowance</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(Math.max(0, specialAllowance))}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Overtime</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(300)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Bonus</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(200)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div>
                <div className="divide-y divide-slate-100">
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Provident Fund (PF)</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(pf)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">ESI</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(esi)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Professional Tax</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(pt)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">TDS (Tax)</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(tds)}</span>
                  </div>
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-slate-600">Other Deductions</span>
                    <span className="text-sm font-medium text-slate-900">{fmt(50)}</span>
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
                <span className="font-bold text-slate-900 text-sm">{fmt(totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay & CTC */}
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
            <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Cost to Company (CTC)</span>
              <span className="text-xl font-bold text-slate-700">{fmt(grossEarnings * 12)} / Annum</span>
            </div>
            <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase block mb-1">Net Pay (A - B)</span>
                <span className="text-2xl font-bold text-blue-800">{fmt(netPay)}</span>
              </div>
              <div className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">
                Paid via Bank Transfer
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-slate-200 pt-6 text-center">
            <p className="text-xs text-slate-400 italic">This is a system-generated payslip and does not require a physical signature.</p>
            <p className="text-xs text-slate-400 mt-1">HAWKEYE NEST Corp. | Reg No: 2026-US-998877</p>
          </div>
        </div>
      </div>
    </div>);

}