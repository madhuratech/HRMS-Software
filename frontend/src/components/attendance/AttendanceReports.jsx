import React from 'react';
import { Calendar as CalendarIcon, Filter, Download, FileText, Activity, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AttendanceReports() {
  const reportsData = [
    { id: '1', name: 'Monthly Attendance Report', type: 'Summary Report', period: 'May 1 - May 31, 2024', generated: 'May 31, 2024 10:30 AM', author: 'Admin' },
    { id: '2', name: 'Department Attendance Report', type: 'Department Report', period: 'May 1 - May 31, 2024', generated: 'May 31, 2024 10:25 AM', author: 'Admin' },
    { id: '3', name: 'Overtime Report', type: 'Overtime Report', period: 'May 1 - May 31, 2024', generated: 'May 31, 2024 10:20 AM', author: 'Admin' },
    { id: '4', name: 'Late Arrival Report', type: 'Late Report', period: 'May 1 - May 31, 2024', generated: 'May 31, 2024 10:15 AM', author: 'Admin' },
    { id: '5', name: 'Absenteeism Report', type: 'Absenteeism Report', period: 'May 1 - May 31, 2024', generated: 'May 31, 2024 10:10 AM', author: 'Admin' },
    { id: '6', name: 'Daily Attendance Summary', type: 'Daily Report', period: 'May 20, 2024', generated: 'May 20, 2024 07:00 PM', author: 'Admin' },
  ];

  const barData = [
    { name: 'May 1', present: 46, absent: 8, leave: 5, late: 12 },
    { name: '', present: 40, absent: 12, leave: 6, late: 10 },
    { name: '', present: 38, absent: 15, leave: 8, late: 9 },
    { name: 'May 8', present: 42, absent: 10, leave: 7, late: 15 },
    { name: '', present: 35, absent: 8, leave: 12, late: 11 },
    { name: '', present: 38, absent: 9, leave: 5, late: 8 },
    { name: 'May 15', present: 46, absent: 7, leave: 9, late: 14 },
    { name: '', present: 43, absent: 11, leave: 6, late: 10 },
    { name: '', present: 39, absent: 14, leave: 8, late: 12 },
    { name: 'May 22', present: 41, absent: 9, leave: 7, late: 13 },
    { name: '', present: 37, absent: 12, leave: 5, late: 9 },
    { name: '', present: 45, absent: 6, leave: 10, late: 11 },
    { name: 'May 31', present: 48, absent: 5, leave: 8, late: 15 },
  ];

  const pieData = [
    { name: 'Design', value: 48, color: '#3b82f6' },
    { name: 'HR', value: 36, color: '#10b981' },
    { name: 'Sales', value: 42, color: '#f59e0b' },
    { name: 'Development', value: 55, color: '#f97316' },
    { name: 'Marketing', value: 28, color: '#a855f7' },
    { name: 'Finance', value: 36, color: '#ec4899' },
  ];

  return (
    <div className="hrms-content">
      {/* Header and Toolbar */}
      <div className="hrms-header" style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '16px' }}>
        <div className="hrms-flex-start" style={{ flexWrap: 'nowrap', flexShrink: 0, gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '220px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>May 1 - May 31, 2024</span>
            <CalendarIcon size={16} style={{ color: '#64748b' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '160px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Departments</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', minWidth: '160px', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span className="hrms-text-sm" style={{ color: '#475569', fontWeight: '500' }}>All Locations</span>
            <ChevronDown size={16} style={{ color: '#94a3b8' }} />
          </div>
          <button className="hrms-primary-btn" style={{ whiteSpace: 'nowrap', padding: '10px 24px', borderRadius: '8px', fontWeight: '500' }}>Generate Report</button>
        </div>
      </div>

      <div style={{ width: '100%', flex: 1, display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: 0 }}>

          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <button style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: '2px solid #2563eb', color: '#2563eb', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Summary</button>
            <button style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#64748b', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Attendance</button>
            <button style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#64748b', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Leaves</button>
            <button style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#64748b', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Overtime</button>
            <button style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#64748b', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Late Arrivals</button>
            <button style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#64748b', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Absenteeism</button>
            <button style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#64748b', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Daily Summary</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 290px', gap: '24px' }}>
            {/* Left KPIs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="hrms-card hrms-stat-card" style={{ padding: '20px 24px' }}>
                <div className="hrms-stat-title" style={{ color: '#475569', marginBottom: '12px' }}>Present Days</div>
                <div className="hrms-flex-between" style={{ alignItems: 'baseline' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>512</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#10b981' }}></div></div>
                    <span className="hrms-text-xs" style={{ fontWeight: '600' }}>70.41%</span>
                  </div>
                </div>
              </div>
              <div className="hrms-card hrms-stat-card" style={{ padding: '20px 24px' }}>
                <div className="hrms-stat-title" style={{ color: '#475569', marginBottom: '12px' }}>Absent Days</div>
                <div className="hrms-flex-between" style={{ alignItems: 'baseline' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>128</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div></div>
                    <span className="hrms-text-xs" style={{ fontWeight: '600' }}>17.62%</span>
                  </div>
                </div>
              </div>
              <div className="hrms-card hrms-stat-card" style={{ padding: '20px 24px' }}>
                <div className="hrms-stat-title" style={{ color: '#475569', marginBottom: '12px' }}>Leave Days</div>
                <div className="hrms-flex-between" style={{ alignItems: 'baseline' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#a855f7' }}>72</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#a855f7' }}></div></div>
                    <span className="hrms-text-xs" style={{ fontWeight: '600' }}>9.90%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Chart */}
            <div className="hrms-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div className="hrms-flex-between" style={{ marginBottom: '24px' }}>
                <h3 className="hrms-font-semibold hrms-text-primary" style={{ margin: 0, fontSize: '15px' }}>Attendance Trend</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '2px' }}></div>
                    <span className="hrms-text-xs hrms-font-medium" style={{ color: '#64748b' }}>Present</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }}></div>
                    <span className="hrms-text-xs hrms-font-medium" style={{ color: '#64748b' }}>Absent</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px' }}></div>
                    <span className="hrms-text-xs hrms-font-medium" style={{ color: '#64748b' }}>Leave</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#a855f7', borderRadius: '2px' }}></div>
                    <span className="hrms-text-xs hrms-font-medium" style={{ color: '#64748b' }}>Late</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, position: 'relative', minHeight: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="present" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={6} />
                    <Bar dataKey="absent" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={6} />
                    <Bar dataKey="leave" fill="#f59e0b" radius={[2, 2, 0, 0]} barSize={6} />
                    <Bar dataKey="late" fill="#a855f7" radius={[2, 2, 0, 0]} barSize={6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Chart */}
            <div className="hrms-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 className="hrms-font-semibold hrms-text-primary" style={{ margin: '0 0 24px 0', fontSize: '15px' }}>Department Wise Summary</h3>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '100px', height: '100px', position: 'relative', flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={34} outerRadius={48} paddingAngle={0} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>245</span>
                    <span style={{ fontSize: '8px', color: '#64748b', textAlign: 'center', lineHeight: 1.1 }}>Total<br />Employees</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {pieData.map((item, idx) => (
                    <div key={idx} className="hrms-flex-between" style={{ whiteSpace: 'nowrap' }}>
                      <div className="hrms-flex-start" style={{ gap: '8px', flexShrink: 0 }}>
                        <div style={{ width: '9px', height: '8px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }}></div>
                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: '500' }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>{item.value} ({(item.value / 245 * 100).toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hrms-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 className="hrms-font-semibold hrms-text-primary" style={{ margin: 0 }}>Reports List</h3>
            </div>
            <div className="hrms-table-container">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Report Type</th>
                    <th>Period</th>
                    <th>Generated On</th>
                    <th>Generated By</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.map((report) => (
                    <tr key={report.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FileText size={18} className="hrms-text-muted" />
                          <span className="hrms-font-medium hrms-text-primary">{report.name}</span>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{report.type}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{report.period}</td>
                      <td style={{ whiteSpace: 'nowrap' }} className="hrms-font-medium">{report.generated}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{report.author}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="hrms-flex-between" style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
              <span className="hrms-text-sm hrms-text-muted">
                Showing 1 to 6 of 18 entries
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }} disabled>&lt;</button>
                <button className="hrms-primary-btn" style={{ padding: '6px 12px', borderRadius: '4px' }}>1</button>
                <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>2</button>
                <button className="hrms-secondary-btn" style={{ padding: '6px 12px', borderRadius: '4px', border: 'none' }}>3</button>
                <button className="hrms-secondary-btn" style={{ padding: '6px', borderRadius: '4px' }}>&gt;</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
