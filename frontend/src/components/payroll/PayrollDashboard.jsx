import React, { useState } from 'react';
import SalaryStructure from './SalaryStructure';
import SalaryComponents from './SalaryComponents';
import PayrollProcessing from './PayrollProcessing';
import GeneratePayslips from './GeneratePayslips';
import BonusIncentives from './BonusIncentives';
import Reimbursements from './Reimbursements';
import LoansAdvances from './LoansAdvances';
import TaxManagement from './TaxManagement';
import PayrollReports from './PayrollReports';

export default function PayrollDashboard({ defaultTab = 'structure' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = [
    { id: 'structure', label: 'Salary Structure' },
    { id: 'components', label: 'Salary Components' },
    { id: 'processing', label: 'Payroll Processing' },
    { id: 'payslips', label: 'Generate Payslips' },
    { id: 'bonus', label: 'Bonus & Incentives' },
    { id: 'reimbursements', label: 'Reimbursements' },
    { id: 'loans', label: 'Loans & Advances' },
    { id: 'tax', label: 'Tax Management' },
    { id: 'reports', label: 'Payroll Reports' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'structure': return <SalaryStructure />;
      case 'components': return <SalaryComponents />;
      case 'processing': return <PayrollProcessing />;
      case 'payslips': return <GeneratePayslips />;
      case 'bonus': return <BonusIncentives />;
      case 'reimbursements': return <Reimbursements />;
      case 'loans': return <LoansAdvances />;
      case 'tax': return <TaxManagement />;
      case 'reports': return <PayrollReports />;
      default: return <SalaryStructure />;
    }
  };

  return (
    <div style={{ padding: '0', background: '#F8FAFC', minHeight: '100%', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Temporary Tab Navigation for Demonstration (Remove if routing is handled externally) */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              backgroundColor: activeTab === tab.id ? '#2952E3' : 'transparent',
              color: activeTab === tab.id ? '#FFFFFF' : '#475569',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
}
