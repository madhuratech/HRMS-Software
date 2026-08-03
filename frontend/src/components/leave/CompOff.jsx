import React, { useState } from 'react';
import { Search, Clock, CheckCircle, Clock4, ShieldCheck, Check, X, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, YAxis } from 'recharts';

const compOffData = [
  { name: 'Aarav Sharma', date: '24 May 2024', overtime: '8h 00m', earned: '1 Day', used: '0', remaining: '1 Day', status: 'Approved', manager: 'Rahul Kapoor' },
  { name: 'Priya Nair', date: '22 May 2024', overtime: '4h 30m', earned: '0.5 Day', used: '0', remaining: '0.5 Day', status: 'Pending', manager: '-' },
  { name: 'Rohan Mehta', date: '20 May 2024', overtime: '8h 00m', earned: '1 Day', used: '1 Day', remaining: '0', status: 'Approved', manager: 'Anita Desai' },
  { name: 'Neha Patel', date: '21 May 2024', overtime: '4h 00m', earned: '0.5 Day', used: '0', remaining: '0.5 Day', status: 'Rejected', manager: 'Rahul Kapoor' },
  { name: 'Karan Verma', date: '18 May 2024', overtime: '8h 00m', earned: '1 Day', used: '0', remaining: '1 Day', status: 'Pending', manager: '-' },
  { name: 'Anjali Desai', date: '20 May 2024', overtime: '4h 00m', earned: '0.5 Day', used: '0.5 Day', remaining: '0', status: 'Approved', manager: 'Rahul Kapoor' },
];

const trendData = [
  { name: 'Jan', used: 12, earned: 15 },
  { name: 'Feb', used: 18, earned: 12 },
  { name: 'Mar', used: 25, earned: 20 },
  { name: 'Apr', used: 10, earned: 25 },
  { name: 'May', used: 30, earned: 22 },
];

export default function CompOff() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    department: '',
    workedDate: '',
    earnedDate: '',
    expiryDate: '',
    totalDays: '',
    reason: '',
    reportingManager: '',
    status: 'Pending'
  });

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
    border: '1px solid #E5E7EB',
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#ecfdf5', color: '#10b981' };
      case 'Pending': return { bg: '#fffbeb', color: '#f59e0b' };
      case 'Rejected': return { bg: '#fef2f2', color: '#ef4444' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      
      {/* Header & Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <button onClick={() => setShowModal(true)} style={{ background: '#2952E3', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          Request Comp Off
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        {[
          { title: 'Available Comp Off', subtitle: 'Company Wide', value: '45h 30m', icon: <ShieldCheck size={20} color="#2952E3" />, bg: '#EEF2FF' },
          { title: 'Pending Requests', subtitle: 'Awaiting Action', value: '6', icon: <Clock size={20} color="#EF4444" />, bg: '#FEF2F2' },
          { title: 'Approved This Month', subtitle: 'Last 30 Days', value: '12', icon: <CheckCircle size={20} color="#F59E0B" />, bg: '#FFFBEB' },
          { title: 'Utilized This Month', subtitle: 'Last 30 Days', value: '18h 00m', icon: <Clock4 size={20} color="#10B981" />, bg: '#ECFDF5' }
        ].map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>{kpi.title}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>{kpi.value}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{kpi.subtitle}</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Main Left Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Table */}
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Recent Requests</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <select style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#475569' }}>
                  <option>All Departments</option>
                  <option>Design</option>
                  <option>Engineering</option>
                </select>
                <select style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#475569' }}>
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Approved</option>
                </select>
                <div style={{ position: 'relative', width: '200px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                  <input type="text" placeholder="Search employee..." style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Employee</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Worked Date</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Overtime</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Earned</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Approved By</th>
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {compOffData.map((req, idx) => {
                    const statusStyle = getStatusStyle(req.status);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(req.name)}&background=f1f5f9&color=64748b`} alt={req.name} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{req.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{req.date}</td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>{req.overtime}</td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#10b981', fontWeight: '600' }}>{req.earned}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{req.manager}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {req.status === 'Pending' && (
                              <>
                                <button style={{ background: '#ecfdf5', border: 'none', cursor: 'pointer', color: '#10b981', padding: '4px', borderRadius: '4px' }}><Check size={14} /></button>
                                <button style={{ background: '#fef2f2', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px', borderRadius: '4px' }}><X size={14} /></button>
                              </>
                            )}
                            <button style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', borderRadius: '4px' }}><Eye size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Area */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Comp Off Utilization Trend</h3>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                  <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="earned" name="Earned Days" fill="#2952E3" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="used" name="Used Days" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Balance Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { name: 'Aarav Sharma', balance: 8 },
                { name: 'Priya Nair', balance: 6 },
                { name: 'Rohan Mehta', balance: 5 },
                { name: 'Neha Patel', balance: 7.15 },
                { name: 'Karan Verma', balance: 4.3 }
              ].map((emp, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500', color: '#1e293b' }}>{emp.name}</span>
                    <span style={{ color: '#475569' }}>{emp.balance}h Available</span>
                  </div>
                  <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((emp.balance / 10) * 100, 100)}%`, height: '100%', background: '#2952E3', borderRadius: '3px' }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginTop: '24px', cursor: 'pointer' }}>
              View All Balances
            </button>
          </div>
        </div>

      </div>

      {/* Add Comp Off Form Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw' }}>
            <div className="p-8 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Add Comp Off</h2>
                <p className="text-sm text-slate-500 mt-1">Submit a request to credit compensatory off hours.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Employee <span className="text-red-500">*</span></label>
                  <select required value={formData.employee} onChange={e => setFormData({ ...formData, employee: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Select Employee</option>
                    <option value="Aarav Sharma">Aarav Sharma</option>
                    <option value="Priya Nair">Priya Nair</option>
                    <option value="Rohan Mehta">Rohan Mehta</option>
                    <option value="Neha Patel">Neha Patel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                  <input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. Engineering" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Worked Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.workedDate} onChange={e => setFormData({ ...formData, workedDate: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Comp Off Earned Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.earnedDate} onChange={e => setFormData({ ...formData, earnedDate: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Expiry Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Total Comp Off Days <span className="text-red-500">*</span></label>
                  <input type="number" step="0.5" required value={formData.totalDays} onChange={e => setFormData({ ...formData, totalDays: e.target.value })} placeholder="e.g. 1 or 0.5" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reporting Manager</label>
                  <input type="text" value={formData.reportingManager} onChange={e => setFormData({ ...formData, reportingManager: e.target.value })} placeholder="Manager Name" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Status <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="compOffStatus" checked={formData.status === 'Pending'} onChange={() => setFormData({ ...formData, status: 'Pending' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm font-semibold text-slate-700">Pending</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="compOffStatus" checked={formData.status === 'Approved'} onChange={() => setFormData({ ...formData, status: 'Approved' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm font-semibold text-slate-700">Approved</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="compOffStatus" checked={formData.status === 'Rejected'} onChange={() => setFormData({ ...formData, status: 'Rejected' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm font-semibold text-slate-700">Rejected</span>
                    </label>
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reason</label>
                  <textarea value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason for comp off" style={{ height: '100px' }} className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md">Save Comp Off</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
