import React from 'react';
import { Clock, TrendingUp, CheckCircle, Users } from 'lucide-react';

const pipelineData = [
  { id: 1, job: 'Senior React Developer', applied: 28, screening: 18, interview: 7, offer: 3, hired: 2, conv: 7.1 },
  { id: 2, job: 'UI/UX Designer', applied: 18, screening: 12, interview: 5, offer: 2, hired: 1, conv: 5.6 },
  { id: 3, job: 'Backend Developer', applied: 14, screening: 9, interview: 4, offer: 2, hired: 1, conv: 7.1 },
  { id: 4, job: 'HR Executive', applied: 22, screening: 15, interview: 6, offer: 2, hired: 1, conv: 4.5 },
  { id: 5, job: 'Business Analyst', applied: 15, screening: 10, interview: 5, offer: 3, hired: 2, conv: 13.3 },
];

export default function HiringPipeline() {
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  const getProgressBarColor = (val) => {
    if (val > 10) return '#10B981';
    if (val > 6) return '#2952E3';
    return '#F59E0B';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Hiring Pipeline</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Track hiring pipeline and conversion rates</p>
        </div>
      </div>

      {/* Horizontal Pipeline */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: '8px' }}>
        <div style={{ flex: 1, background: '#EEF2FF', borderRadius: '12px 0 0 12px', padding: '24px', position: 'relative' }}>
          <div style={{ fontSize: '14px', color: '#6366F1', fontWeight: '600' }}>Applied</div>
          <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700', marginTop: '8px' }}>154</div>
          <div style={{ position: 'absolute', right: '-12px', top: '50%', width: '24px', height: '24px', background: '#FFF', transform: 'translateY(-50%) rotate(45deg)', zIndex: 1 }}></div>
        </div>
        <div style={{ flex: 1, background: '#F5F3FF', padding: '24px', position: 'relative' }}>
          <div style={{ fontSize: '14px', color: '#8B5CF6', fontWeight: '600' }}>Screening</div>
          <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700', marginTop: '8px' }}>96</div>
          <div style={{ position: 'absolute', right: '-12px', top: '50%', width: '24px', height: '24px', background: '#FFF', transform: 'translateY(-50%) rotate(45deg)', zIndex: 1 }}></div>
        </div>
        <div style={{ flex: 1, background: '#FFFBEB', padding: '24px', position: 'relative' }}>
          <div style={{ fontSize: '14px', color: '#F59E0B', fontWeight: '600' }}>Interview</div>
          <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700', marginTop: '8px' }}>32</div>
          <div style={{ position: 'absolute', right: '-12px', top: '50%', width: '24px', height: '24px', background: '#FFF', transform: 'translateY(-50%) rotate(45deg)', zIndex: 1 }}></div>
        </div>
        <div style={{ flex: 1, background: '#F0FDF4', padding: '24px', position: 'relative' }}>
          <div style={{ fontSize: '14px', color: '#10B981', fontWeight: '600' }}>Offered</div>
          <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700', marginTop: '8px' }}>12</div>
          <div style={{ position: 'absolute', right: '-12px', top: '50%', width: '24px', height: '24px', background: '#FFF', transform: 'translateY(-50%) rotate(45deg)', zIndex: 1 }}></div>
        </div>
        <div style={{ flex: 1, background: '#ECFDF5', borderRadius: '0 12px 12px 0', padding: '24px' }}>
          <div style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>Hired</div>
          <div style={{ fontSize: '28px', color: '#1E293B', fontWeight: '700', marginTop: '8px' }}>8</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Analytics Table */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap' }}>Job Title</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Applied</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Screening</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Interview</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Offered</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'center' }}>Hired</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap', textAlign: 'right' }}>Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {pipelineData.map((row, index) => (
                  <tr key={row.id} style={{ borderBottom: index === pipelineData.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#334155', whiteSpace: 'nowrap' }}>{row.job}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap', textAlign: 'center' }}>{row.applied}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap', textAlign: 'center' }}>{row.screening}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap', textAlign: 'center' }}>{row.interview}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569', whiteSpace: 'nowrap', textAlign: 'center' }}>{row.offer}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#1E293B', fontWeight: '600', whiteSpace: 'nowrap', textAlign: 'center' }}>{row.hired}</td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                        <div style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{row.conv}%</div>
                        <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: '#F1F5F9' }}>
                          <div style={{ height: '100%', borderRadius: '3px', background: getProgressBarColor(row.conv), width: `${row.conv * 5}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pipeline Insights */}
        <div style={{ ...cardStyle, alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>Pipeline Insights</h3>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#2952E3" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Average Time to Hire</div>
              <div style={{ fontSize: '16px', color: '#1E293B', fontWeight: '700' }}>28 Days</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#8B5CF6" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Interview Conversion Rate</div>
              <div style={{ fontSize: '16px', color: '#1E293B', fontWeight: '700' }}>33.3%</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} color="#10B981" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Offer Acceptance Rate</div>
              <div style={{ fontSize: '16px', color: '#1E293B', fontWeight: '700' }}>75.0%</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Overall Conversion Rate</div>
              <div style={{ fontSize: '16px', color: '#1E293B', fontWeight: '700' }}>5.2%</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
