import React from 'react';
import { Search, Eye, Download, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Mock Data from image
const employees = [
  { id: 'EMP001', name: 'Aarav Sharma', dept: 'Design', net: '₹78,500', paymentMode: 'Bank Transfer', status: 'Generated', avatar: 'https://i.pravatar.cc/150?u=EMP001' },
  { id: 'EMP002', name: 'Neha Patel', dept: 'HR', net: '₹52,300', paymentMode: 'Bank Transfer', status: 'Generated', avatar: 'https://i.pravatar.cc/150?u=EMP002' },
  { id: 'EMP003', name: 'Rohan Mehta', dept: 'Development', net: '₹85,000', paymentMode: 'Bank Transfer', status: 'Generated', avatar: 'https://i.pravatar.cc/150?u=EMP003' },
  { id: 'EMP004', name: 'Priya Nair', dept: 'Finance', net: '₹66,400', paymentMode: 'Bank Transfer', status: 'Generated', avatar: 'https://i.pravatar.cc/150?u=EMP004' },
  { id: 'EMP005', name: 'Karan Verma', dept: 'Marketing', net: '₹72,600', paymentMode: 'Bank Transfer', status: 'Generated', avatar: 'https://i.pravatar.cc/150?u=EMP005' },
  { id: 'EMP006', name: 'Anjali Desai', dept: 'Sales', net: '₹60,900', paymentMode: 'Bank Transfer', status: 'Generated', avatar: 'https://i.pravatar.cc/150?u=EMP006' },
  { id: 'EMP007', name: 'Vikram Singh', dept: 'Development', net: '₹91,200', paymentMode: 'Bank Transfer', status: 'Generated', avatar: 'https://i.pravatar.cc/150?u=EMP007' },
  { id: 'EMP008', name: 'Pooja Reddy', dept: 'HR', net: '₹53,100', paymentMode: 'Bank Transfer', status: 'Generated', avatar: 'https://i.pravatar.cc/150?u=EMP008' },
];

export default function GeneratePayslips() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0' }}>
      
      {/* Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <div style={{ position: 'relative', width: '180px' }}>
            <select style={{ width: '100%', padding: '10px 32px 10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', appearance: 'none', color: '#334155', backgroundColor: '#FFF', cursor: 'pointer' }}>
              <option>May 2024</option>
            </select>
            <ChevronDown size={16} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative', width: '200px' }}>
            <select style={{ width: '100%', padding: '10px 32px 10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', appearance: 'none', color: '#334155', backgroundColor: '#FFF', cursor: 'pointer' }}>
              <option>All Departments</option>
            </select>
            <ChevronDown size={16} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search employee..." 
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', color: '#334155' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2952E3', color: '#FFF', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            Generate
          </button>
          <button style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', color: '#2952E3', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            Bulk Email
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: 0, boxShadow: '0 8px 24px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Employee</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Employee ID</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Department</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Net Pay</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Payment Mode</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Payslip Status</th>
                <th style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, index) => (
                <tr key={emp.id} style={{ borderBottom: index === employees.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={emp.avatar} alt={emp.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{emp.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#64748B' }}>{emp.id}</td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{emp.dept}</td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{emp.net}</td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{emp.paymentMode}</td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      backgroundColor: '#ECFDF5', 
                      color: '#10B981' 
                    }}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2952E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={16} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2952E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Download size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
          Showing 1 to 8 of 245 entries
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}>
            <ChevronLeft size={16} />
          </button>
          
          <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2952E3', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#FFF', fontSize: '14px', fontWeight: '500' }}>
            1
          </button>
          <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B', fontSize: '14px', fontWeight: '500' }}>
            2
          </button>
          <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B', fontSize: '14px', fontWeight: '500' }}>
            3
          </button>
          <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B', fontSize: '14px', fontWeight: '500' }}>
            4
          </button>
          <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B', fontSize: '14px', fontWeight: '500' }}>
            5
          </button>
          
          <span style={{ color: '#64748B', margin: '0 4px', fontSize: '14px' }}>...</span>
          
          <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B', fontSize: '14px', fontWeight: '500' }}>
            31
          </button>
          
          <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}
