import React from 'react';
import { ChevronLeft, ChevronRight, Video, Link, Clock } from 'lucide-react';

const scheduleData = [
  {
    date: 'Mon, May 20, 2024',
    interviews: [
      { id: 1, time: '10:00 AM', name: 'Rahul Sharma', job: 'Senior React Developer', round: 'Technical Round', interviewer: 'Aarav Mehta' },
      { id: 2, time: '02:00 PM', name: 'Priya Patel', job: 'UI/UX Designer', round: 'Portfolio Review', interviewer: 'Neha Verma' },
    ]
  },
  {
    date: 'Tue, May 21, 2024',
    interviews: [
      { id: 3, time: '11:00 AM', name: 'Amit Kumar', job: 'Backend Developer', round: 'Technical Round', interviewer: 'Rohan Kapoor' },
      { id: 4, time: '03:00 PM', name: 'Sneha Reddy', job: 'HR Executive', round: 'HR Interview', interviewer: 'Anjali Desai' },
    ]
  },
  {
    date: 'Wed, May 22, 2024',
    interviews: [
      { id: 5, time: '10:30 AM', name: 'Vikram Singh', job: 'Business Analyst', round: 'Technical Round', interviewer: 'Karan Malhotra' },
    ]
  }
];

export default function InterviewSchedule() {
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
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>Interview Schedule</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>View and manage interview schedules</p>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>May 20 - May 26, 2024</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '8px', padding: '4px' }}>
            <button style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: '#2952E3', color: '#FFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Week</button>
            <button style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#64748B', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Month</button>
          </div>
        </div>

        {/* Schedule List */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {scheduleData.map((day, dIdx) => (
            <div key={dIdx}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{day.date}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {day.interviews.map((intv) => (
                  <div key={intv.id} style={{ display: 'flex', alignItems: 'center', padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FAFAF9' }}>
                    <div style={{ width: '100px', fontSize: '13px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#64748B" /> {intv.time}
                    </div>
                    <div style={{ flex: 1.5, fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{intv.name}</div>
                    <div style={{ flex: 2, fontSize: '13px', color: '#475569' }}>{intv.job}</div>
                    <div style={{ flex: 2, fontSize: '13px', color: '#475569' }}>{intv.round}</div>
                    <div style={{ flex: 1.5, fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', color: '#64748B' }}>
                        {intv.interviewer.split(' ').map(n => n[0]).join('')}
                      </div>
                      {intv.interviewer}
                    </div>
                    <div style={{ width: '140px', display: 'flex', justifyContent: 'flex-end' }}>
                       <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #2952E3', background: '#EFF6FF', color: '#2952E3', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                        <Video size={14} /> Join Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <button style={{ background: 'none', border: 'none', color: '#2952E3', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>View Full Schedule</button>
          </div>
        </div>

      </div>
    </div>
  );
}
