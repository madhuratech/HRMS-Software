import React, { useState } from 'react';
import {
  ArrowLeft,

  Mail,
  Phone,
  Calendar,
  DollarSign,
  Briefcase,
  Award,
  TrendingUp,
  CheckCircle,
  Clock,

  UserX,
  UserCheck,
  FileText } from
'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { PayslipModal } from './PayslipModal';
import { format, addDays } from 'date-fns';

const PERFORMANCE_DATA = [
{ month: 'May', sales: 4000, target: 5000 },
{ month: 'Jun', sales: 3000, target: 5000 },
{ month: 'Jul', sales: 6000, target: 5000 },
{ month: 'Aug', sales: 8000, target: 5500 },
{ month: 'Sep', sales: 5500, target: 5500 },
{ month: 'Oct', sales: 7200, target: 6000 }];







export function EmployeeProfile({ employee, onBack }) {
  // 5% Incentive Calculation Logic
  const currentMonthSales = 72000; // Example monthly sales amount
  const incentivePercentage = 0.05; // 5%
  const incentiveAmount = currentMonthSales * incentivePercentage;

  const [onboardingStatus, setOnboardingStatus] = useState(employee.onboardingStatus || 'NOT_STARTED');
  const [offboardingStatus, setOffboardingStatus] = useState(employee.offboardingStatus || 'NONE');
  const [showPayslip, setShowPayslip] = useState(false);
  const [selectedPayslipData, setSelectedPayslipData] = useState(null);

  const upcomingDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const getShiftForDay = (date) => {
    // Deterministic mock shift based on date
    const day = date.getDay();
    if (day === 0 || day === 6) return { type: 'OFF', label: 'Day Off', time: '-', color: 'bg-slate-100 text-slate-500' };

    // Randomize slightly for demo but keep consistent for same date
    const seed = date.getDate() % 3;
    if (seed === 0) return { type: 'MORNING', label: 'Morning', time: '08:00 - 16:00', color: 'bg-yellow-100 text-yellow-800' };
    if (seed === 1) return { type: 'AFTERNOON', label: 'Afternoon', time: '14:00 - 22:00', color: 'bg-orange-100 text-orange-800' };
    return { type: 'NIGHT', label: 'Night', time: '22:00 - 06:00', color: 'bg-indigo-100 text-indigo-800' };
  };

  const handleViewPayslip = (month) => {
    // Enrich employee data with mock financial details for the payslip
    const payslipData = {
      ...employee,
      month: month,
      basic: 4000, // Mock basic salary
      allowances: 1200 // Mock allowances
    };
    setSelectedPayslipData(payslipData);
    setShowPayslip(true);
  };

  return (
    <div className="space-y-6">
      <PayslipModal
        isOpen={showPayslip}
        onClose={() => setShowPayslip(false)}
        employee={selectedPayslipData} />
      

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-2">
        
        <ArrowLeft size={18} /> Back to List
      </button>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        <div className="relative flex flex-col md:flex-row items-start md:items-end gap-6 pt-12">
          <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg">
            <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500">
              {employee.name.charAt(0)}
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{employee.name}</h1>
            <p className="text-slate-500 font-medium">{employee.role.replace('_', ' ')} • {employee.branch}</p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider">Attendance</span>
              <span className="text-xl font-bold">{employee.attendance}%</span>
            </div>
            <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider">Status</span>
              <span className="text-xl font-bold">{employee.status}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Email</p>
              <p className="font-medium text-sm">{employee.name.toLowerCase().replace(' ', '.')}@company.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Phone</p>
              <p className="font-medium text-sm">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Joined</p>
              <p className="font-medium text-sm">{employee.joinDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Shifts */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="text-blue-600" size={20} />
          Upcoming Shifts (Next 7 Days)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {upcomingDays.map((date) => {
            const shift = getShiftForDay(date);
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div key={date.toString()} className={`p-3 rounded-lg border flex flex-col items-center text-center ${isToday ? 'border-blue-500 ring-1 ring-blue-200' : 'border-slate-200'}`}>
                <span className={`text-xs font-bold uppercase mb-1 ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                  {format(date, 'EEE')}
                </span>
                <span className="text-lg font-bold text-slate-800 mb-2">
                  {format(date, 'd')}
                </span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold w-full truncate ${shift.color}`}>
                  {shift.label}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  {shift.time}
                </span>
              </div>);

          })}
        </div>
      </div>

      {/* Onboarding & Offboarding Status Manager */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserCheck className="text-green-600" size={20} />
            Onboarding Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Current Stage</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                {onboardingStatus.replace('_', ' ')}
              </span>
            </div>
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={onboardingStatus}
                onChange={(e) => setOnboardingStatus(e.target.value)}>
                
                <option value="NOT_STARTED">Not Started</option>
                <option value="DOCUMENT_SUBMISSION">Document Submission</option>
                <option value="VERIFICATION_PENDING">Verification Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                Update
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserX className="text-red-600" size={20} />
            Offboarding Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Exit Stage</span>
              <span className={`px-2 py-1 text-xs font-bold rounded ${offboardingStatus === 'NONE' ? 'bg-slate-200 text-slate-600' : 'bg-red-100 text-red-700'}`}>
                {offboardingStatus.replace('_', ' ')}
              </span>
            </div>
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                value={offboardingStatus}
                onChange={(e) => setOffboardingStatus(e.target.value)}>
                
                <option value="NONE">None</option>
                <option value="RESIGNATION_SUBMITTED">Resignation Submitted</option>
                <option value="NOTICE_PERIOD">Notice Period</option>
                <option value="EXIT_INTERVIEW">Exit Interview</option>
                <option value="RELIEVED">Relieved</option>
              </select>
              <button className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors">
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              Performance History
            </h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-600 font-medium focus:ring-0">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <AreaChart data={PERFORMANCE_DATA}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="target" stroke="#cbd5e1" strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incentive Calculator Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Award className="text-emerald-100" />
                  Monthly Incentive
                </h3>
                <p className="text-emerald-100 text-sm opacity-90">Based on 5% of monthly sales</p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <DollarSign size={24} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-black/10 rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-emerald-100">Total Monthly Sales</span>
                  <span className="font-bold text-lg">${currentMonthSales.toLocaleString()}</span>
                </div>
                <div className="w-full bg-black/20 h-1.5 rounded-full mt-2">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Commission Rate</p>
                  <p className="text-2xl font-bold">5%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Payout Amount</p>
                  <p className="text-3xl font-bold text-white">${incentiveAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Task Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={16} /></div>
                  <span className="text-sm font-medium text-slate-700">Completed Jobs</span>
                </div>
                <span className="font-bold text-slate-800">145</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={16} /></div>
                  <span className="text-sm font-medium text-slate-700">Avg. Time</span>
                </div>
                <span className="font-bold text-slate-800">45m</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Briefcase size={16} /></div>
                  <span className="text-sm font-medium text-slate-700">Active Tasks</span>
                </div>
                <span className="font-bold text-slate-800">3</span>
              </div>
            </div>
          </div>

          {/* Payroll History Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="text-purple-600" size={20} />
              Payroll History
            </h3>
            <div className="space-y-3">
              {['January 2026', 'December 2025', 'November 2025'].map((month, index) =>
              <div key={month} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500">
                      <DollarSign size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{month}</p>
                      <p className="text-xs text-green-600 font-medium">Paid</p>
                    </div>
                  </div>
                  <button
                  onClick={() => handleViewPayslip(month)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  
                    View Slip
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

}