import React, { useState } from 'react';
import { Play, Calendar, Filter, Users, FileText, CheckCircle2, Circle, ArrowRight, IndianRupee, Loader2, Check, X, Plus } from 'lucide-react';

export default function PayrollProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCompleted, setProcessingCompleted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Stateful Workflow
  const [workflow, setWorkflow] = useState([
    { step: 1, name: 'Attendance Verification', status: 'completed' },
    { step: 2, name: 'Leave Calculation', status: 'completed' },
    { step: 3, name: 'Overtime Calculation', status: 'completed' },
    { step: 4, name: 'Salary Calculation', status: 'in-progress' },
    { step: 5, name: 'Tax Calculation', status: 'pending' },
    { step: 6, name: 'Payroll Completed', status: 'pending' },
  ]);

  // Stateful Checklist
  const [checklist, setChecklist] = useState([
    { name: 'Attendance Completed', status: 'done' },
    { name: 'Leave Approved', status: 'done' },
    { name: 'Salary Generated', status: 'pending' },
    { name: 'Payslips Ready', status: 'pending' },
  ]);

  // Stateful Department Table
  const [departments, setDepartments] = useState([
    { id: 1, dept: 'Engineering', emp: 145, gross: '₹ 15,20,000', net: '₹ 12,80,000', status: 'Processed' },
    { id: 2, dept: 'Sales', emp: 82, gross: '₹ 6,40,000', net: '₹ 5,30,000', status: 'Processed' },
    { id: 3, dept: 'Marketing', emp: 45, gross: '₹ 3,80,000', net: '₹ 3,20,000', status: 'Processed' },
    { id: 4, dept: 'Customer Support', emp: 120, gross: '₹ 5,60,000', net: '₹ 4,90,000', status: 'Pending' },
    { id: 5, dept: 'Human Resources', emp: 15, gross: '₹ 1,80,000', net: '₹ 1,50,000', status: 'Pending' },
  ]);

  // Stateful KPIs
  const [processedCount, setProcessedCount] = useState(450);
  const [pendingCount, setPendingCount] = useState(30);

  // New Payroll Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('November');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [currentPeriod, setCurrentPeriod] = useState('October 2026');

  const startPayrollProcessing = () => {
    if (isProcessing || processingCompleted) return;
    setIsProcessing(true);

    // Step 4 completes, Step 5 becomes in-progress
    setTimeout(() => {
      setWorkflow(prev => prev.map(w => {
        if (w.step === 4) return { ...w, status: 'completed' };
        if (w.step === 5) return { ...w, status: 'in-progress' };
        return w;
      }));
      setChecklist(prev => prev.map(c => c.name === 'Salary Generated' ? { ...c, status: 'done' } : c));
      
      // Part of departments processed
      setDepartments(prev => prev.map(d => d.dept === 'Customer Support' ? { ...d, status: 'Processed' } : d));
      setProcessedCount(465);
      setPendingCount(15);
    }, 1500);

    // Step 5 completes, Step 6 becomes completed
    setTimeout(() => {
      setWorkflow(prev => prev.map(w => {
        if (w.step === 5) return { ...w, status: 'completed' };
        if (w.step === 6) return { ...w, status: 'completed' };
        return w;
      }));
      setChecklist(prev => prev.map(c => c.name === 'Payslips Ready' ? { ...c, status: 'done' } : c));
      
      // All departments processed
      setDepartments(prev => prev.map(d => ({ ...d, status: 'Processed' })));
      setProcessedCount(480);
      setPendingCount(0);

      setIsProcessing(false);
      setProcessingCompleted(true);
      setToastMessage(`Payroll processing completed successfully for ${currentPeriod}!`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 3000);
  };

  const handleCreatePayrollSubmit = (e) => {
    e.preventDefault();
    const period = `${selectedMonth} ${selectedYear}`;
    setCurrentPeriod(period);
    
    // Reset state for new run
    setProcessingCompleted(false);
    setIsProcessing(false);
    setProcessedCount(450);
    setPendingCount(30);
    setWorkflow([
      { step: 1, name: 'Attendance Verification', status: 'completed' },
      { step: 2, name: 'Leave Calculation', status: 'completed' },
      { step: 3, name: 'Overtime Calculation', status: 'completed' },
      { step: 4, name: 'Salary Calculation', status: 'in-progress' },
      { step: 5, name: 'Tax Calculation', status: 'pending' },
      { step: 6, name: 'Payroll Completed', status: 'pending' },
    ]);
    setChecklist([
      { name: 'Attendance Completed', status: 'done' },
      { name: 'Leave Approved', status: 'done' },
      { name: 'Salary Generated', status: 'pending' },
      { name: 'Payslips Ready', status: 'pending' },
    ]);
    setDepartments([
      { id: 1, dept: 'Engineering', emp: 145, gross: '₹ 15,20,000', net: '₹ 12,80,000', status: 'Processed' },
      { id: 2, dept: 'Sales', emp: 82, gross: '₹ 6,40,000', net: '₹ 5,30,000', status: 'Processed' },
      { id: 3, dept: 'Marketing', emp: 45, gross: '₹ 3,80,000', net: '₹ 3,20,000', status: 'Processed' },
      { id: 4, dept: 'Customer Support', emp: 120, gross: '₹ 5,60,000', net: '₹ 4,90,000', status: 'Pending' },
      { id: 5, dept: 'Human Resources', emp: 15, gross: '₹ 1,80,000', net: '₹ 1,50,000', status: 'Pending' },
    ]);

    setIsCreateModalOpen(false);
    setToastMessage(`Payroll run successfully initialized for ${period}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const kpis = [
    { title: 'Employees Processed', value: `${processedCount} / 480`, icon: <Users size={20} color="#2952E3" />, bgColor: '#EFF6FF' },
    { title: 'Pending Payroll', value: pendingCount.toString(), icon: <FileText size={20} color="#F59E0B" />, bgColor: '#FFFBEB' },
    { title: 'Gross Payroll', value: '₹ 45.2L', icon: <IndianRupee size={20} color="#10B981" />, bgColor: '#ECFDF5' },
    { title: 'Net Payroll', value: '₹ 38.8L', icon: <IndianRupee size={20} color="#8B5CF6" />, bgColor: '#F5F3FF' },
  ];

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Toast Banner */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 1000, background: '#10B981', color: '#FFF', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: '600', fontSize: '14px' }}>{toastMessage}</span>
        </div>
      )}

      {/* Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Calendar size={16} /> {currentPeriod}
          </button>
          <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
            <Filter size={16} /> All Departments
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #2952E3', background: '#FFF', color: '#2952E3', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            <Plus size={16} /> Create Payroll
          </button>
          <button 
            onClick={startPayrollProcessing}
            disabled={isProcessing || processingCompleted}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '8px', 
              border: 'none', 
              background: processingCompleted ? '#10B981' : '#2952E3', 
              color: '#FFF', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: (isProcessing || processingCompleted) ? 'not-allowed' : 'pointer', 
              fontSize: '14px', 
              fontWeight: '600',
              opacity: isProcessing ? 0.8 : 1,
              transition: 'background 0.3s'
            }}>
            {isProcessing ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...
              </>
            ) : processingCompleted ? (
              <>
                <Check size={16} /> Payroll Completed
              </>
            ) : (
              <>
                <Play size={16} /> Process Payroll
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: kpi.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '4px' }}>{kpi.title}</div>
              <div style={{ fontSize: '24px', color: '#1E293B', fontWeight: '700' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Progress */}
      <div style={{ ...cardStyle, padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Payroll Workflow</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          
          <div style={{ position: 'absolute', top: '16px', left: '40px', right: '40px', height: '2px', background: '#E2E8F0', zIndex: 1 }}></div>

          {workflow.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2, background: '#FFF', padding: '0 10px' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step.status === 'completed' ? '#10B981' : step.status === 'in-progress' ? '#2952E3' : '#F1F5F9',
                color: step.status === 'pending' ? '#94A3B8' : '#FFF',
                border: step.status === 'pending' ? '2px solid #E2E8F0' : 'none'
              }}>
                {step.status === 'completed' ? <CheckCircle2 size={20} /> : <span style={{ fontSize: '14px', fontWeight: '600' }}>{step.step}</span>}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: step.status === 'pending' ? '#94A3B8' : '#1E293B', textAlign: 'center', maxWidth: '100px' }}>
                {step.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Main Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Department Summary</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Department</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Employees</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Gross Salary</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>Net Salary</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>{row.dept}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{row.emp}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{row.gross}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', fontWeight: '600' }}>{row.net}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        backgroundColor: row.status === 'Processed' ? '#ECFDF5' : '#FFFBEB', 
                        color: row.status === 'Processed' ? '#10B981' : '#F59E0B' 
                      }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Payroll Checklist</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {checklist.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {item.status === 'done' ? (
                    <CheckCircle2 size={18} color="#10B981" />
                  ) : (
                    <Circle size={18} color="#CBD5E1" />
                  )}
                  <div style={{ fontSize: '14px', color: item.status === 'done' ? '#334155' : '#64748B', fontWeight: item.status === 'done' ? '500' : '400' }}>
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
            
            <button style={{ width: '100%', marginTop: '24px', padding: '10px 0', borderRadius: '8px', border: '1px solid #2952E3', background: '#EFF6FF', color: '#2952E3', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              Review Anomalies
            </button>
          </div>
        </div>

      </div>

      {/* Create Payroll Modal */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#FFF', borderRadius: '16px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>Initialize New Payroll Run</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePayrollSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Select Month</label>
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '14px' }}>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Select Year</label>
                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '14px' }}>
                  {['2025', '2026', '2027', '2028'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFF', color: '#64748B', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2952E3', color: '#FFF', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  Initialize Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

