import React, { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, ChevronDown } from 'lucide-react';

const KB_CATS = [
  { id: 'all',        label: 'All Articles',       count: 126 },
  { id: 'it',         label: 'IT Support',         count: 45 },
  { id: 'hr',         label: 'HR Support',         count: 28 },
  { id: 'payroll',    label: 'Payroll',            count: 18 },
  { id: 'leave',      label: 'Leave & Attendance', count: 15 },
  { id: 'training',   label: 'Training',           count: 12 },
  { id: 'assets',     label: 'Assets',             count: 6 },
  { id: 'others',     label: 'Others',             count: 4 },
];

const ARTICLES_DATA = [
  { title: 'How to reset login password',     cat: 'IT Support',          views: '1,245', status: 'Published', date: '31 May 2024' },
  { title: 'How to apply for leave',          cat: 'Leave & Attendance',  views: '987',   status: 'Published', date: '30 May 2024' },
  { title: 'How to download payslip',         cat: 'Payroll',             views: '856',   status: 'Published', date: '29 May 2024' },
  { title: 'How to connect to VPN',           cat: 'IT Support',          views: '765',   status: 'Published', date: '28 May 2024' },
  { title: 'How to request for ID card',      cat: 'HR Support',          views: '654',   status: 'Draft',     date: '27 May 2024' },
  { title: 'How to claim travel expenses',    cat: 'Travel & Expense',    views: '543',   status: 'Published', date: '26 May 2024' },
  { title: 'How to raise a ticket',           cat: 'IT Support',          views: '432',   status: 'Published', date: '25 May 2024' },
];

export function KnowledgeBase() {
  const [selectedCat, setSelectedCat] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* ── HEADER & TOOLBAR ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Knowledge Base</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Manage knowledge base articles</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search articles..."
              style={{
                height: 38, paddingLeft: 34, paddingRight: 14,
                background: '#FFF', border: '1px solid #E5E7EB',
                borderRadius: 8, fontSize: 13, color: '#111827',
                outline: 'none', width: 220,
              }}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ position: 'relative' }}>
            <select style={{
              appearance: 'none', WebkitAppearance: 'none', height: 38,
              paddingLeft: 14, paddingRight: 32, background: '#FFF',
              border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer', outline: 'none',
            }}>
              <option>All Categories</option>
              <option>IT Support</option>
              <option>HR Support</option>
              <option>Payroll</option>
            </select>
            <ChevronDown size={13} color="#6B7280" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Primary Action Button */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px',
            background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(41,82,227,0.25)',
          }}>
            <Plus size={16} /> Add Article
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT: LEFT SIDEBAR + CENTER DATA TABLE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        
        {/* Left Panel: Categories Sidebar */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 16, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {KB_CATS.map((c) => {
              const isActive = selectedCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCat(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: isActive ? 600 : 500,
                    background: isActive ? '#EFF6FF' : 'transparent',
                    color: isActive ? '#2563EB' : '#4B5563',
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  <span>{c.label}</span>
                  <span style={{ fontSize: 11, background: isActive ? '#DBEAFE' : '#F3F4F6', color: isActive ? '#2563EB' : '#6B7280', padding: '2px 6px', borderRadius: 10 }}>
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Main Table: Articles */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
                  {['Article Title', 'Category', 'Views', 'Status', 'Updated On', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ARTICLES_DATA.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 48 }}>
                    <td style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{r.title}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#2563EB', whiteSpace: 'nowrap' }}>{r.cat}</td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>{r.views}</td>
                    <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: r.status === 'Published' ? '#ECFDF5' : '#FEF3C7',
                        color: r.status === 'Published' ? '#059669' : '#D97706',
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.date}</td>
                    <td style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 8, color: '#6B7280' }}>
                        <button style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 4 }}><Eye size={16} /></button>
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
            <span style={{ fontSize: 12, color: '#6B7280' }}>Showing 1 to 7 of 126 entries</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5, '...', 19].map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  style={{
                    minWidth: 28, height: 28, padding: '0 6px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
                    background: currentPage === page ? '#2563EB' : '#F3F4F6',
                    color: currentPage === page ? '#FFF' : '#374151',
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default KnowledgeBase;
