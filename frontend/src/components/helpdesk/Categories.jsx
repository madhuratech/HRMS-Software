import React, { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2 } from 'lucide-react';

const CATEGORIES_DATA = [
  { name: 'IT Support',         desc: 'Issues related to IT, systems, network and devices', total: 482, status: 'Active' },
  { name: 'HR Support',         desc: 'Human resource related queries and requests',        total: 312, status: 'Active' },
  { name: 'Payroll',            desc: 'Salary, payslip and payroll related issues',          total: 198, status: 'Active' },
  { name: 'Leave & Attendance', desc: 'Leave applications and attendance issues',            total: 156, status: 'Active' },
  { name: 'Training',           desc: 'Training and learning related queries',               total: 64,  status: 'Active' },
  { name: 'Travel & Expense',   desc: 'Travel bookings and expense reimbursements',          total: 35,  status: 'Active' },
  { name: 'Assets',             desc: 'Company assets and inventory related issues',         total: 24,  status: 'Active' },
  { name: 'Others',             desc: 'Other general queries and issues',                    total: 20,  status: 'Active' },
];

export function Categories() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* ── HEADER & TOOLBAR ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Categories</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Manage ticket categories</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search categories..."
              style={{
                height: 38, paddingLeft: 34, paddingRight: 14,
                background: '#FFF', border: '1px solid #E5E7EB',
                borderRadius: 8, fontSize: 13, color: '#111827',
                outline: 'none', width: 220,
              }}
            />
          </div>

          {/* Primary Action Button */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px',
            background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(41,82,227,0.25)',
          }}>
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {/* ── MAIN DATA TABLE: Categories ── */}
      <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                {['Category Name', 'Description', 'Total Tickets', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES_DATA.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 48 }}>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.name}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.desc}</td>
                  <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.total}</td>
                  <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: '#ECFDF5', color: '#059669',
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 8, color: '#6B7280' }}>
                      <button style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}><Edit2 size={16} /></button>
                      <button style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF' }}>
          <span style={{ fontSize: 12, color: '#6B7280' }}>Showing 1 to 8 of 8 entries</span>
        </div>
      </div>

    </div>
  );
}

export default Categories;
