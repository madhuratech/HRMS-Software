import React, { useState } from 'react';
import { Calendar, Clock, FileText, Send, CheckCircle, RotateCcw } from 'lucide-react';


const MOCK_MY_HISTORY = [
{
  id: 'lr_101',
  employeeId: 'current_user',
  employeeName: 'John Doe',
  type: 'Sick',
  startDate: '2023-11-10',
  endDate: '2023-11-12',
  days: 3,
  reason: 'Viral Fever',
  status: 'Approved',
  appliedOn: '2023-11-09'
},
{
  id: 'lr_102',
  employeeId: 'current_user',
  employeeName: 'John Doe',
  type: 'Casual',
  startDate: '2023-10-25',
  endDate: '2023-10-25',
  days: 1,
  reason: 'Personal work',
  status: 'Rejected',
  appliedOn: '2023-10-20'
}];


export function LeaveApplication() {
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState(MOCK_MY_HISTORY);
  const [formData, setFormData] = useState({
    type: 'Sick',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Simulate adding to history
    const newRequest = {
      id: `lr_${Date.now()}`,
      employeeId: 'current_user',
      employeeName: 'John Doe',
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: 1, // Simplified calculation
      reason: formData.reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };

    setTimeout(() => {
      setHistory([newRequest, ...history]);
      setSubmitted(false);
      setFormData({ type: 'Sick', startDate: '', endDate: '', reason: '' });
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':return 'bg-green-100 text-green-700';
      case 'Rejected':return 'bg-red-100 text-red-700';
      default:return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-green-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <CheckCircle className="text-green-600 w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Application Submitted</h3>
        <p className="text-slate-500 mt-2 max-w-md">Your leave request has been sent to your manager for approval. You can track its status below.</p>
      </div>);

  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Application Form */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Apply for Leave</h2>
            <p className="text-xs text-slate-500">Submit a new leave request</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Leave Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                
                <option value="Sick">Sick Leave</option>
                <option value="Casual">Casual Leave</option>
                <option value="Privilege">Privilege Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Duration</label>
              <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm flex items-center gap-2">
                <Clock size={16} />
                <span>1 Day(s)</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Reason</label>
            <textarea
              required
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              placeholder="Please describe the reason for your leave...">
            </textarea>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setFormData({ type: 'Sick', startDate: '', endDate: '', reason: '' })}
              className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">
              
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
              
              <Send size={16} /> Submit Request
            </button>
          </div>
        </form>
      </div>

      {/* History Sidebar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Application Status</h3>
          <button className="text-slate-400 hover:text-blue-600 transition-colors">
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {history.length === 0 ?
          <div className="text-center py-8 text-slate-400">
              <p>No recent applications</p>
            </div> :

          history.map((item) =>
          <div key={item.id} className="p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm font-bold text-slate-700">{item.type} Leave</span>
                    <p className="text-xs text-slate-500 mt-0.5">{item.days} Day(s)</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <Calendar size={12} />
                  {item.startDate}
                </div>
                {item.status === 'Rejected' &&
            <p className="text-xs text-red-500 bg-red-50 p-2 rounded">Manager: Staff shortage on these dates.</p>
            }
              </div>
          )
          }
        </div>
      </div>
    </div>);

}