import React from 'react';
import { Search, Download, Filter, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const offersData = [
  { id: 1, name: 'Rahul Sharma', job: 'Senior React Developer', offerDate: 'May 20, 2024', ctc: '₹18,00,000', joinDate: 'Jun 15, 2024', status: 'Accepted' },
  { id: 2, name: 'Priya Patel', job: 'UI/UX Designer', offerDate: 'May 18, 2024', ctc: '₹12,00,000', joinDate: 'Jun 01, 2024', status: 'Pending' },
  { id: 3, name: 'Amit Kumar', job: 'Backend Developer', offerDate: 'May 17, 2024', ctc: '₹16,00,000', joinDate: 'Jun 10, 2024', status: 'Accepted' },
  { id: 4, name: 'Sneha Reddy', job: 'HR Executive', offerDate: 'May 16, 2024', ctc: '₹8,00,000', joinDate: 'May 30, 2024', status: 'Pending' },
  { id: 5, name: 'Vikram Singh', job: 'Business Analyst', offerDate: 'May 15, 2024', ctc: '₹10,00,000', joinDate: 'Jun 05, 2024', status: 'Accepted' },
];

export default function OfferLetters() {
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Accepted': return { bg: '#ECFDF5', text: '#10B981' };
      case 'Pending': return { bg: '#FFFBEB', text: '#F59E0B' };
      case 'Rejected': return { bg: '#FEF2F2', text: '#EF4444' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Offer Letters</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Manage and track offer letters</p>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}>
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Design</option>
            </select>
            <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', fontSize: '14px', color: '#334155', outline: 'none', cursor: 'pointer' }}>
              <option>All Status</option>
              <option>Accepted</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search candidate..." 
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>
          <div>
            <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Candidate</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Job Title</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Offer Date</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>CTC</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Joining Date</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offersData.map((row, index) => (
                <tr key={row.id} style={{ borderBottom: index === offersData.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#334155', whiteSpace: 'nowrap' }}>{row.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.job}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.offerDate}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#1E293B', whiteSpace: 'nowrap' }}>{row.ctc}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap' }}>{row.joinDate}</td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      backgroundColor: getStatusStyle(row.status).bg, 
                      color: getStatusStyle(row.status).text 
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2952E3', display: 'inline-flex', alignItems: 'center' }}>
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
            Showing 1 to 5 of 12 entries
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
            <span style={{ margin: '0 4px', color: '#94A3B8' }}>...</span>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
