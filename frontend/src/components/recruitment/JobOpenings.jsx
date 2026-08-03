import React, { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function JobOpenings() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    vacancies: '',
    experience: '',
  });

  const [openings, setOpenings] = useState([
    { id: 'JOB-101', title: 'Senior React Developer', department: 'Engineering', location: 'Bangalore', type: 'Full-time', applicants: 18, postedDate: 'May 10, 2024', status: 'Open' },
    { id: 'JOB-102', title: 'HR Executive', department: 'Human Resources', location: 'Mumbai', type: 'Full-time', applicants: 24, postedDate: 'May 12, 2024', status: 'Open' },
    { id: 'JOB-103', title: 'UI/UX Designer', department: 'Design', location: 'Remote', type: 'Full-time', applicants: 12, postedDate: 'May 05, 2024', status: 'Open' },
    { id: 'JOB-104', title: 'Financial Analyst', department: 'Finance', location: 'Bangalore', type: 'Full-time', applicants: 8, postedDate: 'Apr 28, 2024', status: 'Closed' },
    { id: 'JOB-105', title: 'Sales Manager', department: 'Sales', location: 'Delhi', type: 'Full-time', applicants: 15, postedDate: 'May 15, 2024', status: 'Open' },
  ]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.department || !formData.location) return;
    const newItem = {
      id: 'JOB-' + (100 + openings.length + 1),
      title: formData.title,
      department: formData.department,
      location: formData.location,
      type: formData.type || 'Full-time',
      applicants: 0,
      postedDate: 'Today',
      status: 'Open',
    };
    setOpenings([newItem, ...openings]);
    setFormData({ title: '', department: '', location: '', type: 'Full-time', vacancies: '', experience: '' });
    setShowAddModal(false);
  };

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Job Openings</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Manage and track all job openings</p>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search job title or department..." 
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
              />
            </div>
            <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}>
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Human Resources</option>
            </select>
            <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}>
              <option>All Locations</option>
              <option>Bangalore</option>
              <option>Mumbai</option>
            </select>
            <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}>
              <option>All Status</option>
              <option>Open</option>
              <option>Closed</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => setShowAddModal(true)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
              <Plus size={16} /> Create Opening
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Job Title</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Department</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Location</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Type</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Experience</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Applications</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobData.map((row, index) => (
                <tr key={row.id} style={{ borderBottom: index === jobData.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#334155', whiteSpace: 'nowrap' }}>{row.title}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.dept}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.location}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.type}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.exp}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#1E293B', whiteSpace: 'nowrap', textAlign: 'center' }}>{row.apps}</td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      backgroundColor: row.status === 'Open' ? '#ECFDF5' : '#F1F5F9', 
                      color: row.status === 'Open' ? '#10B981' : '#64748B' 
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><MoreHorizontal size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
            Showing 1 to 8 of 24 entries
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}>
              <ChevronLeft size={16} />
            </button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2952E3', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#FFF', fontSize: '13px', fontWeight: '500' }}>
              1
            </button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
              2
            </button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
              3
            </button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Create Job Opening Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Create Job Opening</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior React Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore / Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Job Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Vacancies</label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    value={formData.vacancies}
                    onChange={(e) => setFormData({ ...formData, vacancies: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 18px', background: '#2952E3', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}
                >
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
