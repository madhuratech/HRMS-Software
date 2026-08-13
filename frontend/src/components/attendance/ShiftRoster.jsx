import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { ChevronLeft, ChevronRight, Filter, ChevronDown, Plus, X } from 'lucide-react';

export default function ShiftRoster() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    shiftName: '',
    shiftCode: '',
    startTime: '',
    endTime: '',
    breakTime: '',
    status: 'Active',
  });

  const getShiftStyles = (type) => {
    switch (type) {
      case 'general': return { background: '#eff6ff', color: '#2563eb' };
      case 'morning': return { background: '#ecfdf5', color: '#059669' };
      case 'evening': return { background: '#f5f3ff', color: '#7c3aed' };
      case 'off': return { background: '#fef2f2', color: '#dc2626' };
      default: return { background: '#f8fafc', color: '#64748b' };
    }
  };

  const [rosterData, setRosterData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/attendance/roster')
      .then(data => {
        if (Array.isArray(data)) {
          setRosterData(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load shift roster:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="hrms-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', minHeight: 'calc(100vh - 120px)' }}>
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <button style={{ padding: '8px 12px', background: '#fff', border: 'none', borderRight: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <ChevronLeft size={16} style={{ color: '#64748b' }} />
            </button>
            <span className="hrms-text-sm hrms-font-semibold" style={{ padding: '8px 16px', color: '#1e293b' }}>
              20 May - 26 May 2026
            </span>
            <button style={{ padding: '8px 12px', background: '#fff', border: 'none', borderLeft: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <ChevronRight size={16} style={{ color: '#64748b' }} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '180px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Departments</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '180px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Locations</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={() => setShowAddModal(true)} className="hrms-primary-btn" style={{ whiteSpace: 'nowrap', padding: '10px 24px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Add Shift
          </button>
        </div>
      </div>

      <div style={{ width: '100%', flex: 1, display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: 0 }}>
          <div className="hrms-card" style={{ padding: '0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 64px 16px 16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Employee</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Mon</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Tue</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Wed</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Thu</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Fri</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Sat</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Sun</th>
                </tr>
              </thead>
              <tbody>
                {rosterData.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 64px 16px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={row.avatar} alt={row.employee} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '500', color: '#1e293b' }}>{row.employee}</span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{row.empId}</span>
                        </div>
                      </div>
                    </td>
                    {row.shifts.map((shift, i) => {
                      const styles = getShiftStyles(shift.type);
                      return (
                        <td key={i} style={{ padding: '8px', verticalAlign: 'middle', textAlign: 'center' }}>
                          <div style={{
                            display: 'inline-flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: styles.background,
                            minWidth: '120px'
                          }}>
                            <span style={{ color: styles.color, fontSize: '12px', fontWeight: '600' }}>{shift.shift}</span>
                            {shift.time !== '--' && <span style={{ color: styles.color, fontSize: '10px', opacity: 0.8 }}>{shift.time}</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <>
          <div className="modal-backdrop-blur" onClick={() => setShowAddModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} />
          <div className="modal-centered-content" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: '16px', width: '600px', maxWidth: '90vw', zIndex: 101, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="p-8 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0A1629]">Add Shift</h2>
                <p className="text-sm text-slate-500 mt-1">Create a new work shift for attendance rosters.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }} className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Shift Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.shiftName} onChange={e => setFormData({ ...formData, shiftName: e.target.value })} placeholder="e.g. Morning Shift" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Shift Code <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.shiftCode} onChange={e => setFormData({ ...formData, shiftCode: e.target.value })} placeholder="e.g. MSH" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} placeholder="e.g. 09:00 AM" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">End Time <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} placeholder="e.g. 06:00 PM" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Break Time</label>
                  <input type="text" value={formData.breakTime} onChange={e => setFormData({ ...formData, breakTime: e.target.value })} placeholder="e.g. 60 mins" className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="pt-0">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Status <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="rosterStatus" checked={formData.status === 'Active'} onChange={() => setFormData({ ...formData, status: 'Active' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm font-semibold text-slate-700">Active</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="rosterStatus" checked={formData.status === 'Inactive'} onChange={() => setFormData({ ...formData, status: 'Inactive' })} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="text-sm font-semibold text-slate-700">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 shrink-0">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 h-12 border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-8 h-12 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md">Save Shift</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
