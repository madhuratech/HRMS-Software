import React, { useState } from 'react';
import { Plus, Edit, Trash2, CalendarDays, MapPin, X } from 'lucide-react';

const holidayData = [
  { date: '01 Jan 2024', day: 'Mon', name: 'New Year', occasion: 'New Year Celebration', location: 'All', type: 'Gazetted', status: 'Active' },
  { date: '26 Jan 2024', day: 'Fri', name: 'Republic Day', occasion: 'National Holiday', location: 'All', type: 'Gazetted', status: 'Active' },
  { date: '08 Mar 2024', day: 'Fri', name: 'Mahashivratri', occasion: 'Hindu Festival', location: 'All', type: 'Optional', status: 'Active' },
  { date: '29 Mar 2024', day: 'Fri', name: 'Good Friday', occasion: 'Christian Holiday', location: 'All', type: 'Optional', status: 'Active' },
  { date: '11 Apr 2024', day: 'Thu', name: 'Eid ul-Fitr', occasion: 'Islamic Festival', location: 'All', type: 'Gazetted', status: 'Active' },
  { date: '01 May 2024', day: 'Wed', name: 'Labour Day', occasion: 'International Workers Day', location: 'All', type: 'Gazetted', status: 'Active' },
  { date: '15 Aug 2024', day: 'Thu', name: 'Independence Day', occasion: 'National Holiday', location: 'All', type: 'Gazetted', status: 'Active' },
  { date: '02 Oct 2024', day: 'Wed', name: 'Gandhi Jayanti', occasion: 'National Holiday', location: 'All', type: 'Gazetted', status: 'Active' },
  { date: '31 Oct 2024', day: 'Thu', name: 'Diwali', occasion: 'Hindu Festival', location: 'All', type: 'Optional', status: 'Active' },
  { date: '25 Dec 2024', day: 'Wed', name: 'Christmas', occasion: 'Christian Festival', location: 'All', type: 'Optional', status: 'Active' },
];

export default function HolidayList() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'National',
    location: 'All Locations',
    description: '',
    status: 'Active'
  });

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
    border: '1px solid #E5E7EB',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

      {/* Header & Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <select style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#475569', minWidth: '120px' }}>
            <option>2024</option>
            <option>2023</option>
          </select>
          <select style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', color: '#475569', minWidth: '140px' }}>
            <option>All Locations</option>
            <option>Mumbai</option>
            <option>Bangalore</option>
          </select>
          <button onClick={() => setShowModal(true)} style={{ background: '#2952E3', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Plus size={16} /> Add Holiday
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>

        {/* Main Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', alignSelf: 'flex-start' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Day</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Holiday Name</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Occasion</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Location</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidayData.map((holiday, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap' }}>{holiday.date}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>{holiday.day}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '500', color: '#2952E3', whiteSpace: 'nowrap' }}>{holiday.name}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>{holiday.occasion}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{holiday.location}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{holiday.type}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit size={16} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Upcoming Holidays */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Upcoming Holidays</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#10b981', textTransform: 'uppercase' }}>Aug</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>15</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>Independence Day</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Thursday • National Holiday</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', background: '#f5f3ff', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#8b5cf6', textTransform: 'uppercase' }}>Oct</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#8b5cf6' }}>02</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>Gandhi Jayanti</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Wednesday • National Holiday</span>
                </div>
              </div>
            </div>
          </div>

          {/* Holiday Statistics */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Working Days 2024</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#475569' }}>Total Days in Year</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>366</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#475569' }}>Weekends</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>104</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#475569' }}>Gazetted Holidays</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>12</span>
              </div>
              <div style={{ width: '100%', height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#1e293b', fontWeight: '600' }}>Effective Working Days</span>
                <span style={{ fontWeight: '700', color: '#2952E3' }}>250</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Add Holiday Form Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowModal(false)} />
          <div className="modal-centered-content" style={{ width: '1100px', maxWidth: '90vw' }}>
            <div className="p-8 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Add Holiday</h2>
                <p className="text-sm text-slate-500 mt-1">Configure a new company holiday entry.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Holiday Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Republic Day" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Holiday Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Holiday Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="National">National</option>
                    <option value="Regional">Regional</option>
                    <option value="Company">Company</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Applicable Location / Branch</label>
                  <select value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="All Locations">All Locations</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Enter holiday description" style={{ height: '100px' }} className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Status <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="holidayStatus" checked={formData.status === 'Active'} onChange={() => setFormData({ ...formData, status: 'Active' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm font-semibold text-slate-700">Active</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="holidayStatus" checked={formData.status === 'Inactive'} onChange={() => setFormData({ ...formData, status: 'Inactive' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm font-semibold text-slate-700">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md">Save Holiday</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
